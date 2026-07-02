import { NextResponse } from 'next/server';
import { db } from '@/db';
import { guests, whatsappCampaignLogs } from '@/db/schema';
import { inArray } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
  try {
    const { studentIds, senderMode, templateName, imageUrl, manualContacts, supportQuery } = await req.json();

    if ((!studentIds || studentIds.length === 0) && (!manualContacts || manualContacts.length === 0)) {
      return NextResponse.json({ error: 'Please provide recipients (selected or manual)' }, { status: 400 });
    }

    let finalGuests: any[] = [];

    // 1. Fetch selected guests from DB
    if (studentIds && studentIds.length > 0) {
      const selectedGuests = await db
        .select({ id: guests.id, name: guests.name, mobile: guests.mobile })
        .from(guests)
        .where(inArray(guests.id, studentIds));
      finalGuests = [...selectedGuests];
    }

    // 2. Handle manual contacts (insert/update them in DB to get an ID for logging)
    if (manualContacts && manualContacts.length > 0) {
      for (const mc of manualContacts) {
        if (!mc.mobile) continue;
        const normalizedMobile = mc.mobile.replace(/\D/g, ''); // Ensure numbers only
        if (!normalizedMobile) continue;

        // Ensure manual contact exists in DB
        let existingGuest = await db.select({ id: guests.id, name: guests.name, mobile: guests.mobile }).from(guests).where(inArray(guests.mobile, [normalizedMobile])).get();
        if (!existingGuest) {
          const newId = nanoid();
          await db.insert(guests).values({
            id: newId,
            name: mc.name || 'Student',
            mobile: normalizedMobile,
            leadSource: 'Manual',
          });
          existingGuest = { id: newId, name: mc.name || 'Student', mobile: normalizedMobile };
        }
        
        // Prevent duplicates in final array if they were also selected in the UI
        if (!finalGuests.some(g => g.id === existingGuest!.id)) {
           finalGuests.push(existingGuest);
        }
      }
    }

    if (finalGuests.length === 0) {
      return NextResponse.json({ error: 'No valid guests found to send messages' }, { status: 404 });
    }

    // 🛡️ PRODUCTION SAFETY: Limit bulk send to 100 students per batch
    if (finalGuests.length > 100) {
      return NextResponse.json({ error: 'Bulk send limited to 100 recipients per batch' }, { status: 400 });
    }

    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const PHONE_ID = senderMode === 'TEST' 
      ? (process.env.WHATSAPP_TEST_PHONE_ID || '1015817634951119') 
      : process.env.WHATSAPP_PHONE_ID; 

    if (!ACCESS_TOKEN || !PHONE_ID) {
      logger.error('Missing WhatsApp API credentials', undefined, { category: 'api' });
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    let sentCount = 0;
    const startTime = Date.now();
    const MAX_EXECUTION_TIME = 25000; 
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    const selectedTemplate = templateName || 'mppsc_pyq_promo';

    for (const guest of finalGuests) {
      if (!guest.mobile) continue;
      
      if (Date.now() - startTime > MAX_EXECUTION_TIME) {
        logger.warn('Bulk send partially completed: Nearing function timeout', { category: 'api' });
        break;
      }

      await delay(100);

      try {
        // Construct template payload dynamically
        const bodyParameters: any[] = [
          {
            type: 'text',
            text: guest.name || 'Student'
          }
        ];

        // Add 2nd parameter for support templates
        if (selectedTemplate === 'zenscroll_support_received' || selectedTemplate === 'zenscroll_support_received_hi') {
          bodyParameters.push({
            type: 'text',
            text: supportQuery || 'Syllabus Tracker Issue'
          });
        }

        const components: any[] = [
          {
            type: 'body',
            parameters: bodyParameters
          }
        ];

        // If template requires image header (like zenscroll_alert)
        if (selectedTemplate === 'zenscroll_alert' && imageUrl) {
           components.unshift({
             type: 'header',
             parameters: [
               {
                 type: 'image',
                 image: { link: imageUrl }
               }
             ]
           });
        }

        const payload = {
          messaging_product: 'whatsapp',
          to: guest.mobile,
          type: 'template',
          template: {
            name: selectedTemplate,
            language: { code: selectedTemplate.endsWith('_hi') ? 'hi' : 'en' },
            components: components
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
          await db.insert(whatsappCampaignLogs).values({
            guestId: guest.id,
            messageId: messageId,
            status: 'SENT',
            templateName: selectedTemplate,
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
