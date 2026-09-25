import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import EmailTemplate from '../../../../components/email-template';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { appPath } from '@/lib/app-url';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // Admin auth check (device-aware)
    const { verifyAdminApi } = await import('@/lib/auth');
    const adminUser = await verifyAdminApi();
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as { to?: string };
    const to = body.to || adminUser.email;

    const fromName = process.env.EMAIL_FROM_NAME || 'MPPSC 2026';
    const fromAddress =
      process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev';
    const fromEmail = `${fromName} <${fromAddress}>`;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: 'Test Email — MPPSC ZEN',
      react: (
        <EmailTemplate
          name={adminUser.name || 'Admin'}
          actionUrl={appPath('/')}
          planName="Admin Test"
        />
      ),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
