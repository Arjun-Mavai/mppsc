'use server';

import { db } from '@/db';
import { intelligenceFeedback, guests } from '@/db/schema';
import { logger } from '@/lib/logger';
import { sendTelegramNotification } from '@/lib/telegram';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

import { assertAdmin } from '@/lib/auth';

export type IntelligenceReaction = 'helpful' | 'insightful' | 'unhelpful' | 'doubt';

export interface IntelligenceFeedbackData {
  guestMobile?: string;
  questionId: string;
  questionText: string;
  testId?: string;
  reaction: IntelligenceReaction;
  message?: string;
  isPro?: boolean;
  source?: string; // 'expert_analysis', 'open_paper_view', etc.
  userId?: string;
  userName?: string;
  userEmail?: string;
}

export async function submitIntelligenceFeedback(data: IntelligenceFeedbackData) {
  const { 
    guestMobile, 
    questionId, 
    questionText, 
    testId, 
    reaction, 
    message, 
    isPro, 
    source,
    userId,
    userName,
    userEmail,
  } = data;

  try {
    let guestId: string | null = null;
    const finalMobile = guestMobile;

    if (finalMobile) {
      const normalizedMobile = finalMobile.replace(/\D/g, '').slice(-10);
      const guest = await db.query.guests.findFirst({
        where: (g, { and: andOp, eq: eqOp }) => andOp(eqOp(g.mobile, normalizedMobile), eqOp(g.examType, 'mppsc')),
      });
      if (guest) {
        guestId = guest.id;
      }
    }

    const feedbackId = randomUUID();
    await db.insert(intelligenceFeedback).values({
      id: feedbackId,
      guestId,
      questionId,
      questionText: questionText || null,
      testId: testId || null,
      reaction,
      message: message || null,
      isPro: isPro || false,
      source: source || null,
      userId: userId || null,
      userName: userName || null,
      userMobile: finalMobile || null,
      userEmail: userEmail || null,
      examType: 'mppsc',
    });

    // Notify via Telegram for ALL interactions (Like, Dislike, Doubt, etc.)
    const emojiMap = { helpful: '👍 Helpful', insightful: '💡 Insightful', unhelpful: '👎 Unhelpful', doubt: '❓ Doubt' };
    const reactionLabel = emojiMap[reaction as keyof typeof emojiMap] || reaction;
    
    // Build Display Name & Details
    let studentInfo = '';
    if (userName) {
      studentInfo = `<b>Name:</b> ${userName}\n` + 
                   (finalMobile ? `<b>Mobile:</b> <code>${finalMobile}</code>\n` : '') +
                   (userEmail ? `<b>Email:</b> ${userEmail}` : '');
    } else {
      // Fallback to guest search if we only have mobile
      let displayName = finalMobile || 'Anonymous Guest';
      if (guestId) {
        const guest = await db.query.guests.findFirst({
          where: (g, { eq: eqOp }) => eqOp(g.id, guestId!),
          columns: { name: true }
        });
        if (guest?.name) displayName = `${guest.name} (${finalMobile || 'No Mobile'})`;
      }
      studentInfo = `<b>Student:</b> ${displayName}`;
    }

    const studentLabel = isPro ? '💎 Subscribed Pro User' : '👤 Guest Student';
    const sourceLabel = source === 'expert_analysis' ? '🧠 Intelligence Analysis' : 
                       source === 'open_paper_view' ? '📄 Paper Solutions' : 
                       source || 'Generic Page';

    await sendTelegramNotification(
      `${isPro ? '💎' : '🧠'} <b>Solution Interaction</b>\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `<b>Action:</b> ${reactionLabel}\n` +
      `<b>Source:</b> <code>${sourceLabel}</code>\n` +
      `<b>Status:</b> ${studentLabel}\n` +
      `${studentInfo}\n` +
      `<b>Question ID:</b> <code>${questionId}</code>\n` +
      `<b>Content:</b> <i>"${questionText.slice(0, 150)}${questionText.length > 150 ? '...' : ''}"</i>\n` +
      (message ? `\n<b>Feedback:</b> ${message}\n` : '') +
      `━━━━━━━━━━━━━━━━\n` +
      `#SolutionIntelligence #MPPSC2026 ${isPro ? '#ProUser' : ''}`
    );

    return { success: true };
  } catch (error) {
    logger.error('Failed to submit intelligence feedback', error);
    return { error: 'Failed to save feedback' };
  }
}

export async function getIntelligenceFeedback() {
  await assertAdmin();

  try {
    const results = await db.query.intelligenceFeedback.findMany({
      where: (f, { eq: eqOp }) => eqOp(f.examType, 'mppsc'),
      with: {
        guest: true,
        question: {
          columns: {
            subject: true,
          }
        },
      },
      orderBy: (f, { desc }) => [desc(f.createdAt)],
    });

    return results;
  } catch (error) {
    logger.error('Failed to fetch intelligence feedback', error);
    return [];
  }
}

export async function submitZenFeedback(params: {
  guestMobile?: string;
  testId?: string;
  rating: number;
  tags: string[];
  comment?: string;
  isPro?: boolean;
  leadSource?: string;
}) {
  const { guestMobile, testId, rating, tags, comment, isPro, leadSource } = params;

  try {
    let guestId: string | null = null;
    let guestName = '';
    if (guestMobile) {
      const normalizedMobile = guestMobile.replace(/\D/g, '').slice(-10);
      const guest = await db.query.guests.findFirst({
        where: (g, { and: andOp, eq: eqOp }) => andOp(eqOp(g.mobile, normalizedMobile), eqOp(g.examType, 'mppsc')),
      });
      if (guest) {
        guestId = guest.id;
        guestName = guest.name;
      }
    }

    const feedbackId = randomUUID();
    const proLabel = isPro ? ' [PRO USER]' : '';
    const finalMessage = `[Rating: ${rating}/5]${proLabel} Tags: ${tags.join(', ')} ${comment ? `\nComment: ${comment}` : ''}`;

    await db.insert(intelligenceFeedback).values({
      id: feedbackId,
      guestId,
      questionId: 'ZEN_COMPLETION',
      testId: testId || null,
      reaction: rating >= 4 ? 'insightful' : 'doubt',
      message: finalMessage,
      examType: 'mppsc',
    });

    const priorityEmoji = isPro ? '🔴 PRIORITY: ' : '';
    const studentLabel = isPro ? '💎 Subscribed Pro User' : '👤 Guest Student';

    await sendTelegramNotification(
      `${isPro ? '💎' : '🏆'} <b>Zen Completion Feedback</b>\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `<b>${priorityEmoji}Rating:</b> ${'⭐️'.repeat(rating)}\n` +
      `<b>Status:</b> ${studentLabel}\n` +
      `<b>Tags:</b> ${tags.join(', ')}\n` +
      (guestName ? `<b>Name:</b> ${guestName}\n` : '') +
      (guestMobile ? `<b>Mobile:</b> <code>${guestMobile}</code>\n` : '') +
      (leadSource ? `<b>Source:</b> <code>${leadSource}</code>\n` : '') +
      (comment ? `\n<b>Comment:</b> ${comment}\n` : '') +
      `━━━━━━━━━━━━━━━━\n` +
      `#ZenFeedback #MPPSC2026 ${isPro ? '#ProUser' : ''}`
    );

    return { success: true };
  } catch (error) {
    logger.error('Failed to submit zen feedback', error);
    return { error: 'Failed to save feedback' };
  }
}
