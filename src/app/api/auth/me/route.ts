import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

// Auth endpoint must NEVER be cached — stale auth = broken app
export const dynamic = 'force-dynamic';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👤 ME ENDPOINT — Frontend calls this to check current session
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Returns user data including accessExpiresAt so frontend
// can show expiry warnings. Cache-Control: no-store ensures
// browsers never cache this response.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function GET() {
  try {
    const user = await verifyAuth();

    if (!user) {
      return NextResponse.json(
        { user: null },
        {
          headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
        }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone ?? undefined,
          role: user.role,
          isSubscribed: user.isSubscribed,
          planTier: user.planTier,
          accessExpiresAt: user.accessExpiresAt,
        },
      },
      {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      }
    );
  } catch (error) {
    logger.error('Session check failed:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
