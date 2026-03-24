'use server';

import { db } from '@/db';
import { testFeedback, mppscUsers } from '@/db/schema';
import { type FeedbackFormType } from '@/lib/schemas/feedback';
import { randomUUID } from 'crypto';
import { verifyAuth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

interface SubmitFeedbackParams {
  testId: string;
  testType: 'free' | 'premium' | 'pyq';
  data: FeedbackFormType;
  userName?: string | null;
  userEmail?: string | null;
}

export async function submitTestFeedback(params: SubmitFeedbackParams) {
  try {
    const { testId, testType, data, userName, userEmail } = params;
    const authUser = await verifyAuth();
    
    let effectiveName = userName || null;
    let effectiveEmail = userEmail || null;

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
    const dbRecommend = data.wouldRecommend === 'yes' ? 'definitely' : 'no';

    const newFeedback = {
      id: randomUUID(),
      testId,
      userId: authUser?.id || null,
      testType,
      overallRating: data.overallRating,
      difficultyLevel: data.difficultyLevel,
      questionQuality: 'good' as const, // Not collected in UI yet
      wouldRecommend: dbRecommend as 'definitely' | 'no',
      comments: null,
      userName: effectiveName,
      userEmail: effectiveEmail,
    };

    await db.insert(testFeedback).values(newFeedback);

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
      .where(eq(testFeedback.userId, authUser.id))
      .limit(1);

    return existingFeedback.length > 0;
  } catch (error) {
    console.error('Error in hasUserSubmittedFeedback:', error);
    return false;
  }
}
