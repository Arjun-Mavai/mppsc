'use server';

import { db } from '@/db';
import { tests, questions, mppscUsers, syllabusTopics } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { logger } from '@/lib/logger';
import { CACHE } from '@/lib/cache';

// Type definitions for the upload payload
interface QuestionPayload {
  questionText: string;
  questionTextEn?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  explanationEn?: string;
  marks: number;
  negativeMarks: number;
  idealTime: number;
  subject?: string;
  order: number;
  // New Unified Fields
  type?: 'standard' | 'matching';
  matchPairs?: {
    id: string; // "(1)"
    label: string;
    labelEn?: string;
    match: string;
    matchId: string; // "(a)"
    matchEn?: string;
  }[];
}

interface TopicPayload {
  topicId: number | string; // Handle both as we convert to string for DB
  questions: QuestionPayload[];
}

interface BulkUploadPayload {
  unitId: string;
  topics: TopicPayload[];
}

export async function uploadTopicTestQuestions(data: BulkUploadPayload, adminSecret: string) {
  try {
    // 1. Validate Admin Secret
    // 1. Validate Admin Secret
    // CRITICAL FIX: Removed hardcoded "admin123" fallback. Using strict env var check.
    if (!process.env.ADMIN_SECRET_KEY) {
      throw new Error('Server Configuration Error: ADMIN_SECRET_KEY not set');
    }

    if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
      return { success: false, error: 'Unauthorized: Invalid Admin Secret' };
    }

    const { unitId, topics } = data;

    if (!unitId || !topics || !Array.isArray(topics)) {
      return {
        success: false,
        error: 'Invalid payload structure. Missing unitId or topics array.',
      };
    }

    let processedCount = 0;

    for (const topic of topics) {
      const topicIdStr = String(topic.topicId);
      const testSlug = `${unitId}-topic-${topicIdStr}-test`;

      // 2. Find or Create Test
      // Using generic findFirst to avoid potential type issues with db.query if schema not perfectly aligned in inference
      const existingTests = await db
        .select()
        .from(tests)
        .where(and(eq(tests.slug, testSlug), eq(tests.examType, 'mppsc')))
        .limit(1);

      let testId = existingTests[0]?.id;

      if (!testId) {
        // Create new test
        testId = crypto.randomUUID();

        await db.insert(tests).values({
          id: testId,
          title: `Topic ${topicIdStr} Practice Test`,
          slug: testSlug,
          type: 'TOPIC',
          unitId: unitId,
          topicId: topicIdStr,
          durationMinutes: 15,
          totalQuestions: topic.questions.length,
          totalMarks: topic.questions.reduce((sum, q) => sum + q.marks, 0),
          isPro: false,
          examType: 'mppsc' as const, // 🔒 Strict isolation
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        // Update existing test metadata
        await db
          .update(tests)
          .set({
            totalQuestions: topic.questions.length,
            totalMarks: topic.questions.reduce((sum, q) => sum + q.marks, 0),
            updatedAt: new Date(),
          })
          .where(eq(tests.id, testId));
      }

      // 3. Replace Questions
      // DELETE old questions for this test
      await db.delete(questions).where(eq(questions.testId, testId));

      // INSERT new questions
      if (topic.questions.length > 0) {
        const questionValues = topic.questions.map((q) => {
          // Correct logic to map array of strings to the JSON object expected by Drizzle/SQLite
          // We cast to `any` or strict shape if needed to satisfy Drizzle's `mode: 'json'` requirement
          const formattedOptions = q.options.map((optText, idx) => {
            const optId = String.fromCharCode(65 + idx); // A, B, C, D
            return {
              id: optId,
              text: optText,
              text_en: optText,
            };
          });

          // Simple storage of the number/string
          const cleanAnswer = String(q.correctAnswer).trim();

          return {
            id: crypto.randomUUID(),
            testId: testId!,
            questionText: q.questionText,
            questionTextEn: q.questionTextEn,
            options: formattedOptions as unknown as string, // Cast to unknown->string to bypass TS complaints about JSON field, Drizzle handles serialization
            correctAnswer: cleanAnswer,
            explanation: q.explanation,
            explanationEn: q.explanationEn,
            marks: q.marks,
            negativeMarks: q.negativeMarks,
            idealTime: q.idealTime,
            subject: q.subject,
            order: q.order,
            // New Fields
            type: q.type || 'standard',
            matchPairs: q.matchPairs as unknown as string, // Drizzle handles JSON
          };
        });

        await db.insert(questions).values(questionValues);
      }

      processedCount++;
    }

    // Invalidate Caches
    revalidatePath(`/syllabus/unit/${unitId}`);
    revalidateTag(CACHE.TESTS.TAGS.ALL, { expire: 0 }); // Invalidate all test lists
    revalidateTag(CACHE.SYLLABUS.TAGS.ALL, { expire: 0 }); // Invalidate syllabus stats (topic counts etc.)

    return { success: true, message: `Successfully processed ${processedCount} topics.` };
  } catch (error: any) {
    logger.error('Bulk Upload Error:', error);
    return { success: false, error: error.message || 'Internal Server Error' };
  }
}
