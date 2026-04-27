import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { db } from '@/db';
import { mppscUsers, verificationTokens, payments } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

const PLAN_ACCESS_MONTHS: Record<string, number> = { lite: 4, pro: 7 };

const passwordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Need at least one lowercase letter')
    .regex(/[A-Z]/, 'Need at least one uppercase letter')
    .regex(/\d/, 'Need at least one number'),
});

export async function POST(req: Request) {
  let requestToken: string | undefined;
  try {
    // Rate limit
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { setPasswordLimiter } = await import('@/lib/rate-limit');
    const { success } = await checkRateLimit(setPasswordLimiter, ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const { token, password } = passwordSchema.parse(body);
    requestToken = token;

    // Verify token
    const storedToken = await db.query.verificationTokens.findFirst({
      where: eq(verificationTokens.token, token),
    });

    if (!storedToken) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    if (new Date() > storedToken.expires) {
      // Clean up expired token
      await db.delete(verificationTokens).where(eq(verificationTokens.token, token));
      return NextResponse.json(
        { error: 'This link has expired. Use Forgot Password on the login page to get a new one.' },
        { status: 400 }
      );
    }

    const userId = storedToken.identifier;

    // Look up plan from most recent payment
    const userPayments = await db
      .select({ planTier: payments.planTier })
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt))
      .limit(1);

    const planTier = userPayments[0]?.planTier || 'pro';
    const months = PLAN_ACCESS_MONTHS[planTier] || 7;

    // Calculate access expiry
    const accessExpiresAt = new Date();
    accessExpiresAt.setMonth(accessExpiresAt.getMonth() + months);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user — activate with correct plan and expiry
    await db
      .update(mppscUsers)
      .set({
        password: hashedPassword,
        isActive: true,
        planTier: planTier as 'lite' | 'pro',
        isSubscribed: true,
        accessExpiresAt,
      })
      .where(eq(mppscUsers.id, userId));

    // Delete used token
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token));

    // Cleanup: delete all expired tokens (housekeeping)
    await db
      .delete(verificationTokens)
      .where(sql`${verificationTokens.expires} < strftime('%s', 'now')`);

    return NextResponse.json({ success: true, planTier });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }
    logger.error('Set password error:', error, {
      category: 'auth',
      metadata: { hasToken: !!requestToken },
    });
    return NextResponse.json({ error: 'Failed to set password' }, { status: 500 });
  }
}
