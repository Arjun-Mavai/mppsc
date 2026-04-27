import { NextResponse } from 'next/server';
import { db } from '@/db';
import { mppscUsers, verificationTokens } from '@/db/schema';
import { sql, and, isNull, eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';
import { Resend } from 'resend';
import { appPath } from '@/lib/app-url';
import { notifyAdminOnEmailFailure } from '@/lib/admin-notify';
import { escapeHTML } from '@/lib/telegram';
import { escapeHTML } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { resetLimiter, checkRateLimit } = await import('@/lib/rate-limit');

    const { success } = await checkRateLimit(resetLimiter, ip);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
        },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      logger.error('Forgot password: RESEND_API_KEY is not set', undefined, { category: 'email' });
      // Alert admin (Telegram fallback works even if Resend key is missing)
      notifyAdminOnEmailFailure({
        userName: 'Unknown',
        userEmail: normalizedEmail,
        errorMessage: 'RESEND_API_KEY is not configured on the server (forgot-password)',
        paymentId: 'forgot-password-config',
      }).catch(() => {});
      return NextResponse.json(
        { error: 'Password reset is temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // First try index-friendly exact match (emails are normalized on write).
    const users = await db
      .select({
        id: mppscUsers.id,
        name: mppscUsers.name,
        email: mppscUsers.email,
      })
      .from(mppscUsers)
      .where(
        and(eq(mppscUsers.email, normalizedEmail), isNull(mppscUsers.deletedAt))
      )
      .limit(1);

    let user = users[0];

    // Backward-compat: if legacy rows had mixed-case emails, fall back to LOWER(email) match.
    if (!user) {
      const legacyUsers = await db
        .select({
          id: mppscUsers.id,
          name: mppscUsers.name,
          email: mppscUsers.email,
        })
        .from(mppscUsers)
        .where(
          and(sql`LOWER(${mppscUsers.email}) = ${normalizedEmail}`, isNull(mppscUsers.deletedAt))
        )
        .limit(1);
      user = legacyUsers[0];
    }

    if (!user) {
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));
      return NextResponse.json({
        success: true,
        message: 'If this email is registered, you will receive a reset link.',
      });
    }

    const token = uuidv4();
    const expires = addHours(new Date(), 24);

    await db.insert(verificationTokens).values({
      identifier: user.id,
      token,
      expires,
    });

    const fromName = process.env.EMAIL_FROM_NAME || 'MPPSC ZEN';
    const fromAddress =
      process.env.RESEND_FROM_EMAIL ||
      process.env.EMAIL_FROM_ADDRESS ||
      'no-reply@mppsc.zenscroll.app';
    const fromEmail = `${fromName} <${fromAddress}>`;
    const actionUrl = `${appPath('auth/set-password')}?token=${token}`;

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #111; margin-bottom: 20px;">Reset your password</h2>
        <p>Hi ${escapeHTML(user.name || 'Student')},</p>
        <p>We received a request to set or reset the password for your MPPSC ZEN account. Click the button below to continue (same link as after payment — you will choose a new password):</p>
        <div style="margin: 35px 0; text-align: center;">
          <a href="${actionUrl}" style="background: #0a0a0a; color: #00F0FF; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Set password →</a>
        </div>
        <p style="font-size: 13px; color: #ef4444; background: #fef2f2; padding: 10px; border-radius: 6px;">
          <strong>Note:</strong> This link expires in 24 hours. If you did not request this, you can ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">Mindful MPPSC ZEN — Smart Test Series</p>
      </div>
    `;

    const resend = new Resend(apiKey);
    const { error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: [user.email!],
      subject: 'MPPSC ZEN — Reset your password',
      html: emailHtml,
    });

    if (emailError) {
      logger.error('Forgot password: Resend send failed', emailError, {
        category: 'email',
        userId: user.id,
        metadata: { to: user.email, fromEmail },
      });
      notifyAdminOnEmailFailure({
        userName: user.name || 'Unknown',
        userEmail: user.email!,
        errorMessage:
          typeof emailError === 'object' && emailError !== null && 'message' in emailError
            ? String(emailError.message)
            : JSON.stringify(emailError),
        paymentId: 'forgot-password-email',
      }).catch(() => {});
    }

    logger.info(`[Password Reset] Email dispatched for user: ${user.id} (${normalizedEmail})`);

    return NextResponse.json({
      success: true,
      message: 'If this email is registered, you will receive a reset link.',
    });
  } catch (error) {
    logger.error('Forgot Password Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
