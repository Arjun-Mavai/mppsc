import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import Razorpay from 'razorpay';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';
import { db } from '@/db';
import { pricingConfig } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { PRICING_DEFAULTS } from '@/config/pricing';
import { checkRateLimit } from '@/lib/rate-limit';
import { notifyAdminOnVerificationFailure } from '@/lib/admin-notify';

const createOrderSchema = z.object({
  planType: z.enum(['lite', 'pro', 'upgrade']),
  examType: z.enum(['upsc', 'mppsc', 'mppolice']).default('mppsc'),
});

/**
 * Razorpay Order Creation API - The Security Gate 🛡️
 *
 * Bhai, ye route sabse critical h. Yaha hum 'Order' create karte h.
 *
 * 🔥 Why Server-Side?
 * Agar hum frontend se amount bhejte, to koi bhi right-click karke inspect element se
 * amount ko 999 se 1 kar sakta tha! 😱
 * Isliye hum sirf 'planType' lete h aur amount DB/Config se uthate h.
 *
 * Best Practices:
 * 1. Zod Validation: Incoming data ko sanitize karo.
 * 2. Rate Limiting: Spam bots ko roko.
 * 3. Environment Variables: Keys code me hardcode nahi, .env me rakho.
 */
export async function POST(req: Request) {
  let planType: string | undefined;
  try {
    // 🚦 Rate Limit Check: 10 requests / 15 mins
    // Bhai, ye zaroori h taaki koi script lagakar hazaro fake orders na banaye.
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { paymentLimiter } = await import('@/lib/rate-limit');
    const { success } = await checkRateLimit(paymentLimiter, ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = createOrderSchema.parse(body);
    planType = parsed.planType;
    const examType = parsed.examType;

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay keys not configured');
    }

    // 💰 Amount Calculation: The Single Source of Truth
    // DB se price fetch karo. Agar DB down h, to default constant use karo (Fallback Strategy).
    const rows = await db
      .select()
      .from(pricingConfig)
      .where(eq(pricingConfig.examType, examType))
      .limit(1);
    const p = rows[0] || PRICING_DEFAULTS;

    const PLAN_AMOUNTS: Record<string, number> = {
      lite: (p.litePrice ?? PRICING_DEFAULTS.litePrice) * 100, // Amount in Paise (INR * 100)
      pro: (p.proPrice ?? PRICING_DEFAULTS.proPrice) * 100,
      upgrade: (p.upgradePrice ?? PRICING_DEFAULTS.upgradePrice) * 100,
    };

    const amount = PLAN_AMOUNTS[planType];
    if (!amount || amount < 100) {
      // Min 1 Rupee (100 paise)
      return NextResponse.json({ error: 'Invalid plan configuration' }, { status: 500 });
    }

    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    //  Metadata: Add UserId for verification later
    const session = await verifyAuth();

    // 📝 Creating Order on Razorpay
    // Ye ID (order_xxx) frontend par jayegi. Payment isi ID ke against hoga.
    const order = await instance.orders.create({
      amount,
      currency: 'INR',
      notes: { planType, userId: session?.id ?? '', examType }, // Metadata for future reference
    });

    return NextResponse.json({ ...(order as any), planType });
  } catch (error: any) {
    const message = error instanceof Error ? error.message : 'Failed to create order';
    logger.error('Razorpay order creation error:', error, {
      category: 'payment',
      metadata: { planType },
    });
    
    // 🚨 Notify Admin on Order Creation Failure
    notifyAdminOnVerificationFailure({
      userId: 'requested',
      orderId: 'failed',
      error: `Order Creation Failure (${planType}): ${message}`,
    }).catch(() => {});

    // 🛡️ SECURITY FIX: Don't expose internal error.message to client!
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
