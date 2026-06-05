import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { db } from '@/db';
import { payments, mppscUsers } from '@/db/schema';
import { fetchPricingConfigRow } from '@/lib/pricing-db';
import { eq } from 'drizzle-orm';
import {
  mergeGrantsAfterPrePurchase,
  parseAccessGrants,
  serializeAccessGrants,
} from '@/lib/access-grants';
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';
import { checkRateLimit } from '@/lib/rate-limit';
import { PRICING_DEFAULTS } from '@/config/pricing';
import { notifyAdminOnPayment, notifyAdminOnEmailFailure, notifyAdminOnVerificationFailure } from '@/lib/admin-notify';

/**
 * Payment Verification API FOR UPGRADES 🚀
 *
 * Specialized route for existing users upgrading to Pro.
 * - Verifies payment
 * - Updates plan to Pro
 * - Sends RECEIPT email (No magic link/password setup)
 */
export async function POST(req: Request) {
  let requestUserId: string | undefined;
  let requestOrderId: string | undefined;
  let requestPaymentId: string | undefined;
  try {
    // 🛑 Rate Limit
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { paymentLimiter } = await import('@/lib/rate-limit');
    const { success } = await checkRateLimit(paymentLimiter, ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = body;
    requestUserId = userId;
    requestOrderId = razorpay_order_id;
    requestPaymentId = razorpay_payment_id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error('Razorpay secret not configured');

    // 🔒 Signature Verification
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    // 🛡️ CRASH PREVENTION: Validate signature format BEFORE timingSafeEqual
    // timingSafeEqual THROWS if buffer lengths differ! Attacker could crash server
    // with garbage signature like "abc" (odd hex → different buffer length)
    const isValidHex = /^[a-f0-9]+$/i.test(razorpay_signature);
    if (!isValidHex || razorpay_signature.length !== generated_signature.length) {
      await notifyAdminOnVerificationFailure({
        userId,
        orderId: razorpay_order_id,
        error: 'Malformed payment signature format (Upgrade route)',
      }).catch(() => {});
      return NextResponse.json({ error: 'Invalid payment signature format' }, { status: 400 });
    }

    // 🛡️ Timing-Safe Comparison (Prevents timing attacks)
    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(generated_signature, 'hex'),
      Buffer.from(razorpay_signature, 'hex')
    );

    if (!isValidSignature) {
      await notifyAdminOnVerificationFailure({
        userId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        error: 'Invalid Razorpay signature (Upgrade route)',
      }).catch(() => {});
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 🔄 Idempotency Check
    const existingPayment = await db
      .select({ id: payments.id })
      .from(payments)
      .where(eq(payments.paymentId, razorpay_payment_id))
      .limit(1);
    if (existingPayment.length > 0) {
      return NextResponse.json({ success: true, message: 'Payment already verified' });
    }

    // 👤 Verify User
    const user = await db.query.mppscUsers.findFirst({
      where: eq(mppscUsers.id, userId),
    });
    if (!user || !user.email) {
      return NextResponse.json({ error: 'User not found or email missing' }, { status: 400 });
    }

    // 🕵️ Razorpay Cross-Check
    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: secret,
    });
    const order = await instance.orders.fetch(razorpay_order_id);

    // 🛡️ Vulnerability Fix: Cross-Check UserId
    // Check agar order kisi aur user (order.notes.userId) ka h, to block karo.
    const orderUserId = order.notes?.userId;
    if (orderUserId && orderUserId !== userId) {
      logger.error(
        `Fraud Attempt: Order User ${orderUserId} !== Request User ${userId}`,
        undefined,
        {
          category: 'payment',
          userId,
          metadata: { orderUserId, razorpay_order_id },
        }
      );
      await notifyAdminOnVerificationFailure({
        userId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        error: `Order ownership mismatch (User: ${userId}, Order notes: ${orderUserId})`,
      }).catch(() => {});
      return NextResponse.json({ error: 'Order does not belong to this user' }, { status: 400 });
    }

    // 💡 Note: razorpay_key_id public hota h (safe to expose), secret server par safe h.
    const paidAmount = order.amount as number;

    // Recover examType from order notes
    const examType = (order.notes?.examType as 'upsc' | 'mppsc' | 'mppolice') || 'mppsc';

    // 🏷️ Plan Verification (Allows Upgrade Price OR Full Pro Price)
    const p = (await fetchPricingConfigRow(examType)) ?? PRICING_DEFAULTS;

    // We expect user to pay at least upgrade price
    const upgradeAmountPaise = (p.upgradePrice ?? PRICING_DEFAULTS.upgradePrice) * 100;
    const proAmountPaise = (p.proPrice ?? PRICING_DEFAULTS.proPrice) * 100;

    const isValidAmount = paidAmount >= upgradeAmountPaise || paidAmount >= proAmountPaise;

    // If they paid standard Lite price (unlikely in this route, but safety check), don't upgrade to Pro
    const liteAmountPaise = (p.litePrice ?? PRICING_DEFAULTS.litePrice) * 100;

    let planTier = user.planTier || 'lite';
    if (isValidAmount && paidAmount > liteAmountPaise) {
      planTier = 'pro';
    }

    // 📅 Calculate Expiry Date (Upgrades are always to Pro/Extended)
    const months = p.proMonths ?? PRICING_DEFAULTS.proMonths;
    const accessExpiresAt = new Date();
    accessExpiresAt.setMonth(accessExpiresAt.getMonth() + months);

    // 💾 Persist Payment & Update User
    await db.transaction(async (tx) => {
      await tx.insert(payments).values({
        id: `pay_${uuidv4()}`,
        userId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        amount: paidAmount,
        planTier: planTier as 'lite' | 'pro',
        status: 'captured',
        currency: 'INR',
      });

      const grants = mergeGrantsAfterPrePurchase(parseAccessGrants(user.accessGrants));

      await tx
        .update(mppscUsers)
        .set({
          planTier: planTier as 'lite' | 'pro',
          isSubscribed: true,
          isActive: true,
          accessExpiresAt,
          accessGrants: serializeAccessGrants(grants),
          deletedAt: null,
        })
        .where(eq(mppscUsers.id, userId));
    });

    // 📧 Send Receipt Email
    const resend = new Resend(process.env.RESEND_API_KEY);

    const fromName = process.env.EMAIL_FROM_NAME || 'MPPSC 2026';
    const fromAddress =
      process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM_ADDRESS || 'no-reply@mppsc.zenscroll.app';
    const fromEmail = `${fromName} <${fromAddress}>`;

    const { error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: [user.email!],
      subject: '🚀 Upgrade Successful — MPPSC ZEN',
      html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #111;">Upgrade Successful!</h1>
                <p>Hi ${user.name},</p>
                <p>You have successfully upgraded your plan to <strong>Pro</strong>.</p>
                <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #666; font-size: 14px;">Transaction ID</p>
                    <p style="margin: 4px 0 0; font-family: monospace; font-size: 16px;">${razorpay_payment_id}</p>
                </div>
                <p>All Pro features are now unlocked for your account.</p>
                <p>Keep practicing!</p>
                <hr style="border: none; border-top: 1px solid #eaeaea; margin: 40px 0;" />
                <p style="color: #888; font-size: 12px;">Mindful MPPSC Zen App</p>
            </div>
        `,
    });

    if (emailError) {
      logger.error('Failed to send upgrade email via Resend', emailError, {
        category: 'email',
        userId,
        metadata: { to: user.email },
      });
      
      // 🚨 Notify admin that user email failed
      await notifyAdminOnEmailFailure({
        userName: user.name || 'Unknown',
        userEmail: user.email!,
        errorMessage: typeof emailError === 'object' && emailError !== null && 'message' in emailError 
          ? String(emailError.message) 
          : JSON.stringify(emailError),
        paymentId: razorpay_payment_id,
      }).catch(() => {});
    }

    // 📧 Notify Admin of Upgrade (Non-blocking)
    await notifyAdminOnPayment({
      type: 'upgrade',
      userName: user.name || 'Unknown',
      userEmail: user.email!,
      planTier: planTier as 'lite' | 'pro',
      amountInRupees: paidAmount / 100,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      isUpgrade: true,
      examType: user.examType || 'mppsc',
    }).catch(() => {}); // Fire and forget

    // ── Log Activity ──────────────────────────────────────────────
    try {
      const { logUserActivity } = await import('@/app/actions/user-activity');
      await logUserActivity({
        userId,
        userEmail: user.email!,
        userName: user.name,
        adminId: 'system',
        action: 'PLAN_CHANGE',
        details: {
          plan: 'pro',
          amount: paidAmount / 100,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          reason: 'Upgrade Payment',
          isUpgrade: true,
        },
      });
    } catch (err) {
      logger.warn('Failed to log upgrade activity:', {
        category: 'payment',
        metadata: { error: err, userId },
      });
    }

    return NextResponse.json({ success: true, planTier });
  } catch (error) {
    logger.error('Upgrade verification error:', error, {
      category: 'payment',
      userId: requestUserId,
      metadata: { razorpay_order_id: requestOrderId, razorpay_payment_id: requestPaymentId },
    });
    await notifyAdminOnVerificationFailure({
      userId: requestUserId || 'unknown',
      orderId: requestOrderId || 'unknown',
      paymentId: requestPaymentId || undefined,
      error: error instanceof Error ? error.message : 'Unexpected verification error in verify-upgrade API route',
    }).catch(() => {});
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
