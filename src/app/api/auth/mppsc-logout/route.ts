import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { mppscUsers, mppscUserActivities } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';
import { touchAuthLogoutMetadata } from '@/lib/auth-session-metadata';
import { extractAuthToken, deleteAuthCookies } from '@/lib/auth-constants';

/**
 * Logout API - clean exit choreography
 * 1) current token decode
 * 2) sessionVersion bump (old token invalid)
 * 3) metadata me logout marker
 * 4) cookie delete
 *
 * Isse user dubara protected route khole to seedha login flow trigger hota hai.
 */
// Logout must never be cached
export const dynamic = 'force-dynamic';

export async function POST() {
  const cookieStore = await cookies();
  const token = extractAuthToken(cookieStore);

  try {
    if (token) {
      const { verifyToken } = await import('@/lib/jwt');
      const decoded = verifyToken(token);

      if (decoded?.userId) {
        const user = await db.query.mppscUsers.findFirst({
          where: eq(mppscUsers.id, decoded.userId),
          columns: {
            sessionVersion: true,
            metadata: true,
          },
        });

        if (user) {
          // Check if this token is actually the current active session
          const tokenVersion = decoded.sessionVersion || 1;
          const dbVersion = user.sessionVersion || 1;

          // Only bump session and record logout if the token is still valid (not already kicked)
          if (tokenVersion === dbVersion) {
            await db
              .update(mppscUsers)
              .set({
                sessionVersion: dbVersion + 1,
                metadata: touchAuthLogoutMetadata(user.metadata),
              })
              .where(eq(mppscUsers.id, decoded.userId));

            await db.insert(mppscUserActivities).values({
              id: uuidv4(),
              userId: decoded.userId,
              userEmail: decoded.email || '',
              userName: null,
              action: 'LOGOUT',
              details: {
                reason: 'manual_logout',
              },
            });
          }
        }


      }
    }
  } catch (error) {
    logger.error('Logout session clear failed', error, {
      category: 'auth',
    });
    deleteAuthCookies(cookieStore);
    const response = NextResponse.json({ success: false }, { status: 500 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  }

  // Clear all auth and device binding cookies
  deleteAuthCookies(cookieStore);

  // Set no-cache headers to prevent browser/CDN from caching logout response
  const response = NextResponse.json({ success: true });
  deleteAuthCookies(response);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}
