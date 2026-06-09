'use server';

import { db } from '@/db';
import { mppscUsers, mppscUserActivities } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';
import { parseAccessGrants, serializeAccessGrants } from '@/lib/access-grants';
import { sendTelegramNotification, sendLeadNotification, escapeHTML } from '@/lib/telegram';
import { v4 as uuidv4 } from 'uuid';
import { after } from 'next/server';
import { hasActiveAuthSession, touchAuthLoginMetadata } from '@/lib/auth-session-metadata';

import { AuthenticatedUser } from '@/types/auth';

/**
 * Auth Actions - Street Map (Server Side)
 * - getCurrentUser(): current cookie session ka clean user snapshot deta hai.
 * - loginUserAction():
 *   a) credentials verify
 *   b) active-session marker check (metadata.authSession)
 *   c) force na ho to confirmation mangta hai
 *   d) force/normal login pe sessionVersion bump + login marker set
 *
 * Analogy:
 * sessionVersion = purana pass cancel karne ka "gate number change"
 * authSession metadata = "last in / last out" register.
 */
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
  const { verifyAuthInternal } = await import('@/lib/auth');
  const user = await verifyAuthInternal();

  if (!user) {
    return { user: null };
  }

  // 🛡️ Detected session version mismatch
  if (user._mismatch) {
    return { user: null, reason: 'multi_device' };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      isSubscribed: user.isSubscribed,
      planTier: user.planTier,
      role: user.role,
      accessExpiresAt: user.accessExpiresAt ?? undefined,
      accessGrants: user.accessGrants,
    },
  };
}

interface LoginParams {
  email?: string;
  password?: string;
  force?: boolean;
}

/**
 * 🔑 Login User (Server Action)
 *
 * Bhai, ye function email aur password leke user ko login karata hai.
 * API route se move kiya gaya taaki security aur consistency bani rahe.
 */
export async function loginUserAction(formData: LoginParams) {
  const { email, password, force } = formData;

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
    let currentAccessGrants = user.accessGrants;

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
        currentAccessGrants = serializeAccessGrants(['mppsc_pre']);
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

    // ── Active Session Detection ────────────────────────────────
    // A takeover is active if the last login is newer than the last logout.
    if (!force) {
      if (hasActiveAuthSession(user.metadata)) {
        return {
          requiresConfirmation: true,
          message:
            'An active session was detected. Logging in here will disconnect your other devices. Continue?',
        };
      }
    }

    // ── Single Device Login Logic ──────────────────────────────
    // Bhai, we increment sessionVersion to invalidate all previous JWTs.
    // If they were logged in elsewhere, their next request will fail verifyAuth.
    const newVersion = (user.sessionVersion || 0) + 1;

    await db
      .update(mppscUsers)
      .set({
        sessionVersion: newVersion,
        metadata: touchAuthLoginMetadata(user.metadata),
      })
      .where(eq(mppscUsers.id, user.id));

    // ── Audit Log ──────────────────────────────────────────────
    try {
      await db.insert(mppscUserActivities).values({
        id: uuidv4(),
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        action: 'LOGIN',
        details: {
          ip,
          userAgent: headersList.get('user-agent'),
          sessionVersion: newVersion,
          forced: !!force,
        },
      });
    } catch (e) {
      logger.error('Failed to log login activity', e, { category: 'auth' });
    }

    // ── Telegram Notification ───────────────────────────────────
    after(async () => {
      try {
        const userAgent = headersList.get('user-agent') || 'Unknown Device';
        
        await sendLeadNotification({
          type: 'Returning Lead', // Login is a returning event
          name: user.name,
          email: user.email,
          phone: user.phone,
          plan: user.planTier || 'FREE',
          status: `Login Detected ${force ? '(FORCED)' : ''} — IP: ${ip} | Device: ${userAgent.slice(0, 50)}`
        });
      } catch (e) {
        logger.error('Telegram login notification failed (non-blocking)', e, {
          category: 'telegram',
        });
      }
    });

    // ── Sign JWT Token ──────────────────────────────────────────
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionVersion: newVersion,
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

    const freshGrants = parseAccessGrants(currentAccessGrants);

    return {
      success: true,
      message: force
        ? 'Login forced. All other sessions have been logged out.'
        : 'Logged in successfully. Other sessions have been logged out for security.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isSubscribed: currentIsSubscribed,
        planTier: currentPlanTier,
        role: user.role as any,
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
