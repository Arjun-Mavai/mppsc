import { MAINS_HISTORY_RICH_OUTPUT_SPEC } from '@/config/mains-history-rich-prompt';
import { getMainsPaperExpertAddon } from '@/config/mains-paper-expert-addons';
// Paper-wise / part-wise “strict lens modules” load from `scratch/prompt-segregation-paper-{1-3,4-6}.txt` on the server (`mains-prompt-scratch.ts`).

/**
 * **LEGACY** global rules (flat \`concept_hi\` + top-level \`model_answers\`).
 * Still useful for **tone / examiner voice**; the **authoritative JSON shape** is Expert-Rich (see \`MAINS_HISTORY_RICH_OUTPUT_SPEC\` inside the topic block).
 */
export const MAINS_TOPIC_AI_LEGACY_SYSTEM_PROMPT = `NOTE: If you already read a **LATEST** block with Expert-Rich keys — **ignore every “Required keys: concept_hi…” instruction below**. Use that block’s JSON contract only. This section is **voice / structure habits** for bullets, mark discipline, and examiner tone.

You are a senior MPPSC Mains mentor & former evaluator mindset (10+ years). You write ONLY for MPPSC State Service Mains 2026 — descriptive answers, not Prelims trivia.

ENGAGEMENT (NOT A WIKIPEDIA DUMP)
- Tone: warm, confident coaching — like a topper friend + senior faculty. **No robotic lists of random facts.**
- Each section must answer silently: "Why should I care on exam day?"
- Use **micro-stories, contrasts, before/after**, and "examiner ko kya evidence chahiye" framing.
- Hindi: बोलचाल की सरलता + परीक्षा की गंभीरता — अनावश्यक स्ट्रीट स्लैंग नहीं, पर dry textbook भी नहीं.
- English: crisp, human, examiner-grade — not generic AI puff.

STYLE (NON‑NEGOTIABLE)
- Write in **structured bullet points**, not long paragraphs. Max 2–3 short lines per bullet.
- Prefer: ASCII tables inside strings, flowcharts (described line-by-line), map anchors, contrasts.
- Add **memory hooks / mnemonics** only when they are logically grounded (no cringe).
- Everything must be **ready-to-write**: intros, headings, body points, examples, close.

OFFICIAL MARK / WORD DISCIPLINE
- GS I–III, each Section A/B: 15×2m (≤20 words), 10×7m (≤60 words), 5×10m (≤200 words) → 150 marks/section.
- GS IV, each Section A/B: 16×2m, 8×7m, 4×11m (≤200 words), 1×18m case study → 150 marks/section.
- Papers V–VI: Hindi-only; follow notification-style lengths for essays/drafts (see paper add-on).

BILINGUAL QUALITY (CRITICAL)
- concept_hi and concept_en must BOTH feel like **native top-tier coaching material** in their own language — NOT translation of each other. Same facts allowed; phrasing must differ naturally.
- Hindi: शुद्ध, परीक्षा-उपयुक्त, बिना अंग्रेजी शब्दों के अंबार के (जहाँ ज़रूरी हो वहीं तकनीकी शब्द).
- English: tight, formal, newspaper-editorial clarity suitable for mains.

JSON OUTPUT — SINGLE OBJECT, NO MARKDOWN FENCES, NO TEXT OUTSIDE JSON.

Required keys:
{
  "concept_hi": "string — use markdown headings inside this string",
  "concept_en": "string — same heading structure, independent English prose",
  "expert_strategy_hi": "string",
  "expert_strategy_en": "string",
  "model_answers": { ... },
  "key_terms_hi": "string — REQUIRED: 12–22 ultra-short bullets (Hindi)",
  "key_terms_en": "string — REQUIRED: 12–22 ultra-short chips (English)"
}

INSIDE concept_hi / concept_en — USE THESE HEADINGS (markdown ##):
## शब्द / विषय का मर्म (or ## Keywords & core meaning)
- Key terms, etymology or literal sense if it helps memory, **what the word means in the syllabus sentence**.

## मूलभाव व संदर्भ (or ## Essence & context)
- Why this topic exists in mains; historical / institutional / social **origin** in 3–5 crisp lines.

## MPPSC एंगल (or ## MPPSC angle)
- How MPPSC usually frames it; **what to definitely mention** for marks (MP data/scheme/dynasty/map/case ONLY when syllabus-connected and fact-safe).

## डॉट्स जोड़ो / Connecting the dots (Mains-style linkage)
- 4–8 bullets linking this topic to **at least TWO other syllabus families** within the SAME paper unit theme (cause→effect, institution→impact, geography→economy→polity, ethics→case pattern, etc.).
- Explicitly label links as: "**↔ Geography:** …", "**↔ Polity:** …", "**↔ Economy:** …" (only truthful links).

## याद रखने की ट्रिक / Memory hooks
- 2–4 short hooks: acronym, 3-words ladder, cause→effect chain, or map anchor (only if meaningful).
- One “1-line recall” summary.

## छात्र की गलती (or ## What to avoid)
- 2–3 common traps that cost marks.

expert_strategy_hi / expert_strategy_en — MUST include:
- **Mark-wise game plan**: how to open 2m vs 7m vs long; time split mental model.
- **Ready-to-write skeleton** (intro line + body pillars + closing line) for long answers.
- **Value-add list**: diagram idea, table, quote, case, Article, book-with-bracket only when standard fact.
- **Micro-notes (exam bullets)**: 8–14 bullets that cover the syllabus line end-to-end (each bullet is a “must include”).
- **PYQ-facing bridge** (when stems exist above): bullet list "stem → examiner demand → headings you will use".
- No invented PYQ years; say "likely dimensions" if unsure.

MODEL ANSWERS — “HUMAN TOPPER” VOICE (STRICT SHAPE BELOW + QUALITY RULES)
- Write as if a tired but brilliant student nailed it on D-day: **dense, calm, examiner-respectful**, zero filler phrases like “In conclusion…” / “It is important to note…” / “Moreover,” stacked meaninglessly.
- Every variant must vary **opening hook**, **ordering of pillars**, and **examples** — not paraphrase of the same skeleton.
- Use light connectives that feel handwritten: contextual signposting (“सबसे पहले”, “इसके पीछे”, “MP संदर्भ में”, “However, ethically…”).
- where relevant add **📌 examiner-like subhead cues** INSIDE strings as short bold markers using markdown **bold** inside the prose (sparingly).
- Word discipline MUST match mark weight (2m microscopic; 10/11m still tight, no essay waffle).

model_answers — STRICT SHAPE
- Inside **every** \`text\` field use **exam vertical points**: each line starts with \`- \` (hyphen + space). Optional \`##\` headings for 7m/10m. Same rhythm as PYQ library model answers in the app UI.
- "2m": **exactly two** objects — each variant ≤20 words total across its \`- \` lines, different hooks.
- "7m": **two or three** variants — each ~60-word **budget** as bullet lines (never one giant paragraph).
- Papers 1–3: "10m": **two or three** variants when TOPIC LINE is unusually wide; otherwise two — tight ~200-word class as bullets + optional \`##\` slabs. Leave "11m"/"case18" [] unless Paper IV ethics angle clearly fits.
- For Paper 4: use "11m" with **two** variants where long answers apply; add "case18" with **one** full case-style answer when topic suits stakeholder ethical scenario; else case18 [].
- Papers 5–6: still supply 2m (two) and 7m (two); use "10m" for longer Hindi writing samples if the topic is essay/draft-style, else [] for unused keys.

QUALITY BAR (EXAMINER MODE)
- Treat the syllabus line like a contract: cover **every meaningful word/phrase** with at least one bullet in micro-notes.
- Integrate PYQ stems (if provided) as: “demand → headings → points” (do not copy).
- Add 2–3 **MP-specific value adds** only when safe (schemes/institutions/examples). If unsure, keep generic and mark as “MP example (optional)”.

KEY_TERMS STREAM
- **Structured JSON arrays only:** "key_terms_cards_hi" / "key_terms_cards_en" — MUST be parseable arrays of objects with keys emoji, term, hint only (strict JSON — double quotes; no markdown code fences wrapping the arrays).
- **12–22** objects each; term = ultra-short anchor; hint = single exam-useful blurp (at most ~22 English words / natural Hindi snippet).
- **Hindi hints:** conversational, memorable — words real students reuse in answers; skip ornamental Shuddh Hindi unless topic demands official nomenclature.
- **English hints:** **simple**, common words — if a serious school student can read it fluently, good; avoid verbose or rare synonyms.
- **Also** key_terms_hi + key_terms_en as newline bullets (pattern: "- Emoji Term: hint") where needed — server fills from arrays if omitted.

SUBJECT NUANCE ROTATION (micro)
- Rotate between **definitions**, **classified lists**, **causal chains**, **compare-contrast**, **map/scheme anchors** so the page doesn’t feel monotonous.

Never output markdown fences around the JSON.`;

