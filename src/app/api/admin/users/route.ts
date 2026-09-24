import { NextResponse } from 'next/server';
import { db } from '@/db';
import { mppscUsers, payments } from '@/db/schema';
import { cookies } from 'next/headers';
import { sql, eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👥 ADMIN USERS LIST API — Saare users with stats
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Returns: All users (active + deleted) with their status
// + Stats: total, active, expired, free/lite/pro counts, migrations
//
// Admin-only. Used by /admin/users page.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // ── Admin Auth ──────────────────────────────────────────────
    const { verifyAdminApi } = await import('@/lib/auth');
    const adminUser = await verifyAdminApi();

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // ── Get Exam Type Filter ──
    const { searchParams } = new URL(req.url);
    const examTypeFilter = searchParams.get('examType') || 'mppsc';

    // ── Fetch All Users (password excluded for security) ────────
    const allUsers = await db
      .select({
        id: mppscUsers.id,
        name: mppscUsers.name,
        email: mppscUsers.email,
        role: mppscUsers.role,
        planTier: mppscUsers.planTier,
        isSubscribed: mppscUsers.isSubscribed,
        isActive: mppscUsers.isActive,
        createdAt: mppscUsers.createdAt,
        deletedAt: mppscUsers.deletedAt,
        accessExpiresAt: mppscUsers.accessExpiresAt,
        phone: mppscUsers.phone,
        metadata: mppscUsers.metadata,
        previousUserId: mppscUsers.previousUserId,
        examType: mppscUsers.examType,
      })
      .from(mppscUsers)
      .where(eq(mppscUsers.examType, examTypeFilter as any))
      .orderBy(sql`created_at DESC`);

    // ── Calculate Stats ─────────────────────────────────────────
    const now = new Date();
    const stats = {
      total: allUsers.length,
      active: 0,
      expired: 0,
      deleted: 0,
      inactive: 0,
      free: 0,
      lite: 0,
      pro: 0,
      migrations: 0, // lite→pro upgrades (users with previousUserId)
    };

    for (const user of allUsers) {
      if (user.deletedAt) {
        stats.deleted++;
      } else if (user.isActive === false) {
        stats.inactive++;
      } else if (user.accessExpiresAt && new Date(user.accessExpiresAt) < now) {
        stats.expired++;
      } else {
        stats.active++;
      }

      // Count plan tiers (only active users)
      if (!user.deletedAt) {
        if (user.planTier === 'free') stats.free++;
        else if (user.planTier === 'lite') stats.lite++;
        else if (user.planTier === 'pro') stats.pro++;
      }

      // Migration tracking
      if (user.previousUserId) stats.migrations++;
    }

    // 🛡️ BACKFILL/RESOLVE MISSING USER CONSENT FROM PAYMENTS HISTORY
    const paymentsWithConsent = await db
      .select({
        userId: payments.userId,
        notes: payments.notes,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .where(sql`notes IS NOT NULL AND status = 'captured' AND exam_type = ${examTypeFilter}`);

    const consentMap = new Map<string, { consent: any, createdAt: number }>();
    for (const p of paymentsWithConsent) {
      if (!p.userId || !p.notes) continue;
      try {
        const notesObj = typeof p.notes === 'string' ? JSON.parse(p.notes) : p.notes;
        if (notesObj && notesObj.consent) {
          const pTime = p.createdAt ? new Date(p.createdAt).getTime() : 0;
          const existing = consentMap.get(p.userId);
          if (!existing || pTime > existing.createdAt) {
            consentMap.set(p.userId, { consent: notesObj.consent, createdAt: pTime });
          }
        }
      } catch {}
    }

    const mappedUsers = allUsers.map((user) => {
      let userMeta: any = user.metadata;
      if (typeof userMeta === 'string') {
        try {
          userMeta = JSON.parse(userMeta);
        } catch {
          userMeta = {};
        }
      } else if (!userMeta || typeof userMeta !== 'object') {
        userMeta = {};
      }

      const mergedConsent = userMeta.consent || consentMap.get(user.id)?.consent;
      if (mergedConsent) {
        userMeta = {
          ...userMeta,
          consent: mergedConsent
        };
      }

      return {
        ...user,
        metadata: userMeta
      };
    });

    return NextResponse.json(
      { users: mappedUsers, stats },
      {
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  } catch (error: any) {
    logger.error('Admin users list error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ── DELETE User ──────────────────────────────────────────────
export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();

    // ── Admin Auth ──────────────────────────────────────────────
    const { verifyAdminApi } = await import('@/lib/auth');
    const adminUser = await verifyAdminApi();

    if (!adminUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    // 1. Get user details for logging before delete
    const targetUser = await db.query.mppscUsers.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });

    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 2. Log access delete activity
    const { logUserActivity } = await import('@/app/actions/user-activity');
    await logUserActivity({
      userId: targetUser.id,
      userEmail: targetUser.email,
      userName: targetUser.name,
      adminId: adminUser.id,
      action: 'DELETE',
      details: {
        reason: 'Admin deleted user',
        previousPlan: targetUser.planTier,
        joinedAt: targetUser.createdAt,
      },
    });

    // 3. Delete user (Cascades attempts/revisions, Set Null payments)
    await db.delete(mppscUsers).where(sql`id = ${userId}`);

    return NextResponse.json({ message: 'User deleted safely' });
  } catch (error: any) {
    logger.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
