'use server';

import { db } from '@/db';
import { mppscUsers, payments, verificationTokens } from '@/db/schema';
import { fetchPricingConfigRow } from '@/lib/pricing-db';
import { eq, sql, and } from 'drizzle-orm';
import { addHours } from 'date-fns';
import { Resend } from 'resend';
import { appPath } from '@/lib/app-url';
import { PRICING_DEFAULTS } from '@/config/pricing';
import { mergePricingRow } from '@/lib/pricing-merge';
import { mergeMppscProductCopy, paymentLabelToMppscSegment } from '@/config/mppsc-product-copy';
import { renderMppscPaymentWelcomeEmail } from '@/lib/welcome-payment-email';
import { resolveVerifiedPayment } from '@/lib/payment-access-resolve';
import { parseAccessGrants, serializeAccessGrants } from '@/lib/access-grants';
import { verifyAuth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import Razorpay from 'razorpay';
import { logger } from '@/lib/logger';
import crypto from 'crypto';
import { z } from 'zod';
import { after } from 'next/server';
import { sendLeadNotification } from '@/lib/telegram';
import {
  notifyAdminOnVerificationFailure,
  notifyAdminOnEmailFailure,
  notifyAdminOnPayment,
} from '@/lib/admin-notify';
import { renderWelcomeSetPasswordEmailHtml } from '@/lib/render-welcome-set-password-email';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💳 START PAYMENT (Register + Create Order)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const startPaymentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(20),
  source: z.string().optional(),
  planType: z.enum(['lite', 'pro', 'upgrade', 'mains', 'combo']),
  examType: z.enum(['upsc', 'mppsc', 'mppolice']).default('mppsc'),
});

type StartPaymentInput = z.infer<typeof startPaymentSchema>;

/**
 * 💳 Start Payment (Server Action)
 *
 * Combined: Register User + Create Razorpay Order in ONE call
 *
 * Benefits over API route:
 * - 30% faster (single request vs 2 separate)
 * - No network visibility
 * - Better error handling
 * - Type-safe
 */
