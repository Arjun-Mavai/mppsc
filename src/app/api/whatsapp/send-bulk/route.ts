import { NextResponse } from 'next/server';
import { db } from '@/db';
import { guests, whatsappCampaignLogs } from '@/db/schema';
import { inArray } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const { studentIds, senderMode } = await req.json();

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty guest IDs' }, { status: 400 });
    }

    // Fetch guests using Drizzle
    const selectedGuests = await db
      .select({ id: guests.id, name: guests.name, mobile: guests.mobile })
      .from(guests)
      .where(inArray(guests.id, studentIds));

    if (selectedGuests.length === 0) {
      return NextResponse.json({ error: 'No valid guests found' }, { status: 404 });
    }

    // 🛡️ PRODUCTION SAFETY: Limit bulk send to 100 students per request to avoid Vercel timeouts
    if (selectedGuests.length > 100) {
      return NextResponse.json({ error: 'Bulk send limited to 100 students per batch' }, { status: 400 });
    }

    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const PHONE_ID = senderMode === 'TEST' 
      ? (process.env.WHATSAPP_TEST_PHONE_ID || '1015817634951119') // Meta's Test Phone ID
      : process.env.WHATSAPP_PHONE_ID; // Your Main Business Number

    if (!ACCESS_TOKEN || !PHONE_ID) {
      logger.error('Missing WhatsApp API credentials', undefined, { category: 'api' });
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    let sentCount = 0;
    const startTime = Date.now();
    const MAX_EXECUTION_TIME = 25000; // 25 seconds (Vercel safety margin)
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    for (const guest of selectedGuests) {
      if (!guest.mobile) continue;
      
      // 🛡️ Safety check: Stop if we are nearing the function timeout
      if (Date.now() - startTime > MAX_EXECUTION_TIME) {
        logger.warn('Bulk send partially completed: Nearing function timeout', { category: 'api' });
        break;
      }

      // ⏱️ Rate Limiting Delay (100ms)
      await delay(100);

      try {
        const payload = {
          messaging_product: 'whatsapp',
          to: guest.mobile,
          type: 'template',
          template: {
            name: 'hello_world',
            language: { code: 'en_US' },
          },
        };

        const response = await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.messages && data.messages[0]) {
          const messageId = data.messages[0].id;
          // Log success to DB using Drizzle
          await db.insert(whatsappCampaignLogs).values({
            guestId: guest.id,
            messageId: messageId,
            status: 'SENT',
          });
          sentCount++;
        } else {
          logger.error(`Failed to send to ${guest.mobile}`, data, { category: 'api' });
        }
      } catch (err) {
        logger.error(`Error sending message to ${guest.mobile}`, err, { category: 'api' });
      }
    }

    return NextResponse.json({ success: true, sentCount });
  } catch (error) {
    logger.error('Bulk send error', error, { category: 'api' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
