import { cookies } from 'next/headers';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq, isNull, and } from 'drizzle-orm';
import { cache } from 'react';
import { logger } from '@/lib/logger';
import type { JWTPayload } from './jwt';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 AUTH VERIFICATION — har server component me use hota h
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// React cache() wrapper — ek request me multiple baar call
// hone par bhi DB query sirf EK baar chalega (dedup magic!)
//
// Checks:
//   1. Cookie exists? → nahi to null (not logged in)
//   2. JWT valid? → nahi to null (tampered/expired token)
//   3. User exists in DB? → nahi to null
//   4. User soft-deleted? → haan to null (deactivated account)
//
// Note: Expiry check is NOT done here — it's done at login time.
// Once logged in, user stays logged in until cookie expires (30 days).
// This prevents mid-session kicks which is bad UX.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const verifyAuth = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('mppsc_token');

  if (!token) {
    return null;
  }

  const { verifyToken } = await import('@/lib/jwt');
  const decoded = verifyToken(token.value);

  if (!decoded || !decoded.userId) {
    return null;
  }

  const userId = decoded.userId;

  try {
    // Only fetch active users — soft-deleted + inactive users are treated as non-existent
    const users = await db
      .select()
      .from(mppscUsers)
      .where(
        and(
          eq(mppscUsers.id, userId),
          eq(mppscUsers.examType, 'mppsc'),
          isNull(mppscUsers.deletedAt),
          eq(mppscUsers.isActive, true)
        )
      )
      .limit(1);
    return users[0] || null;
  } catch (error) {
    // DB errors → null (graceful degradation, user redirected to login)
    logger.error('Database error during auth verification:', error, {
      category: 'auth',
      userId,
    });
    return null;
  }
});

/**
 * 🛡️ ASSERT ADMIN — Server Action protection
 * Verifies user is logged in AND has 'admin' role.
 * Throws error if not authorized.
 */
export async function assertAdmin() {
  const user = await verifyAuth();
  if (!user || user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
  return user;
}
