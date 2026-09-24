import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { extractAuthToken, extractDeviceCookie } from '@/lib/auth-constants';
import { getClientIp, getClientLocation, getClientUserAgent } from '@/lib/ip';
import { sendSecurityAlertNotification } from '@/lib/security-alerts';

/**
 * Mumbai Gatekeeper (Proxy/Middleware) - Fast Flow Index
 * 1) Token signature check karta hai (bouncer ID check).
 * 2) Sirf protected routes pe login enforce karta hai.
 * 3) Agar token valid dikh raha ho, phir bhi /api/auth/me se poochta hai:
 *    "session asli hai ya dusre device ne kick kar diya?"
 * 4) mismatch mile to seedha /login?reason=multi_device.
 *
 * User journey visualize:
 * Device A login -> Device B "kick others" -> Device A protected page hit ->
 * middleware me mismatch detect -> login redirect + reason param.
 */
// Bhai, ye proxy hi apna main gatekeeper (Middleware) hai.
// Bina valid token ke protected routes pe entry mana hai!
const FREE_TEST_IDS = [
  'CtN-YXOB5fU5Lz7f6HI1G',
  'd4fe15f9-faf0-42cb-a8d1-11831db84a5c',
  '33465b70-011e-45d7-92f3-5081351cc436',
  'FFPEWTMww259TMakCWyYF',
  'fnyHrjpJ3YXunl67GSihg',
  'ID-CHHATHA-666',
];
const JWT_SECRET = process.env.JWT_SECRET || 'bhai-ka-secret-key-change-kar-le-jaldi';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

// Protected Routes: Jahan bina login ke nahi ja sakte
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/admin',
  '/syllabus/test-history',
  '/syllabus/analytics',
  '/syllabus/quiz/pyq/intelligence/*',
];

const matchesRoutePattern = (pathname: string, pattern: string) => {
  if (pattern.endsWith('/*')) {
    const base = pattern.slice(0, -2);
    return pathname === base || pathname.startsWith(`${base}/`);
  }
  return pathname === pattern || pathname.startsWith(`${pattern}/`);
};

const startsWithAny = (pathname: string, routes: string[]) =>
  routes.some((route) => matchesRoutePattern(pathname, route));

// Auth Routes: Jahan login hone ke baad nahi jana chahiye
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = extractAuthToken(request.cookies);
  const testId = searchParams.get('testId');
  // 1. Verify Token (Agar token hai to check karo valid hai ya nahi)
  let isValidToken = false;
  let isDeviceMismatch = false;
  let decodedPayload: { userId?: string; email?: string; role?: string; name?: string; deviceId?: string } | null = null;

  if (token) {
    try {
      const { payload } = (await jwtVerify(token, SECRET_KEY)) as {
        payload: { userId?: string; email?: string; role?: string; name?: string; deviceId?: string };
      };
      decodedPayload = payload;
      // 🛡️ Anti-Cookie-Theft: Device Binding Check
      // - If payload.deviceId is present, it MUST match the request cookie '_app_cid' (or legacy 'mppsc_did').
      // - If payload.deviceId is absent, this is an existing legacy user session → ALLOW with zero disruption!
      if (payload.deviceId) {
        const clientDeviceId = extractDeviceCookie(request.cookies);
        if (!clientDeviceId || clientDeviceId !== payload.deviceId) {
          isValidToken = false;
          isDeviceMismatch = true;
        } else {
          isValidToken = true;
        }
      } else {
        isValidToken = true;
      }
    } catch (error) {
      // Token invalid or expired
      isValidToken = false;
    }
  }

  // 2. Handle Protected Routes
  // Agar route protected hai aur token nahi hai/invalid hai -> Login pe bhejo
  // Also check dynamic routes under /syllabus
  const isProtectedRoute = startsWithAny(pathname, PROTECTED_ROUTES);

  if (isProtectedRoute) {
    if (!isValidToken) {
      // "Bhai, pehle login karke aao ya unauthorized device se access roko"
      const redirectUrl = new URL('/login', request.url);
      if (isDeviceMismatch) {
        redirectUrl.searchParams.set('reason', 'unauthorized_device');

        // 🚨 Fast Telegram Alert on Unauthorized / Copied Device Attempt
        const clientDeviceId = extractDeviceCookie(request.cookies);
        const alertPromise = sendSecurityAlertNotification({
          reason: 'unauthorized_device',
          token,
          userId: decodedPayload?.userId || null,
          userEmail: decodedPayload?.email || null,
          userRole: decodedPayload?.role || null,
          tokenDeviceId: decodedPayload?.deviceId || null,
          clientDeviceId: clientDeviceId || null,
          ip: getClientIp(request.headers),
          location: await getClientLocation(request.headers),
          userAgent: getClientUserAgent(request.headers),
          targetPath: pathname,
          triggerSource: 'middleware_proxy',
        });
        // Race with 800ms so user redirect is never stalled
        await Promise.race([alertPromise, new Promise((res) => setTimeout(res, 800))]);
      }
      return NextResponse.redirect(redirectUrl, {
        headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
      });
    }

    // Bhai, yahan pehle fetch('/api/auth/me') hota tha jo app ko slow kar raha tha.
    // Ab hum directly page rendering phase me verifyAuth se check karenge.
    // Isse extra internal HTTP request bach jayegi aur app 100% light chalegi!
  }
  // Agar testId free wali list mein hai, toh jaane do (Allow)
  if (testId && FREE_TEST_IDS.includes(testId)) {
    // console.log('hello i am here', testId, FREE_TEST_IDS.includes(testId));
    //https://share.google/aimode/zo09763VrWQotzvQU

    //https://share.google/aimode/JdmtXf6WUqWCKInbN
    // proxy knowlege of cache and all
    return NextResponse.next();
  }
  // 3. Handle Auth Routes
  // Agar user logged in hai aur Login/Signup pe ja raha hai -> Syllabus pe bhejo
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthRoute) {
    if (isValidToken) {
      // "Arre bhai, login toh hai tu, andar chal"
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 4. Admin Access
  return NextResponse.next();
}

// Export as 'proxy' if usage expects it, but for standard Middleware file, default export is usually config/middleware.
// Since user insists on 'proxy.ts', we export middleware logic.
// If this file is hooked up elsewhere, caller should import { middleware } from '@/proxy'.

// Matcher Configuration for Next.js Middleware mechanism
//"Syllabus ke baad agar quiz, units, ya pyq likha hai, toh Chup raho. Iske alawa kuch bhi aur likha hai, toh Chilla do (Redirect kar do)."
//
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|icon|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
    // '/syllabus/:path((?!quiz$|units$|pyq$|csat$|full-length$|topics$|auth$).+)',
    // '/syllabus/:path*',
  ],
};
