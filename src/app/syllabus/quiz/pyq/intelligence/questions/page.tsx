import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import { getUserTier } from '@/lib/access-control';
import { db } from '@/db';
import { questions, tests, pyqQuestionTopics, pyqTopics } from '@/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import ViewAllQuestionsClient from './ViewAllQuestionsClient';
import { getUnitDistributionStats } from '@/actions/pyq-analytics';
import {
  getScopedStateServiceYear,
  PYQ_SCOPE_START_YEAR,
  PYQ_SCOPE_END_YEAR,
} from '@/features/tests/utils/pyq-scope';
import { getYearFromTestId } from '@/lib/pyq-constants';
import { normalizeCorrectAnswer } from '@/lib/quiz-scoring';
import { mapRawQuestionToClientQuestion } from '@/lib/quiz-question-normalize';

// Cache for 1 hour
export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<{
    unit?: string;
    year?: string;
    topic?: string;
    source?: string;
    subject?: string;
    pdf_mode?: string;
  }>;
}

/** Next.js `unstable_cache` rejects serialized payloads >2MB — “Subject = All” exceeds that. */
const MAX_QUESTION_IDS_FOR_DATA_CACHE = 320;

async function fetchQuestionsWithDetailsFromDb(questionIds: string[]) {
  if (questionIds.length === 0) return [];

  const questionData = await db
    .select({
      id: questions.id,
      text: questions.questionText,
      textEn: questions.questionTextEn,
      options: questions.options,
      type: questions.type,
      matchPairs: questions.matchPairs,
      correctAnswer: questions.correctAnswer,
      explanation: questions.explanation,
      explanationEn: questions.explanationEn,
      explanation_hi: questions.explanation,
      testId: questions.testId,
      testTitle: tests.title,
      order: questions.order,
      subject: questions.subject,
      extendedData: questions.extendedData,
    })
    .from(questions)
    .innerJoin(tests, eq(questions.testId, tests.id))
    .where(inArray(questions.id, questionIds));

  return questionData.map((q) => {
    const year = getYearFromTestId(q.testId);
    // Use the canonical normalization function
    const clientQ = mapRawQuestionToClientQuestion(q as unknown as Record<string, unknown>, {
      subject: q.subject || undefined,
    });

    return {
      ...clientQ,
      text: clientQ.question,
      textEn: clientQ.questionEn,
      year,
      qNo: q.order,
    };
  });
}

const getQuestionsWithDetailsCached = unstable_cache(
  async (questionIds: string[]) => fetchQuestionsWithDetailsFromDb(questionIds),
  ['pyq-questions-details-v3'],
  { revalidate: 3600, tags: ['pyq-questions'] }
);

async function getQuestionsWithDetails(questionIds: string[]) {
  if (questionIds.length > MAX_QUESTION_IDS_FOR_DATA_CACHE) {
    return fetchQuestionsWithDetailsFromDb(questionIds);
  }
  return getQuestionsWithDetailsCached(questionIds);
}

// Cached function to get questions by topic (using topicSlug)
const getQuestionsByTopic = unstable_cache(
  async (topicSlug: string) => {
    // Get topic info
    const topic = await db
      .select()
      .from(pyqTopics)
      .where(eq(pyqTopics.topicSlug, topicSlug))
      .limit(1);

    if (topic.length === 0) return { topic: null, questions: [] };

    // Get question IDs mapped to this topic
    const mappings = await db
      .select({ questionId: pyqQuestionTopics.questionId })
      .from(pyqQuestionTopics)
      .where(eq(pyqQuestionTopics.topicId, topic[0].id));

    if (mappings.length === 0) return { topic: topic[0], questions: [] };

    const questionIds = mappings.map((m) => m.questionId);
    const questionList = await getQuestionsWithDetails(questionIds);

    return {
      topic: topic[0],
      questions: questionList,
    };
  },
  ['pyq-topic-questions'],
  { revalidate: 3600, tags: ['pyq-questions', 'pyq-topics'] }
);

