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

export interface SendTelegramMessageOptions {
  photoUrl?: string;
  inlineButtons?: Array<{ text: string; url: string }> | Array<Array<{ text: string; url: string }>>;
  destination?: 'test' | 'live';
}

export async function sendTelegramBotMessage(rawText: string, opts?: SendTelegramMessageOptions) {
  await assertAdmin();

  const token = process.env.TELEGRAM_EVENTS_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = opts?.destination === 'live' ? '@MPPSCZenScroll' : (process.env.TELEGRAM_EVENTS_CHAT_ID || process.env.TELEGRAM_CHAT_ID);

  if (!token || !chatId) {
    return { success: false, error: 'Telegram credentials missing in environment variables.' };
  }

  // Convert basic markdown to HTML for Telegram
  // PRO TIP: Escape <, > and & FIRST, then apply tags
  const htmlText = rawText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    // Underline
    .replace(/__(.*?)__/g, '<u>$1</u>')
    // Italic
    .replace(/(?<!\w)_(.*?)_(?!\w)/g, '<i>$1</i>')
    // Strikethrough
    .replace(/~~(.*?)~~/g, '<s>$1</s>')
    // Code
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Convert Telegram native quotes `> ` to blockquote
    .replace(/^&gt; (.*?)$/gm, '<blockquote>$1</blockquote>')
    .replace(/<\/blockquote>\n<blockquote>/g, '\n'); // Merge adjacent blockquotes

  // Handle Inline Keyboard
  let inline_keyboard: any[][] = [];
  if (opts?.inlineButtons && opts.inlineButtons.length > 0) {
    if (Array.isArray(opts.inlineButtons[0])) {
      inline_keyboard = opts.inlineButtons as any[][];
    } else {
      inline_keyboard = [opts.inlineButtons as any[]];
    }
  }

  const reply_markup = inline_keyboard.length > 0 ? { inline_keyboard } : undefined;

  // Determine endpoint
  const endpoint = opts?.photoUrl ? 'sendPhoto' : 'sendMessage';
  const url = `https://api.telegram.org/bot${token}/${endpoint}`;

  // Build payload
  const payload: any = {
    chat_id: chatId,
    parse_mode: 'HTML',
    reply_markup,
  };

  if (opts?.photoUrl) {
    payload.photo = opts.photoUrl;
    payload.caption = htmlText;
  } else {
    payload.text = htmlText;
    payload.disable_web_page_preview = true;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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

export interface TelegramPollData {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export async function sendTelegramPolls(polls: TelegramPollData[], destination: 'test' | 'live' = 'test') {
  await assertAdmin();

  const token = process.env.TELEGRAM_EVENTS_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = destination === 'live' ? '@MPPSCZenScroll' : (process.env.TELEGRAM_EVENTS_CHAT_ID || process.env.TELEGRAM_CHAT_ID);

  if (!token || !chatId) {
    return { success: false, error: 'Telegram credentials missing.' };
  }

  const url = `https://api.telegram.org/bot${token}/sendPoll`;

  let successCount = 0;
  
  for (const poll of polls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          question: poll.question.substring(0, 300), // Max 300 chars
          options: poll.options.map(opt => opt.substring(0, 100)), // Max 100 chars
          type: 'quiz',
          correct_option_id: poll.correctIndex,
          explanation: poll.explanation ? poll.explanation.substring(0, 200) : undefined // Max 200 chars
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        console.error('Failed to send poll:', data);
        return { success: false, error: data.description || 'Failed to send one of the polls', sentCount: successCount };
      }
      successCount++;
      // Wait slightly between polls to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error: any) {
      console.error('Poll Error:', error);
      return { success: false, error: error.message, sentCount: successCount };
    }
  }

  return { success: true, sentCount: successCount };
}
