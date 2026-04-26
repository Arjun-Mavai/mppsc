'use server';

import { db } from '@/db';
import { questions, tests, syllabusTopics } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { parseLenientJSON, minimalClean } from '@/lib/json-utils';
import { requireAdmin } from '@/lib/auth';

export async function getDetailedUpgradeStats() {
  await requireAdmin();
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
  await requireAdmin();
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

export async function getGeminiPromptForTest(limit: number, testId: string, testType: string, testTitle: string) {
  try {
    await requireAdmin();
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

    const systemPrompt = `You are a legendary MPPSC Chief Mentor and Exam Strategist known as "The Veteran". Your mission is to provide the "Superior Explanation Framework" (The Veteran's Wisdom).

### 🔴 CRITICAL QUALITY RULES (NON-NEGOTIABLE):
1. **STRICTLY BILINGUAL**: You MUST provide content for BOTH English (_en) and Hindi (_hi) for EVERY SINGLE field in the schema.
2. **NATURAL HINDI FLOW**: DO NOT use robotic, word-to-word literal translations from English to Hindi. Use the "Natural Mentorship Flow" (Amanat/Hindavi). It should sound like an elder mentor explaining to a student in a coaching center.
3. **NEXT-LEVEL DEPTH**: Every insight must be "next-level"—providing value that a standard book cannot. If it's a simple fact, add a "Pro-Tip" or "Contextual Layer" to it.
4. **NO HALLUCINATIONS**: Never guess years or sources. Stick to the logic of the subject.
5. **GENERATE FROM SCRATCH**: You are NOT provided with any legacy explanation. Build the "Veteran's Wisdom" entirely from the question, options, and the correct answer.
6. **STRICT JSON ESCAPING**: Ensure all newlines in strings are escaped as \\n. Avoid raw control characters that break JSON parsing.

CONTEXT: ${contextualEmphasis}

### 💎 The Superior Explanation Framework (4-Part Structure):
1. ✅ **Conceptual Core**: The "Why" and "How". Focus on the underlying principle. (Bilingual)
2. 🔄 **Inter-disciplinary Link**: Connect to other subjects (e.g., History linked to Art/Culture or Geography). (Bilingual)
3. 🧠 **Veteran's Wisdom & Pattern**: The "Exam Insight". Why does MPPSC/UPSC ask this? Hidden patterns. (Bilingual)
4. ⚡ **Tips, Tricks & Elimination**: 
   - **Red Flags**: Identify extreme words (only, all, never).
   - **Memory Mnemonics**: Acronyms, tricks, or stories to memorize. (Bilingual)
   - **Topper's Mantra**: A high-impact, marketing-friendly "Gold Nugget". (Bilingual)

JSON SCHEMA:
{
  "questions": [
    {
      "questionId": "Copy from input",
      "explanation": {
        "stream": "mppsc_expert",
        "topic_micro_mapping": "Syllabus micro-topic (Bilingual)",
        "conceptual_depth_hi": "Conceptual Core (Natural Hindi - Professional & Conversational)",
        "conceptual_depth_en": "Conceptual Core (English)",
        "interdisciplinary_link_hi": "Holistic Link (Hindi)",
        "interdisciplinary_link_en": "Holistic Link (English)",
        "historical_trend_hi": "Veteran's Wisdom (Hindi)",
        "historical_trend_en": "Veteran's Wisdom (English)",
        "elimination_strategy_hi": "Elimination Logic (Hindi)",
        "elimination_strategy_en": "Elimination Logic (English)",
        "memory_mnemonic_hi": "Memory Trick (Hindi)",
        "memory_mnemonic_en": "Memory Trick (English)",
        "toppers_mantra_hi": "Marketing Mantra (Hindi)",
        "toppers_mantra_en": "Marketing Mantra (English)",
        "mains_application_hi": "Mains Connection (Hindi)",
        "mains_application_en": "Mains Connection (English)",
        "ncert_reference": "Standard Source (e.g. NCERT Class 12)",
        "high_yield_facts_hi": ["Fact 1", "Fact 2"],
        "high_yield_facts_en": ["Fact 1", "Fact 2"]
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
