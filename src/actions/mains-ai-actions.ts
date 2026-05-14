'use server';

import JSON5 from 'json5';
import { jsonrepair } from 'jsonrepair';
import { db } from '@/db';
import { mainsTopics } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { upsertMainsContent } from '@/actions/mains-actions';
import {
  composeExpertStrategyFromRich,
  extractModelAnswersEn,
  extractModelAnswersForValidation,
  isHistoryRichPayload,
  normalizeVariantArr,
  stripServerFields,
} from '@/lib/mains-history-rich-normalize';
import { structuredKeyTermsToString } from '@/lib/mains-key-terms-flash';
import {
  repairInteriorDoubleQuotesInMappedStrings,
  jsonParseSnippetContext,
} from '@/lib/mains-pyq-paste-json-parse';

function stripCodeFence(s: string) {
  return s
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function normalizeAiPayload(raw: Record<string, unknown>) {
  const conceptHi = String(raw.concept_hi ?? raw.conceptHi ?? '').trim();
  const conceptEn = String(raw.concept_en ?? raw.conceptEn ?? '').trim();
  const modelAnswers = extractModelAnswersForValidation(raw);
  return {
    conceptHi,
    conceptEn,
    expertStrategyHi: String(raw.expert_strategy_hi ?? raw.expertStrategyHi ?? '').trim() || null,
    expertStrategyEn: String(raw.expert_strategy_en ?? raw.expertStrategyEn ?? '').trim() || null,
    modelAnswers,
    keyTermsHi: (raw.key_terms_hi ?? raw.keyTermsHi) as string | null | undefined,
    keyTermsEn: (raw.key_terms_en ?? raw.keyTermsEn) as string | null | undefined,
    practiceQuestions: (raw.practice_questions ?? raw.practiceQuestions) as unknown,
  };
}

function parseContentJson(rawText: string): Record<string, unknown> {
  const sanitized = rawText
    .replace(/^\uFEFF/, '') // Remove UTF-8 BOM if present
    .replace(/\u0000/g, '') // Remove NULL bytes
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  const stripped = stripCodeFence(sanitized);

  // Phase 1: Try raw parsing (with/without jsonrepair) to avoid altering valid quotes
  const rawTries = [
    { label: 'JSON.parse raw', run: () => JSON.parse(stripped) },
    { label: 'JSON5.parse raw', run: () => JSON5.parse(stripped) },
    { label: 'jsonrepair + JSON.parse raw', run: () => JSON.parse(jsonrepair(stripped)) },
    { label: 'jsonrepair + JSON5.parse raw', run: () => JSON5.parse(jsonrepair(stripped)) },
  ];

  for (const t of rawTries) {
    try {
      const val = t.run();
      if (val && typeof val === 'object') {
        return val as Record<string, unknown>;
      }
    } catch {
      // Continue
    }
  }

  // Phase 2: Patch unescaped quotes in mapped strings and try again
  const patched = repairInteriorDoubleQuotesInMappedStrings(stripped);
  const patchTries = [
    { label: 'JSON.parse patched', run: () => JSON.parse(patched) },
    { label: 'JSON5.parse patched', run: () => JSON5.parse(patched) },
    { label: 'jsonrepair + JSON.parse patched', run: () => JSON.parse(jsonrepair(patched)) },
    { label: 'jsonrepair + JSON5.parse patched', run: () => JSON5.parse(jsonrepair(patched)) },
  ];

  for (const t of patchTries) {
    try {
      const val = t.run();
      if (val && typeof val === 'object') {
        return val as Record<string, unknown>;
      }
    } catch {
      // Continue
    }
  }

  // Phase 3: Everything failed, isolate the error index and return snippet context
  let lastErrorMsg = 'Invalid JSON';
  let errorIndex: number | undefined;

  try {
    JSON.parse(stripped);
  } catch (e) {
    if (e instanceof Error) {
      lastErrorMsg = e.message;
      const m = lastErrorMsg.match(/\bposition\s+(\d+)/i);
      if (m) errorIndex = parseInt(m[1]!, 10);
    }
  }

  if (errorIndex === undefined) {
    try {
      jsonrepair(stripped);
    } catch (e) {
      if (e instanceof Error) {
        lastErrorMsg = e.message;
        const m = lastErrorMsg.match(/\bposition\s+(\d+)/i);
        if (m) errorIndex = parseInt(m[1]!, 10);
      }
    }
  }

  const context = jsonParseSnippetContext(stripped, errorIndex, 120);
  throw new Error(`JSON Parsing Failed: ${lastErrorMsg}\n\n${context}`);
}

function getDiagnostics(parsed: Record<string, unknown>, ma: ReturnType<typeof extractModelAnswersForValidation>): string {
  const rootKeys = Object.keys(parsed);
  const findMaObj = (
    parsed.model_answers_hi ??
    parsed.model_answer_hi ??
    parsed.modelanswers_hi ??
    parsed.model_answers ??
    parsed.model_answer ??
    parsed.modelAnswers ??
    parsed.modelAnswer ??
    parsed.modelanswers
  ) as Record<string, unknown> | undefined;
  const maKeys = findMaObj && typeof findMaObj === 'object' ? Object.keys(findMaObj) : [];
  return `[Diagnostics — schema_version: "${parsed.schema_version ?? 'missing'}", has_model_answers_hi: ${!!parsed.model_answers_hi}, has_model_answers: ${!!parsed.model_answers}, root_keys: [${rootKeys.join(', ')}], ma_subkeys: [${maKeys.join(', ')}], counted_models: 2m=${ma['2m'].length}, 7m=${ma['7m'].length}, 10m=${ma['10m'].length}, 11m=${ma['11m'].length}, case18=${ma.case18.length}]`;
}

function validateModelShape(
  pn: number,
  ma: ReturnType<typeof extractModelAnswersForValidation>
): string | null {
  const hasModels =
    ma['2m'].length +
      ma['7m'].length +
      ma['10m'].length +
      ma['11m'].length +
      ma.case18.length >
    0;
  if (!hasModels) return 'model_answers empty — add at least one block';

  if (pn >= 1 && pn <= 4) {
    if (ma['2m'].length < 1 || ma['7m'].length < 1) {
      return 'Paper I–IV: provide at least ONE 2m and ONE 7m variant.';
    }
  }
  if (pn <= 3) {
    if (ma['10m'].length < 1) return 'Paper I–III: provide at least ONE 10m (~200 word) variant.';
  }
  if (pn === 4) {
    if (ma['11m'].length < 1) return 'Paper IV: provide at least ONE 11m long-answer variant.';
  }
  if (pn >= 5) {
    if (ma['2m'].length < 1) return 'Paper V/VI: keep at least one 2m sample; add 7m and/or 10m rows as fits the topic.';
  }
  return null;
}

/** Paste AI JSON → validate → save to `mains_content` (admin-only via upsert). */
export async function adminApplyMainsContentJson(topicId: string, rawText: string) {
  try {
    const parsed = parseContentJson(rawText);

    const topicRow = await db.query.mainsTopics.findFirst({
      where: eq(mainsTopics.id, topicId),
      with: { unit: { with: { paper: true } } },
    });
    const pn = topicRow?.unit?.paper?.paperNumber ?? 1;

    if (isHistoryRichPayload(parsed)) {
      const graspHi = String(parsed.syllabus_grasp_hi ?? '').trim();
      const graspEn = String(parsed.syllabus_grasp_en ?? '').trim();
      const cognitiveHi = String(parsed.cognitive_intro_hi ?? '').trim();
      const cognitiveEn = String(parsed.cognitive_intro_en ?? '').trim();
      const openerHi = graspHi || cognitiveHi;
      const openerEn = graspEn || cognitiveEn;
      if (!openerHi || !openerEn) {
        return {
          success: false as const,
          error:
            'History‑rich JSON: supply cognitive_intro_* and/or syllabus_grasp_* in BOTH languages (at least one non-empty per language).',
        };
      }
      const conceptHi = [graspHi, cognitiveHi].filter(Boolean).join('\n\n');
      const conceptEn = [graspEn, cognitiveEn].filter(Boolean).join('\n\n');

      const ma = extractModelAnswersForValidation(parsed);
      const err = validateModelShape(pn, ma);
      if (err) {
        const diag = getDiagnostics(parsed, ma);
        return { success: false as const, error: `${err} ${diag}` };
      }

      const keyHi =
        String(parsed.key_terms_hi ?? '').trim() ||
        structuredKeyTermsToString(parsed.key_terms_cards_hi).trim();
      const keyEn =
        String(parsed.key_terms_en ?? '').trim() ||
        structuredKeyTermsToString(parsed.key_terms_cards_en).trim();
      if (!keyHi || !keyEn) {
        return {
          success: false as const,
          error:
            'key_terms_hi / key_terms_en — OR structured key_terms_cards_hi / key_terms_cards_en (History‑rich JSON)',
        };
      }

      const maEn = extractModelAnswersEn(parsed);
      const needEn =
        maEn['2m'].length + maEn['7m'].length + maEn['10m'].length + maEn['11m'].length + maEn.case18.length;
      if (needEn === 0) {
        return {
          success: false as const,
          error: 'model_answers_en required for bilingual History‑rich saves',
        };
      }
      const enErr = validateModelShape(pn, maEn);
      if (enErr) {
        const diag = getDiagnostics(parsed, maEn);
        return {
          success: false as const,
          error: `English models: ${enErr} ${diag}`,
        };
      }

      const res = await upsertMainsContent(topicId, {
        conceptHi,
        conceptEn,
        expertStrategyHi: composeExpertStrategyFromRich(parsed, 'hi'),
        expertStrategyEn: composeExpertStrategyFromRich(parsed, 'en'),
        modelAnswers: ma,
        keyTermsHi: keyHi,
        keyTermsEn: keyEn,
        practiceQuestions: (parsed.practice_questions ?? parsed.practiceQuestions) as unknown,
        richPayload: stripServerFields(parsed),
        examType: 'mppsc_mains',
      });
      return res;
    }

    const n = normalizeAiPayload(parsed);
    if (!n.conceptHi || !n.conceptEn) {
      return { success: false as const, error: 'concept_hi / concept_en required' };
    }
    const err = validateModelShape(pn, n.modelAnswers);
    if (err) {
      const diag = getDiagnostics(parsed, n.modelAnswers);
      return { success: false as const, error: `${err} ${diag}` };
    }

    const res = await upsertMainsContent(topicId, {
      conceptHi: n.conceptHi,
      conceptEn: n.conceptEn,
      expertStrategyHi: n.expertStrategyHi,
      expertStrategyEn: n.expertStrategyEn,
      modelAnswers: n.modelAnswers,
      keyTermsHi: n.keyTermsHi ?? null,
      keyTermsEn: n.keyTermsEn ?? null,
      practiceQuestions: n.practiceQuestions ?? null,
      richPayload: null,
      examType: 'mppsc_mains',
    });
    return res;
  } catch (e) {
    console.error('adminApplyMainsContentJson', e);
    return { success: false as const, error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}
