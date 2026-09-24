'use server';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🆓 FREE QUIZ ACTIONS — Lead generation ke liye free tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Public actions — koi bhi access kar sakta h (no auth needed)
// MISC type ke tests jo isFreeAccess=true hain wahi dikhenge
// unstable_cache se cached — same pattern as FLT/PYQ/CSAT
// Tag 'tests' se admin upload/edit pe auto-invalidate hota h
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { db } from '@/db';
import { tests, questions, freeQuizAttempts } from '@/db/schema';
import { eq, and, desc, or } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getClientIp, getClientLocation } from '@/lib/ip';
import { sendTelegramNotification, escapeHTML } from '@/lib/telegram';
import { getTelegramStatsSummary } from '@/lib/telegram-stats-loader';
import { SCORING_CONFIG } from '@/lib/quiz-scoring';

/**
 * recordGuestAttempt — Saves guest score to DB and notifies admin
 */
export async function recordGuestAttempt(data: {
  testId: string;
  guestName: string;
  testTitle?: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  timeTaken: number;
}) {
  try {
    const attemptId = crypto.randomUUID();
    
    // 1. Save to DB
    await db.insert(freeQuizAttempts).values({
      id: attemptId,
      testId: data.testId,
      guestId: 'guest_session', // Placeholder
      score: data.score,
      completedAt: new Date(),
    });

    // 2. Fetch Test Title for better notification
    const test = await db.query.tests.findFirst({
      where: eq(tests.id, data.testId),
      columns: { title: true }
    });

    // 3. Send Telegram Notification
    const accuracy = ((data.correctCount / data.totalQuestions) * 100).toFixed(0);
    const timeStr = data.timeTaken > 60 
      ? `${Math.floor(data.timeTaken / 60)}m ${data.timeTaken % 60}s` 
      : `${data.timeTaken}s`;

    // 🔥 NEW: Fetch global stats summary
    const statsSummary = await getTelegramStatsSummary();
    const reqHeaders = await headers().catch(() => null);
    const ip = reqHeaders ? getClientIp(reqHeaders) : '127.0.0.1';
    const location = reqHeaders ? await getClientLocation(reqHeaders, ip) : 'Unknown Location';

    await sendTelegramNotification(
      `📊 <b>FREE QUIZ RESULT</b>\n\n` +
      `<b>👤 Student:</b> ${escapeHTML(data.guestName)}\n` +
      `<b>📝 Test:</b> ${escapeHTML(data.testTitle || test?.title || 'Practice Test')}\n` +
      `🌐 <b>Real IP:</b> <code>${escapeHTML(ip)}</code>\n` +
      `📍 <b>Location:</b> ${escapeHTML(location)}\n\n` +
      `<b>🏆 Performance Card:</b>\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `• <b>Score:</b> ${data.score} / ${data.totalQuestions * SCORING_CONFIG.MARKS_PER_QUESTION}\n` +
      `• <b>Accuracy:</b> ${accuracy}%\n` +
      `• <b>Correct:</b> ✅ ${data.correctCount}\n` +
      `• <b>Wrong:</b> ❌ ${data.wrongCount}\n` +
      `• <b>Time Taken:</b> ⏱️ ${timeStr}\n` +
      `━━━━━━━━━━━━━━━━\n\n` +
      (statsSummary ? statsSummary + '\n\n' : '') +
      `#FreeQuiz #LeadGenerated`
    );

    return { success: true, attemptId };
  } catch (error) {
    logger.error('Failed to record guest attempt:', error);
    return { success: false };
  }
}

/**
 * getCachedFreeQuizzes — unstable_cache se cached MISC tests
 * 60s revalidate + 'tests' tag — admin se test add/edit hone pe bust hota h
 * Same pattern as getCachedFLTTests, getCachedPYQTests
 */
export const getCachedFreeQuizzes = unstable_cache(
  async () => {
    try {
      const result = await db
        .select({
          id: tests.id,
          title: tests.title,
          titleEn: tests.titleEn,
          slug: tests.slug,
          description: tests.description,
          totalQuestions: tests.totalQuestions,
          unitId: tests.unitId,
          tags: tests.tags,
          createdAt: tests.createdAt,
          isInstantMode: tests.isInstantMode,
        })
        .from(tests)
        .where(
          and(
            eq(tests.type, 'MISC'),
            eq(tests.isFreeAccess, true),
            eq(tests.isHidden, false),
            or(eq(tests.examType, 'mppsc'), eq(tests.examType, 'all'))
          )
        )
        .orderBy(desc(tests.createdAt));
      
      return result;
    } catch (error) {
      console.error('--- CRITICAL DB ERROR in getCachedFreeQuizzes ---');
      console.error('Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      return [];
    }
  },
  ['free-tests-list-v5'],
  { revalidate: 60, tags: ['tests'] }
);

/**
 * getFreeQuizWithQuestions — Ek specific free test + uske questions
 * Quiz play page pe use hoga — questions load karne ke liye
 * NOW CACHED for performance - revalidates every 5 minutes
 */
const fetchFreeQuizData = async (testId: string) => {
  const test = await db
    .select()
    .from(tests)
    .where(
      and(
        eq(tests.id, testId),
        eq(tests.type, 'MISC'),
        eq(tests.isFreeAccess, true),
        eq(tests.isHidden, false),
        or(eq(tests.examType, 'mppsc'), eq(tests.examType, 'all'))
      )
    )
    .get();

  if (!test) return null;

  const testQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.testId, testId))
    .orderBy(questions.order);

  return { ...test, questions: testQuestions };
};

export const getCachedFreeQuizWithQuestions = unstable_cache(
  fetchFreeQuizData,
  ['free-quiz-with-questions-v5'],
  { revalidate: 300, tags: ['tests'] }
);

export async function getFreeQuizWithQuestions(testId: string) {
  try {
    return await getCachedFreeQuizWithQuestions(testId);
  } catch (error) {
    logger.error('getFreeQuizWithQuestions Error:', error);
    return null;
  }
}

/**
 * notifyInstantModeGuideClick — Telemetry for Instant Mode usage
 */
export async function notifyInstantModeGuideClick(clientGuestName?: string, clientGuestPhone?: string) {
  try {
    const user = await verifyAuth().catch(() => null);
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const city = headersList.get('x-vercel-ip-city') || 'Unknown City';
    const region = headersList.get('x-vercel-ip-country-region') || 'Unknown Region';

    let userInfo = '';
    if (user) {
      // Get phone from DB user model if we can (using db directly if verifyAuth doesn't return phone)
      const phone = 'phone' in user ? (user as any).phone : 'N/A';
      userInfo = `👤 *Registered User*
📛 *Name:* ${user.name || 'Unknown'}
📧 *Email:* ${user.email}
📱 *Phone:* ${phone}`;
    } else {
      userInfo = `👤 *Guest User*
📛 *Name:* ${clientGuestName || 'Not Provided'}
📱 *Phone:* ${clientGuestPhone || 'Not Provided'}`;
    }

    const message = `⚡ *INSTANT MODE GUIDE OPENED* ⚡
Someone is exploring the Instant Mode feature on the MPPSC Free Quiz page!

${userInfo}

🌍 *Location:* ${city}, ${region}
💻 *IP:* \`${ip}\``;

    await sendTelegramNotification(message);
  } catch (error) {
    logger.error('Failed to notify instant mode click', error);
  }
}
