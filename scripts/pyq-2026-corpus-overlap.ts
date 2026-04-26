/**
 * MPPSC 2026 Prelims paper vs Zenscroll corpus — overlap report (offline).
 *
 * Measures:
 *  1) Stem Jaccard: 2026 question (Hindi+English+options) vs corpus questions (same).
 *  2) Explanation coverage: tokens from 2026 stem appear in a corpus item's
 *     explanations (classic + expert JSON) — catches "saw the fact in solution".
 *
 * NOT statistical proof of prediction — editorial / trust-building with honest caveats.
 *
 * Prefer: `node scripts/pyq-2026-corpus-overlap.mjs` (no tsx) — see that file for Turso-first logic.
 * Turso: set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN in `.env.local` (read-only).
 * Local file only: REPORT_USE_LOCAL_DB=1
 *
 * Optional:
 *   PYQ_2026_TEST_ID=xxx  (default: 2026 canonical id in pyq-constants)
 */

import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { and, eq, inArray, ne, asc } from 'drizzle-orm';
import * as schema from '../src/db/schema';
const { questions, tests } = schema;
import { CANONICAL_TEST_IDS, getYearFromTestId, TEST_ID_TO_YEAR } from '../src/lib/pyq-constants';

// ── stop words: subset aligned with src/actions/pyq-analytics.ts (repeated Q logic) ──
const STOP = new Set([
  'the', 'is', 'at', 'of', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'with', 'by', 'from', 'which',
  'correct', 'incorrect', 'following', 'statements', 'regarding', 'consider', 'match', 'option',
  'question', 'answer', 'not', 'none', 'all', 'above', 'below', 'true', 'false',
  'ka', 'ki', 'ke', 'hai', 'tha', 'thi', 'ko', 'se', 'me', 'mein', 'par', 'aur', 'evam', 'tatha',
  'kya', 'kaun', 'kis', 'nimn', 'likhit', 'nimnalikhit', 'kathan', 'sahi', 'galat', 'h', 'nahi',
  'है', 'हैं', 'था', 'थी', 'थे', 'का', 'की', 'के', 'को', 'से', 'में', 'पर', 'और', 'एवं', 'तथा', 'क्या', 'कौन',
  'निम्नलिखित', 'कथनों', 'कथन', 'विचार', 'कीजिए', 'उत्तर', 'दीजिए', 'विकल्प', 'सुमेलित', 'कौनसा', 'नहीं',
  'एक', 'यह', 'वह', 'वे', 'करते', 'होता', 'होती', 'होते', 'दिया', 'गया',
]);

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^\w\u0900-\u097F\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSignificantTokens(text: string): Set<string> {
  const n = normalize(text);
  const tokens = n.split(' ').filter((t) => t.length > 3 && !STOP.has(t));
  return new Set(tokens);
}

function jaccardFromSets(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  const [sm, la] = a.size < b.size ? [a, b] : [b, a];
  for (const t of sm) {
    if (la.has(t)) inter++;
  }
  const u = a.size + b.size - inter;
  return u === 0 ? 0 : inter / u;
}

function jaccardText(t1: string, t2: string): number {
  return jaccardFromSets(getSignificantTokens(t1), getSignificantTokens(t2));
}

function flattenJsonValues(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.map(flattenJsonValues).join(' ');
  if (typeof v === 'object') return Object.values(v as object).map(flattenJsonValues).join(' ');
  return String(v);
}

function stemBlob(
  text: string | null,
  textEn: string | null,
  options: unknown
): string {
  let opt = '';
  try {
    if (options != null) {
      opt = typeof options === 'string' ? options : JSON.stringify(options);
    }
  } catch {
    opt = '';
  }
  return `${text || ''} ${textEn || ''} ${opt}`;
}

function explBlob(
  ex: string | null,
  exEn: string | null,
  ext: unknown
): string {
  const fromJson = ext ? flattenJsonValues(typeof ext === 'string' ? tryParseJson(ext) : ext) : '';
  return `${ex || ''} ${exEn || ''} ${fromJson}`;
}

function tryParseJson(s: string): unknown {
  try {
    return JSON.parse(s) as unknown;
  } catch {
    return s;
  }
}

function explanationCoverage(needleTokens: Set<string>, haystack: string): number {
  if (needleTokens.size === 0) return 0;
  const h = getSignificantTokens(haystack);
  let inter = 0;
  for (const t of needleTokens) {
    if (h.has(t)) inter++;
  }
  return inter / needleTokens.size;
}

const CORPUS_TYPES = ['FLT', 'UNIT', 'CSAT', 'PYQ', 'TOPIC', 'MISC'] as const;

type CorpusRow = {
  id: string;
  testId: string;
  testTitle: string;
  testType: string;
  slug: string;
  order: number;
  stem: string;
  expl: string;
  stemT: Set<string>;
  explT: Set<string>;
  pyqYear: number | null;
};

const TARGET_2026 =
  process.env.PYQ_2026_TEST_ID || CANONICAL_TEST_IDS[2026] || 'n9Zy8u3ytAf1ZPB9W_Rbk';

