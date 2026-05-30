/**
 * API: Track copy attempts on protected content
 * Endpoint: POST /api/tracking/copy-attempt
 * 
 * Logs:
 * - Copy attempts (user fingerprint, content ID, timestamp)
 * - For analytics and anti-piracy monitoring
 */

import { logger } from '@/lib/logger';

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

function resolveTrustedOrigin(req: Request): string | null {
  const requestOrigin = normalizeOrigin(req.headers.get('origin'));
  if (!requestOrigin) return null;

  const host = req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const hostOrigin = normalizeOrigin(host ? `${proto}://${host}` : null);

  if (ALLOWED_ORIGINS.has(requestOrigin) || (hostOrigin && requestOrigin === hostOrigin)) {
    return requestOrigin;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const secFetchSite = req.headers.get('sec-fetch-site');
    const trustedOrigin = resolveTrustedOrigin(req);
    const isSameSite = secFetchSite === 'same-origin' || secFetchSite === 'same-site';

    if (process.env.NODE_ENV === 'production' && !trustedOrigin && !isSameSite) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const contentTypeHeader = req.headers.get('content-type') || '';
    let action: string | null = null;
    let fingerprint: string | null = null;
    let contentType: string | null = null;
    let contentId: string | null = null;
    let userId: string | null = null;
    let timestamp: string | null = null;

    if (contentTypeHeader.includes('multipart/form-data') || contentTypeHeader.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      action = formData.get('action') as string;
      fingerprint = formData.get('fingerprint') as string;
      contentType = formData.get('contentType') as string;
      contentId = formData.get('contentId') as string;
      userId = formData.get('userId') as string;
      timestamp = formData.get('timestamp') as string;
    } else {
      const body = await req.json();
      action = body.action;
      fingerprint = body.fingerprint;
      contentType = body.contentType;
      contentId = body.contentId;
      userId = body.userId;
      timestamp = body.timestamp;
    }

    // Validate inputs
    if (!action || !fingerprint || !contentType || !contentId) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (action !== 'copy_attempt') {
      return Response.json(
        { error: 'Unknown action' },
        { status: 400 }
      );
    }

    // Log the copy attempt
    logger.warn(`Copy attempt on protected content`, {
      category: 'content',
      metadata: {
        fingerprint,
        contentType,
        contentId,
        userId: userId === 'anonymous' ? 'anonymous' : userId,
        timestamp,
      },
    });

    // Optional: Store in database for analytics
    // const copyAttempt = {
    //   id: uuidv4(),
    //   userId: userId === 'anonymous' ? null : userId,
    //   fingerprint,
    //   contentType,
    //   contentId,
    //   timestamp: new Date(timestamp),
    //   userAgent: req.headers.get('user-agent') || 'unknown',
    // };
    // await db.insert(copyAttempts).values(copyAttempt);

    return Response.json({ success: true, message: 'Logged' });
  } catch (error) {
    logger.error('Failed to track copy attempt', error as Error, {
      category: 'content',
    });

    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle CORS Preflight requests for navigator.sendBeacon
 * When sendBeacon is used, modern browsers may fire an OPTIONS request first.
 * Next.js Route Handlers return 404/405 if OPTIONS is not exported.
 */
export async function OPTIONS(req: Request) {
  const trustedOrigin = resolveTrustedOrigin(req);
  if (!trustedOrigin) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': trustedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
