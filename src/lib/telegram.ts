import { logger } from './logger';

/**
 * Simple HTML escape for Telegram messages
 * Bhai, agar user name mein '<' ya '&' ho, to Telegram API error de deta hai.
 * Isliye humein isse escape karna padega.
 */
export function escapeHTML(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function sendTelegramNotification(message: string) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing; notification skipped'
      );
    }
    return;
  }

  // ⏱️ AbortController to prevent hanging (5s timeout)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message, // Message should be escaped by the caller where appropriate
        parse_mode: 'HTML',
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Telegram API Error', new Error(errorText), { category: 'telegram' });
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      logger.error('Telegram notification timed out', error, { category: 'telegram' });
    } else {
      logger.error('Failed to send Telegram notification', error, { category: 'telegram' });
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

interface LeadNotificationInput {
  type: 'New Lead' | 'Returning Lead' | 'Registration' | 'Admin Grant';
  name: string | null | undefined;
  email: string;
  phone?: string | null | undefined;
  plan?: string;
  exam?: string;
  source?: string;
  attemptCount?: number;
  status?: string;
}

/**
 * Premium Lead Formatter
 * Bhai, formatting ek hi jagah rakhenge to consistency bani rahegi.
 */
export async function sendLeadNotification(input: LeadNotificationInput) {
  const { type, name, email, phone, plan, exam, source, attemptCount, status } = input;

  const planEmoji: Record<string, string> = {
    lite: '⚡', pro: '👑', upgrade: '🚀', mains: '🏛️', combo: '💎',
  };

  const formattedTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const message =
    `👮 <b>MPPSC ZEN</b>\n` +
    `📝 <b>${type} — ${status || 'Processed'}</b>\n\n` +
    `👤 Name: ${escapeHTML(name || 'Unknown User')}\n` +
    `📧 Email: ${escapeHTML(email)}\n` +
    (phone ? `📞 Phone: <code>${escapeHTML(phone)}</code>\n` : '') +
    (plan ? `${planEmoji[plan.toLowerCase()] || '🎯'} Plan: <b>${plan.toUpperCase()}</b>\n` : '') +
    (exam ? `📋 Exam: <b>${exam.toUpperCase()}</b>\n` : '') +
    (source ? `🔍 Source: <code>${escapeHTML(source)}</code>\n` : '') +
    (attemptCount && attemptCount > 1 ? `🔄 Attempt: #${attemptCount}\n` : '') +
    `⏱️ Time: ${formattedTime} IST\n\n` +
    `⚠️ <i>Status: ${status || 'System Logged'}</i>`;

  return sendTelegramNotification(message);
}
