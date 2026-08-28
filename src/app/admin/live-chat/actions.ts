'use server';

import { db } from '@/db';
import { chatSessions, chatMessages } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Fetch all active sessions for the sidebar
export async function getActiveSessions() {
  try {
    const sessions = await db.select({
      id: chatSessions.id,
      name: chatSessions.guestName,
      updatedAt: chatSessions.updatedAt,
      isBanned: chatSessions.isBanned,
    })
    .from(chatSessions)
    // .where(eq(chatSessions.status, 'active')) // Fetch all to allow unbanning etc.
    .orderBy(desc(chatSessions.updatedAt))
    .limit(50);

    return sessions;
  } catch (err) {
    console.error('Failed to get active sessions', err);
    return [];
  }
}

// Fetch chat history for a specific user
export async function getChatHistory(userId: string) {
  try {
    const messages = await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, userId))
      .orderBy(chatMessages.createdAt);

    return messages.map((msg) => ({
      id: msg.id,
      type: 'chat' as const,
      senderRole: msg.direction === 'inbound' ? 'student' as const : 'admin' as const,
      senderId: msg.direction === 'inbound' ? userId : (msg.adminId || 'admin_arjun'),
      senderName: msg.direction === 'inbound' ? 'Aspirant' : 'Admin Arjun',
      text: msg.content,
      timestamp: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString(),
      msgType: (msg.msgType as 'text' | 'rich_link' | 'interactive') || 'text',
      metadata: msg.metadata || undefined,
    }));
  } catch (err) {
    console.error('Failed to get chat history', err);
    return [];
  }
}

// Ban a user for 10 minutes
export async function banStudentAction(userId: string) {
  try {
    const tenMinutesFromNow = new Date(Date.now() + 10 * 60000);
    
    await db.update(chatSessions)
      .set({
        isBanned: true,
        banExpiresAt: tenMinutesFromNow,
      })
      .where(eq(chatSessions.id, userId));
      
    revalidatePath('/admin/live-chat');
    return { success: true };
  } catch (err) {
    console.error('Failed to ban student', err);
    return { success: false };
  }
}

// Unban a user immediately
export async function unbanStudentAction(userId: string) {
  try {
    await db.update(chatSessions)
      .set({
        isBanned: false,
        banExpiresAt: null,
      })
      .where(eq(chatSessions.id, userId));
      
    revalidatePath('/admin/live-chat');
    return { success: true };
  } catch (err) {
    console.error('Failed to unban student', err);
    return { success: false };
  }
}
