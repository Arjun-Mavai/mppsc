import { NextResponse } from 'next/server';
import { sendTelemetryEvent, TelemetryEvent } from '@/lib/telegram-events';
import { logger } from '@/lib/logger';
import { headers } from 'next/headers';

/**
 * API Endpoint: POST /api/tracking/events
 * Receives lightweight user navigation events and routes them asynchronously.
 * Fully optimized, non-blocking, and silent-failing.
 */
export async function POST(req: Request) {
  try {
    // 🛡️ ABUSE PROTECTION: Verify request origin/site
    const headerList = await headers();
    const origin = headerList.get('origin');
    const secFetchSite = headerList.get('sec-fetch-site');
    const host = headerList.get('host');

    // Only allow same-origin or same-site requests to prevent external spam
    const isSameOrigin = origin && host && origin.includes(host);
    const isSameSite = secFetchSite === 'same-origin' || secFetchSite === 'same-site';

    if (!isSameOrigin && !isSameSite && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = (await req.json()) as TelemetryEvent;

    // 🛡️ PAYLOAD VALIDATION & CONSTRAINTS
    if (!body || !body.type || !body.path) {
      return NextResponse.json({ error: 'Invalid telemetry payload' }, { status: 400 });
    }

    // Truncate strings to prevent oversized Telegram requests (max 4096 chars per message)
    // We enforce a conservative limit per field here.
    const sanitize = <T extends string | null | undefined>(str: T, max = 500): T => 
      typeof str === 'string' ? str.substring(0, max) as T : str;

    const validatedEvent: TelemetryEvent = {
      ...body,
      path: body.path.substring(0, 255),
      previousPath: sanitize(body.previousPath, 255),
      referrer: sanitize(body.referrer, 500),
      userAgent: sanitize(body.userAgent, 500),
      actionDetails: sanitize(body.actionDetails, 1000),
      guestName: sanitize(body.guestName, 100),
    };

    // 🚀 ASYNCHRONOUS BACKGROUND DISPATCH
    // We intentionally DO NOT await this call, allowing Next.js to return 200 OK immediately
    // and offload all Telegram requests out-of-band so it doesn't affect user interactions.
    sendTelemetryEvent(validatedEvent).catch((err) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Telemetry API] Background telemetry dispatch failed:', err);
      }
    });

    // Return immediate success
    return NextResponse.json({ success: true });
  } catch (error: any) {
    // 🔒 Silent catch-all on the server side
    logger.error('Failed to process incoming telemetry payload', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

