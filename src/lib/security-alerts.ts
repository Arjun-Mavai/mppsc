/**
 * 🚨 SECURITY ALERT DISPATCHER (MPPSC ZEN)
 *
 * Bhai, jab bhi koi "Unauthorized device / Copied session" pakda jata hai,
 * toh ye module turant Telegram admin bot ko detailed alert bhejta hai.
 *
 * ⚡ FAST & EDGE-COMPATIBLE:
 * - Native fetch use karta hai (0 heavy dependencies).
 * - Middleware (Edge) aur Node.js (Server/API) dono jagah seamlessly chalta hai.
 * - Non-blocking (user ka redirect ya page load wait nahi karega).
 */

import { escapeHTML } from '@/lib/telegram';

export interface SecurityAlertPayload {
  reason: 'unauthorized_device' | 'device_mismatch' | 'client_vault_missing' | 'token_hijack_attempt';
  token?: string | null;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  userRole?: string | null;
  tokenDeviceId?: string | null;
  clientDeviceId?: string | null;
  ip: string;
  location?: string;
  userAgent?: string;
  targetPath?: string;
  triggerSource: 'middleware_proxy' | 'server_auth' | 'client_hydration_guard' | 'api_route';
}

/**
 * 🚀 Telegram pe Security Incident Alert bhejta hai
 */
export async function sendSecurityAlertNotification(alert: SecurityAlertPayload): Promise<void> {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_EVENTS_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_EVENTS_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[SecurityAlert] Telegram BOT_TOKEN or CHAT_ID missing; alert skipped');
    }
    return;
  }

  const formattedTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const reasonTitleMap: Record<string, string> = {
    unauthorized_device: '🚨 UNAUTHORIZED DEVICE / COPIED COOKIE BLOCKED',
    device_mismatch: '⚠️ TOKEN DEVICE MISMATCH DETECTED',
    client_vault_missing: '🛡️ HARDWARE VAULT MISSING (INCOGNITO PASTE DETECTED)',
    token_hijack_attempt: '🛑 POTENTIAL SESSION HIJACK ATTEMPT',
  };

  const title = reasonTitleMap[alert.reason] || '🚨 UNAUTHORIZED SESSION DETECTED';

  // 🔒 Redacted token formatting with one-way SHA-256 fingerprint (Zero credential leakage to Telegram)
  let directTokenText = 'None';
  if (alert.token) {
    const rawToken = alert.token.trim();
    let fingerprint = 'n/a';
    try {
      const msgUint8 = new TextEncoder().encode(rawToken);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      fingerprint = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 16);
    } catch {
      // Fallback
    }
    const prefix = rawToken.slice(0, 12);
    const suffix = rawToken.slice(-6);
    directTokenText = `${prefix}...[REDACTED_SIG]...${suffix} (SHA-256: ${fingerprint})`;
  }

  const message =
    `🚨 <b>${title}</b>\n\n` +
    `⚠️ <b>Trigger:</b> ${escapeHTML(alert.triggerSource.toUpperCase())}\n` +
    `👤 <b>User:</b> ${escapeHTML(alert.userName || 'Unknown')}\n` +
    `📧 <b>Email:</b> <code>${escapeHTML(alert.userEmail || 'Not Decoded')}</code>\n` +
    (alert.userId ? `🆔 <b>User ID:</b> <code>${escapeHTML(alert.userId)}</code>\n` : '') +
    (alert.userRole ? `👑 <b>Role:</b> ${escapeHTML(alert.userRole)}\n` : '') +
    `🎯 <b>Target Path:</b> <code>${escapeHTML(alert.targetPath || '/')}</code>\n\n` +
    `🌐 <b>Real Client IP:</b> <code>${escapeHTML(alert.ip)}</code>\n` +
    `📍 <b>Location:</b> ${escapeHTML(alert.location || 'Unknown Location')}\n` +
    `📱 <b>Device/Browser:</b> ${escapeHTML(alert.userAgent || 'Unknown')}\n\n` +
    `🔐 <b>Token Device ID:</b> <code>${escapeHTML(alert.tokenDeviceId || 'None')}</code>\n` +
    `💻 <b>Client Cookie Device ID:</b> <code>${escapeHTML(alert.clientDeviceId || 'None (Missing / Empty)')}</code>\n` +
    `⏱️ <b>Time:</b> ${formattedTime} IST\n\n` +
    `🎫 <b>Token Fingerprint:</b>\n<code>${escapeHTML(directTokenText)}</code>`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error('[SecurityAlert] Telegram API error:', await response.text());
    }
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      console.error('[SecurityAlert] Failed to send Telegram alert:', err);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
