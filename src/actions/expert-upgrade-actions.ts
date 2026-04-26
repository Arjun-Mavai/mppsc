'use server';

import { db } from '@/db';
import { questions, tests, syllabusTopics } from '@/db/schema';
import { eq, and, sql, asc } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { parseLenientJSON, minimalClean } from '@/lib/json-utils';
import { assertAdmin } from '@/lib/auth';

function pickField(
  o: Record<string, unknown>,
  keys: string[],
): string | null | undefined {
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(o, k)) {
      const v = o[k];
      if (v === null) return null;
      if (typeof v === 'string') return v;
    }
  }
  return undefined;
}

export async function getDetailedUpgradeStats() {
  await assertAdmin();
  try {
    const statsQuery = await db
      .select({
        testId: tests.id,
        testTitle: tests.title,
        topicTitle: syllabusTopics.title,
        testType: tests.type,
        total: sql<number>`count(${questions.id})`.mapWith(Number),
        upgraded: sql<number>`sum(case when ${questions.extendedData} LIKE '%mppsc_expert%' then 1 else 0 end)`.mapWith(Number),
        pending: sql<number>`sum(case when ${questions.extendedData} NOT LIKE '%mppsc_expert%' OR ${questions.extendedData} IS NULL then 1 else 0 end)`.mapWith(Number),
      })
      .from(tests)
      .innerJoin(questions, eq(questions.testId, tests.id))
      .leftJoin(syllabusTopics, eq(tests.topicId, syllabusTopics.id))
      .where(eq(tests.examType, 'mppsc')) // STICK TO MPPSC
      .groupBy(tests.id, tests.title, tests.type, syllabusTopics.title)
      .orderBy(tests.type, tests.title);

    // Refine titles for TOPIC tests
    const refinedData = statsQuery.map(s => {
       if (s.testType === 'TOPIC' && s.topicTitle) {
          // If the title is an ID (approximate check) or we have a better syllabus title
          return { ...s, testTitle: s.topicTitle };
       }
       return s;
    });

    return {
      success: true,
      data: refinedData.filter(s => s.total > 0), // Omit empty tests
    };
  } catch (error) {
    logger.error('Error fetching detailed expert upgrade stats', error, { category: 'admin' });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

interface ExpertExplanation {
  stream: 'mppsc_expert';
  topic_micro_mapping: string;
  historical_trend_hi: string;
  historical_trend_en: string;
  conceptual_depth_hi: string;
  conceptual_depth_en: string;
  interdisciplinary_link_hi: string;
  interdisciplinary_link_en: string;
  elimination_strategy_hi: string;
  elimination_strategy_en: string;
  memory_mnemonic_hi: string;
  memory_mnemonic_en: string;
  toppers_mantra_hi: string;
  toppers_mantra_en: string;
  mains_application_hi?: string;
  mains_application_en?: string;
  ncert_reference?: string;
  high_yield_facts_hi: string[];
  high_yield_facts_en: string[];
}

interface UpgradedQuestion {
  questionId: string;
  explanation: ExpertExplanation;
}

export async function processManualGeminiJSON(jsonString: string) {
  await assertAdmin();
  try {
    const root = parseLenientJSON(jsonString) as
      | { questions?: UpgradedQuestion[]; Questions?: UpgradedQuestion[] }
      | UpgradedQuestion[];
    const upgradedQuestions = Array.isArray(root)
      ? root
      : (root.questions ?? root.Questions ?? []);
    
    if (!Array.isArray(upgradedQuestions)) {
        throw new Error('JSON did not contain an array of upgraded questions. Please check the Gemini output format.');
    }

    let firstPreview: ExpertExplanation | null = null;
    let successCount = 0;
    
    for (const upgraded of upgradedQuestions) {
      if (!upgraded.questionId || !upgraded.explanation) continue;

      const updated = await db
        .update(questions)
        .set({ extendedData: upgraded.explanation })
        .where(
          and(eq(questions.id, upgraded.questionId), eq(questions.examType, 'mppsc')),
        )
        .returning({ id: questions.id });

      if (updated.length === 0) continue;

      if (!firstPreview) {
        firstPreview = upgraded.explanation;
      }

      successCount++;
    }

    return { 
      success: true, 
      message: `Successfully upgraded ${successCount} questions from pasted JSON.`, 
      processedCount: successCount,
      preview: firstPreview
    };

  } catch (error) {
    const cleaned = minimalClean(jsonString);
    logger.error('Error in processManualGeminiJSON', error, {
      category: 'admin',
      metadata: {
        jsonSnippet: jsonString.substring(0, 50),
        cleanedSnippet: cleaned.substring(0, 50),
        charCode0: cleaned.charCodeAt(0),
        charCode1: cleaned.charCodeAt(1),
        charCode2: cleaned.charCodeAt(2),
      }
    });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Bulk upsert legacy "classic" bilingual text into `explanation` (Hindi) and `explanation_en` (English)
 * by question id — same columns the Tests tab uses in "Classic" mode. Use for 2026+ rows where the
 * student UI needs markdown classic text alongside (or without) `extendedData` expert JSON.
 *
 * Accepts: a top-level array, or `{ questions: [...] }` / `{ items: [...] }`.
 * Each item: `questionId` (or `id`), plus any of:
 * - `explanation_hi` / `explanation` (string, Hindi — `explanation` must be a string, not expert object)
 * - `explanationEn` / `explanation_en` (string, English)
 * Omitted keys are left unchanged; `null` clears that column.
 */
export async function processManualClassicExplanationsJSON(jsonString: string) {
  await assertAdmin();
  try {
    const root = parseLenientJSON(jsonString) as
      | { questions?: unknown[]; items?: unknown[] }
      | unknown[];
    const rows = Array.isArray(root) ? root : (root.questions ?? root.items ?? []);
    if (!Array.isArray(rows)) {
      throw new Error(
        'Expected a JSON array (or { "questions": [...] }) of objects with questionId and classic text fields.'
      );
    }

    function buildPatch(item: Record<string, unknown>): {
      questionId: string;
      patch: { explanation?: string | null; explanationEn?: string | null };
    } | null {
      const qid = (item.questionId ?? item.id) as string | undefined;
      if (!qid || typeof qid !== 'string' || !qid.trim()) return null;

      const patch: { explanation?: string | null; explanationEn?: string | null } = {};

      /** First matching key wins; common AI / copy-paste variants */
      const hi =
        pickField(item, ['explanation_hi', 'explanationHi', 'explanationHI']) ??
        (() => {
          if (!('explanation' in item)) return undefined;
          const v = item.explanation;
          if (v === null) return null;
          if (typeof v === 'string') return v;
          return undefined;
        })();

      if (hi !== undefined) {
        if (hi === null) patch.explanation = null;
        else if (typeof hi === 'string') patch.explanation = hi;
      }

      const en = pickField(item, [
        'explanationEn',
        'explanation_en',
        'explanationEN',
        'ExplanationEn',
        'explanation_EN',
      ]);
      if (en !== undefined) {
        if (en === null) patch.explanationEn = null;
        else if (typeof en === 'string') patch.explanationEn = en;
      }

      if (Object.keys(patch).length === 0) return null;
      return { questionId: qid.trim(), patch };
    }

    let successCount = 0;
    const notFoundIds: string[] = [];
    const skipped: string[] = [];

    for (const raw of rows) {
      if (!raw || typeof raw !== 'object') {
        continue;
      }
      const item = raw as Record<string, unknown>;
      const parsed = buildPatch(item);
      if (!parsed) {
        const id = (item.questionId ?? item.id) as string | undefined;
        if (id && typeof id === 'string') skipped.push(id);
        continue;
      }

      const { questionId, patch } = parsed;
      const updated = await db
        .update(questions)
        .set(patch)
        .where(and(eq(questions.id, questionId), eq(questions.examType, 'mppsc')))
        .returning({ id: questions.id });

      if (updated.length === 0) {
        notFoundIds.push(questionId);
      } else {
        successCount++;
      }
    }

    const parts = [
      `Updated classic text for ${successCount} question(s).`,
      notFoundIds.length > 0
        ? `Not found (wrong id or non-mppsc): ${notFoundIds.slice(0, 15).join(', ')}${
            notFoundIds.length > 15 ? ` …+${notFoundIds.length - 15}` : ''
          }`
        : '',
      skipped.length > 0
        ? `Skipped (no text fields or invalid id): ${skipped.slice(0, 10).join(', ')}${
            skipped.length > 10 ? ` …+${skipped.length - 10}` : ''
          }`
        : '',
    ].filter(Boolean);

    return {
      success: true,
      message: parts.join(' '),
      processedCount: successCount,
      notFoundCount: notFoundIds.length,
      skippedCount: skipped.length,
    };
  } catch (error) {
    logger.error('Error in processManualClassicExplanationsJSON', error, { category: 'admin' });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

const CLASSIC_BATCH_SIZES = [10, 25, 50] as const;
export type ClassicBatchSize = (typeof CLASSIC_BATCH_SIZES)[number];

/** Hindi + English classic columns: both non-empty. For progress: done = total - pending. */
const classicColumnsPendingFilter = () =>
  sql`(trim(coalesce(${questions.explanation}, '')) = '' OR trim(coalesce(${questions.explanationEn}, '')) = '')`;

/**
 * Quick counts for admin UI: how many of `totalInTest` have both classic text columns filled.
 */
export async function getClassicColumnProgressForTest(testId: string) {
  await assertAdmin();
  const testRow = await db
    .select({ title: tests.title })
    .from(tests)
    .where(eq(tests.id, testId))
    .get();
  const baseWhere = and(eq(questions.testId, testId), eq(questions.examType, 'mppsc'));
  const wherePending = and(baseWhere, classicColumnsPendingFilter());
  const [totRow] = await db
    .select({ n: sql<number>`count(*)`.mapWith(Number) })
    .from(questions)
    .where(baseWhere);
  const [penRow] = await db
    .select({ n: sql<number>`count(*)`.mapWith(Number) })
    .from(questions)
    .where(wherePending);
  const totalInTest = totRow?.n ?? 0;
  const pendingTotal = penRow?.n ?? 0;
  const classicDoneCount = Math.max(0, totalInTest - pendingTotal);
  return {
    success: true as const,
    testId,
    testTitle: testRow?.title ?? testId,
    totalInTest,
    pendingTotal,
    classicDoneCount,
  };
}

/**
 * For a given test (e.g. 2026 canonical PYQ), return the next batch of questions that still need
 * classic text (Hindi and/or `explanation` or `explanation_en` column empty) plus a full Gemini-style
 * prompt string — same workflow as getGeminiPromptForTest but for classic column upsert.
 */
export async function getClassicPendingBatchPrompt(testId: string, limit: number) {
  await assertAdmin();
  const L = (CLASSIC_BATCH_SIZES as readonly number[]).includes(limit) ? limit : 25;

  const testRow = await db
    .select({ id: tests.id, title: tests.title })
    .from(tests)
    .where(eq(tests.id, testId))
    .get();

  if (!testRow) {
    return { success: false as const, error: 'Test not found' };
  }

  const baseWhere = and(eq(questions.testId, testId), eq(questions.examType, 'mppsc'));
  const wherePending = and(baseWhere, classicColumnsPendingFilter());

  const totalCountRows = await db
    .select({ n: sql<number>`count(*)`.mapWith(Number) })
    .from(questions)
    .where(baseWhere);
  const totalInTest = totalCountRows[0]?.n ?? 0;

  const countRows = await db
    .select({ n: sql<number>`count(*)`.mapWith(Number) })
    .from(questions)
    .where(wherePending);
  const pendingTotal = countRows[0]?.n ?? 0;
  const classicDoneCount = Math.max(0, totalInTest - pendingTotal);

  const rows = await db
    .select({
      id: questions.id,
      questionText: questions.questionText,
      questionTextEn: questions.questionTextEn,
      options: questions.options,
      correctAnswer: questions.correctAnswer,
      order: questions.order,
    })
    .from(questions)
    .where(wherePending)
    .orderBy(asc(questions.order))
    .limit(L);

  if (rows.length === 0) {
    return {
      success: true as const,
      testId,
      testTitle: testRow.title,
      count: 0,
      pendingTotal,
      totalInTest,
      classicDoneCount,
      fullPrompt: null,
      inputJson: null,
      emptyMessage:
        pendingTotal === 0
          ? 'All questions in this test already have both Hindi and English classic text (no empty columns), or the test has no questions.'
          : 'No rows in this batch (unexpected).',
    };
  }

  const inputPayload = rows.map((q) => {
    let opts: unknown = q.options;
    if (typeof opts === 'string') {
      try {
        opts = JSON.parse(opts);
      } catch {
        opts = [];
      }
    }
    return {
      questionId: q.id,
      order: q.order,
      questionText: q.questionText,
      questionTextEn: q.questionTextEn,
      options: opts,
      correctAnswer: q.correctAnswer,
    };
  });

  const inputJson = JSON.stringify({ questions: inputPayload }, null, 2);

  const fullPrompt = `You are a legendary MPPSC mentor. Your job is to write **CLASSIC** bilingual coaching-style explanations (not the long expert JSON schema).

### OUTPUT (NON-NEGOTIABLE)
1. Return **ONLY** a valid JSON **array** of objects. No markdown code fences, no backticks, no trailing commas, no extra commentary.
2. **Exactly** ${inputPayload.length} array items. Each object MUST be:
   { \"questionId\": \"<copy exactly from input>\", \"explanation_hi\": \"Hindi text\", \"explanationEn\": \"English text\" }
3. \`explanation_en\` as snake_case is also accepted in your output, but **prefer** \`explanationEn\` (camelCase) for consistency.
4. Style: use section markers in each language, e.g. **सही तर्क / **Correct Logic, **Exam Fact, **Memory Tip, **Scam Alert where useful. Separate blocks with newlines; escape newlines in JSON as \\\\n.
5. **Do not** change, invent, reorder, or omit \`questionId\` — copy from INPUT verbatim.

### BILINGUAL
- \`explanation_hi\` = natural Hindi. \`explanationEn\` = natural English. Not word-for-word translation only — exam-useful, concise.

Test: \"${testRow.title}\" — **Classic progress: ${classicDoneCount} / ${totalInTest}** (paper questions with *both* Hindi + English classic columns filled). **${pendingTotal}** still need classic. This request is **${inputPayload.length}** of those, in order.

--- INPUT (questions) ---
${inputJson}

--- Return ONLY the JSON array, nothing else. ---`;

  logger.info('[getClassicPendingBatchPrompt] batch for classic', {
    category: 'admin',
    testId,
    limit: L,
    count: inputPayload.length,
    pendingTotal,
    totalInTest,
    classicDoneCount,
  });

  return {
    success: true as const,
    testId,
    testTitle: testRow.title,
    count: inputPayload.length,
    pendingTotal,
    totalInTest,
    classicDoneCount,
    fullPrompt,
    inputJson,
  };
}

export async function getGeminiPromptForTest(limit: number, testId: string, testType: string, testTitle: string) {
  try {
    await assertAdmin();
    const pending = await db
      .select({
        id: questions.id,
        questionText: questions.questionText,
        questionTextEn: questions.questionTextEn,
        options: questions.options,
        correctAnswer: questions.correctAnswer,
        explanation: questions.explanation,
        explanationEn: questions.explanationEn
      })
      .from(questions)
      .where(and(
        eq(questions.testId, testId),
        eq(questions.examType, 'mppsc'), // STICK TO MPPSC
        sql`(${questions.extendedData} IS NULL OR ${questions.extendedData} NOT LIKE '%mppsc_expert%')`
      ))
      .limit(limit);

    logger.info('[getGeminiPromptForTest] Retrieved pending questions for expert upgrade batch', {
      category: 'admin',
      testId,
      limit,
      pendingCount: pending.length,
    });

    if (pending.length === 0) {
      return { success: true, message: 'All questions in this test have been upgraded!', prompt: null };
    }

    // Prepare payload with explicit context
    const inputPayload = pending.map((q) => ({
      questionId: q.id,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));

    let contextualEmphasis = "";
    if (testType.toLowerCase() === 'pyq') {
       contextualEmphasis = `Since these are explicitly PREVIOUS YEAR QUESTIONS (PYQ) from '${testTitle}', heavily emphasize historical repeating trends and strictly map out NCERT references.`;
       if (testTitle.toLowerCase().includes('csat')) {
          contextualEmphasis += `\nWARNING: This is a CSAT/Reasoning PYQ. Focus heavily on calculation shortcuts and mental logic formulas.`;
       }
    } else if (testType.toLowerCase() === 'csat') {
       contextualEmphasis = "These are CSAT / Mathematics / Reasoning questions. Focus almost entirely on Step-by-Step logic, shortcuts, and formulaic memory tips. Use standard `mppsc_expert` structure but adapt language for math.";
    } else {
       contextualEmphasis = `These are General Studies questions from a standard test ('${testTitle}'). Focus on creating a premium mentorship experience, identifying exact micro-syllabus topics and NCERT linkages where possible.`;
    }

    const systemPrompt = `You are a legendary MPPSC Chief Mentor and Exam Strategist known as \"The Veteran\". Your mission is to provide the \"Superior Explanation Framework\" (The Veteran's Wisdom).

### 🔴 CRITICAL QUALITY RULES (NON-NEGOTIABLE):
1. **STRICTLY BILINGUAL**: You MUST provide content for BOTH English (_en) and Hindi (_hi) for EVERY SINGLE field in the schema.
2. **NATURAL HINDI FLOW**: DO NOT use robotic, word-to-word literal translations from English to Hindi. Use the \"Natural Mentorship Flow\" (Amanat/Hindavi). It should sound like an elder mentor explaining to a student in a coaching center.
3. **NEXT-LEVEL DEPTH**: Every insight must be \"next-level\"—providing value that a standard book cannot. If it's a simple fact, add a \"Pro-Tip\" or \"Contextual Layer\" to it.
4. **NO HALLUCINATIONS**: Never guess years or sources. Stick to the logic of the subject.
5. **GENERATE FROM SCRATCH**: You are NOT provided with any legacy explanation. Build the \"Veteran's Wisdom\" entirely from the question, options, and the correct answer.
6. **STRICT JSON ESCAPING**: Ensure all newlines in strings are escaped as \\\\n. Avoid raw control characters that break JSON parsing.

CONTEXT: ${contextualEmphasis}

### 💎 The Superior Explanation Framework (4-Part Structure):
1. ✅ **Conceptual Core**: The \"Why\" and \"How\". Focus on the underlying principle. (Bilingual)
2. 🔄 **Inter-disciplinary Link**: Connect to other subjects (e.g., History linked to Art/Culture or Geography). (Bilingual)
3. 🧠 **Veteran's Wisdom & Pattern**: The \"Exam Insight\". Why does MPPSC/UPSC ask this? Hidden patterns. (Bilingual)
4. ⚡ **Tips, Tricks & Elimination**: 
   - **Red Flags**: Identify extreme words (only, all, never).
   - **Memory Mnemonics**: Acronyms, tricks, or stories to memorize. (Bilingual)
   - **Topper's Mantra**: A high-impact, marketing-friendly \"Gold Nugget\". (Bilingual)

JSON SCHEMA:
{
  \"questions\": [
    {
      \"questionId\": \"Copy from input\",
      \"explanation\": {
        \"stream\": \"mppsc_expert\",
        \"topic_micro_mapping\": \"Syllabus micro-topic (Bilingual)\",
        \"conceptual_depth_hi\": \"Conceptual Core (Natural Hindi - Professional & Conversational)\",
        \"conceptual_depth_en\": \"Conceptual Core (English)\",
        \"interdisciplinary_link_hi\": \"Holistic Link (Hindi)\",
        \"interdisciplinary_link_en\": \"Holistic Link (English)\",
        \"historical_trend_hi\": \"Veteran's Wisdom (Hindi)\",
        \"historical_trend_en\": \"Veteran's Wisdom (English)\",
        \"elimination_strategy_hi\": \"Elimination Logic (Hindi)\",
        \"elimination_strategy_en\": \"Elimination Logic (English)\",
        \"memory_mnemonic_hi\": \"Memory Trick (Hindi)\",
        \"memory_mnemonic_en\": \"Memory Trick (English)\",
        \"toppers_mantra_hi\": \"Marketing Mantra (Hindi)\",
        \"toppers_mantra_en\": \"Marketing Mantra (English)\",
        \"mains_application_hi\": \"Mains Connection (Hindi)\",
        \"mains_application_en\": \"Mains Connection (English)\",
        \"ncert_reference\": \"Standard Source (e.g. NCERT Class 12)\",
        \"high_yield_facts_hi\": [\"Fact 1\", \"Fact 2\"],
        \"high_yield_facts_en\": [\"Fact 1\", \"Fact 2\"]
      }
    }
  ]
}

RETURN ONLY THE RAW JSON OBJECT. NO MARKDOWN BACKTICKS.

INPUT DATA:
${JSON.stringify({ questions: inputPayload }, null, 2)}`;

    return { 
      success: true, 
      prompt: systemPrompt,
      count: pending.length
    };
  } catch (error) {
    logger.error('Error in getGeminiPromptForTest', error, { category: 'admin' });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