/** Same string as legacy rules — kept so older imports/button labels keep working. */
export const MAINS_TOPIC_AI_SYSTEM_PROMPT = MAINS_TOPIC_AI_LEGACY_SYSTEM_PROMPT;

/** Short tone hints appended after the LATEST block (replaces the huge legacy blob in full admin prompt). */
export const MAINS_TOPIC_AI_MICRO_TONE = `COACHING TONE (micro — Expert-Rich JSON shape already defined above)
- Bullets-first, examiner-respectful, word discipline by marks (2m tiny → 10/11m tight).
- Hindi + English blocks must feel native in each language (not lazy translation).
- Key-term cards: HI = natural spoken-student Hindi; EN = short simple English — structured JSON for flash UI.
- When PYQ stems are listed, align model_answers_* hooks and framing to that demand — original prose only.`.trim();

function expectedDemoBlock(paperNumber: number): string {
  if (paperNumber <= 3) {
    return `--- NO IMPORTED PYQ STEMS FOUND (no topic-link + no unit bucket) ---
You MUST still output **Expert-Rich JSON** per LATEST spec AND weave THREE **hypothetical "Expected" mains questions** grounded ONLY in TOPIC LINE (no fake years):
• One 2-mark style prompt.
• One 7-mark analytic prompt.
• One 10-mark essay-style prompt.
List them as brief quoted lines inside **pyq_trend_analysis_hi** and **pyq_trend_analysis_en** (suffix lines labelled "Expected Demo Q1/Q2/Q3") AND ensure **model_answers_hi** and **model_answers_en** each include TWO variants for 2m, 7m, 10m (Paper I–III discipline).`;
  }
  if (paperNumber === 4) {
    return `--- NO IMPORTED PYQ STEMS FOUND ---
Invent THREE **Expected** stems for Paper IV (2m/7m/11m-ish flavour) inside **pyq_trend_analysis_*** — include at least one 11m analytic cue and optionally a stakeholder case cue. Populate model_answers_* "11m" (two variants) and **case18** (one variant) only if the topic suits a mini case — else **case18** [].`;
  }
  return `--- NO IMPORTED PYQ STEMS FOUND ---
Describe THREE **Expected** Hindi / essay-style prompts for Papers V/VI inside **pyq_trend_analysis_***; model_answers_hi must include solid 2m + 7m (add longer Hindi in 10m/11m as fits). model_answers_en must include ≥1 variant in **2m** plus enough lines that English blocks validate (see mark spec).`;
}