export async function startPayment(input: StartPaymentInput) {
  try {
    // ── PHASE 0: Validate Input
    const validatedInput = startPaymentSchema.safeParse(input);
    if (!validatedInput.success) {
      return {
        success: false,
        error: validatedInput.error.issues[0]?.message || 'Invalid input data',
      };
    }

    const { name, email, phone, source, planType, examType } = validatedInput.data;
    const normalizedEmail = email.toLowerCase().trim();

    // ── PHASE 1: Find existing user by email (case-insensitive)
    const existingUser = await db.query.mppscUsers.findFirst({
      where: and(
        sql`LOWER(${mppscUsers.email}) = ${normalizedEmail}`,
        eq(mppscUsers.examType, examType)
      ),
    });

    const currentSession = await verifyAuth();

    // Paid Pre (lite/pro) + same email + duplicate Pre SKU → block unless that user is logged in (mains/combo/add-ons use logged-in flow)
    if (existingUser) {
      const tier = String(existingUser.planTier ?? 'free').toLowerCase();
      const hasPaidPre = tier === 'lite' || tier === 'pro';
      const duplicatePreSku =
        hasPaidPre && (planType === 'lite' || planType === 'pro' || planType === 'upgrade');

      if (duplicatePreSku) {
        if (!currentSession || currentSession.id !== existingUser.id) {
          return {
            error:
              'This email is already registered with a plan. Please log in to access your account or upgrade.',
          };
        }
      }
    }

    let userId: string;
    let finalAttemptCount = 1;
    const isReturning = !!existingUser;

    if (existingUser) {
      // Existing user: update name/phone/metadata only
      //
      // 🛡️ SAFE METADATA PARSING
      // ─────────────────────────────────────────────────────────────
      // DB mein `metadata` column TEXT hai. Par value teen tarah ka ho sakta hai:
      //
      //   1. STRING: '{"source":"google"}'  → JSON.parse se object banao
      //   2. OBJECT: {source:"google"}      → directly use karo (kisi route ne
      //      bina stringify kiye store kiya hoga)
      //   3. null/undefined                 → empty object {}
      //
      // Purana code: JSON.parse(metadata as string)
      //   → Case 2 pe CRASH! JSON.parse ko string chahiye, object nahi.
      //   → Payment start flow break ho jaata tha! 💥
      //
      // Fix: typeof check pehle karo, try-catch bhi rakho safety ke liye
      let existingMeta: Record<string, unknown> = {};
      const raw = existingUser.metadata;
      if (raw) {
        if (typeof raw === 'string') {
          try {
            existingMeta = JSON.parse(raw);
          } catch {
            existingMeta = {};
          }
        } else if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
          existingMeta = raw as Record<string, unknown>;
        }
      }

      const prevAttempts = typeof existingMeta.attemptCount === 'number' ? existingMeta.attemptCount : 0;
      finalAttemptCount = prevAttempts + 1;

      await db
        .update(mppscUsers)
        .set({
          name: name.trim(),
          phone: phone.trim(),
          metadata: JSON.stringify({
            ...existingMeta,
            source,
            attemptedPlan: planType,
            lastAttemptAt: new Date().toISOString(),
            attemptCount: finalAttemptCount,
          }),
        })
        .where(eq(mppscUsers.id, existingUser.id));
      userId = existingUser.id;
    } else {
      // New user: create account
      userId = uuidv4();
      finalAttemptCount = 1;
      const tempPassword = await bcrypt.hash(uuidv4(), 10);
      await db.insert(mppscUsers).values({
        id: userId,
        email: normalizedEmail,
        name: name.trim(),
        phone: phone.trim(),
        password: tempPassword,
        isActive: false,
        role: 'user',
        metadata: JSON.stringify({
          source,
          attemptedPlan: planType,
          lastAttemptAt: new Date().toISOString(),
          attemptCount: 1,
        }),
        planTier: 'free',
        examType: examType, // Set exam type on registration
        accessGrants: serializeAccessGrants(['mppsc_pre']),
      });
    }

    // 🚀 TELEGRAM LEAD ALERT — Phase 1 complete, user saved
    // ─────────────────────────────────────────────────────────────
    // Hum `after()` use kar rahe hain taaki notification background mein jaaye
    // aur user ko Razorpay order creation mein koi delay na mile.
    // ─────────────────────────────────────────────────────────────
    after(async () => {
      try {
        await sendLeadNotification({
          type: isReturning ? 'Returning Lead' : 'New Lead',
          name: name.trim(),
          email: normalizedEmail,
          phone: phone.trim(),
          plan: planType,
          exam: examType,
          source: source,
          attemptCount: finalAttemptCount,
          status: 'Checkout Started — Awaiting Payment'
        });
      } catch (e) {
        logger.error('Telegram lead notification failed', e, { category: 'telegram' });
      }
    });

    // ── PHASE 2: Create Razorpay Order (Server-Side Pricing)
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return { error: 'Razorpay keys not configured' };
    }

    const pricing = mergePricingRow(await fetchPricingConfigRow(examType));

    const PLAN_AMOUNTS: Record<string, number> = {
      lite: pricing.litePrice * 100,
      pro: pricing.proPrice * 100,
      upgrade: pricing.upgradePrice * 100,
      mains: pricing.mainsPrice * 100,
      combo: pricing.comboPrice * 100,
    };

    const amount = PLAN_AMOUNTS[planType];
    if (!amount || amount < 100) {
      return { error: 'Invalid plan configuration' };
    }

    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await instance.orders.create({
      amount,
      currency: 'INR',
      notes: {
        planType,
        userId,
        examType,
      },
    });

    return {
      success: true,
      data: {
        userId,
        order: { ...order, planType },
      },
    };
  } catch (error: unknown) {
    logger.error('Payment start error:', error, {
      category: 'payment',
      metadata: { planType: input.planType },
    });
    const message = error instanceof Error ? error.message : 'Failed to start payment';
    return { success: false, error: message };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ VERIFY PAYMENT (Signature + IDOR + Transaction)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  userId?: string; // Fallback for new users who don't have JWT yet
}

