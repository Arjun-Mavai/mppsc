import { logger } from '@/lib/logger';
import { sendHumanRequestTelegramNotification } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, email, phone } = body;

    if (!userId) {
      return Response.json({ error: 'Invalid metrics payload' }, { status: 400 });
    }

    // Log internally
    logger.warn(`Content Print Attempt Detected`, {
      category: 'system',
      metadata: { userId, name, email, phone },
    });

    const formattedTime = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Send Telegram Alert to Human Request Bot (Support Inbox Group) using Markdown
    const message = `👮 *MPPSC ZEN SECURITY*\n` +
      `🚨 *PRINT ATTEMPT DETECTED* 🚨\n\n` +
      `👤 *Name:* ${name || 'Unknown'}\n` +
      `📧 *Email:* \`${email || 'Unknown'}\`\n` +
      `📞 *Phone:* \`${phone || 'Unknown'}\`\n` +
      `🆔 *User ID:* \`${userId}\`\n\n` +
      `_User triggered print/PDF generation._\n\n` +
      `⏱️ *Time:* _${formattedTime} IST_`;

    await sendHumanRequestTelegramNotification(message);

    return Response.json({ success: true, timestamp: Date.now() });
  } catch (error) {
    logger.error('Failed to process ui-metrics', error as Error, {
      category: 'system',
    });
    // Return 200 even on error so it looks like a normal metric drop
    return Response.json({ success: false, dropped: true });
  }
}
