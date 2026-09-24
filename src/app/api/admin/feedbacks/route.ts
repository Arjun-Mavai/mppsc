import { NextResponse } from 'next/server';
import { db } from '@/db';
import { feedbacks, mppscUsers } from '@/db/schema';
import { cookies } from 'next/headers';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    // Verify Admin (device-aware)
    const { verifyAdminApi } = await import('@/lib/auth');
    const admin = await verifyAdminApi();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Fetch Feedbacks
    const data = await db
      .select()
      .from(feedbacks)
      .where(eq(feedbacks.examType, 'mppsc')) // 🔒 Isolation
      .orderBy(desc(feedbacks.createdAt));

    return NextResponse.json({ feedbacks: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
