import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { db } from '@/db';
import { mppscUsers, verificationTokens } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/ip';


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
    const ip = getClientIp(req.headers);
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

    // Fetch user to get their current planTier for the success message
    const user = await db.query.mppscUsers.findFirst({
      where: eq(mppscUsers.id, userId),
      columns: { planTier: true },
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user — set password and ensure they are active.
    // Do NOT touch accessExpiresAt or planTier, as they are managed by verifyPayment
    // or admin explicitly. Resetting password should not alter subscription state!
    await db
      .update(mppscUsers)
      .set({
        password: hashedPassword,
        isActive: true,
      })
      .where(eq(mppscUsers.id, userId));

    // Delete used token
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token));

    // Cleanup: delete all expired tokens (housekeeping)
    await db
      .delete(verificationTokens)
      .where(sql`${verificationTokens.expires} < strftime('%s', 'now')`);

    return NextResponse.json({ success: true, planTier: user?.planTier || 'free' });
  } catch (error: unknown) {
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