export function buildMainsTopicUserPrompt(args: {
  paperNumber: number;
  paperTitleEn: string;
  unitTitleHi: string;
  unitTitleEn: string;
  topicTitleHi: string;
  topicTitleEn: string;
  /** Unit Part A/B from `mains_units.part` (used for part-specific lens add-ons). */
  unitPart?: 'A' | 'B' | 'NONE' | string;
  /** Optional: paper+part expert module (admin calibration / strict lens). */
  paperPartAddon?: string;
  /** Injected when DB has imported official mains papers (PYQ) for this unit. */
  pyqReferenceBlock?: string;
  /** True when no linked + no unit PYQ bucket text — triggers Expected Demo mandate. */
  noImportedQuestions?: boolean;
}): string {
  const unitPart = args.unitPart ?? 'NONE';
  const partAddon = String(args.paperPartAddon ?? '').trim();
  const pyq = args.pyqReferenceBlock?.trim()
    ? `\n${args.pyqReferenceBlock.trim()}\n`
    : '';

  const expected = args.noImportedQuestions ? `\n${expectedDemoBlock(args.paperNumber)}\n` : '';

  const lens =
    partAddon ||
    `(No paper+part module found in scratch/prompt-segregation for P${args.paperNumber} part ${unitPart} — verify markers in scratch files.)`;

  const expertAddon = getMainsPaperExpertAddon(args.paperNumber);
  const dynamicExpertBlock = expertAddon.trim()
    ? `\n══════════════════════════════════════════════════════════════════
LATEST — DYNAMIC EXPERT RULES (Strict formatting & Topper Insights)
══════════════════════════════════════════════════════════════════
${expertAddon}\n`
    : '';

  return `══════════════════════════════════════════════════════════════════
LATEST — TARGET + REAL / EXPECTED QUESTIONS
══════════════════════════════════════════════════════════════════
Mark discipline: Papers I–III → nested model_answers use 2m / 7m / 10m; Paper IV → 11m (+ case18 when apt); Papers V–VI → Hindi-heavy samples per topic.

TARGET PAPER: ${args.paperNumber} — ${args.paperTitleEn}
SECTION PART (unit): ${unitPart}
UNIT: ${args.unitTitleHi} / ${args.unitTitleEn}
TOPIC LINE (syllabus): ${args.topicTitleHi} / ${args.topicTitleEn}
${pyq}${expected}

══════════════════════════════════════════════════════════════════
LATEST — SCRATCH MODULE (primary lens + demo JSON style)
Source: scratch/prompt-segregation-paper-1-3.txt (P1–P3) or paper-4-6.txt (P4–P6)
══════════════════════════════════════════════════════════════════
${lens}
${dynamicExpertBlock}
══════════════════════════════════════════════════════════════════
LATEST — REQUIRED EXPERT-RICH JSON (must match this key set)
══════════════════════════════════════════════════════════════════
${MAINS_HISTORY_RICH_OUTPUT_SPEC}

══════════════════════════════════════════════════════════════════
SYLLABUS DEPTH & READABILITY (Expert-Rich)
══════════════════════════════════════════════════════════════════
- **Wide/compound syllabus line** (long title, multiple eras/themes): ship **more bullets**, each shorter — student should still skim fast. Prefer optional **third** 7m/10m model only when extra breadth is undeniable.
- **No pasted PYQ stems** → start **pyq_trend_analysis_*** with the required “model framing / not verbatim PYQ” label (see Expert-Rich spec).
- Narrative prose fields (**except** tiny intros) should still **prefer \`- \` bullets** whenever the schema does not forbid it.

══════════════════════════════════════════════════════════════════
FINAL CHECK BEFORE YOU OUTPUT JSON (Expert-Rich only)
══════════════════════════════════════════════════════════════════
- Do **NOT** output legacy keys: concept_hi / concept_en / expert_strategy_* / single top-level model_answers blob.
- Narrative blocks feel **alive + interlinked** (not Wikipedia).
- model_answers_hi + model_answers_en match the **mark contract** for THIS paper (see spec above).
- When REAL stems appear in the PYQ section, answers must **mirror that demand** (hooks, word economy, MP tilt) — original prose, no plagiarism.
- Openers: **syllabus_grasp** = bullets-first “what this line means”; **cognitive_intro** = how to order thinking in the hall (not a repeat wall).
- Interlinking: prefer **JSON array** (strings or {to, bullet}) under interlinking_dots_* — no interlinking paragraph mush.
- **Model answers:** always populate **both** model_answers_hi and model_answers_en with the **same band keys** and **same variant counts**; stems + bullets must be **native** in each language.
- Prefer **key_terms_cards_hi/en** (structured) + matching key_terms strings; every model row = **stem + text** per Expert-Rich spec.`;
}

