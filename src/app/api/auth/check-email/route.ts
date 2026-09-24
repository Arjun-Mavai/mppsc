import { NextResponse } from 'next/server';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { checkRateLimit, loginLimiter } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/ip';

/**
 * Lightweight Email Check — prevents duplicate payments.
 * Returns: { exists, planTier, isActive }
 */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req.headers);
    const { success } = await checkRateLimit(loginLimiter, ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    // Case-insensitive lookup so we always find Pro/Lite user regardless of how email was stored
    const user = await db.query.mppscUsers.findFirst({
      where: sql`LOWER(${mppscUsers.email}) = ${normalized}`,
      columns: { planTier: true, isActive: true, isSubscribed: true },
    });

    if (!user) return NextResponse.json({ exists: false });

    return NextResponse.json({
      exists: true,
      planTier: user.planTier ?? 'free',
      isActive: user.isActive,
      isSubscribed: user.isSubscribed ?? false,
    });
  } catch {
    return NextResponse.json({ error: 'Check failed' }, { status: 500 });
  }
}
