'use server';

import { verifyAuth } from '@/lib/auth';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';
import { parseAccessGrants, serializeAccessGrants } from '@/lib/access-grants';

/**
 * 🔐 Get Current User (Server Action)
 *
 * Bhai, ye function JWT se user data nikalta hai.
 * Frontend ko userId bhejne ki zaroorat nahi — sab server pe hota hai!
 *
 * Benefits:
 * - No API endpoint visible in Network tab
 * - userId never exposed to client
 * - Automatic cookie handling
 */
export async function getCurrentUser() {
  const user = await verifyAuth();

  if (!user) {
    return { user: null };
  }

  const grants = parseAccessGrants(user.accessGrants);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      isSubscribed: !!user.isSubscribed,
      planTier: (user.planTier as any) || 'free',
      role: user.role ?? undefined,
      accessExpiresAt: user.accessExpiresAt ?? undefined,
      accessGrants: grants.length ? grants : ['mppsc_pre'],
    },
  };
}

interface LoginParams {
  email?: string;
  password?: string;
}

/**
 * 🔑 Login User (Server Action)
 *
 * Bhai, ye function email aur password leke user ko login karata hai.
 * API route se move kiya gaya taaki security aur consistency bani rahe.
 */
export async function loginUserAction(formData: LoginParams) {
  const { email, password } = formData;

  try {
    // ── Rate Limiting ───────────────────────────────────────────
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') ?? '127.0.0.1';
    const { loginLimiter, checkRateLimit } = await import('@/lib/rate-limit');

    const { success } = await checkRateLimit(loginLimiter, ip);

    if (!success) {
      return {
        error: 'Too many login attempts. Please try again after 15 minutes.',
      };
    }

    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    // ── Find User by Email ──────────────────────────────────────
    const users = await db
      .select()
      .from(mppscUsers)
      .where(eq(mppscUsers.email, email.toLowerCase().trim()))
      .limit(1);
    const user = users[0];

    if (!user) {
      return { error: 'Invalid credentials' };
    }

    // ── Exam Type Check ────────────────────────────────────────
    // This repo is for MPPSC only. Restrict login to mppsc users.
    if (user.examType && user.examType !== 'mppsc') {
      return {
        error: `This account is for ${user.examType.toUpperCase()}. Please login to the correct site.`,
        code: 'INVALID_EXAM_TYPE',
      };
    }

    // ── Soft Delete Check ──────────────────────────────────────
    if (user.deletedAt) {
      return {
        error: 'Account deactivated. Contact admin for reactivation.',
      };
    }

    // ── Active Check ──────────────────────────────────────────
    if (user.isActive === false) {
      return {
        error: 'Account is currently inactive. Contact admin to reactivate.',
        code: 'ACCOUNT_INACTIVE',
      };
    }

    // ── Access Expiry Check ────────────────────────────────────
    let currentPlanTier = (user.planTier as any) || 'free';
    let currentIsSubscribed = !!user.isSubscribed;

    if (user.accessExpiresAt) {
      const now = new Date();
      const expiryDate = new Date(user.accessExpiresAt);
      const hadPaidAccess = user.planTier !== 'free' || user.isSubscribed;
      if (expiryDate < now && hadPaidAccess) {
        await db
          .update(mppscUsers)
          .set({
            planTier: 'free',
            isSubscribed: false,
            accessGrants: serializeAccessGrants(['mppsc_pre']),
          })
          .where(eq(mppscUsers.id, user.id));

        currentPlanTier = 'free';
        currentIsSubscribed = false;
      }
    }

    // ── Password Verification ───────────────────────────────────
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // 🚨 Robust Rate Limiting: Count failure against a stricter limiter and ENFORCE it
      const { loginFailureLimiter, checkRateLimit } = await import('@/lib/rate-limit');
      const { success } = await checkRateLimit(loginFailureLimiter, ip);

      if (!success) {
        return {
          error: 'Too many failed login attempts. Please try again after 15 minutes.',
        };
      }

      return { error: 'Invalid credentials' };
    }

    // ── Sign JWT Token ──────────────────────────────────────────
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const { signToken } = await import('@/lib/jwt');
    const token = signToken(payload);

    if (!token) {
      throw new Error('Token generation failed');
    }

    // ── Set HTTP-Only Cookie (30 days) ──────────────────────────
    const cookieStore = await cookies();
    cookieStore.set('mppsc_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    const fresh = await db.query.mppscUsers.findFirst({
      where: eq(mppscUsers.id, user.id),
      columns: { accessGrants: true },
    });

    const freshGrants = parseAccessGrants(fresh?.accessGrants);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isSubscribed: currentIsSubscribed,
        planTier: currentPlanTier,
        role: user.role ?? undefined,
        accessExpiresAt: user.accessExpiresAt ?? undefined,
        accessGrants: freshGrants.length ? freshGrants : ['mppsc_pre'],
      },
    };
  } catch (error) {
    logger.error('Login action error:', error, {
      category: 'auth',
      metadata: { email },
    });
    return { error: 'Internal Server Error' };
  }
}
