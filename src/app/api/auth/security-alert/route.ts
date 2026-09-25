import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractAuthToken, extractDeviceCookie } from '@/lib/auth-constants';
import { getClientIp, getClientLocation, getClientUserAgent } from '@/lib/ip';
import { sendSecurityAlertNotification } from '@/lib/security-alerts';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'bhai-ka-secret-key-change-kar-le-jaldi';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

// 🛡️ Sliding window rate limiter (Max 5 alerts per minute per IP to prevent spam/flooding)
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const alertRateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_ALERTS_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = alertRateLimitMap.get(ip);

  // Periodic cleanup if map grows
  if (alertRateLimitMap.size > 1000) {
    for (const [key, value] of alertRateLimitMap.entries()) {
      if (now > value.resetAt) {
        alertRateLimitMap.delete(key);
      }
    }
  }

  if (!entry || now > entry.resetAt) {
    alertRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_ALERTS_PER_WINDOW) {
    return true;
  }

  entry.count += 1;
  return false;
}

/**
 * 🚨 CLIENT SECURITY INCIDENT REPORTING ENDPOINT
 *
 * Bhai, jab client-side (AppNavbar) me detect hota hai ki:
 * "Cookies toh chura ke le aaye Incognito me, par IndexedDB / LocalStorage me
 * hardware key gayab hai!"
 * Toh browser turant is API ko report karta hai taaki Telegram pe alert chala jaye.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);

    // 1. Abuse & Flooding Protection: Rate limit check
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const token = extractAuthToken(request.cookies) || (typeof body.token === 'string' ? body.token.trim() : null);
    const clientDeviceId = extractDeviceCookie(request.cookies);

    // 2. Strict Payload Validation: Must provide valid reason and token or device identifiers
    const validReasons = ['client_vault_missing', 'unauthorized_device', 'token_hijack_attempt'];
    const reason = validReasons.includes(body.reason) ? body.reason : 'unauthorized_device';

    // Basic spam filter: Token must look like a JWT (at least header.payload.sig format) if provided
    let decodedPayload: any = null;
    if (token) {
      if (!/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token)) {
        return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
      }
      try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        decodedPayload = payload;
      } catch {
        // Token invalid or unparseable, but might still be a stolen corrupted token
      }
    } else if (!body.reason && !clientDeviceId) {
      // Empty unauthenticated garbage payload
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const location = await getClientLocation(request.headers, ip);
    const userAgent = getClientUserAgent(request.headers);

    // Non-blocking trigger to Telegram
    sendSecurityAlertNotification({
      reason,
      token: token || null,
      userId: decodedPayload?.userId || null,
      userEmail: decodedPayload?.email || null,
      userName: decodedPayload?.name || null,
      userRole: decodedPayload?.role || null,
      tokenDeviceId: decodedPayload?.deviceId || null,
      clientDeviceId: clientDeviceId || null,
      ip,
      location,
      userAgent,
      targetPath: body.path || request.nextUrl.pathname,
      triggerSource: 'client_hydration_guard',
    }).catch((err) => {
      console.error('[SecurityAlert API] Failed to dispatch alert:', err);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
