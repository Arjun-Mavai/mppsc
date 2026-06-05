'use server';

import { db } from '@/db';
import { syllabusTopics, mainsTopics, mainsUnits, mainsPapers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { assertAdmin } from '@/lib/auth';

export async function getTelegramTopics() {
  await assertAdmin();

  // 1. Fetch Prelims Topics
  const preTopicsRaw = await db.query.syllabusTopics.findMany({
    where: eq(syllabusTopics.examType, 'mppsc'),
    orderBy: (topics, { asc }) => [asc(topics.unitId), asc(topics.order)],
  });

  // Group Prelims
  const prelimsGroups: Record<string, any[]> = {};
  preTopicsRaw.forEach((t) => {
    const unitName = t.unitId.replace('_', ' ').toUpperCase();
    if (!prelimsGroups[unitName]) prelimsGroups[unitName] = [];
    prelimsGroups[unitName].push({
      id: t.id,
      title: t.title,
      titleEn: t.titleEn || t.title,
    });
  });

  const prelims = Object.entries(prelimsGroups).map(([unit, topics]) => ({
    unit,
    topics,
  }));

  // 2. Fetch Mains Topics
  // We need to join topics -> units -> papers to get Paper/Unit structure
  const mainsTopicsRaw = await db
    .select({
      topicId: mainsTopics.id,
      topicOrder: mainsTopics.displayOrder,
      topicTitle: mainsTopics.titleEn,
      unitNumber: mainsUnits.unitNumber,
      unitTitle: mainsUnits.titleEn,
      part: mainsUnits.part,
      paperNumber: mainsPapers.paperNumber,
      paperTitle: mainsPapers.titleEn,
    })
    .from(mainsTopics)
    .innerJoin(mainsUnits, eq(mainsTopics.unitId, mainsUnits.id))
    .innerJoin(mainsPapers, eq(mainsUnits.paperId, mainsPapers.id))
    .where(eq(mainsTopics.examType, 'mppsc_mains'))
    .orderBy(mainsPapers.paperNumber, mainsUnits.part, mainsUnits.unitNumber, mainsTopics.displayOrder);

  // Group Mains by Paper -> Part -> Unit
  const mainsGroups: Record<string, any[]> = {};
  mainsTopicsRaw.forEach((t) => {
    const groupName = `Paper ${t.paperNumber} Part ${t.part} Unit ${t.unitNumber}: ${t.unitTitle}`;
    if (!mainsGroups[groupName]) mainsGroups[groupName] = [];
    mainsGroups[groupName].push({
      id: t.topicId,
      title: t.topicTitle,
    });
  });

  const mains = Object.entries(mainsGroups).map(([unit, topics]) => ({
    unit,
    topics,
  }));

  return { prelims, mains };
}

export async function sendTelegramBotMessage(rawText: string) {
  await assertAdmin();

  const token = process.env.TELEGRAM_EVENTS_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_EVENTS_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { success: false, error: 'Telegram credentials missing in environment variables.' };
  }

  // Convert basic markdown to HTML for Telegram
  let htmlText = rawText
    .replace(/&/g, '&amp;')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    // Underline (custom markdown or just supporting existing <u>)
    .replace(/__(.*?)__/g, '<u>$1</u>')
    // Italic
    .replace(/(?<!\w)_(.*?)_(?!\w)/g, '<i>$1</i>')
    // Strikethrough
    .replace(/~~(.*?)~~/g, '<s>$1</s>')
    // Convert Telegram native quotes `> ` to blockquote
    .replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>')
    .replace(/<\/blockquote>\n<blockquote>/g, '\n'); // Merge adjacent blockquotes

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: htmlText,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('Telegram API Error:', data);
      return { success: false, error: data.description || 'Failed to send message' };
    }

    return { success: true, messageId: data.result.message_id };
  } catch (error: any) {
    console.error('Failed to send telegram message:', error);
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
}
