import { NextResponse } from 'next/server';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { parseAccessGrants, serializeAccessGrants } from '@/lib/access-grants';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';
import { hasActiveAuthSession, touchAuthLoginMetadata } from '@/lib/auth-session-metadata';
import { setAuthCookies } from '@/lib/auth-constants';
import { getClientIp, getClientLocation } from '@/lib/ip';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔑 LOGIN API — Email + Password → JWT cookie set karo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Flow: Rate limit → Find user → Check soft-delete → Check expiry
//       → Compare password → Sign JWT → Set cookie → Return user
//
// Blocks login if:
//   1. User soft-deleted (deletedAt != null) → "Account deactivated"
//   2. Access expired (accessExpiresAt < now) → "Access expired" with date
//
// Scalability: Rate limited (15 min window), bcrypt compare, indexed email lookup
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function POST(request: Request) {
  let email: string | undefined;

  try {
    // ── Rate Limiting ───────────────────────────────────────────
    const ip = getClientIp(request.headers);
    const { loginLimiter, checkRateLimit } = await import('@/lib/rate-limit');

    const { success, limit, remaining, reset } = await checkRateLimit(loginLimiter, ip);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again after 15 minutes.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    const body = await request.json();
    email = body.email;
    const password = body.password;
    const force = Boolean(body.force);
    const deviceId = typeof body.deviceId === 'string' ? body.deviceId.trim() : undefined;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // ── Find User by Email ──────────────────────────────────────
    const users = await db
      .select()
      .from(mppscUsers)
      .where(eq(mppscUsers.email, email.toLowerCase().trim()))
      .limit(1);
    const user = users[0];

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // ── Soft Delete Check — deactivated account can't login ─────
    if (user.deletedAt) {
      return NextResponse.json(
        {
          error: 'Account deactivated. Contact admin for reactivation.',
        },
        { status: 403 }
      );
    }

    // ── Active Check — admin can toggle this off to block login ──
    if (user.isActive === false) {
      return NextResponse.json(
        {
          error: 'Account is currently inactive. Contact admin to reactivate.',
          code: 'ACCOUNT_INACTIVE',
        },
        { status: 403 }
      );
    }

    // ── Access Expiry Check — only for paid plans with expiry set ──
    // Free users have no expiry (null) → always allowed
    let currentPlanTier = user.planTier;
    let currentIsSubscribed = user.isSubscribed;
    let isExpiredPaidUser = false;

    if (user.accessExpiresAt) {
      const now = new Date();
      const expiryDate = new Date(user.accessExpiresAt);
      const hadPaidAccess = user.planTier !== 'free' || user.isSubscribed;
      if (expiryDate < now && hadPaidAccess) {
        isExpiredPaidUser = true;
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
        return NextResponse.json(
          { error: 'Too many failed login attempts. Please try again after 15 minutes.' },
          { status: 429 }
        );
      }

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // ── Single Device Login Logic ──────────────────────────────
    const newVersion = (user.sessionVersion || 0) + 1;
    if (!force) {
      if (hasActiveAuthSession(user.metadata)) {
        return NextResponse.json(
          {
            requiresConfirmation: true,
            message:
              'An active session was detected. Logging in here will disconnect your other devices. Continue?',
          },
          { status: 409 }
        );
      }
    }

    // ── Sign JWT Token ──────────────────────────────────────────
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionVersion: newVersion,
      deviceId: deviceId || null,
    };

    const { signToken } = await import('@/lib/jwt');
    const token = signToken(payload);

    if (!token) {
      throw new Error('Token generation failed');
    }

    await db
      .update(mppscUsers)
      .set({
        sessionVersion: newVersion,
        metadata: touchAuthLoginMetadata(user.metadata),
      })
      .where(eq(mppscUsers.id, user.id));

    // ── Telegram Notification (Backgrounded) ────────────────────
    try {
      const { sendTelegramNotification, escapeHTML } = await import('@/lib/telegram');
      const userAgent = request.headers.get('user-agent') || 'Unknown Device';
      const grants = Array.isArray(user.accessGrants)
        ? user.accessGrants
        : typeof user.accessGrants === 'string'
          ? JSON.parse(user.accessGrants)
          : ['mppsc_pre'];

      const location = await getClientLocation(request.headers, ip);
      const telegramMessage =
        `🔑 <b>New Login (API)</b> ${force ? '(FORCED)' : ''}\n\n` +
        `👤 <b>User:</b> ${escapeHTML(user.name || 'Anonymous')}\n` +
        `📧 <b>Email:</b> ${escapeHTML(user.email)}\n` +
        `📞 <b>Phone:</b> ${escapeHTML(user.phone || 'Not Provided')}\n` +
        `🏆 <b>Plan:</b> ${escapeHTML((user.planTier as string)?.toUpperCase() || 'FREE')}\n` +
        `🔓 <b>Grants:</b> ${escapeHTML(Array.isArray(grants) ? grants.join(', ') : 'None')}\n` +
        `📱 <b>Device:</b> ${escapeHTML(userAgent.slice(0, 100))}\n` +
        `🌐 <b>Real IP:</b> ${escapeHTML(ip)}\n` +
        `📍 <b>Location:</b> ${escapeHTML(location)}\n` +
        `🔢 <b>Session v:</b> ${newVersion}\n` +
        `⏱️ <b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} IST`;

      sendTelegramNotification(telegramMessage).catch((e) => {
        logger.error('Telegram login notification failed (non-blocking)', e, {
          category: 'telegram',
        });
      });
    } catch (e) {
      // Construction failed
    }

    // ── Set Standardized Auth & Device Cookies (30 days) ───────
    const cookieStore = await cookies();
    setAuthCookies(cookieStore, token, deviceId);

    const freshGrants = Array.isArray(user.accessGrants)
      ? user.accessGrants
      : typeof user.accessGrants === 'string'
        ? JSON.parse(user.accessGrants)
        : ['mppsc_pre'];

    return NextResponse.json({
      success: true,
      requiresRenewal: isExpiredPaidUser,
      redirectTo: isExpiredPaidUser ? '/renew' : undefined,
      user: {
        email: user.email,
        name: user.name,
        isSubscribed: currentIsSubscribed,
        planTier: currentPlanTier,
        role: user.role,
        accessExpiresAt: user.accessExpiresAt,
        accessGrants: freshGrants.length ? freshGrants : ['mppsc_pre'],
      },
    });
  } catch (error) {
    logger.error('Login error:', error, {
      category: 'auth',
      metadata: { email },
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
