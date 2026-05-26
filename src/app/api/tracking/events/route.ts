import { NextResponse } from 'next/server';
import { sendTelemetryEvent, TelemetryEvent } from '@/lib/telegram-events';
import { logger } from '@/lib/logger';

/**
 * API Endpoint: POST /api/tracking/events
 * Receives lightweight user navigation events and routes them asynchronously.
 * Fully optimized, non-blocking, and silent-failing.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TelemetryEvent;

    // Basic validation
    if (!body || !body.type || !body.path) {
      return NextResponse.json({ error: 'Invalid telemetry payload' }, { status: 400 });
    }

    // 🚀 ASYNCHRONOUS BACKGROUND DISPATCH
    // We intentionally DO NOT await this call, allowing Next.js to return 200 OK immediately
    // and offload all Telegram requests out-of-band so it doesn't affect user interactions.
    sendTelemetryEvent(body).catch((err) => {
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
