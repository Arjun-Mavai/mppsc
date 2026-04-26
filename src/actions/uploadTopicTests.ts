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
  options: string[] | Array<Record<string, unknown>>;
  correctAnswer: string | number;
  /** @deprecated use explanation_hi for new uploads */
  explanation?: string | Record<string, unknown>;
  explanationEn?: string;
  /** Hindi classic explanation (markdown-style blocks) */
  explanation_hi?: string;
  /** English — alias supported: explanation_en in JSON */
  explanation_en?: string;
  /** Expert structured blob; stored in extended_data. If set, do not also put the same object in `explanation`. */
  extendedData?: unknown;
  marks: number;
  negativeMarks: number;
  idealTime: number;
  subject?: string;
  order: number;
  type?: 'standard' | 'matching';
  /** Legacy label/match or upload shape with left, left_en, right, right_en */
  matchPairs?: Array<Record<string, unknown>>;
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
          const formattedOptions = (() => {
            if (!Array.isArray(q.options) || q.options.length === 0) return [];
            const first = q.options[0];
            if (typeof first === 'object' && first !== null && 'text' in first) {
              return q.options as Array<Record<string, unknown>>;
            }
            return (q.options as string[]).map((optText, idx) => {
              const optId = String.fromCharCode(65 + idx);
              return {
                id: optId,
                text: optText,
                text_en: optText,
              };
            });
          })();

          const cleanAnswer = String(q.correctAnswer).trim();

          const explanationTextForDb =
            q.explanation_hi ??
            (typeof q.explanation === 'string' ? q.explanation : null) ??
            null;

          const expertBlob =
            q.extendedData ??
            (typeof q.explanation === 'object' && q.explanation !== null ? q.explanation : null);

          const explanationEnForDb = q.explanationEn ?? q.explanation_en ?? null;

          return {
            id: crypto.randomUUID(),
            testId: testId!,
            questionText: q.questionText,
            questionTextEn: q.questionTextEn,
            options: formattedOptions as unknown as string,
            correctAnswer: cleanAnswer,
            explanation: explanationTextForDb,
            explanationEn: explanationEnForDb,
            marks: q.marks,
            negativeMarks: q.negativeMarks,
            idealTime: q.idealTime,
            subject: q.subject,
            order: q.order,
            type: q.type || 'standard',
            matchPairs: (q.matchPairs ?? null) as unknown as string,
            extendedData: (expertBlob ?? null) as unknown as string,
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
