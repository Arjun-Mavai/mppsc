import { NextResponse } from 'next/server';
import { db } from '@/db';
import { guests, whatsappCampaignLogs } from '@/db/schema';
import { desc, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // Fetch recent guests with a limit for production safety
    const allGuests = await db
      .select()
      .from(guests)
      .orderBy(desc(guests.createdAt))
      .limit(500);

    // Fetch stats from new whatsappCampaignLogs table
    const statsQuery = await db
      .select({
        status: whatsappCampaignLogs.status,
        count: sql<number>`count(*)`,
      })
      .from(whatsappCampaignLogs)
      .groupBy(whatsappCampaignLogs.status);

    const stats = { SENT: 0, DELIVERED: 0, READ: 0, REPLIED: 0 };
    statsQuery.forEach((row) => {
      if (row.status in stats) {
        stats[row.status as keyof typeof stats] = row.count;
      }
    });

    return NextResponse.json({ students: allGuests, stats });
  } catch (error) {
    logger.error('Error fetching guests and stats', error, { category: 'api' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { students } = await req.json(); // Array of { name, phone_number }
    if (!students || !Array.isArray(students)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    let count = 0;
    for (const s of students) {
      const phone = s.phone_number.replace(/\D/g, '');
      if (phone && s.name) {
        // Upsert into guests table based on mobile
        await db
          .insert(guests)
          .values({
            id: crypto.randomUUID(),
            name: s.name,
            mobile: phone,
            leadSource: 'whatsapp_import',
          })
          .onConflictDoUpdate({
            target: guests.mobile,
            set: { name: s.name },
          });
        count++;
      }
    }

    return NextResponse.json({ success: true, added: count });
  } catch (error) {
    logger.error('Error saving guests', error, { category: 'api' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
