import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractAuthToken, extractDeviceCookie } from '@/lib/auth-constants';
import { getClientIp, getClientLocation, getClientUserAgent } from '@/lib/ip';
import { sendSecurityAlertNotification } from '@/lib/security-alerts';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'bhai-ka-secret-key-change-kar-le-jaldi';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

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
    const body = await request.json().catch(() => ({}));
    const token = extractAuthToken(request.cookies);
    const clientDeviceId = extractDeviceCookie(request.cookies);

    const ip = getClientIp(request.headers);
    const location = await getClientLocation(request.headers, ip);
    const userAgent = getClientUserAgent(request.headers);

    let decodedPayload: any = null;

    if (token) {
      try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        decodedPayload = payload;
      } catch {
        // Token invalid or unparseable
      }
    }

    // Non-blocking trigger to Telegram
    sendSecurityAlertNotification({
      reason: body.reason === 'client_vault_missing' ? 'client_vault_missing' : 'unauthorized_device',
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
