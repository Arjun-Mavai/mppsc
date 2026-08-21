'use server';

import { sendHumanRequestTelegramNotification, sendTelegramNotification } from '@/lib/telegram';
import { logger } from '@/lib/logger';

/**
 * 🚀 Notify Admin on Telegram when a student initiates a Live WebChat Session
 * Only sends on the initial session message to avoid spamming admin's Telegram!
 */
export async function notifyLiveChatSession(data: {
  studentId: string;
  studentName: string;
  initialMessage: string;
}) {
  try {
    const { studentId, studentName, initialMessage } = data;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mppsc.zenscroll.app';
    const adminChatUrl = `${baseUrl}/admin/live-chat`;

    const markdownMessage =
      `👮 *MPPSC ZEN LIVE CHAT*\n` +
      `🚨 *Naya Live Student Doubt Session!*\n\n` +
      `👤 *Student Name:* ${studentName}\n` +
      `🆔 *Student ID:* \`${studentId}\`\n` +
      `💬 *Initial Doubt:* \n_${initialMessage}_\n\n` +
      `⏱️ *Time:* _${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST_\n\n` +
      `👉 *Open Admin Workspace:* [Live Chat Desk](${adminChatUrl})`;

    await sendHumanRequestTelegramNotification(markdownMessage).catch(() => {
      // Fallback to primary admin telegram channel if human bot is not set
      return sendTelegramNotification(
        `👮 <b>MPPSC ZEN LIVE CHAT</b>\n` +
        `🚨 <b>Naya Live Student Session!</b>\n\n` +
        `👤 <b>Student:</b> ${studentName}\n` +
        `🆔 <b>ID:</b> <code>${studentId}</code>\n` +
        `💬 <b>Doubt:</b> ${initialMessage}\n\n` +
        `🔗 <b>Admin Workspace:</b> <a href="${adminChatUrl}">Open Live Chat Desk</a>`
      );
    });

    logger.info('Admin notified of Live Chat session on Telegram', {
      category: 'telegram',
      metadata: { studentId, studentName },
    });

    return { success: true };
  } catch (error) {
    logger.error('Failed to notify admin of live chat session', error);
    return { success: false };
  }
}
