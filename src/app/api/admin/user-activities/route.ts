import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { db } from '@/db';
import { mppscUserActivities } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  let decoded: any;
  try {
    const cookieStore = await cookies();
    const { extractAuthToken } = await import('@/lib/auth-constants');
    const token = extractAuthToken(cookieStore);

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { verifyToken } = await import('@/lib/jwt');
    const decodedToken: any = verifyToken(token);
    decoded = decodedToken;

    if (!decoded?.userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const adminUser = await db.query.mppscUsers.findFirst({
      where: (users, { eq }) => eq(users.id, decoded.userId),
    });

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const logs = await db
      .select()
      .from(mppscUserActivities)
      .orderBy(desc(mppscUserActivities.createdAt))
      .limit(100);

    return NextResponse.json({ logs });
  } catch (error) {
    logger.error('Fetch activities error:', error, {
      category: 'system',
      userId: decoded?.userId,
    });
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
