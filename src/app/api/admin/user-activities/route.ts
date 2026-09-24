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
    // Admin Auth (device-aware)
    const { verifyAdminApi } = await import('@/lib/auth');
    const adminUser = await verifyAdminApi();
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    decoded = { userId: adminUser.id };

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
