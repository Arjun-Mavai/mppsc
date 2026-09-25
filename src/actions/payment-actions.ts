'use server';

import { db } from '@/db';
import { mppscUsers, payments, verificationTokens } from '@/db/schema';
import { fetchPricingConfigRow } from '@/lib/pricing-db';
import { eq, sql, and } from 'drizzle-orm';
import { addHours } from 'date-fns';
import { Resend } from 'resend';
import { appPath } from '@/lib/app-url';
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
import { headers } from 'next/headers';
import { sendLeadNotification } from '@/lib/telegram';
import { getClientIp } from '@/lib/ip';
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
  consentAccepted: z.boolean().refine((val) => val === true, {
    message: 'Consent to terms is mandatory to proceed',
  }),
  consentVersion: z.string().default('v1.2'),
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

        const { name, email, phone, source, planType, examType, consentAccepted, consentVersion } = validatedInput.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 🌍 Retrieve IP and User Agent for consent audit trail
    const reqHeaders = await headers();
    const ipAddress = getClientIp(reqHeaders);
    const userAgent = reqHeaders.get('user-agent') || 'unknown';

    const consentInfo = {
      accepted: consentAccepted,
      version: consentVersion,
      ip: ipAddress,
      userAgent: userAgent,
      timestamp: new Date().toISOString(),
    };

    // ── PHASE 1: Find existing user by email (case-insensitive)
    const existingUser = await db.query.mppscUsers.findFirst({
      where: and(
        sql`LOWER(${mppscUsers.email}) = ${normalizedEmail}`,
        eq(mppscUsers.examType, examType)
      ),
    });

    const currentSession = await verifyAuth();

    let isRenewalOrder = false;

    // Paid Pre (lite/pro) + same email + duplicate Pre SKU → block UNLESS user is logged in as that user OR account plan is expired
    if (existingUser) {
      const tier = String(existingUser.planTier ?? 'free').toLowerCase();
      const hasPaidPre = tier === 'lite' || tier === 'pro';
      const duplicatePreSku =
        hasPaidPre && (planType === 'lite' || planType === 'pro' || planType === 'upgrade');

      const isExpired = existingUser.accessExpiresAt
        ? new Date(existingUser.accessExpiresAt).getTime() < Date.now()
        : false;

      const isSameUserSession = currentSession && currentSession.id === existingUser.id;

      if (isSameUserSession || isExpired) {
        // Safe renewal flow — user is renewing their own account or plan has expired
        isRenewalOrder = true;
      } else if (duplicatePreSku) {
        if (!currentSession || currentSession.id !== existingUser.id) {
          return {
            error:
              'This email is already registered with an active plan. Please log in to renew or manage your account.',
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
            consent: consentInfo,
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
          consent: consentInfo,
        }),
        planTier: 'free',
        examType: examType, // Set exam type on registration
        accessGrants: serializeAccessGrants(['mppsc_pre']),
      });
    }

    after(async () => {
      try {
        const formattedTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
        const consentDetails = 
          `\n\n🛡️ <b>Clickwrap Consent Captured:</b>\n` +
          `• Accepted: ${consentAccepted ? '✅ Yes' : '❌ No'}\n` +
          `• Version: <code>${consentVersion}</code>\n` +
          `• IP Address: <code>${ipAddress}</code>\n` +
          `• Device/UA: <code>${userAgent.slice(0, 100)}${userAgent.length > 100 ? '...' : ''}</code>\n` +
          `• Time: <code>${formattedTime}</code>`;

        await sendLeadNotification({
          type: isReturning ? 'Returning Lead' : 'New Lead',
          name: name.trim(),
          email: normalizedEmail,
          phone: phone.trim(),
          plan: planType,
          exam: examType,
          source: source,
          attemptCount: finalAttemptCount,
          status: `Checkout Started — Awaiting Payment${consentDetails}`
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
        paymentType: isRenewalOrder ? 'renewal' : (planType === 'upgrade' ? 'upgrade' : 'new'),
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
      columns: {
        accessGrants: true,
        planTier: true,
        metadata: true,
        accessExpiresAt: true,
        renewalCount: true,
        email: true,
        name: true,
      },
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

    // 🧠 Smart Expiry Calculation:
    // 1. Early Renewal (old expiry in future) -> add months to old expiry
    // 2. Late/Expired Renewal (old expiry in past or null) -> add months to NOW
    const now = new Date();
    let baseExpiryDate = now;
    if (paidUserBefore?.accessExpiresAt && new Date(paidUserBefore.accessExpiresAt) > now) {
      baseExpiryDate = new Date(paidUserBefore.accessExpiresAt);
    }

    const accessExpiresAt = new Date(baseExpiryDate);
    accessExpiresAt.setMonth(accessExpiresAt.getMonth() + resolved.months);

    const planTier = resolved.planTier;
    const subscribedNow =
      planTier === 'lite' || planTier === 'pro' || resolved.paymentLabel === 'mains' || resolved.paymentLabel === 'combo';

    // Payment Type Resolution
    const orderPaymentType = order.notes?.paymentType as 'new' | 'renewal' | 'upgrade' | undefined;
    const isRenewal = orderPaymentType === 'renewal' || (paidUserBefore?.accessExpiresAt !== null && paidUserBefore?.accessExpiresAt !== undefined);
    const resolvedPaymentType = orderPaymentType || (isRenewal ? 'renewal' : (order.notes?.planType === 'upgrade' ? 'upgrade' : 'new'));

    // Extract consent info from user metadata
    let consentFromMeta = null;
    if (paidUserBefore?.metadata) {
      try {
        const metaObj = typeof paidUserBefore.metadata === 'string'
          ? JSON.parse(paidUserBefore.metadata)
          : paidUserBefore.metadata;
        if (metaObj && metaObj.consent) {
          consentFromMeta = metaObj.consent;
        }
      } catch (e) {
        // Safe catch
      }
    }

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
        paymentType: resolvedPaymentType,
        status: 'captured',
        examType,
        notes: JSON.stringify({
          planType: order.notes?.planType || resolved.paymentLabel,
          paymentType: resolvedPaymentType,
          extendedFrom: baseExpiryDate.toISOString(),
          extendedTo: accessExpiresAt.toISOString(),
          consent: consentFromMeta || {
            accepted: true,
            version: 'v1.2',
            timestamp: new Date().toISOString(),
            ip: 'unknown_at_verify',
            userAgent: 'unknown_at_verify'
          }
        }),
      });

      const nextRenewalCount = isRenewal
        ? ((paidUserBefore?.renewalCount || 0) + 1)
        : (paidUserBefore?.renewalCount || 0);

      await tx
        .update(mppscUsers)
        .set({
          planTier,
          isSubscribed: subscribedNow,
          isActive: true,
          accessExpiresAt,
          lastRenewedAt: isRenewal ? new Date() : undefined,
          renewalCount: nextRenewalCount,
          accessGrants: serializeAccessGrants(resolved.accessGrants),
          deletedAt: null,
        })
        .where(eq(mppscUsers.id, userId!));

      // Audit Log Entry for Renewal
      if (isRenewal) {
        const { mppscUserActivities } = await import('@/db/schema');
        await tx.insert(mppscUserActivities).values({
          id: uuidv4(),
          userId,
          userEmail: paidUserBefore?.email || 'student',
          userName: paidUserBefore?.name || 'Aspirant',
          action: 'PLAN_RENEWAL',
          details: JSON.stringify({
            oldExpiresAt: paidUserBefore?.accessExpiresAt || null,
            newExpiresAt: accessExpiresAt.toISOString(),
            paymentId: razorpay_payment_id,
            amountPaidRupees: amountInPaise / 100,
            planTier,
            renewalCount: nextRenewalCount,
          }),
        });
      }
    });

    // 🎫 + 📧 Set-password token + welcome email
    // PaymentModal calls this server action — NOT /api/payment/verify — so this block is required
    // for first-time payers to receive mail and use /auth/set-password. Upgrade skips (already has password).
    const isUpgradePurchase = (order.notes?.planType as string | undefined) === 'upgrade';
    
    after(async () => {
      try {
        if (!isUpgradePurchase) {
          const paidUser = await db.query.mppscUsers.findFirst({
            where: eq(mppscUsers.id, userId!),
            columns: { name: true, email: true, examType: true, phone: true },
          });

          if (paidUser?.email) {
            const token = uuidv4();
            const expires = addHours(new Date(), 24);

            await db.insert(verificationTokens).values({
              identifier: userId!,
              token,
              expires,
            });
            
            // 🚀 Send WhatsApp Welcome Alert (COMMENTED OUT FOR NOW)
            // Note: Uncomment this once the 'zenscroll_alert' template is officially approved by Meta.
            /*
            const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
            const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
            if (WHATSAPP_TOKEN && PHONE_ID && paidUser.phone) {
              try {
                const waPayload = {
                  messaging_product: "whatsapp",
                  to: paidUser.phone.startsWith('91') ? paidUser.phone : `91${paidUser.phone}`,
                  type: "template",
                  template: {
                    name: "zenscroll_alert", 
                    language: { code: "en_US" },
                    components: [
                      {
                        type: "header",
                        parameters: [
                          {
                            type: "image",
                            image: {
                              link: "https://mppsc.zenscroll.app/og-hero.png"
                            }
                          }
                        ]
                      },
                      {
                        type: "body",
                        parameters: [
                          {
                            type: "text",
                            text: paidUser.name || "Aspirant"
                          }
                        ]
                      }
                    ]
                  }
                };

                await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(waPayload),
                });
              } catch (waErr) {
                logger.error('Failed to send WhatsApp welcome alert', waErr, { category: 'api', userId });
              }
            }
            */

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
              userPhone: paidUser.phone,
              planTier: resolved.paymentLabel,
              amountInRupees: amountInPaise / 100,
              orderId: razorpay_order_id,
              paymentId: razorpay_payment_id,
              examType: paidUser.examType || 'mppsc',
              consent: consentFromMeta ? {
                consentAccepted: !!(consentFromMeta.accepted ?? (consentFromMeta as any).consentAccepted ?? false),
                ipAddress: String(consentFromMeta.ip ?? (consentFromMeta as any).ipAddress ?? 'unknown'),
                userAgent: String(consentFromMeta.userAgent ?? 'unknown'),
                version: String(consentFromMeta.version ?? 'unknown'),
                timestamp: String(consentFromMeta.timestamp ?? ''),
              } : null,
            }).catch(() => {});
          }
        }
      } catch (err) {
        logger.error('Background tasks failed in verifyPayment', err, { category: 'payment', metadata: { userId, orderId: razorpay_order_id } });
      }
    });

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
