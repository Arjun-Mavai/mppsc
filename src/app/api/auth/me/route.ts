import { NextResponse } from 'next/server';
import { verifyAuthInternal } from '@/lib/auth';
import { logger } from '@/lib/logger';
import type { AuthSessionResponse } from '@/types/auth';

/**
 * /api/auth/me = single source of truth for "abhi session zinda hai?"
 * - user return -> UI stays logged in
 * - { user: null, reason: 'multi_device' } -> kicked-session signal
 * Middleware + Navbar dono isi signal pe react karte hain.
 */
// Auth endpoint must NEVER be cached — stale auth = broken app
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await verifyAuthInternal();

    if (!user) {
      const response: AuthSessionResponse = { user: null };
      return NextResponse.json(response, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      });
    }

    // 🛡️ Detected session version mismatch
    if (user._mismatch) {
      const response: AuthSessionResponse = { user: null, reason: 'multi_device' };
      return NextResponse.json(response, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      });
    }

    const response: AuthSessionResponse = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? undefined,
        role: user.role,
        isSubscribed: user.isSubscribed,
        planTier: user.planTier,
        accessExpiresAt: user.accessExpiresAt,
        accessGrants: user.accessGrants,
      },
    };

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error) {
    logger.error('Session check failed:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
