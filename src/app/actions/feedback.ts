'use server';

import { db } from '@/db';
import { testFeedback, mppscUsers } from '@/db/schema';
import { type FeedbackFormType, type FeedbackResponse, feedbackFormSchema } from '@/lib/schemas/feedback';
import { randomUUID } from 'crypto';
import { verifyAuth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { sendTelegramNotification } from '@/lib/telegram';
import { getTelegramStatsSummary } from '@/lib/telegram-stats-loader';

interface SubmitFeedbackParams {
  testId: string;
  testType: 'free' | 'premium' | 'pyq';
  testName?: string | null; // The title of the test (e.g., 'Modern History')
  data: FeedbackFormType;
  userName?: string | null;
  userEmail?: string | null;
}

export async function submitTestFeedback(params: SubmitFeedbackParams): Promise<FeedbackResponse> {
  try {
    const { testId, testType, testName, data, userName, userEmail } = params;
    
    // ✅ Input validation for security
    if (!testId || testId.length > 100) {
      return { success: false, error: 'Invalid testId' };
    }
    
    if (!['free', 'premium', 'pyq'].includes(testType)) {
      return { success: false, error: 'Invalid testType' };
    }
    
    // Validate feedback data using Zod schema
    const validationResult = feedbackFormSchema.safeParse(data);
    if (!validationResult.success) {
      return { success: false, error: 'Invalid feedback data' };
    }
    
    const authUser = await verifyAuth();
    
    let effectiveName = userName?.slice(0, 100) || null; // Limit name length
    let effectiveEmail = userEmail?.slice(0, 100) || null; // Limit email length

    if (authUser) {
      const user = await db.query.mppscUsers.findFirst({
        where: eq(mppscUsers.id, authUser.id),
      });
      if (user) {
        effectiveName = effectiveName || user.name;
        effectiveEmail = effectiveEmail || user.email;
      }
    }

    // Convert to DB format with proper types
    const dbRecommend = (data.wouldRecommend as any) || 'definitely';

    const newFeedback = {
      id: randomUUID(),
      testId,
      testName, // Save the identifiable test name
      userId: authUser?.id || null,
      testType,
      overallRating: data.overallRating,
      difficultyLevel: data.difficultyLevel,
      questionQuality: 'good' as const, // Not collected in UI yet
      wouldRecommend: (['definitely', 'probably', 'maybe', 'no'].includes(dbRecommend) 
        ? dbRecommend 
        : 'definitely') as 'definitely' | 'probably' | 'maybe' | 'no',
      comments: data.comment || null,
      userName: effectiveName,
      userEmail: effectiveEmail,
      examType: 'mppsc' as const, // 🔒 Explicitly tag as MPPSC
    };

    await db.insert(testFeedback).values(newFeedback);

    // Notify via Telegram
    const stars = '⭐'.repeat(data.overallRating);
    let difficultyIcon = '⚖️';
    if (data.difficultyLevel === 'too_easy') difficultyIcon = '✅';
    else if (data.difficultyLevel === 'too_hard') difficultyIcon = '🔥';
    
    // 🔥 NEW: Fetch global stats summary
    const statsSummary = await getTelegramStatsSummary();
    
    await sendTelegramNotification(
      `📝 <b>NEW TEST FEEDBACK</b>\n\n` +
      `<b>👤 Student:</b> ${effectiveName || 'Anonymous'}\n` +
      `<b>📧 Contact:</b> ${effectiveEmail || 'N/A'}\n` +
      `<b>📝 Test:</b> ${testName || 'Practice Test'}\n\n` +
      `<b>📊 Review Details:</b>\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `• <b>Rating:</b> ${stars} (${data.overallRating}/5)\n` +
      `• <b>Difficulty:</b> ${difficultyIcon} ${data.difficultyLevel.toUpperCase()}\n` +
      `• <b>Comment:</b> "${data.comment || 'No comment provided'}"\n` +
      `━━━━━━━━━━━━━━━━\n\n` +
      (statsSummary ? statsSummary + '\n\n' : '') +
      `#Feedback #TestReview`
    );

    return { success: true };
  } catch (error) {
    console.error('Error in submitTestFeedback:', error);
    return { success: false, error: 'Failed to save feedback' };
  }
}

export async function hasUserSubmittedFeedback() {
  try {
    const authUser = await verifyAuth();
    if (!authUser) return false;

    const existingFeedback = await db
      .select({ id: testFeedback.id })
      .from(testFeedback)
      .where(
        and(
          eq(testFeedback.userId, authUser.id),
          eq(testFeedback.examType, 'mppsc')
        )
      )
      .limit(1);

    return existingFeedback.length > 0;
  } catch (error) {
    console.error('Error in hasUserSubmittedFeedback:', error);
    return false;
  }
}
