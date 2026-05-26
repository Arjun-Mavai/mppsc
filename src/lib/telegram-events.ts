import { getTelemetryEnabled } from './system-settings';
import { escapeHTML } from './telegram';

export interface TelemetryEvent {
  type: 'page_view' | 'page_dwell' | 'action';
  path: string;
  previousPath?: string;
  duration?: number; // in seconds
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    planTier?: string;
  } | null;
  guestName?: string | null;
  device?: string;
  userAgent?: string;
  referrer?: string;
  actionDetails?: string;
}

/**
 * Normalizes user agents into readable formats
 */
function parseReadableUserAgent(ua: string): string {
  if (!ua) return 'Unknown Browser';
  const lowercaseUa = ua.toLowerCase();
  
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  // Check Edge before Chrome because Edge includes "Chrome" in its UA
  if (lowercaseUa.includes('firefox')) browser = 'Firefox';
  else if (lowercaseUa.includes('edg/') || lowercaseUa.includes('edge')) browser = 'Edge';
  else if (lowercaseUa.includes('chrome')) browser = 'Chrome';
  else if (lowercaseUa.includes('safari')) browser = 'Safari';

  if (lowercaseUa.includes('iphone')) os = 'iPhone';
  else if (lowercaseUa.includes('ipad')) os = 'iPad';
  else if (lowercaseUa.includes('android')) os = 'Android';
  else if (lowercaseUa.includes('macintosh') || lowercaseUa.includes('mac os')) os = 'macOS';
  else if (lowercaseUa.includes('windows')) os = 'Windows';
  else if (lowercaseUa.includes('linux')) os = 'Linux';

  return `${browser} on ${os}`;
}

/**
 * Formats seconds into a highly readable duration string
 */
function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

/**
 * Formats a single telemetry event into standard beautiful HTML for Telegram
 */
function formatTelemetryMessage(event: TelemetryEvent): string {
  // Identify payment funnel
  const isPaymentPath = 
    event.path.startsWith('/pricing') || 
    event.path.startsWith('/payment') || 
    event.path.startsWith('/upgrade') || 
    event.path.startsWith('/thank-you');

  // Identify Mains path
  const isMainsPath = event.path.startsWith('/mains');

  // Normalize User info
  let userDisplay = 'Guest (Anonymous)';
  if (event.user && event.user.email) {
    const tier = event.user.planTier ? ` (${event.user.planTier.toUpperCase()})` : '';
    userDisplay = `👤 <b>${escapeHTML(event.user.name || 'User')}</b> - ${escapeHTML(event.user.email)}${tier}`;
  } else if (event.guestName) {
    userDisplay = `👤 <b>${escapeHTML(event.guestName)}</b> (Guest Lead)`;
  }

  // Device & browser details
  const deviceType = event.device ? `[${event.device}]` : '';
  const browserOs = event.userAgent ? parseReadableUserAgent(event.userAgent) : 'Unknown Browser';
  const connectionDisplay = `📱 ${escapeHTML(browserOs)} ${deviceType}`;

  // Time in IST
  const timestamp = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }) + ' IST';

  let title = '📊 <b>MPPSC ZEN TELEMETRY ALERT</b>';
  let body = '';
  let tags = '#telemetry';

  if (isPaymentPath) {
    title = '💰 <b>PAYMENT FUNNEL EVENT</b>';
    tags = '#PaymentFunnel #conversion';
  } else if (isMainsPath) {
    title = '📘 <b>MAINS TELEMETRY ALERT</b>';
    tags = '#MainsPlatform';
  }

  if (event.type === 'page_view') {
    title = isPaymentPath ? `💰 <b>PAYMENT LANDING ALERT</b>` : title;
    
    // Highlight if payment landing (very high intent)
    const landingBadge = isPaymentPath ? '\n🚀 <b>HIGH PURCHASE INTENT!</b> Landed on checkout funnel.' : '';
    
    body = 
      `${title}\n` +
      `👀 <b>Page Visited:</b> <code>${escapeHTML(event.path)}</code>${landingBadge}\n\n` +
      `${userDisplay}\n` +
      `${connectionDisplay}\n` +
      (event.referrer ? `🔍 <b>Referrer:</b> <code>${escapeHTML(event.referrer)}</code>\n` : '') +
      `⏱️ <b>Time:</b> ${timestamp}\n\n` +
      `${tags} #PageView`;
  } else if (event.type === 'page_dwell') {
    title = isPaymentPath ? `⏱️ <b>PAYMENT FUNNEL EXIT SURVEY</b>` : title;
    
    const stayTime = event.duration ? formatDuration(event.duration) : '0s';
    body = 
      `${title}\n` +
      `⏱️ <b>Time Spent:</b> <b>${stayTime}</b> on <code>${escapeHTML(event.path)}</code>\n` +
      (event.previousPath ? `➡️ <b>Navigated to:</b> <code>${escapeHTML(event.previousPath)}</code>\n\n` : '\n') +
      `${userDisplay}\n` +
      `${connectionDisplay}\n` +
      `⏱️ <b>Time:</b> ${timestamp}\n\n` +
      `${tags} #DwellTime`;
  } else {
    // Action / Custom Clicks
    body = 
      `${title}\n` +
      `🎯 <b>User Interaction:</b> <code>${escapeHTML(event.actionDetails || 'Clicked element')}</code>\n` +
      `📍 <b>Active Page:</b> <code>${escapeHTML(event.path)}</code>\n\n` +
      `${userDisplay}\n` +
      `${connectionDisplay}\n` +
      `⏱️ <b>Time:</b> ${timestamp}\n\n` +
      `${tags} #UserAction`;
  }

  return body;
}

/**
 * 🚀 Dispatches a structured user event to the Telegram events bot asynchronously.
 * Fully isolated, resilient, and checks active telemetry dynamic toggle state before shipping.
 */
export async function sendTelemetryEvent(event: TelemetryEvent) {
  // 4. Dispatch fetch asynchronously with strict AbortController timeout (3 seconds)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    // 1. Check Dynamic Toggle Switch State (SQLite settings table)
    const isEnabled = await getTelemetryEnabled();
    if (!isEnabled) {
      return; // Dynamic switch is OFF -> Silently ignore
    }

    // 2. Load Tokens and fallback config
    const BOT_TOKEN = process.env.TELEGRAM_EVENTS_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_EVENTS_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Telemetry] Missing event bot token or chat ID configuration; alert skipped.');
      }
      return;
    }

    // 3. Prevent flood of minor detailed logs if TELEGRAM_EVENTS_DETAILED is false
    const isDetailed = process.env.TELEGRAM_EVENTS_DETAILED !== 'false';
    const isPaymentPath = 
      event.path.startsWith('/pricing') || 
      event.path.startsWith('/payment') || 
      event.path.startsWith('/upgrade') || 
      event.path.startsWith('/thank-you');

    // If not detailed tracking, skip normal PageViews and DwellTimes on non-payment routes
    if (!isDetailed && !isPaymentPath && event.type !== 'action') {
      return;
    }

    const message = formatTelemetryMessage(event);

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

    if (!response.ok && process.env.NODE_ENV === 'development') {
      console.error('[Telemetry] Telegram API Error:', await response.text());
    }
  } catch (error: any) {
    // 🔒 Silent failure: Telemetry should never affect client runtime or slow down anything
    if (process.env.NODE_ENV === 'development') {
      if (error.name === 'AbortError') {
        console.error('[Telemetry] Telegram notification timed out (3s limit reached)');
      } else {
        console.error('[Telemetry] Failed to dispatch event:', error);
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

