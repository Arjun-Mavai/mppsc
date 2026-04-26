/**
 * 2026 paper vs Zenscroll corpus — runs with `node` (no tsx).
 *
 * **Default: remote Turso (read-only SQL).** Set in `.env` / `.env.local`:
 *   TURSO_DATABASE_URL=libsql://...
 *   TURSO_AUTH_TOKEN=...
 *
 * Local file DB only if: REPORT_USE_LOCAL_DB=1 and mppsc_local_dev.db exists.
 */
import dotenv from 'dotenv';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CWD = process.cwd();
// Prefer .env.local (where Turso creds usually live) over .env
dotenv.config({ path: path.join(CWD, '.env.local') });
dotenv.config({ path: path.join(CWD, '.env') });

const TEST_ID_TO_YEAR = {
  '5KRVTgTIw07bWNxu20YNl': 2020,
  ix0FnJV496Rgvw0YHOEFj: 2021,
  o_rO3J1tSEACKENOLT9QI: 2022,
  mQ1a9hZoTdfSRfkz40K5C: 2023,
  '3XmZ0l700BJV3j2FLd0XZ': 2024,
  'D0gf6bklgl3RT-sTnue2n': 2025,
  n9Zy8u3ytAf1ZPB9W_Rbk: 2026,
};

function getYearFromTestId(tid) {
  return TEST_ID_TO_YEAR[tid] ?? 2020;
}

const TARGET_2026 = process.env.PYQ_2026_TEST_ID || 'n9Zy8u3ytAf1ZPB9W_Rbk';
/** Substring: corpus tests whose slug contains this are skipped (e.g. duplicate 2026 upload). */
const EXCLUDE_CORPUS_SLUG_LIKE = (process.env.REPORT_EXCLUDE_CORPUS_SLUG_LIKE || 'pyq-26-new').trim();
const J_STEM_DUP = 0.45;
const J_STEM_SIM = 0.28;
const EXPL_COVER = 0.18;
const CORPUS_TYPES = ['FLT', 'UNIT', 'CSAT', 'PYQ', 'TOPIC', 'MISC'];

const STOP = new Set([
  'the', 'is', 'at', 'of', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'with', 'by', 'from', 'which',
  'correct', 'incorrect', 'following', 'statements', 'regarding', 'consider', 'match', 'option',
  'question', 'answer', 'not', 'none', 'all', 'above', 'below', 'true', 'false',
  'ka', 'ki', 'ke', 'hai', 'tha', 'thi', 'ko', 'se', 'me', 'mein', 'par', 'aur', 'evam', 'tatha',
  'kya', 'kaun', 'kis', 'h', 'nahi', 'है', 'हैं', 'का', 'की', 'के', 'को', 'से', 'में', 'पर', 'और',
  'निम्नलिखित', 'कथन', 'उत्तर', 'विकल्प', 'नहीं', 'एक', 'यह', 'वह', 'वे', 'दिया', 'गया',
]);

