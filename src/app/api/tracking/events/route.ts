import { NextResponse, after } from 'next/server';
import { sendTelemetryEvent, TelemetryEvent } from '@/lib/telegram-events';
import { logger } from '@/lib/logger';
import { headers } from 'next/headers';

function normalizeOrigin(origin: string | null | undefined): string | null {
  if (!origin) return null;
  try {
    return new URL(origin).origin.toLowerCase();
  } catch {
    return null;
  }
}

const ALLOWED_ORIGINS = new Set(
  [process.env.NEXT_PUBLIC_APP_URL, process.env.APP_URL, 'http://localhost:3000']
    .map(normalizeOrigin)
    .filter((origin): origin is string => Boolean(origin))
);

/**
 * API Endpoint: POST /api/tracking/events
 * Receives lightweight user navigation events and routes them asynchronously.
 * Fully optimized, non-blocking, and silent-failing.
 */
export async function POST(req: Request) {
  try {
    // 🛡️ ABUSE PROTECTION: Verify request origin/site
    const headerList = await headers();
    const requestOrigin = normalizeOrigin(headerList.get('origin'));
    const secFetchSite = headerList.get('sec-fetch-site');
    const host = headerList.get('host');
    const proto = headerList.get('x-forwarded-proto') ?? 'https';
    const hostOrigin = normalizeOrigin(host ? `${proto}://${host}` : null);

    // Only allow same-origin/same-site or configured trusted origins to prevent external spam
    const isSameOrigin = requestOrigin && hostOrigin && requestOrigin === hostOrigin;
    const isSameSite = secFetchSite === 'same-origin' || secFetchSite === 'same-site';
    const isAllowedOrigin = requestOrigin ? ALLOWED_ORIGINS.has(requestOrigin) : false;

    if (!isSameOrigin && !isSameSite && !isAllowedOrigin && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let body: TelemetryEvent;
    try {
      body = (await req.json()) as TelemetryEvent;
    } catch {
      return NextResponse.json({ error: 'Invalid or missing JSON payload' }, { status: 400 });
    }
    // 🛡️ PAYLOAD VALIDATION & CONSTRAINTS
    if (!body || !body.type || !body.path) {
      return NextResponse.json({ error: 'Invalid telemetry payload' }, { status: 400 });
    }

    // Truncate strings to prevent oversized Telegram requests (max 4096 chars per message)
    // We enforce a conservative limit per field here.
    const sanitize = <T extends string | null | undefined>(str: T, max = 500): T => 
      typeof str === 'string' ? str.substring(0, max) as T : str;

    // 🌍 EXTRACT IP AND LOCATION FROM VERCEL/CLOUDFLARE HEADERS
    const isCloudflare = !!headerList.get('cf-connecting-ip');
    const ip = headerList.get('cf-connecting-ip') || headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'Unknown IP';
    
    const rawCity = isCloudflare ? headerList.get('cf-ipcity') : (headerList.get('x-vercel-ip-city') || headerList.get('cf-ipcity'));
    let city: string | null = rawCity;
    if (rawCity) {
      try { city = decodeURIComponent(rawCity); } catch { city = rawCity; }
    }
    
    const region = isCloudflare ? null : headerList.get('x-vercel-ip-country-region');
    const country = isCloudflare ? headerList.get('cf-ipcountry') : (headerList.get('x-vercel-ip-country') || headerList.get('cf-ipcountry'));
    
    // Build location string
    const locationParts: string[] = [];
    if (city) locationParts.push(city);
    if (region) locationParts.push(region);
    if (country) locationParts.push(country);
    const location = locationParts.length > 0 ? locationParts.join(', ') : undefined;

    const validatedEvent: TelemetryEvent = {
      ...body,
      path: body.path.substring(0, 255),
      previousPath: sanitize(body.previousPath, 255),
      referrer: sanitize(body.referrer, 500),
      userAgent: sanitize(body.userAgent, 500),
      actionDetails: sanitize(body.actionDetails, 1000),
      guestName: sanitize(body.guestName, 100),
      ip,
      location,
    };

    // 🚀 ASYNCHRONOUS BACKGROUND DISPATCH
    after(() => {
      sendTelemetryEvent(validatedEvent).catch((err) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('[Telemetry API] Background telemetry dispatch failed:', err);
        }
      });
    });

    // Return immediate success
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    // 🔒 Silent catch-all on the server side
    logger.error('Failed to process incoming telemetry payload', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Handle CORS Preflight requests for navigator.sendBeacon
 * When sendBeacon is used with a Blob of type application/json, modern browsers 
 * fire an OPTIONS request first. Next.js Route Handlers return 404/405 if OPTIONS is not exported.
 */
export async function OPTIONS(req: Request) {
  const requestOrigin = normalizeOrigin(req.headers.get('origin'));
  if (!requestOrigin) {
    return new NextResponse(null, { status: 403 });
  }

  const host = req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const hostOrigin = normalizeOrigin(host ? `${proto}://${host}` : null);

  const isTrusted = ALLOWED_ORIGINS.has(requestOrigin) || (hostOrigin && requestOrigin === hostOrigin);

  if (!isTrusted) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': requestOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
