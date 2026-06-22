import { NextResponse } from 'next/server';
import { db } from '@/db';
import { guests, whatsappCampaignLogs, supportMessages } from '@/db/schema';
import { desc, sql, eq, inArray } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // Fetch recent guests with a limit for production safety
    const allGuests = await db
      .select()
      .from(guests)
      .orderBy(desc(guests.createdAt))
      .limit(500);

    // Status priority: READ is best, then DELIVERED, SENT, FAILED
    // This ensures a guest who has READ the message shows READ, not an older SENT log
    const STATUS_PRIORITY: Record<string, number> = {
      READ: 4,
      DELIVERED: 3,
      SENT: 2,
      FAILED: 1,
    };

    const guestIds = allGuests.map(g => g.id);

    // Fetch campaign logs only for the retrieved guests
    let logs: Array<{
      guestId: string;
      status: string;
      templateName: string | null;
      createdAt: Date | null;
      updatedAt: Date | null;
    }> = [];

    if (guestIds.length > 0) {
      logs = await db
        .select({
          guestId: whatsappCampaignLogs.guestId,
          status: whatsappCampaignLogs.status,
          templateName: whatsappCampaignLogs.templateName,
          createdAt: whatsappCampaignLogs.createdAt,
          updatedAt: whatsappCampaignLogs.updatedAt,
        })
        .from(whatsappCampaignLogs)
        .where(inArray(whatsappCampaignLogs.guestId, guestIds));
    }

    const guestLogMap = new Map<string, { status: string; sentAt: Date | null; updatedAt: Date | null; templateName: string | null }>();

    logs.forEach(log => {
      const incoming = log.status || 'SENT';
      const existing = guestLogMap.get(log.guestId);
      if (!existing || (STATUS_PRIORITY[incoming] ?? 0) > (STATUS_PRIORITY[existing.status] ?? 0)) {
        guestLogMap.set(log.guestId, {
          status: incoming,
          sentAt: log.createdAt ?? null,
          updatedAt: log.updatedAt ?? null,
          templateName: log.templateName ?? null,
        });
      }
    });

    const enrichedGuests = allGuests.map(g => {
      const logEntry = guestLogMap.get(g.id);
      return {
        ...g,
        campaignStatus: logEntry?.status || 'UNSENT',
        lastSentAt: logEntry?.sentAt?.toISOString() ?? null,
        lastStatusAt: logEntry?.updatedAt?.toISOString() ?? null,
        lastTemplateName: logEntry?.templateName ?? null,
      };
    });

    // Fetch stats from new whatsappCampaignLogs table
    const statsQuery = await db
      .select({
        status: whatsappCampaignLogs.status,
        count: sql<number>`count(*)`,
      })
      .from(whatsappCampaignLogs)
      .groupBy(whatsappCampaignLogs.status);

    const stats = { SENT: 0, DELIVERED: 0, READ: 0, REPLIED: 0, FAILED: 0 };
    statsQuery.forEach((row) => {
      if (row.status in stats) {
        stats[row.status as keyof typeof stats] = row.count;
      }
    });

    // Detailed template status breakdown for billing/cost calculations
    const templateStats = await db
      .select({
        templateName: whatsappCampaignLogs.templateName,
        status: whatsappCampaignLogs.status,
        count: sql<number>`count(*)`,
      })
      .from(whatsappCampaignLogs)
      .groupBy(whatsappCampaignLogs.templateName, whatsappCampaignLogs.status);

    // Fetch received user messages from support_messages
    const receivedRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(supportMessages)
      .where(eq(supportMessages.sender, 'user'));
    
    const receivedCount = receivedRes[0]?.count || 0;

    return NextResponse.json({ students: enrichedGuests, stats, templateStats, receivedCount });
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
      const phone = s.phone_number?.replace(/\D/g, '');
      if (phone) {
        const finalName = s.name?.trim() || 'MPPSC Aspirant';
        // Upsert into guests table based on mobile
        await db
          .insert(guests)
          .values({
            id: crypto.randomUUID(),
            name: finalName,
            mobile: phone,
            leadSource: 'whatsapp_import',
          })
          .onConflictDoUpdate({
            target: guests.mobile,
            set: { name: finalName },
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
