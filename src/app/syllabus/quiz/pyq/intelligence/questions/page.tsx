import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import { getUserTier } from '@/lib/access-control';
import { db } from '@/db';
import { questions, pyqQuestionTopics, pyqTopics } from '@/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import ViewAllQuestionsClient, { type QuestionData } from './ViewAllQuestionsClient';
import { getOverallWeightageSubjectData, getUnitDistributionStats } from '@/actions/pyq-analytics';
import { getCanonicalTestIds, getYearFromTestId } from '@/lib/pyq-constants';
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

/** Next.js `unstable_cache` rejects serialized payloads >2MB. 
 * We increase it to 800 but we will be careful with columns. */
const MAX_QUESTION_IDS_FOR_DATA_CACHE = 800;

function mapQuestionRowToClient(q: Record<string, unknown>): QuestionData {
  const clientQ = mapRawQuestionToClientQuestion(q, {
    subject: (q.subject as string) || undefined,
  });

  return {
    ...clientQ,
    text: clientQ.question,
    textEn: clientQ.questionEn,
    year: getYearFromTestId(q.testId as string),
    qNo: q.order as number,
    explanation_hi: clientQ.explanation_hi || clientQ.explanation || null,
  } as QuestionData;
}

async function fetchQuestionsWithDetailsFromDb(questionIds: string[]) {
  const uniqueQuestionIds = Array.from(new Set(questionIds));
  if (uniqueQuestionIds.length === 0) return [];

  // 🚀 PERF: Chunk the questionIds to avoid SQLite variable limit if too many
  const chunks = [];
  const chunkSize = 400;
  for (let i = 0; i < uniqueQuestionIds.length; i += chunkSize) {
    chunks.push(uniqueQuestionIds.slice(i, i + chunkSize));
  }

  const chunkResults = await Promise.all(
    chunks.map((chunk) =>
      db
      .select({
        id: questions.id,
        questionText: questions.questionText,
        questionTextEn: questions.questionTextEn,
        options: questions.options,
        type: questions.type,
        matchPairs: questions.matchPairs,
        correctAnswer: questions.correctAnswer,
        explanation: questions.explanation,
        explanationEn: questions.explanationEn,
        testId: questions.testId,
        order: questions.order,
        subject: questions.subject,
        extendedData: questions.extendedData,
      })
      .from(questions)
      .where(inArray(questions.id, chunk))
    )
  );

  const mappedById = new Map<string, QuestionData>(
    chunkResults.flat().map((q) => {
      return [q.id, mapQuestionRowToClient(q)];
    })
  );

  return uniqueQuestionIds
    .map((id) => mappedById.get(id))
    .filter((q): q is QuestionData => Boolean(q));
}

const getQuestionsWithDetailsCached = unstable_cache(
  async (questionIds: string[]) => fetchQuestionsWithDetailsFromDb(questionIds),
  ['pyq-questions-details-v3'],
  { revalidate: 3600, tags: ['pyq-questions'] }
);

async function getQuestionsWithDetails(questionIds: string[]) {
  const uniqueQuestionIds = Array.from(new Set(questionIds));
  if (uniqueQuestionIds.length > MAX_QUESTION_IDS_FOR_DATA_CACHE) {
    return fetchQuestionsWithDetailsFromDb(uniqueQuestionIds);
  }
  return getQuestionsWithDetailsCached(uniqueQuestionIds);
}

const fetchAllCanonicalQuestionsCached = unstable_cache(
  async () => {
    const canonicalTestIds = getCanonicalTestIds();
    const rows = await db
      .select({
        id: questions.id,
        questionText: questions.questionText,
        questionTextEn: questions.questionTextEn,
        options: questions.options,
        type: questions.type,
        matchPairs: questions.matchPairs,
        correctAnswer: questions.correctAnswer,
        explanation: questions.explanation,
        explanationEn: questions.explanationEn,
        testId: questions.testId,
        order: questions.order,
        subject: questions.subject,
        extendedData: questions.extendedData,
      })
      .from(questions)
      .where(and(eq(questions.examType, 'mppsc'), inArray(questions.testId, canonicalTestIds)));

    return rows.map(mapQuestionRowToClient);
  },
  ['pyq-all-canonical-questions-v1'],
  { revalidate: 3600, tags: ['pyq-questions'] }
);

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

  let questionList: QuestionData[] = [];
  let unitTitle = UNIT_TITLES[unitId] || '';
  let topicTitle: string | undefined;

  if (topicSlug) {
    // Topic-based query - use topic slug
    const result = await getQuestionsByTopic(topicSlug);
    questionList = result.questions;
    topicTitle = result.topic?.topicTitle || result.topic?.topicTitleEn || undefined;
  } else if (subject && source === 'subject') {
    // Subject-based query - get questions by subject
    if (subject === 'All') {
      questionList = await fetchAllCanonicalQuestionsCached();
      unitTitle = `All Subjects Questions (2020-2026)`;
    } else {
      // 🔧 No limit here, we want all questions for "View All" page
      const subjectData = await getOverallWeightageSubjectData();
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

  questionList.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || (a.qNo ?? 0) - (b.qNo ?? 0));

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
