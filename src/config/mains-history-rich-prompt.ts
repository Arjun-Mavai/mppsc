import { MAINS_HISTORY_RICH_VERSION } from '@/lib/mains-history-rich-normalize';

/**
 * **LATEST** authoritative JSON contract for MPPSC Mains topic generation.
 * Aligns with `scratch/prompt-segregation-paper-1-3.txt` and `paper-4-6` demos (expert lens + bilingual rich keys).
 *
 * Saving: `adminApplyMainsContentJson` recognises this shape (`isHistoryRichPayload`) → `mains_content.rich_payload`.
 */
export const MAINS_HISTORY_RICH_OUTPUT_SPEC = `
--- LATEST — REQUIRED OUTPUT: EXPERT-RICH JSON (single object) ---
Authority order: (1) scratch module DEMO + lens above, (2) this key list. Do **NOT** emit legacy flat keys (\`concept_hi\`, \`expert_strategy_*\`, top-level flat \`model_answers\`).

Set "schema_version": "${MAINS_HISTORY_RICH_VERSION}" (exact string).

Optional meta:
- "expert_evaluator_lens_applied": short string naming the examiner mindset (mirror scratch header if useful).

Mandatory bilingual narrative blocks (mirror scratch property names — use BOTH _hi and _en suffixes everywhere below):
- **"syllabus_grasp_hi" / "_en" (lead block — do not bury it)** — 8–15 lines, MUST be 100% bullet points (start each with "- "). Deeply explain: (1) **What is this topic?** (Simple explanation), (2) **Why is it in the syllabus?** (The examiner's psychological intent), (3) **Syllabus Decoding & Exam Prediction:** What EXACTLY the student must study from this single line (kya-kya paper me aa sakta hai) — list these sub-topics as explicit numbered points (e.g., "- 1. ...\n- 2. ..."), (4) **In-scope vs out-of-scope** boundaries. No paragraphs allowed — bullets only for max readability.
- "pyq_trend_analysis_hi" / "_en" — how MPPSC typically frames THIS topic by marks (tie to stems if listed above; else hypothetical 'likely' wording, no fake years). **When no official PYQ stems were pasted in the prompt**, start each language block with ONE explicit label line exactly: "(MPPSC Mains · model/practice framing — not a verbatim past-year PYQ)" then continue with bullets only.
- "cognitive_intro_hi" / "_en" — sharp **mental model** opener: still "- " bullets only (4–8 lines). Play with student psychology — tell them exactly how to structure their thoughts in the exam hall. What separates an average student's intro from a Topper's intro? Explain how to sequence facts. Overlaps allowed with syllabus_grasp but must add **how to order** facts.
- "desi_analogy_hi" / "_en" — one strong India / exam-hall analogy per language (not cheesy).
- "authentic_source_citation_hi" / "_en" — one exam-safe authoritative anchor each (Acts, surveys, reputed bodies — no fabricated quotes).

Structured arrays/strings:
- "dynamic_dimensions_hi" / "_en" — array of { "dimension_name", "bullets": string[] }; minimum **3** objects per language, topic-appropriate headings. **CRITICAL REQUIREMENT:** For History (Papers 1, 2, 3) or any timeline-based topic, at least ONE dimension MUST be a strict "Chronological / Phase-wise Breakdown" (कालक्रम / प्रमुख चरण) detailing exactly what happened in which phase, who were the key personalities (kon-kon tha), and the point-wise sequence of events.
- **Interlinking (both languages)** — Prefer **JSON arrays** under "interlinking_dots_*" OR "multidimensional_interlinking_*" (either key is OK):
  - **Option A — array of strings** (easiest): 6–12 items like "- ↔ Geography: …" already embedded OR plain lines we can bullet.
  - **Option B — array of objects**: { "to": "Paper II Polity — Local govt", "bullet": "Panchayat ↔ this topic because …" } with **truthful** links only.
  Plain multi-line prose is allowed as fallback only if arrays are inconvenient — still MUST be one idea per "- " line, never one dense paragraph.
- "psychological_memory_hook_hi" / "_en"
- "visual_infographic_cue_hi" / "_en" — hall-ready diagram / map / matrix cue.
- "examiner_trap_hi" / "_en"
- "topper_x_factor_hi" / "_en" — MUST include a concrete "hands-on" proof or example (e.g., "औसत छात्र लिखेगा X, लेकिन टॉपर लिखेगा Y" or a specific diagram layout/catchy phrase). PROVE how to implement it in the exam sheet to gain an extra +1 mark. Make it extremely practical and demonstrable.

Model answers — **strictly bilingual**: you MUST fill **both** "model_answers_hi" **and** "model_answers_en" for the same mark keys (2m/7m/10m/11m/case18). Hindi block = authentic Hindi stems + Hindi "- " bullets; English block = authentic English stems + English bullets — **not** lazy word-for-word translation; same facts, natural wording in each language. 
EXCEPTION: For Papers 5 and 6, the test is Pure Hindi. Therefore, you MUST set ALL \`_en\` keys (including \`model_answers_en\`, \`syllabus_grasp_en\`, etc.) to \`null\` or empty arrays. Write the pure Hindi content ONLY in the \`_hi\` keys.

Shape (each language block mirrors the other in **structure** — same number of variants per band):
{ "2m": [{"stem":"full question in THIS language","text":"- ..."}], "7m": [...], "10m": [...], "11m": [...], "case18": [...] }

**Every object MUST include "stem" + "text".** stem language = parent block language (HI → Hindi question, EN → English question).

**Inside every model-answer "text" field (mandatory formatting — matches student PYQ desk UI):**
- Use **vertical points only**: each non-empty line starts with hyphen + space "- " (hyphen then space). (EXCEPTION: For Paper 6 Essays, you may use standard paragraphs without the \`- \` prefix).
- **Tables for Difference Questions:** If the question explicitly asks for "Difference between X and Y" (अंतर स्पष्ट करें), you MUST use a Markdown table format. Example: \`| बिंदु | विषय A | विषय B |\\n|---|---|---|\`. You can skip the \`- \` prefix for table lines, the UI will parse them as tables.
- **Quotes & Case References:** For powerful quotes, article names, or case study references (especially in Essays and Ethics), use a Markdown Blockquote (\`> \`). Example: \`> "Quote text here"\`. This will render with a beautiful visual highlight in the UI. You can skip the \`- \` prefix for blockquotes.
- Use **"## Short section title"** lines for 7m/10m/11m/case18 whenever you switch theme (e.g. context → features → significance). For **2m**, still use "- " only unless a single "##" improves two micro-clusters.
- For **inline subsection labels** inside a bullet, prefer **"- **Label:** fact…"** OR **"- Label: fact…"** (short Label before colon) so the UI can emphasise headings like tooling/technique lines.
- Stay within mark word budgets; prefer **many short bullets** over a few heavy paragraphs.

**Breadth:** If TOPIC LINE is compound (many commas / “and” chains / roughly 100+ English characters spanning multiple eras or domains), widen coverage with **extra crisp bullets** (not longer sentences). Student must still skim in under a few minutes.

**Third variant (optional):** Only when breadth is clearly high, you MAY add **a third object** inside **7m** and/or **10m** arrays (distinct angle — e.g. MP tilt vs all-India institutional vs analytic timeline). Never add a third 2m row. If two variants suffice, omit the third (keep arrays to two entries).

Mark discipline (mirror MPPSC notification; fill unused keys as [] arrays):
- **Papers I–III:** at least **two** DISTINCT variants each for **2m**, **7m**, **10m** in BOTH model_answers_hi and model_answers_en — counts must match (e.g. two 7m Hindi + two 7m English). Optional **third** 7m/10m only per breadth rule above. Set "11m" and "case18" to [] unless a rare ethics tangent truly fits Paper III.
- **Paper IV:** at least TWO **11m** variants; **case18**: one full mini-case ONLY if the syllabus line suits stakeholder ethics — else [].
- **Papers V–VI (Hindi + Essay):** model_answers_hi MUST include strong Pure Hindi-ready samples. You MUST leave model_answers_en completely empty ([]) or null, as English is strictly prohibited. Add longer Hindi practice in **7m**/ **10m** / optional **11m** as the topic warrants.

Flash terms — UI parses **key_terms_cards_\*** arrays as strict JSON — valid JSON only (double quotes on keys/strings, commas between objects, **no trailing comma**, UTF-8).
- **REQUIRED:** "key_terms_cards_hi" AND "key_terms_cards_en" — each exactly **12–22** objects of this shape (keys as written):
  {\"emoji\":\"📜\",\"term\":\"…\",\"hint\":\"…\"}
  - **emoji** — one symbol per card (exam-relevant catalogue: 📜🗺️🏛️⚖️📊🧭 etc.), not spam.
  - **term** — **2–5 words**, scan-friendly headline (not a full sentence).
  - **hint** — **15–35 words**. Must be highly valuable and structured. If explaining multiple aspects or facts, use newline bullet points (\`\\n- \`) INSIDE the string so it renders as a proper list in the UI. The student should gain immense value from this flashcard (e.g. real meaning, practical use, or core data).
  - **_hi cards:** बोलचाल की नैचुरल Hindi — ज़्यादा शुद्ध संस्कृत/किशोर शास्त्रीय घिसी पट्टी नहीं; छात्र असल में बोलते वैसे शब्द (जरूर हो तो कानून/नीति का आधिकारिक शब्द रखें)। Short labels that sit well on flash cards — avoid stiff exam-paper Sanskritisation for every term.
  - **_en cards:** **plain**, simple sentences — vocabulary a serious MPPSC Hindi‑medium aspirant comfortably reads (no GRE / rare Latinate fluff). Short words over fancy synonyms. Anglo‑Indian examiner register is OK; jargon only when standard (e.g. Article, Schedule, CPI).
  - Cards in HI and EN are **independent** (not lazy translation pairs) but should cover comparable **ideas** across the topic.
- **Forbidden:** dumping all hints in **one JSON string**, markdown fences wrapping the arrays, ellipsis-only hints, duplicated identical term rows.
- **Parallel:** mirror as "key_terms_hi" / "key_terms_en" newline bullets (pattern: "- **Emoji Term**: hint (use nested \`  - \` for sub-points if needed)") where possible so search/admin fallbacks stay populated — server may also derive strings from arrays.

STYLE
Bullets-first everywhere (conceptual blocks too where the schema allows bullets), examiner-grade, bilingual independence (not lazy translation). Emoji: at most **one purposeful emoji per subsection title** — no spam.
`.trim();

/** Alias for imports that referred to \"expert\" naming in earlier iterations. */
export const MAINS_EXPERT_RICH_OUTPUT_SPEC = MAINS_HISTORY_RICH_OUTPUT_SPEC;
