'use server';

import { db } from '@/db';
import { tests, userAttempts, questions, attemptAnswers, syllabusTopics } from '@/db/schema';
import { eq, asc, desc, and, inArray, sql } from 'drizzle-orm';
import { unstable_cache, revalidateTag } from 'next/cache';
import { verifyAuth } from '@/lib/auth';
import { SCORING_CONFIG, normalizeCorrectAnswer } from '@/lib/quiz-scoring';
import { logger } from '@/lib/logger';
import { insertUserToLeaderboard } from '@/actions/leaderboard-actions';
import { sendTelegramNotification, escapeHTML } from '@/lib/telegram';

// --- Generic Cached Fetchers ---

export const getCachedPYQTests = unstable_cache(
  async () => {
    const pyqTests = await db
      .select({
        id: tests.id,
        title: tests.title,
        titleEn: tests.titleEn,
        description: tests.description,
        slug: tests.slug,
        durationMinutes: tests.durationMinutes,
        totalQuestions: tests.totalQuestions,
        totalMarks: tests.totalMarks,
        type: tests.type,
        isPro: tests.isPro,
        isFreeAccess: tests.isFreeAccess,
        isLiteAccess: tests.isLiteAccess,
        isProAccess: tests.isProAccess,
        displayOrder: tests.displayOrder,
        isHidden: tests.isHidden,
        createdAt: tests.createdAt,
      })
      .from(tests)
      .where(
        and(
          eq(tests.type, 'PYQ'),
          eq(tests.isHidden, false),
          eq(tests.examType, 'mppsc')
        )
      )
      .orderBy(asc(tests.displayOrder), desc(tests.createdAt));

    return pyqTests.map((test) => ({
      ...test,
      year: test.title.match(/\d{4}/)?.[0] || new Date(test.createdAt!).getFullYear().toString(),
    }));
  },
  ['pyq-tests-list-v4'],
  { revalidate: 60, tags: ['tests'] }
);

export const getCachedFLTTests = unstable_cache(
  async () => {
    return await db
      .select()
      .from(tests)
      .where(
        and(
          eq(tests.type, 'FLT'),
          eq(tests.isHidden, false),
          eq(tests.examType, 'mppsc')
        )
      )
      .orderBy(asc(tests.displayOrder));
  },
  ['flt-tests-list'],
  { revalidate: 60, tags: ['tests'] }
);

export const getCachedCSATTests = unstable_cache(
  async () => {
    return await db
      .select()
      .from(tests)
      .where(
        and(
          eq(tests.type, 'CSAT'),
          eq(tests.isHidden, false),
          eq(tests.examType, 'mppsc')
        )
      )
      .orderBy(asc(tests.displayOrder), desc(tests.createdAt));
  },
  ['csat-tests-list'],
  { revalidate: 60, tags: ['tests'] }
);

// --- Dynamic User Data Fetchers ---

