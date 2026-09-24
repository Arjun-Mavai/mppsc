import { NextResponse } from 'next/server';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔄 TOGGLE ACTIVE — Admin toggles user active/inactive
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST { userId, isActive: boolean }
// Inactive users can't login — simple on/off switch for admin
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function POST(request: Request) {
  try {
    // ── Admin Auth ──────────────────────────────────────────────
    const cookieStore = await cookies();
    const { extractAuthToken } = await import('@/lib/auth-constants');
    const token = extractAuthToken(cookieStore);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { verifyToken } = await import('@/lib/jwt');
    const decoded: any = verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const adminUser = await db.query.mppscUsers.findFirst({
      where: (users, { eq }) => eq(users.id, decoded.userId),
    });

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // ── Parse + Validate ────────────────────────────────────────
    const { userId, isActive } = await request.json();

    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'userId and isActive (boolean) required' },
        { status: 400 }
      );
    }

    // Can't deactivate yourself
    if (userId === decoded.userId) {
      return NextResponse.json({ error: "Can't deactivate your own account" }, { status: 400 });
    }

    // ── Update isActive ─────────────────────────────────────────
    await db.update(mppscUsers).set({ isActive }).where(eq(mppscUsers.id, userId));

    logger.info(
      `User ${userId} ${isActive ? 'activated' : 'deactivated'} by admin ${decoded.userId}`
    );

    return NextResponse.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error: any) {
    logger.error('Toggle active error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