const J_STEM_DUP = 0.45;
const J_STEM_SIM = 0.28;
const EXPL_COVER = 0.18;

function connectDb() {
  const isLocal = !process.env.TURSO_DATABASE_URL;
  const url = isLocal ? 'file:mppsc_local_dev.db' : (process.env.TURSO_DATABASE_URL as string);
  const auth = isLocal ? undefined : process.env.TURSO_AUTH_TOKEN;
  if (!isLocal && !auth) {
    console.warn('WARN: TURSO_AUTH_TOKEN missing; connection may fail.');
  }
  const client = createClient({ url, authToken: auth });
  return drizzle(client, { schema });
}

async function main() {
  const db = connectDb();
  const base = and(
    eq(tests.examType, 'mppsc'),
    eq(tests.isHidden, false),
    inArray(tests.type, [...CORPUS_TYPES]),
  );

  const [targetQs, corpusRows] = await Promise.all([
    db
      .select({
        id: questions.id,
        testId: questions.testId,
        order: questions.order,
        text: questions.questionText,
        textEn: questions.questionTextEn,
        options: questions.options,
        ex: questions.explanation,
        exEn: questions.explanationEn,
        ext: questions.extendedData,
      })
      .from(questions)
      .innerJoin(tests, eq(questions.testId, tests.id))
      .where(and(eq(questions.examType, 'mppsc'), eq(questions.testId, TARGET_2026)))
      .orderBy(asc(questions.order)),
    db
      .select({
        id: questions.id,
        testId: questions.testId,
        order: questions.order,
        text: questions.questionText,
        textEn: questions.questionTextEn,
        options: questions.options,
        ex: questions.explanation,
        exEn: questions.explanationEn,
        ext: questions.extendedData,
        ttitle: tests.title,
        ttype: tests.type,
        slug: tests.slug,
      })
      .from(questions)
      .innerJoin(tests, eq(questions.testId, tests.id))
      .where(and(base, ne(questions.testId, TARGET_2026))),
  ]);

  const corpus: CorpusRow[] = corpusRows.map((r) => {
    const stem = stemBlob(r.text, r.textEn, r.options);
    const expl = explBlob(r.ex, r.exEn, r.ext);
    const pyqYear = r.ttype === 'PYQ' ? (TEST_ID_TO_YEAR[r.testId] ?? getYearFromTestId(r.testId)) : null;
    return {
      id: r.id,
      testId: r.testId,
      testTitle: r.ttitle,
      testType: r.ttype,
      slug: r.slug,
      order: r.order,
      stem,
      expl,
      stemT: getSignificantTokens(stem),
      explT: getSignificantTokens(expl),
      pyqYear,
    };
  });

  if (targetQs.length === 0) {
    console.error(
      `No questions for 2026 test id=${TARGET_2026}. Set PYQ_2026_TEST_ID or add paper to DB.`,
    );
    process.exit(1);
  }

  interface Match {
    targetOrder: number;
    targetQId: string;
    kind: 'stem_strong' | 'stem_medium' | 'explanation_only' | 'none';
    jStem: number;
    explCover: number;
    ref: CorpusRow | null;
  }

  const matches: Match[] = [];
  for (const tq of targetQs) {
    const stem = stemBlob(tq.text, tq.textEn, tq.options);
    const stemT = getSignificantTokens(stem);
    let best: { row: CorpusRow; j: number; cov: number; refKind: Match['kind'] } | null = null;

    for (const c of corpus) {
      if (c.id === tq.id) continue;
      const j = jaccardText(stem, c.stem);
      const cov = explanationCoverage(stemT, c.expl);
      let refKind: Match['kind'] = 'none';
      if (j >= J_STEM_DUP) refKind = 'stem_strong';
      else if (j >= J_STEM_SIM) refKind = 'stem_medium';
      else if (cov >= EXPL_COVER) refKind = 'explanation_only';
      else continue;

      const score = j * 1.0 + cov * 0.35;
      const bestScore = best ? best.j * 1.0 + best.cov * 0.35 : -1;
      if (!best || score > bestScore) {
        best = { row: c, j, cov, refKind };
      } else if (Math.abs(score - bestScore) < 1e-6 && best && (j > best.j || (j === best.j && cov > best.cov))) {
        best = { row: c, j, cov, refKind };
      }
    }

    if (!best) {
      matches.push({
        targetOrder: tq.order,
        targetQId: tq.id,
        kind: 'none',
        jStem: 0,
        explCover: 0,
        ref: null,
      });
      continue;
    }

    matches.push({
      targetOrder: tq.order,
      targetQId: tq.id,
      kind: best.refKind,
      jStem: best.j,
      explCover: best.cov,
      ref: best.row,
    });
  }

  const withAny = matches.filter((m) => m.kind !== 'none');
  const byType: Record<string, number> = {};
  for (const m of withAny) {
    const t = m.ref?.testType || '—';
    byType[t] = (byType[t] || 0) + 1;
  }

  const lines: string[] = [];
  const date = new Date().toISOString().slice(0, 10);
  lines.push(`# 2026 Prelims vs Zenscroll corpus — overlap report`);
  lines.push(`Generated: ${date}`);
  lines.push(`2026 test_id: \`${TARGET_2026}\` · Corpus questions: **${corpus.length}** (MPPSC, non-hidden, FLT/UNIT/CSAT/PYQ/TOPIC/MISC, excluding 2026 paper).`);
  lines.push(``);
  lines.push(`## How to read this (methodology)`);
  lines.push(`- **Stem Jaccard**: token overlap (length>3, stopwords stripped) on Hindi+English+options. Same family as the app's repeated-PYQ detector.`);
  lines.push(`- **Explanation coverage**: share of 2026 question tokens that also appear in *our* explanation / expert JSON for *some* other question. Picks "fact might have been seen in a solution" (e.g. Chandrayaan–3, dates).`);
  lines.push(
    `- Thresholds: strong duplicate stem ≥${J_STEM_DUP}, similar stem ≥${J_STEM_SIM}, explanation-only ≥${Math.round(EXPL_COVER * 100)}% token recall on explanations.`,
  );
  lines.push(`- This is **not** proof the exam copied our tests; it estimates **content overlap** for transparency.`);
  lines.push(``);
  lines.push(`## Executive summary (Telegram / intro)`);
  lines.push(
    `Out of **${targetQs.length}** 2026 questions, **${withAny.length}** have at least one match (similar stem or explanation overlap) somewhere in the Zenscroll MPPSC test series (PYQ 2020–25, FLT, Unit, Topic, MISC, CSAT). ` +
      `Use the table below for question numbers and where to find the reference.`,
  );
  lines.push(``);
  lines.push(`### By test type (count of 2026 Qs with a hit)`);
  for (const [k, v] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    lines.push(`- **${k}**: ${v}`);
  }
  lines.push(``);
  lines.push(`## Per-question (2026 Q# → best reference)`);
  lines.push(`| 2026 Q | Match kind | jStem | explCov | Test type | PYQ year | Test (short) | Q# in test | \`/tests/slug\` |`);
  lines.push(`|--------|------------|-------|---------|-----------|----------|--------------|------------|----------------|`);
  for (const m of matches.sort((a, b) => a.targetOrder - b.targetOrder)) {
    const r = m.ref;
    const shortTitle = r ? (r.testTitle.length > 42 ? r.testTitle.slice(0, 40) + '…' : r.testTitle) : '—';
    const y = r && r.testType === 'PYQ' && r.pyqYear != null ? String(r.pyqYear) : (r && r.testType === 'PYQ' ? '?' : '—');
    lines.push(
      `| ${m.targetOrder} | ${m.kind} | ${m.jStem.toFixed(3)} | ${(m.explCover * 100).toFixed(1)}% | ${r?.testType ?? '—'} | ${y} | ${shortTitle} | ${r?.order ?? '—'} | \`${r?.slug ?? '—'}\` |`,
    );
  }
  lines.push(``);
  lines.push(`## JSON export`);
  lines.push('See `report.json` next to this file for machine-readable output.');

  const outDir = path.join(process.cwd(), 'reports');
  mkdirSync(outDir, { recursive: true });
  const outMd = path.join(outDir, `pyq-2026-corpus-overlap-${date}.md`);
  const outJson = path.join(outDir, `pyq-2026-corpus-overlap-${date}.json`);
  writeFileSync(outMd, lines.join('\n'), 'utf8');
  const leanRow = (m: Match) => ({
    targetOrder: m.targetOrder,
    targetQId: m.targetQId,
    kind: m.kind,
    jStem: m.jStem,
    explCover: m.explCover,
    reference: m.ref
      ? {
          questionId: m.ref.id,
          testId: m.ref.testId,
          testTitle: m.ref.testTitle,
          testType: m.ref.testType,
          pyqYear: m.ref.pyqYear,
          questionOrder: m.ref.order,
          slug: m.ref.slug,
        }
      : null,
  });
  const payload = {
    targetTestId: TARGET_2026,
    targetQuestionCount: targetQs.length,
    corpusQuestionCount: corpus.length,
    thresholds: { jStemStrong: J_STEM_DUP, jStemSim: J_STEM_SIM, explCover: EXPL_COVER },
    summary: { matchedAtLeastOne: withAny.length, byTestType: byType },
    rows: matches.map(leanRow),
  };
  writeFileSync(outJson, JSON.stringify(payload, null, 2), 'utf8');
  writeFileSync(
    path.join(outDir, 'pyq-2026-corpus-overlap-latest.json'),
    JSON.stringify({ targetTestId: TARGET_2026, generated: date, ...payload }, null, 2),
    'utf8',
  );

  console.log(`Wrote ${outMd}\n${outJson}`);
  console.log(`Matched ${withAny.length} / ${targetQs.length} (any tier)`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