function normalize(s) {
  return s
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^\w\u0900-\u097F\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function getSignificantTokens(text) {
  const n = normalize(String(text));
  return new Set(n.split(' ').filter((t) => t.length > 3 && !STOP.has(t)));
}
function jaccardFromSets(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  const [sm, la] = a.size < b.size ? [a, b] : [b, a];
  for (const t of sm) if (la.has(t)) inter++;
  const u = a.size + b.size - inter;
  return u === 0 ? 0 : inter / u;
}
function jaccardText(t1, t2) {
  return jaccardFromSets(getSignificantTokens(t1), getSignificantTokens(t2));
}
function flattenJsonValues(v) {
  if (v == null) return '';
  if (typeof v === 'string') {
    try {
      return flattenJsonValues(JSON.parse(v));
    } catch {
      return v;
    }
  }
  if (Array.isArray(v)) return v.map(flattenJsonValues).join(' ');
  if (typeof v === 'object') return Object.values(v).map(flattenJsonValues).join(' ');
  return String(v);
}
function stemBlob(text, textEn, options) {
  let opt = '';
  try {
    if (options != null) opt = typeof options === 'string' ? options : JSON.stringify(options);
  } catch {
    opt = '';
  }
  return `${text || ''} ${textEn || ''} ${opt}`;
}
function explBlob(ex, exEn, ext) {
  const fromJson = ext ? flattenJsonValues(ext) : '';
  return `${ex || ''} ${exEn || ''} ${fromJson}`;
}
function explanationCoverage(needleTokens, haystack) {
  if (needleTokens.size === 0) return 0;
  const h = getSignificantTokens(haystack);
  let inter = 0;
  for (const t of needleTokens) if (h.has(t)) inter++;
  return inter / needleTokens.size;
}

const SQL_BASE = `SELECT q.id AS id, q.test_id AS testId, q."order" AS "order", q.question_text AS text, 
  q.question_text_en AS textEn, q.options AS options, q.explanation AS ex, q.explanation_en AS exEn, q.extended_data AS ext,
  t.title AS ttitle, t.type AS ttype, t.slug AS slug, t.unit_id AS unitId, t.topic_id AS topicId,
  st.title AS topicTitle, st.title_en AS topicTitleEn
FROM questions q
INNER JOIN tests t ON q.test_id = t.id
LEFT JOIN syllabus_topics st ON t.topic_id = st.id
WHERE q.exam_type = 'mppsc' AND t.exam_type = 'mppsc' 
AND t.is_hidden = 0
AND t.type IN (${CORPUS_TYPES.map(() => '?').join(',')}) `;

function corpusExtraFilters() {
  if (!EXCLUDE_CORPUS_SLUG_LIKE) return { sql: '', args: [] };
  return { sql: ` AND IFNULL(t.slug, '') NOT LIKE ? `, args: [`%${EXCLUDE_CORPUS_SLUG_LIKE}%`] };
}

function rowFromRaw(r) {
  return {
    id: r.id,
    testId: r.testId,
    order: r.order,
    text: r.text,
    textEn: r.textEn,
    options: r.options,
    ex: r.ex,
    exEn: r.exEn,
    ext: r.ext,
    ttitle: r.ttitle,
    ttype: r.ttype,
    slug: r.slug,
    unitId: r.unitId,
    topicId: r.topicId,
    topicTitle: r.topicTitle,
    topicTitleEn: r.topicTitleEn,
  };
}

/** Human-readable test label: `syllabus_topics.title` for TOPIC tests, else `tests.title`. */
function displayTestLabel(row) {
  const tt = row.topicTitle && String(row.topicTitle).trim();
  if (row.ttype === 'TOPIC' && tt) {
    const u = row.unitId ? String(row.unitId).replace(/^unit_(\d+)$/i, 'Unit $1') : '';
    let line = u ? `${u} — ${tt}` : tt;
    const ten = row.topicTitleEn && String(row.topicTitleEn).trim();
    if (ten && ten.toLowerCase() !== tt.toLowerCase()) line += ` (${ten})`;
    return line;
  }
  return row.ttitle || '';
}

function openDataSource() {
  const useLocal = process.env.REPORT_USE_LOCAL_DB === '1' || process.env.REPORT_USE_LOCAL_DB === 'true';
  if (useLocal) {
    const fp = path.join(CWD, 'mppsc_local_dev.db');
    if (!existsSync(fp)) {
      throw new Error(
        `REPORT_USE_LOCAL_DB is set but file missing: ${fp}. Remove REPORT_USE_LOCAL_DB to use Turso, or add the local DB file.`,
      );
    }
    console.log('[report] using local SQLite (READ_ONLY):', fp);
    return { kind: 'file', db: new Database(fp, { readonly: true }) };
  }

  const url = process.env.TURSO_DATABASE_URL?.trim();
  const token = process.env.TURSO_AUTH_TOKEN?.trim();
  if (!url) {
    throw new Error(
      'Set TURSO_DATABASE_URL (and TURSO_AUTH_TOKEN) in .env.local for remote Turso read. ' +
        'For a local file instead, set REPORT_USE_LOCAL_DB=1.',
    );
  }
  if (!token) {
    throw new Error('TURSO_AUTH_TOKEN is required for Turso. Add it to .env.local (same as production).');
  }
  console.log('[report] using remote Turso (read-only) —', url.split('?')[0].slice(0, 48) + '…');
  return {
    kind: 'libsql',
    client: createClient({ url, authToken: token }),
  };
}

function runQuery(source, sql, args) {
  if (source.kind === 'file') {
    return source.db.prepare(sql).all(...args);
  }
  return source.client.execute({ sql, args });
}

function normalizeLibsqlResult(result) {
  if (Array.isArray(result?.rows) && result.rows.length && typeof result.rows[0] === 'object' && !Array.isArray(result.rows[0])) {
    return result.rows;
  }
  if (result?.columns && Array.isArray(result?.rows)) {
    const cols = result.columns;
    return result.rows.map((vals) => {
      const o = {};
      cols.forEach((c, i) => {
        o[c] = vals[i];
      });
      return o;
    });
  }
  return [];
}

async function fetchRows(source, sql, args) {
  if (source.kind === 'file') return runQuery(source, sql, args);
  const r = await runQuery(source, sql, args);
  return normalizeLibsqlResult(r);
}

async function main() {
  const source = openDataSource();
  const dataSource = source.kind === 'libsql' ? 'Turso (remote, read-only)' : 'local mppsc_local_dev.db';
  const tArgs = [...CORPUS_TYPES];

  const f = corpusExtraFilters();
  const targetSql = `${SQL_BASE} AND q.test_id = ? ORDER BY q."order"`;
  const corpusSql = `${SQL_BASE}${f.sql} AND q.test_id != ?`;

  const targetRaw = await fetchRows(source, targetSql, [...tArgs, TARGET_2026]);
  const corpusRaw = await fetchRows(source, corpusSql, [...tArgs, ...f.args, TARGET_2026]);

  const targetQs = targetRaw.map(rowFromRaw);
  const corpus = corpusRaw.map((r) => {
    const row = rowFromRaw(r);
    const stem = stemBlob(row.text, row.textEn, row.options);
    const expl = explBlob(row.ex, row.exEn, row.ext);
    const pyqYear = row.ttype === 'PYQ' ? (TEST_ID_TO_YEAR[row.testId] ?? getYearFromTestId(row.testId)) : null;
    return {
      id: row.id,
      testId: row.testId,
      testTitle: displayTestLabel(row),
      testTitleStore: row.ttitle,
      topicTitle: row.topicTitle,
      testType: row.ttype,
      slug: row.slug,
      order: row.order,
      stem,
      expl,
      stemT: getSignificantTokens(stem),
      pyqYear,
    };
  });

  if (targetQs.length === 0) {
    throw new Error(`No questions for 2026 test_id=${TARGET_2026}`);
  }

  const matches = [];
  for (const tq of targetQs) {
    const stem = stemBlob(tq.text, tq.textEn, tq.options);
    const stemT = getSignificantTokens(stem);
    let best = null;
    for (const c of corpus) {
      if (c.id === tq.id) continue;
      const j = jaccardText(stem, c.stem);
      const cov = explanationCoverage(stemT, c.expl);
      let refKind = 'none';
      if (j >= J_STEM_DUP) refKind = 'stem_strong';
      else if (j >= J_STEM_SIM) refKind = 'stem_medium';
      else if (cov >= EXPL_COVER) refKind = 'explanation_only';
      else continue;
      const score = j * 1.0 + cov * 0.35;
      const bestScore = best ? best.j * 1.0 + best.cov * 0.35 : -1;
      if (!best || score > bestScore) best = { row: c, j, cov, refKind };
      else if (Math.abs(score - bestScore) < 1e-6 && best && (j > best.j || (j === best.j && cov > best.cov))) {
        best = { row: c, j, cov, refKind };
      }
    }
    if (!best) {
      matches.push({ targetOrder: tq.order, targetQId: tq.id, kind: 'none', jStem: 0, explCover: 0, ref: null });
    } else {
      matches.push({
        targetOrder: tq.order,
        targetQId: tq.id,
        kind: best.refKind,
        jStem: best.j,
        explCover: best.cov,
        ref: best.row,
      });
    }
  }

  const withAny = matches.filter((m) => m.kind !== 'none');
  const byType = {};
  for (const m of withAny) {
    const t = m.ref?.testType || '—';
    byType[t] = (byType[t] || 0) + 1;
  }

  const date = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push(`# 2026 Prelims vs Zenscroll corpus — overlap report`);
  lines.push(`Generated: ${date}`);
  lines.push(`**Data source:** ${dataSource}`);
  if (EXCLUDE_CORPUS_SLUG_LIKE) {
    lines.push(
      `**Corpus filter:** tests with \`slug\` containing \`${EXCLUDE_CORPUS_SLUG_LIKE}\` are excluded (avoids matching 2026 paper to a duplicate upload). Override: \`REPORT_EXCLUDE_CORPUS_SLUG_LIKE=\`.`,
    );
  }
  lines.push(
    `**2026 test_id:** \`${TARGET_2026}\`  ·  **Corpus questions:** ${corpus.length} (MPPSC, visible, FLT/UNIT/CSAT/PYQ/TOPIC/MISC, 2026 paper excluded).`,
  );
  lines.push(``);
  lines.push(`## Methodology (short)`);
  lines.push(`- **stem_strong / stem_medium / explanation_only** — token Jaccard on question+options vs corpus question; or token recall of 2026 stem inside our explanations + expert JSON.`);
  lines.push(`- **Not a leak claim** — transparency on how much of your test series *overlaps* 2026 paper wording/concepts.`);
  lines.push(``);
  lines.push(`## Executive summary`);
  lines.push(
    `| Metric | Value |`,
  );
  lines.push(`|--------|--------|`);
  lines.push(`| 2026 questions in DB | ${targetQs.length} |`);
  lines.push(`| At least one match (any tier) | **${withAny.length}** |`);
  lines.push(`| No strong match in corpus | **${targetQs.length - withAny.length}** |`);
  lines.push(``);
  lines.push(`### Hits by our test \`type\``);
  for (const [k, v] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    lines.push(`- **${k}:** ${v}`);
  }
  lines.push(``);
  const noMatchRows = matches.filter((m) => m.kind === 'none');
  const noMatchOrders = noMatchRows.map((m) => m.targetOrder).join(', ');
  const splitLine = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${v}`)
    .join(' · ');
  lines.push(`## Telegram / channel (copy-paste, honest)`);
  lines.push(``);
  lines.push(
    `**Hinglish:** MPPSC Prelims 2026 ke **${targetQs.length}** prashno mein se **${withAny.length}** ke liye Zenscroll corpus (**${corpus.length}** questions) mein best match: similar stem ya explanation overlap. **${noMatchRows.length}** prashn (${noMatchOrders || '—'}) par is scan mein koi tier match nahi. Yeh **overlap** estimate hai, paper “copy” ka proof nahi.${EXCLUDE_CORPUS_SLUG_LIKE ? ' Duplicate 2026 upload (`' + EXCLUDE_CORPUS_SLUG_LIKE + '`) tests excluded.' : ''}`,
  );
  lines.push(``);
  lines.push(
    `**English one-liner:** Turso production (read-only). **${withAny.length}/${targetQs.length}** items matched; best-reference mix: **${splitLine}**.`,
  );
  lines.push(``);
  lines.push(`**App:** \`/tests/{slug}\` from table below.`);
  lines.push(``);
  lines.push(`## Full table: 2026 Q# → best reference in Zenscroll`);
  lines.push(
    `| 2026 Q# | kind | jStem | explCov | type | PYQ yr | Q# ref | Reference (name) | slug |`,
  );
  lines.push(`|--------|------|-------|---------|------|--------|--------|-------------|------|`);
  for (const m of [...matches].sort((a, b) => a.targetOrder - b.targetOrder)) {
    const r = m.ref;
    const short = r ? (r.testTitle.length > 44 ? r.testTitle.slice(0, 42) + '…' : r.testTitle) : '—';
    const y = r && r.testType === 'PYQ' && r.pyqYear != null ? String(r.pyqYear) : r && r.testType === 'PYQ' ? '?' : '—';
    lines.push(
      `| ${m.targetOrder} | ${m.kind} | ${m.jStem.toFixed(3)} | ${(m.explCover * 100).toFixed(1)}% | ${r?.testType ?? '—'} | ${y} | ${r?.order ?? '—'} | ${short} | \`${r?.slug ?? '—'}\` |`,
    );
  }
  lines.push(``);
  lines.push(`---`);
  lines.push(`*Report generated by \`node scripts/pyq-2026-corpus-overlap.mjs\`. JSON: \`reports/pyq-2026-corpus-overlap-${date}.json\`*`);

  const outDir = path.join(CWD, 'reports');
  mkdirSync(outDir, { recursive: true });
  const outMd = path.join(outDir, 'PYQ_2026_ZENSCROLL_OVERLAP_REPORT.md');
  const outMdDated = path.join(outDir, `pyq-2026-corpus-overlap-${date}.md`);
  const outJson = path.join(outDir, `pyq-2026-corpus-overlap-${date}.json`);
  const combined = lines.join('\n');
  writeFileSync(outMd, combined, 'utf8');
  writeFileSync(outMdDated, combined, 'utf8');
  const leanRow = (m) => ({
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
          testTitleStore: m.ref.testTitleStore,
          topicTitle: m.ref.topicTitle,
          testType: m.ref.testType,
          pyqYear: m.ref.pyqYear,
          questionOrder: m.ref.order,
          slug: m.ref.slug,
        }
      : null,
  });
  const payload = {
    dataSource: source.kind === 'libsql' ? 'turso' : 'local',
    excludeCorpusSlugLike: EXCLUDE_CORPUS_SLUG_LIKE || null,
    targetTestId: TARGET_2026,
    generated: date,
    targetQuestionCount: targetQs.length,
    corpusQuestionCount: corpus.length,
    thresholds: { jStemStrong: J_STEM_DUP, jStemSim: J_STEM_SIM, explCover: EXPL_COVER },
    summary: { matchedAtLeastOne: withAny.length, byTestType: byType },
    rows: matches.map(leanRow),
  };
  writeFileSync(outJson, JSON.stringify(payload, null, 2), 'utf8');
  writeFileSync(path.join(outDir, 'pyq-2026-corpus-overlap-latest.json'), JSON.stringify(payload, null, 2), 'utf8');
  if (source.kind === 'file') source.db.close();
  console.log(`OK: ${outMd} + ${outJson}`);
  console.log(`Match: ${withAny.length} / ${targetQs.length}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
