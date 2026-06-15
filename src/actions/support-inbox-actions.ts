'use server';

import { db } from '@/db';
import { supportConversations, supportMessages, guests } from '@/db/schema';
import { eq, desc, asc, or } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { logger } from '@/lib/logger';

export async function saveIncomingMessage({
  platform,
  guestPhone,
  guestName,
  text,
}: {
  platform: 'whatsapp' | 'telegram';
  guestPhone: string;
  guestName?: string;
  text: string;
}) {
  try {
    // Normalize phone: remove '+', spaces, etc.
    const cleanPhone = guestPhone.replace(/\D/g, '');

    // 1. Find existing conversation for this phone/ID and platform
    let conv = await db.select().from(supportConversations)
      .where(
        or(
          eq(supportConversations.guestPhone, cleanPhone),
          eq(supportConversations.guestPhone, `+${cleanPhone}`),
          eq(supportConversations.guestPhone, guestPhone)
        )
      ).limit(1).then(res => res[0]);

    if (!conv) {
      // Find guest if exists
      let guestId = null;
      if (platform === 'whatsapp') {
        const guestRes = await db.select().from(guests).where(
          or(
            eq(guests.mobile, cleanPhone),
            eq(guests.mobile, `+${cleanPhone}`),
            eq(guests.mobile, guestPhone)
          )
        ).limit(1);
        if (guestRes.length > 0) guestId = guestRes[0].id;
      }

      // Create new conversation
      const newId = nanoid();
      await db.insert(supportConversations).values({
        id: newId,
        platform,
        guestId,
        guestName: guestName || 'Unknown User',
        guestPhone,
        unreadCount: 1,
        lastMessageAt: new Date(),
      });
      
      conv = { id: newId } as any;
    } else {
      // Update conversation unread count and timestamp
      await db.update(supportConversations)
        .set({ 
          unreadCount: (conv.unreadCount || 0) + 1,
          lastMessageAt: new Date(),
          guestName: guestName && conv.guestName === 'Unknown User' ? guestName : conv.guestName, // Update name if we get it
        })
        .where(eq(supportConversations.id, conv.id));
    }

    // 2. Save the message
    await db.insert(supportMessages).values({
      id: nanoid(),
      conversationId: conv.id,
      sender: 'user',
      text,
      createdAt: new Date(),
    });

    return { success: true, conversationId: conv.id, unreadCount: conv.unreadCount || 1 };
  } catch (error) {
    console.error('Error saving incoming message:', error);
    return { success: false };
  }
}

export async function saveOutgoingMessage(conversationId: string, text: string, sender: 'bot' | 'admin', messageId?: string) {
  try {
    await db.insert(supportMessages).values({
      id: messageId || nanoid(),
      conversationId,
      sender,
      text,
      createdAt: new Date(),
    });

    await db.update(supportConversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(supportConversations.id, conversationId));

    return { success: true };
  } catch (error) {
    console.error('Error saving outgoing message:', error);
    return { success: false };
  }
}

export async function getConversations() {
  try {
    const convs = await db.select().from(supportConversations).orderBy(desc(supportConversations.lastMessageAt));
    return { success: true, conversations: convs };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { success: false, conversations: [] };
  }
}

export async function getMessages(conversationId: string) {
  try {
    const msgs = await db.select().from(supportMessages)
      .where(eq(supportMessages.conversationId, conversationId))
      .orderBy(asc(supportMessages.createdAt));
    return { success: true, messages: msgs };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { success: false, messages: [] };
  }
}

export async function markAsRead(conversationId: string) {
  try {
    await db.update(supportConversations)
      .set({ unreadCount: 0 })
      .where(eq(supportConversations.id, conversationId));
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function sendAdminReply(conversationId: string, text: string, options?: { buttons?: { id: string, title: string }[] }) {
  try {
    const conv = await db.select().from(supportConversations).where(eq(supportConversations.id, conversationId)).limit(1).then(res => res[0]);
    if (!conv) return { success: false, error: 'Conversation not found' };

    let apiSuccess = false;
    let metaMessageId: string | undefined = undefined;

    if (conv.platform === 'telegram') {
      const BOT_TOKEN = process.env.TELEGRAM_CONVERSATION_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
      if (BOT_TOKEN) {
        let reply_markup = undefined;
        if (options?.buttons && options.buttons.length > 0) {
          reply_markup = {
            inline_keyboard: options.buttons.map(b => [{ text: b.title, callback_data: b.id }])
          };
        }

        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            chat_id: conv.guestPhone, 
            text,
            reply_markup 
          })
        });
        if (res.ok) {
          apiSuccess = true;
          const data = await res.json();
          if (data.result?.message_id) metaMessageId = `tg_${data.result.message_id}`;
        } else {
          const errorText = await res.text();
          logger.error('Telegram Admin Reply API error', new Error(errorText), { category: 'telegram' });
        }
      }
    } else if (conv.platform === 'whatsapp') {
      const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
      const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
      if (WHATSAPP_TOKEN && WHATSAPP_PHONE_ID) {
        let bodyPayload: any = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: conv.guestPhone,
        };

        if (options?.buttons && options.buttons.length > 0 && options.buttons.length <= 3) {
          bodyPayload.type = 'interactive';
          bodyPayload.interactive = {
            type: 'button',
            body: { text: text },
            action: {
              buttons: options.buttons.map(b => ({
                type: 'reply',
                reply: { id: b.id, title: b.title }
              }))
            }
          };
        } else {
          bodyPayload.type = 'text';
          bodyPayload.text = { preview_url: false, body: text };
        }

        const res = await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyPayload)
        });
        if (res.ok) {
          apiSuccess = true;
          const data = await res.json();
          if (data.messages?.[0]?.id) metaMessageId = data.messages[0].id;
        } else {
          const errorText = await res.text();
          logger.error('WhatsApp Admin Reply API error', new Error(errorText), { category: 'api' });
        }
      }
    }

    if (apiSuccess) {
      await saveOutgoingMessage(conversationId, text, 'admin', metaMessageId);
      return { success: true };
    } else {
      return { success: false, error: 'Failed to send via API' };
    }
  } catch (error) {
    logger.error('Error sending admin reply', error, { category: 'api' });
    return { success: false, error: 'Internal Server Error' };
  }
}
