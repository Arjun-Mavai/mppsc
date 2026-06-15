import { NextResponse } from 'next/server';
import { db } from '@/db';
import { supportMessages, supportConversations } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch incoming messages (replies from users) with their names and phones
    const replies = await db
      .select({
        id: supportMessages.id,
        userPhone: supportConversations.guestPhone,
        userName: supportConversations.guestName,
        message: supportMessages.text,
        createdAt: supportMessages.createdAt,
      })
      .from(supportMessages)
      .leftJoin(supportConversations, eq(supportMessages.conversationId, supportConversations.id))
      .where(eq(supportMessages.sender, 'user'))
      .orderBy(desc(supportMessages.createdAt))
      .limit(50);

    return NextResponse.json({ success: true, replies });
  } catch (error) {
    console.error('Insights Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