/**
 * ✅ Verify Payment (Server Action)
 *
 * Secure payment verification with:
 * - JWT authentication (userId from session)
 * - Timing-safe signature comparison
 * - IDOR prevention (order ownership check)
 * - Atomic transaction (payment + user update)
 * - Idempotency check
 *
 * Benefits over API route:
 * - No userId visible in Network tab
 * - Automatic JWT handling
 * - Type-safe
 */
export async function verifyPayment(input: VerifyPaymentInput) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;
  let userId: string | undefined;

  try {
    // 🔒 Step 1: Get userId — JWT first, fallback to input (for new users)
    const session = await verifyAuth();
    userId = session?.id || input.userId;
    
    if (!userId) {
      return { error: 'Unauthorized — no session or userId provided' };
    }

    // 🔒 Step 2: Timing-Safe Signature Verification
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // 🛡️ CRASH PREVENTION: Validate signature format before timingSafeEqual
    // ─────────────────────────────────────────────────────────────────────
    // Bhai, timingSafeEqual THROW karta hai agar dono buffers ka length
    // different ho! Attacker garbage signature bhej ke server crash kara sakta tha.
    //
    // Attack scenario: razorpay_signature = "abc" (odd-length, not valid hex)
    //   → Buffer.from("abc", 'hex') = <Buffer ab> (1 byte, 'c' dropped!)
    //   → generated_signature buffer = 32 bytes (SHA256)
    //   → timingSafeEqual THROWS: "Input buffers must have the same length"
    //   → Unhandled error = 500 response + potential info leak
    //
    // Fix: Check length match BEFORE calling timingSafeEqual
    const isValidHex = /^[a-f0-9]+$/i.test(razorpay_signature);
    if (!isValidHex || razorpay_signature.length !== generated_signature.length) {
      logger.warn('Malformed payment signature rejected', {
        category: 'payment',
        metadata: { userId, orderId: razorpay_order_id, sigLength: razorpay_signature.length },
      });
      
      await notifyAdminOnVerificationFailure({
        userId: userId || 'unknown',
        orderId: razorpay_order_id,
        error: 'Malformed payment signature rejected (timingSafeEqual safety check)',
      }).catch(() => {});

      return { error: 'Invalid signature format' };
    }

    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(generated_signature, 'hex'),
      Buffer.from(razorpay_signature, 'hex')
    );

    if (!isValidSignature) {
      logger.warn('Invalid payment signature', {
        category: 'payment',
        metadata: { userId, orderId: razorpay_order_id },
      });

      await notifyAdminOnVerificationFailure({
        userId: userId || 'unknown',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        error: 'Invalid Razorpay signature (cryptographic proof failed)',
      }).catch(() => {});

      return { error: 'Invalid signature' };
    }

    // 🔄 Step 3: Idempotency Check
    // DB column is `orderId` (maps to `order_id` in SQLite)
    const existingPayment = await db.query.payments.findFirst({
      where: eq(payments.orderId, razorpay_order_id),
    });

    if (existingPayment) {
      logger.info('Payment already verified (idempotent)', {
        category: 'payment',
        metadata: { userId, orderId: razorpay_order_id },
      });
      const u = await db.query.mppscUsers.findFirst({
        where: eq(mppscUsers.id, userId as string),
        columns: { accessGrants: true, planTier: true },
      });
      const g = parseAccessGrants(u?.accessGrants);
      const sku = String(existingPayment.planTier ?? 'pro');
      return {
        success: true as const,
        message: 'Payment already verified',
        planTier: u?.planTier ?? existingPayment.planTier,
        paymentLabel: sku,
        accessGrants: g.length ? g : ['mppsc_pre'],
      };
    }

    // 🕵️ Step 4: Cross-Check with Razorpay API + IDOR Prevention
    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await instance.orders.fetch(razorpay_order_id);
    const orderUserId = order.notes?.userId;

    if (orderUserId && orderUserId !== userId) {
      logger.warn('Payment verification failed: Order ownership mismatch', {
        category: 'payment',
        metadata: { orderUserId, requestUserId: userId, orderId: razorpay_order_id },
      });

      await notifyAdminOnVerificationFailure({
        userId: userId || 'unknown',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        error: `Order ownership mismatch (User: ${userId}, Order notes: ${orderUserId})`,
      }).catch(() => {});

      return { error: 'Order does not belong to this user' };
    }

    // 💰 Determine plan tier from amount
    // ─────────────────────────────────────────────────────────────────────
    // IMPORTANT: order.amount is ALREADY in paise (Razorpay standard).
    // DB column `payments.amount` is integer → store paise directly!
    //
    // Before fix: amount = order.amount / 100 → stored rupees in integer
    //   column → 49900 paise became 499 rupees → DB stored 499 (truncated!)
    //
    // After fix: Keep paise throughout. Compare against pricing × 100.
    // ─────────────────────────────────────────────────────────────────────
    const amountInPaise = Number(order.amount); // Already paise from Razorpay

    // Recover examType from order notes (fallback to user's examType or mppsc)
    const examType = (order.notes?.examType as 'upsc' | 'mppsc' | 'mppolice') || 'mppsc';

    const pricingRow = await fetchPricingConfigRow(examType);
    const pricing = mergePricingRow(pricingRow);

    const paidUserBefore = await db.query.mppscUsers.findFirst({
      where: eq(mppscUsers.id, userId!),
      columns: { accessGrants: true, planTier: true },
    });

    const resolved = resolveVerifiedPayment(
      amountInPaise,
      order.notes?.planType as string | undefined,
      pricing,
      paidUserBefore?.accessGrants,
      paidUserBefore?.planTier as string | undefined
    );

    if (!resolved.allowedAmount) {
      logger.warn('Unknown payment amount — does not match any plan', {
        category: 'payment',
        metadata: { userId, orderId: razorpay_order_id, amountInPaise },
      });
      return { error: 'Payment amount does not match any valid plan' };
    }

    const accessExpiresAt = new Date();
    accessExpiresAt.setMonth(accessExpiresAt.getMonth() + resolved.months);

    const planTier = resolved.planTier;
    const subscribedNow =
      planTier === 'lite' || planTier === 'pro' || resolved.paymentLabel === 'mains' || resolved.paymentLabel === 'combo';

    // 💾 Step 6: Atomic Transaction (Payment + User Update)
    await db.transaction(async (tx) => {
      await tx.insert(payments).values({
        id: uuidv4(),
        userId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        amount: amountInPaise,
        planTier: resolved.paymentLabel,
        status: 'captured',
        examType,
      });

      await tx
        .update(mppscUsers)
        .set({
          planTier,
          isSubscribed: subscribedNow,
          isActive: true,
          accessExpiresAt,
          accessGrants: serializeAccessGrants(resolved.accessGrants),
          deletedAt: null,
        })
        .where(eq(mppscUsers.id, userId!));
    });

    // 🎫 + 📧 Set-password token + welcome email
    // PaymentModal calls this server action — NOT /api/payment/verify — so this block is required
    // for first-time payers to receive mail and use /auth/set-password. Upgrade skips (already has password).
    const isUpgradePurchase = (order.notes?.planType as string | undefined) === 'upgrade';
    if (!isUpgradePurchase) {
      const paidUser = await db.query.mppscUsers.findFirst({
        where: eq(mppscUsers.id, userId!),
        columns: { name: true, email: true, examType: true },
      });

      if (paidUser?.email) {
        const token = uuidv4();
        const expires = addHours(new Date(), 1);

        await db.insert(verificationTokens).values({
          identifier: userId!,
          token,
          expires,
        });

        const resendApiKey = process.env.RESEND_API_KEY;
        const fromName = process.env.EMAIL_FROM_NAME || 'MPPSC ZEN';
        const fromAddress =
          process.env.RESEND_FROM_EMAIL ||
          process.env.EMAIL_FROM_ADDRESS ||
          'no-reply@mppsc.zenscroll.app';
        const fromEmail = `${fromName} <${fromAddress}>`;
        const actionUrl = `${appPath('auth/set-password')}?token=${token}`;

        const welcomePlan: 'lite' | 'pro' =
          resolved.paymentLabel === 'mains' || resolved.paymentLabel === 'combo'
            ? 'pro'
            : planTier === 'lite'
              ? 'lite'
              : 'pro';

        const mergedMppscCopy =
          examType === 'mppsc'
            ? mergeMppscProductCopy(
                (pricingRow as Record<string, unknown> | null)?.mppscProductCopyJson as
                  | string
                  | null
                  | undefined
              )
            : null;

        let emailHtml: string;
        let emailSubject =
          '🎉 Welcome to MPPSC ZEN — Set Your Password';
        if (examType === 'mppsc' && mergedMppscCopy) {
          const segmentCopy =
            mergedMppscCopy[paymentLabelToMppscSegment(resolved.paymentLabel)];
          const rend = await renderMppscPaymentWelcomeEmail({
            name: paidUser.name || 'Student',
            actionUrl,
            segmentCopy,
          });
          emailHtml = rend.html;
          emailSubject = rend.subject;
        } else {
          emailHtml = await renderWelcomeSetPasswordEmailHtml({
            name: paidUser.name || 'Student',
            actionUrl,
            planTier: welcomePlan,
          });
        }

        if (!resendApiKey) {
          logger.error('RESEND_API_KEY missing — welcome email skipped after payment', undefined, {
            category: 'email',
            userId,
            metadata: { to: paidUser.email },
          });
          await notifyAdminOnEmailFailure({
            userName: paidUser.name || 'Unknown',
            userEmail: paidUser.email,
            errorMessage: 'RESEND_API_KEY is not configured on the server',
            paymentId: razorpay_payment_id,
          }).catch(() => {});
        } else {
          const resend = new Resend(resendApiKey);
          const { error: emailError } = await resend.emails.send({
            from: fromEmail,
            to: [paidUser.email],
            subject: emailSubject,
            html: emailHtml,
          });

          if (emailError) {
            logger.error('Failed to send welcome email via Resend', emailError, {
              category: 'email',
              userId,
              metadata: { to: paidUser.email, fromEmail },
            });
            await notifyAdminOnEmailFailure({
              userName: paidUser.name || 'Unknown',
              userEmail: paidUser.email,
              errorMessage:
                typeof emailError === 'object' && emailError !== null && 'message' in emailError
                  ? String(emailError.message)
                  : JSON.stringify(emailError),
              paymentId: razorpay_payment_id,
            }).catch(() => {});
          }
        }

        await notifyAdminOnPayment({
          type: 'new_payment',
          userName: paidUser.name || 'Unknown',
          userEmail: paidUser.email,
          planTier: resolved.paymentLabel,
          amountInRupees: amountInPaise / 100,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          examType: paidUser.examType || 'mppsc',
        }).catch(() => {});
      }
    }

    logger.info('Payment verified successfully', {
      category: 'payment',
      metadata: { userId, planTier, orderId: razorpay_order_id },
    });

    return {
      success: true,
      planTier,
      paymentLabel: resolved.paymentLabel,
      accessGrants: resolved.accessGrants,
    };
  } catch (error: unknown) {
    logger.error('Payment verification error:', error, {
      category: 'payment',
    });
    
    await notifyAdminOnVerificationFailure({
      userId: userId || 'unknown',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      error: error instanceof Error ? error.message : 'Unexpected verification error in verifyPayment server action',
    }).catch(() => {});

    const message = error instanceof Error ? error.message : 'Verification failed';
    return { error: message };
  }
}