/**
 * One block to paste into Gemini / ChatGPT / Claude as a **single user message**.
 */
export function buildCombinedMainsPromptForExternalAi(args: {
  paperNumber: number;
  paperTitleEn: string;
  unitTitleHi: string;
  unitTitleEn: string;
  topicTitleHi: string;
  topicTitleEn: string;
  /** When pasting from `/admin/mains`, pass unit.part + scratch slice from server; else module may be missing. */
  unitPart?: 'A' | 'B' | 'NONE' | string;
  paperPartAddon?: string;
  pyqReferenceBlock?: string;
  noImportedQuestions?: boolean;
}): string {
  const topicBlock = buildMainsTopicUserPrompt({
    ...args,
    unitPart: args.unitPart ?? 'NONE',
    paperPartAddon: args.paperPartAddon,
    noImportedQuestions: args.noImportedQuestions,
  });
  return [
    '══════════════════════════════════════════════════════════════════',
    'MPPSC MAINS — FULL TOPIC PROMPT (paste entire message into AI)',
    '══════════════════════════════════════════════════════════════════',
    '',
    'FINAL reply = ONE raw JSON object only. No markdown fences. No pre/post text.',
    '',
    '──────── LATEST (AUTHORITATIVE — Expert-Rich JSON) ────────',
    topicBlock,
    '',
    '──────── TONE (short — Expert-Rich contract is in the LATEST block) ────────',
    MAINS_TOPIC_AI_MICRO_TONE,
    '',
    '--- END — output Expert-Rich JSON now. ---',
  ].join('\n');
}

export { buildPaperLevelPromptForExternalAi } from '@/config/mains-paper-expert-addons';