export async function getUserAttempts(testIds: string[], userId?: string) {
  let finalUserId = userId;

  if (!finalUserId) {
    const user = await verifyAuth();
    if (!user) return {};
    finalUserId = user.id;
  }

  if (testIds.length === 0) return {};

  const attempts = await db
    .select({
      testId: userAttempts.testId,
      count: sql<number>`count(*)`,
    })
    .from(userAttempts)
    .where(and(eq(userAttempts.userId, finalUserId), inArray(userAttempts.testId, testIds)))
    .limit(100)

    .groupBy(userAttempts.testId);

  // Return as a Record<string, number> for easy client-side mapping
  return attempts.reduce(
    (acc, curr) => {
      acc[curr.testId] = Number(curr.count);
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * getUserAttemptsByType
 * Faster way to get all attempts for a specific type (FLT, PYQ, etc)
 */
export async function getUserAttemptsByType(
  type: 'FLT' | 'UNIT' | 'CSAT' | 'PYQ' | 'TOPIC',
  userId: string
) {
  const attempts = await db
    .select({
      testId: userAttempts.testId,
      count: sql<number>`count(*)`,
    })
    .from(userAttempts)
    .innerJoin(tests, eq(userAttempts.testId, tests.id))
    .where(and(eq(userAttempts.userId, userId), eq(tests.type, type)))
    .limit(1000)
    .groupBy(userAttempts.testId);

  return attempts.reduce(
    (acc, curr) => {
      acc[curr.testId] = Number(curr.count);
      return acc;
    },
    {} as Record<string, number>
  );
}

import { z } from 'zod';

const testIdSchema = z.string().uuid().or(z.string().min(1)); // Allow non-UUID IDs if legacy support needed, but prefer UUID
const unitIdSchema = z.string().min(1);

export async function getTestByUnitId(unitId: string) {
  const validatedUnitId = unitIdSchema.parse(unitId);

  const test = await db.query.tests.findFirst({
    where: and(
      eq(tests.unitId, validatedUnitId),
      // We look for 'UNIT' type tests specifically.
      // If multiple exist, we take the first one (usually there's only one "Unit Test" per unit).
      eq(tests.type, 'UNIT')
    ),
    with: {
      questions: {
        orderBy: asc(questions.order),
      },
    },
  });

  return test || null;
}

// --- Cached Test with Questions ---
// Heavy function called on every quiz start - MUST be cached

const fetchTestWithQuestionsData = async (testId: string) => {
  const validatedId = testIdSchema.parse(testId);

  // Fetch Test with questions in single query
  const test = await db.query.tests.findFirst({
    where: eq(tests.id, validatedId),
    with: {
      questions: {
        orderBy: asc(questions.order),
      },
    },
  });

  if (!test) return null;

  // Enriched Logic: If it's a Topic Test, fetch the topic title
  if (test.topicId) {
    const topic = await db.query.syllabusTopics.findFirst({
      where: eq(syllabusTopics.id, test.topicId),
      columns: {
        title: true,
        titleEn: true,
      },
    });

    if (topic) {
      const cleanTitle = topic.titleEn || topic.title;
      if (cleanTitle) {
        test.title = `${cleanTitle} Practice Test`;
      }
    }
  }

  return test;
};

// Cached version - revalidates every 5 minutes, invalidates on test update
export const getCachedTestWithQuestions = unstable_cache(
  fetchTestWithQuestionsData,
  ['test-with-questions'],
  { revalidate: 300, tags: ['tests'] }
);

export async function getTestWithQuestions(testId: string) {
  try {
    return await getCachedTestWithQuestions(testId);
  } catch (error) {
    logger.error('Invalid Test ID or DB Error:', error);
    return null;
  }
}

export async function submitTestAttempt(
  testId: string,
  userId: string,
  answers: Record<string, string>,
  durationSeconds: number,
  questionTimes: Record<string, number>,
  testTitle?: string
) {
  try {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔒 IDOR Prevention: Verify userId from JWT matches parameter
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Bhai, bina ye check ke koi Postman se kisi aur ka userId bhej ke
    // uski attempt count badha sakta tha! Ab JWT se userId verify hota hai.
    //
    // Attack scenario (before fix):
    //   POST /submitTestAttempt body: { userId: "victim-123", ... }
    //   → Attacker's request inserts attempt for victim's account!
    //
    // Fix: JWT se nikalo asli userId, match karo parameter se
    const session = await verifyAuth();
    if (!session) {
      return { error: 'Unauthorized — please login to submit test' };
    }
    if (session.id !== userId) {
      // 🚨 Someone tried to submit as a different user!
      logger.warn('IDOR attempt: userId mismatch in test submission', {
        category: 'system',
        metadata: {
          jwtUserId: session.id,
          paramUserId: userId,
          testId,
        },
      });
      return { error: 'Unauthorized — userId mismatch' };
    }

    // 🛡️ CRITICAL FIX: Prevent Double Submit (Race Condition Protection)
    // Bhai, agar user ne 30 second pehle hi submit kiya hai, to dobara nahi hone denge!
    // SQLite's datetime('now') uses UTC, which might mismatch DB if not careful.
    // JS Date.now() is reliable for relative comparison.
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);

    const recentAttempt = await db.query.userAttempts.findFirst({
      where: and(
        eq(userAttempts.userId, userId),
        eq(userAttempts.testId, testId),
        eq(userAttempts.isCompleted, true),
        sql`${userAttempts.endTime} > ${thirtySecondsAgo}`
      ),
    });

    if (recentAttempt) {
      logger.warn('Duplicate test submission attempt blocked', {
        category: 'system',
        metadata: { userId, testId, recentAttemptId: recentAttempt.id },
      });
      return { error: 'Test already submitted recently. Please wait.' };
    }

    // 1. Fetch Correct Answers from DB (Secure)
    const testQuestions = await db
      .select({
        id: questions.id,
        correctAnswer: questions.correctAnswer,
        marks: questions.marks,
        negativeMarks: questions.negativeMarks,
      })
      .from(questions)
      .where(eq(questions.testId, testId));

    if (testQuestions.length === 0) return { error: 'Test not found' };

    // 2. Calculate Score
    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;

    const answersList: {
      questionId: string;
      userAnswer: string;
      isCorrect: boolean;
      timeTaken: number;
    }[] = [];

    testQuestions.forEach((q) => {
      const userAnswer = answers[q.id];
      if (userAnswer !== undefined) {
        // Bhai, userAnswer client se 0, 1, 2, 3 aata hai (index).
        // q.correctAnswer DB se "A", "0", 0 kuch bhi ho sakta hai.
        // normalizeCorrectAnswer dono ko numeric index me convert karke compare karega.
        const correctIdx = normalizeCorrectAnswer(q.correctAnswer);
        const isCorrect = Number(userAnswer) === correctIdx;

        if (isCorrect) {
          // Strict Scoring as per User Request ("Global Standard")
          // Enforce Global Pattern (+3)
          const marks = SCORING_CONFIG.MARKS_PER_QUESTION;
          totalScore += marks;
          correctCount++;
        } else {
          // Strict Negative Marking
          // Enforce Global Pattern (-1)
          const deduction = SCORING_CONFIG.NEGATIVE_MARKING;
          totalScore -= deduction;
          incorrectCount++;
        }

        answersList.push({
          questionId: q.id,
          userAnswer: String(userAnswer),
          isCorrect,
          timeTaken: Math.round(questionTimes[q.id] || 0),
        });
      }
    });

    // 🛡️ Server-Side Timer Validation (Prevent Time Manipulation)
    // Bhai, client se jo time aaya hai wo sahi hai ya nahi check karo!
    const test = await db.query.tests.findFirst({ where: eq(tests.id, testId) });
    const maxDuration = (test?.durationMinutes || 60) * 60; // Convert to seconds
    const validDuration = Math.min(Math.max(durationSeconds, 0), maxDuration);

    if (validDuration !== durationSeconds) {
      logger.warn('Invalid test duration detected', {
        category: 'system',
        metadata: {
          userId,
          testId,
          submittedDuration: durationSeconds,
          validatedDuration: validDuration,
        },
      });
    }

    // 3. Create Attempt Record
    const attemptId = crypto.randomUUID();

    // Transaction to ensure data consistency
    await db.transaction(async (tx) => {
      // Create Attempt
      await tx.insert(userAttempts).values({
        id: attemptId,
        userId,
        testId,
        startTime: new Date(Date.now() - validDuration * 1000), // Use validated duration
        endTime: new Date(),
        score: parseFloat(totalScore.toFixed(2)),
        isCompleted: true,
      });

      // Bulk Insert Answers (if supported by DB/Drizzle driver, otherwise loop)
      if (answersList.length > 0) {
        // Drizzle supports bulk insert
        // Need to map to table columns
        /*
                 export const attemptAnswers = sqliteTable('attempt_answers', {
                    id: text('id').primaryKey(),
                    attemptId: ...
                    questionId: ...
                    userAnswer: ...
                    isCorrect: ...
                    timeTakenSeconds: ...
                 */
        await tx.insert(attemptAnswers).values(
          answersList.map((a) => ({
            id: crypto.randomUUID(),
            attemptId,
            questionId: a.questionId,
            userAnswer: a.userAnswer,
            isCorrect: a.isCorrect,
            timeTakenSeconds: a.timeTaken,
          }))
        );
      }
    });

    // 4. Parallelize post-submission tasks (Leaderboard, Analytics, Revalidation)
    // Bhai, ye sab kaam parallel mein honge to user ko result 200-300ms jaldi dikhega
    const postSubmissionTasks = [];

    const totalTestMarks = testQuestions.length * SCORING_CONFIG.MARKS_PER_QUESTION;

    if (session && session.name) {

      postSubmissionTasks.push(
        insertUserToLeaderboard({
          testId,
          userId,
          displayName: session.name,
          score: parseFloat(totalScore.toFixed(2)),
          timeTaken: validDuration,
          totalMarks: totalTestMarks,
        })
      );
    }

    // Invalidate User Analytics Cache
    postSubmissionTasks.push(revalidateTag(`analytics-${userId}`, { expire: 0 }));

    // 🚀 Prepare Telegram Notification data
    const totalAttempted = correctCount + incorrectCount;
    const accuracy = totalAttempted > 0 ? ((correctCount / totalAttempted) * 100).toFixed(0) : '0';
    
    const telegramMessage = `🏆 <b>Test Completed</b>\n\n` +
      `<b>Test:</b> ${escapeHTML(testTitle || test?.title || 'N/A')}\n` +
      `<b>User:</b> ${escapeHTML(session?.name || 'Student')}\n` +
      `<b>Score:</b> <code>${totalScore}/${totalTestMarks}</code> (${accuracy}% accuracy)\n` +
      `<b>Stats:</b> ✅${correctCount} (+${correctCount * SCORING_CONFIG.MARKS_PER_QUESTION}) | ❌${incorrectCount} (-${incorrectCount * SCORING_CONFIG.NEGATIVE_MARKING}) | ⏱️${Math.floor(validDuration / 60)}m\n` +
      `⏱️ <b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} IST`;

    postSubmissionTasks.push(sendTelegramNotification(telegramMessage));

    // Run all tasks in parallel
    await Promise.allSettled(postSubmissionTasks);

    return { success: true, attemptId, score: parseFloat(totalScore.toFixed(2)) };
  } catch (error) {
    logger.error('Error submitting test:', error);
    return { error: 'Failed to submit test' };
  }
}
