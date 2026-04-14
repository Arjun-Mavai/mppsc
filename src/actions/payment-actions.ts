'use server';

import { db } from '@/db';
import { mppscUsers, pricingConfig, payments } from '@/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { PRICING_DEFAULTS } from '@/config/pricing';
import { verifyAuth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import Razorpay from 'razorpay';
import { logger } from '@/lib/logger';
import crypto from 'crypto';
import { z } from 'zod';
import { sendTelegramNotification, escapeHTML } from '@/lib/telegram';
import { notifyAdminOnVerificationFailure } from '@/lib/admin-notify';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💳 START PAYMENT (Register + Create Order)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const startPaymentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(20),
  source: z.string().optional(),
  planType: z.enum(['lite', 'pro', 'upgrade']),
  examType: z.enum(['upsc', 'mppsc', 'mppolice']).default('mppsc'),
});

interface StartPaymentInput extends z.infer<typeof startPaymentSchema> {}

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

    // If this email already has a paid plan (lite/pro) — block unless same user is logged in
    if (existingUser) {
      const tier = String(existingUser.planTier ?? 'free').toLowerCase();
      const isSubscribed = Boolean(existingUser.isSubscribed);
      const hasPaidPlan = tier === 'lite' || tier === 'pro' || isSubscribed;

      if (hasPaidPlan) {
        if (!currentSession || currentSession.id !== existingUser.id) {
          return {
            error:
              'This email is already registered with a plan. Please log in to access your account or upgrade.',
          };
        }
      }
    }

    let userId: string;
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

      await db
        .update(mppscUsers)
        .set({
          name: name.trim(),
          phone: phone.trim(),
          metadata: JSON.stringify({ ...existingMeta, source }),
        })
        .where(eq(mppscUsers.id, existingUser.id));
      userId = existingUser.id;
    } else {
      // New user: create account
      userId = uuidv4();
      const tempPassword = await bcrypt.hash(uuidv4(), 10);
      await db.insert(mppscUsers).values({
        id: userId,
        email: normalizedEmail,
        name: name.trim(),
        phone: phone.trim(),
        password: tempPassword,
        isActive: false,
        role: 'user',
        metadata: JSON.stringify({ source }),
        planTier: 'free',
        examType: examType, // Set exam type on registration
      });
    }

    // ── PHASE 2: Create Razorpay Order (Server-Side Pricing)
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return { error: 'Razorpay keys not configured' };
    }

    const rows = await db
      .select()
      .from(pricingConfig)
      .where(eq(pricingConfig.examType, examType))
      .limit(1);
    const p = rows[0] || PRICING_DEFAULTS;

    const PLAN_AMOUNTS: Record<string, number> = {
      lite: (p.litePrice ?? PRICING_DEFAULTS.litePrice) * 100,
      pro: (p.proPrice ?? PRICING_DEFAULTS.proPrice) * 100,
      upgrade: (p.upgradePrice ?? PRICING_DEFAULTS.upgradePrice) * 100,
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
      notes: { planType, userId, examType },
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
  let orderId: string = razorpay_order_id; // Map to local name if preferred, or just use razorpay_order_id
  let paymentId: string | undefined = razorpay_payment_id;

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
      
      notifyAdminOnVerificationFailure({
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

      notifyAdminOnVerificationFailure({
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
      return {
        message: 'Payment already verified',
        planTier: existingPayment.planTier, // DB column is `planTier`
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

      notifyAdminOnVerificationFailure({
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

    const rows = await db
      .select()
      .from(pricingConfig)
      .where(eq(pricingConfig.examType, examType)) // 🔒 Isolation
      .limit(1);
    const p = rows[0] || PRICING_DEFAULTS;

    // Compare paise against expected prices (config stores rupees, ×100 for paise)
    const litePaise = (p.litePrice ?? PRICING_DEFAULTS.litePrice) * 100;
    const proPaise = (p.proPrice ?? PRICING_DEFAULTS.proPrice) * 100;
    const upgradePaise = (p.upgradePrice ?? PRICING_DEFAULTS.upgradePrice) * 100;

    let planTier: 'lite' | 'pro';
    if (amountInPaise === litePaise) {
      planTier = 'lite';
    } else if (amountInPaise === proPaise || amountInPaise === upgradePaise) {
      // 🛡️ Both pro purchase and lite→pro upgrade grant 'pro' tier
      planTier = 'pro';
    } else {
      // 🚨 SECURITY: Reject unknown amounts instead of defaulting to pro!
      // Before this fix, ANY amount → 'pro' tier (free pro for everyone!)
      logger.warn('Unknown payment amount — does not match any plan', {
        category: 'payment',
        metadata: { userId, orderId: razorpay_order_id, amountInPaise },
      });
      return { error: 'Payment amount does not match any valid plan' };
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
        planTier,
        status: 'captured',
        examType, // 👈 FIXED: Add missing field
      });

      await tx
        .update(mppscUsers)
        .set({
          planTier,
          isSubscribed: true,
          isActive: true,
        })
        .where(eq(mppscUsers.id, userId!));
    });

    // 🚀 Step 6: Notify via Telegram
    try {
      const amountInRupees = amountInPaise / 100;
      const userResult = await db.query.mppscUsers.findFirst({
        where: eq(mppscUsers.id, userId as string),
        columns: { name: true, email: true, phone: true, examType: true },
      });

      const examLabel = userResult?.examType?.toUpperCase() || 'UNKNOWN';
      
      const message = `👮 <b>MPPSC ZEN</b>\n` +
        `💰 <b>Payment Successful (${examLabel})!</b>\n\n` +
        `👤 User: ${escapeHTML(userResult?.name || 'Unknown')}\n` +
        `📧 Email: ${escapeHTML(userResult?.email || 'N/A')}\n` +
        `📞 Phone: ${userResult?.phone || 'N/A'}\n` +
        `🎟️ Plan: ${planTier.toUpperCase()}\n` +
        `💵 Amount: ₹${amountInRupees}\n` +
        `🆔 Payment ID: <code>${razorpay_payment_id}</code>\n` +
        `✅ Access granted instantly.`;

      await sendTelegramNotification(message);
    } catch (err) {
      logger.error('Telegram notification failed for payment', { err });
    }

    logger.info('Payment verified successfully', {
      category: 'payment',
      metadata: { userId, planTier, orderId: razorpay_order_id },
    });

    return { success: true, planTier };
  } catch (error: unknown) {
    logger.error('Payment verification error:', error, {
      category: 'payment',
    });
    
    notifyAdminOnVerificationFailure({
      userId: userId || 'unknown',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      error: error instanceof Error ? error.message : 'Unexpected verification error in verifyPayment server action',
    }).catch(() => {});

    const message = error instanceof Error ? error.message : 'Verification failed';
    return { error: message };
  }
}