// Unit titles mapping
const UNIT_TITLES: Record<string, string> = {
  unit_1: 'भारत का इतिहास एवं भारतीय राष्ट्रीय आंदोलन',
  unit_2: 'मध्य प्रदेश का इतिहास, संस्कृति एवं साहित्य',
  unit_3: 'भारत एवं विश्व का भूगोल',
  unit_4: 'मध्य प्रदेश का भूगोल',
  unit_5: 'भारतीय राजव्यवस्था एवं शासन व्यवस्था',
  unit_6: 'भारतीय अर्थव्यवस्था',
  unit_7: 'विज्ञान एवं प्रौद्योगिकी',
  unit_8: 'समसामयिक घटनाएं एवं खेल',
  unit_9: 'सूचना एवं संचार प्रौद्योगिकी',
  unit_10: 'अनुसूचित जाति एवं जनजाति',
  unmapped: 'अन्य / सामान्य',
};

export default async function ViewAllQuestionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const isPdfMode = params.pdf_mode === 'true';

  // Skip authentication for PDF generation mode
  if (!isPdfMode) {
    const user = await verifyAuth();
    if (!user) {
      redirect('/pricing');
    }

    const tier = getUserTier(user);
    if (tier === 'free') {
      redirect('/pricing');
    }
  }

  const unitId = params.unit || 'unit_1';
  const year = params.year ? parseInt(params.year) : undefined;
  const topicSlug = params.topic;
  const source = (params.source as 'paper' | 'overall' | 'topic' | 'subject') || 'overall';
  const subject = params.subject;

  let questionList: any[] = [];
  let unitTitle = UNIT_TITLES[unitId] || '';
  let topicTitle: string | undefined;

  if (topicSlug) {
    // Topic-based query - use topic slug
    const result = await getQuestionsByTopic(topicSlug);
    questionList = result.questions;
    topicTitle = result.topic?.topicTitle || result.topic?.topicTitleEn || undefined;
  } else if (subject && source === 'subject') {
    // Subject-based query - get questions by subject
    const { getOverallWeightageSubjectData } = await import('@/actions/pyq-analytics');
    // 🔧 No limit here, we want all questions for "View All" page
    const subjectData = await getOverallWeightageSubjectData();

    if (subject === 'All') {
      const allQuestionIds = subjectData.flatMap((data) => data.questions.map((q) => q.id));
      questionList = await getQuestionsWithDetails(allQuestionIds);
      unitTitle = `All Subjects Questions (2020-2026)`;
    } else {
      const matchingSubject = subjectData.find((data) => data.subject === subject);
      if (matchingSubject) {
        // Convert subject questions to the expected format
        questionList = await getQuestionsWithDetails(matchingSubject.questions.map((q) => q.id));
        unitTitle = `${subject} Questions (2020-2026)`;
      }
    }
  } else {
    // Unit-based query - get from cached analytics data
    const stats = await getUnitDistributionStats();

    // Filter stats by unit and optionally by year
    const relevantStats = stats.filter((s) => {
      if (s.unitId !== unitId) return false;
      if (year && s.year !== year) return false;
      return true;
    });

    // Collect all question IDs from matching stats
    const questionIds = relevantStats.flatMap((s) => s.questions.map((q) => q.id));

    // Fetch full question details
    if (questionIds.length > 0) {
      questionList = await getQuestionsWithDetails(questionIds);
    }

    // Update unit title from stats if available
    if (relevantStats.length > 0) {
      unitTitle = relevantStats[0].unitTitle;
    }
  }

  return (
    <ViewAllQuestionsClient
      unitId={unitId}
      unitTitle={unitTitle}
      questions={questionList}
      source={source}
      topicTitle={topicTitle}
      year={year}
      subject={subject}
    />
  );
}
