import { loadMainsScratchPromptFiles, mainsPartAddonFromScratch } from '@/lib/mains-prompt-scratch';
import { getMainsPaperExpertAddon } from '@/config/mains-paper-expert-addons';

export type PyqBatchQuestion = {
  id: string;
  part: string;
  unitNumber: number;
  questionNumber: string;
  marks: number;
  questionType: string;
  questionHi: string;
  questionEn: string | null;
};

const MARK_POINT_PRESENTATION = (isEssay: boolean) => `
POINT-FIRST PRESENTATION (mandatory — students read in our UI as fast-scan bullets)
- **Every** model answer (**answer_hi** and **answer_en**) MUST be written as **vertical points**: each non-empty line starts with **"- "** (hyphen + space). No free-flow paragraphs; no essay blocks.${isEssay ? ' (EXCEPTION: For Paper 6 Essays, you may use standard paragraphs without the `- ` prefix.)' : ''}
- Let **m** = marks from the stem line in this batch. Choose density by **m** (some papers/years use **5** or **11** instead of 7 or 10 — follow the **actual m** printed):
  • **m = 2** (~≤20 words total per variant): **2–4 bullets** only; each bullet **≤12 words**; ultra-tight “examiner hook” feel; **zero** long sentences.
  • **m = 5** (short): **4–6 bullets**; ~35–45 words total; each bullet one crisp fact or judgement.
  • **m = 7** (~≤60-word class): **5–8 bullets**; still one idea per line; micro-structure allowed via bullet order (definition → dimensions → MP/example → limit).
  • **m = 10 or 11** (long): **8–14 bullets**; optional grouping with a line **## …** section heading **or** a bullet starting with **bold** mini-label using **…** inside that bullet only.
  • **m = 18** (case / ethics-style when applicable): numbered phases OK as lines like **"- Phase 1: …"** still using "- " prefix for main lines.
- **Bold** only for 3–6 word labels inside a bullet (**…**), never whole paragraphs.
- Same point layout rules for **both** variants; variants differ by **angle / ordering / example**, not by turning bullets into prose.
`.trim();

const SUBJECT_LENS = `
CROSS-PAPER DISCIPLINE (infer from unit / stem — apply what fits; never invent facts)
- History / culture / medieval / ancient: weave **political–administrative, socio-religious, economic (agrarian, trade, revenue), architectural & urban form, cultural production (language, art, syncretism)** only when syllabus-linked and exam-safe.
- Geography / environment: **physical basis → human response → regional variation → MP link if honest** (relief, climate, drainage, resources, hazards, planning tools); maps & directional anchors in prose (no fake coordinates).
- Polity / governance: **constitutional–institutional–federal–MP local self-gov** chain; avoid partisan rhetoric.
- Economy / planning: **concept → mechanism → outcome → MP/state scheme only when standard**; data only if widely cited / NCERT-class safe.
- Ethics / philosophy (Paper IV): **stakeholders → values → framework → proportionate action → precedent/classification**; case hooks only as generic patterns.
- Science–tech / MP-specific themes: **definition → Indian/MP context → limitation → way forward**; no speculative “reports”.
`.trim();

/**
 * One AI user message: batch of official stems → JSON with 2 variants per stem (HI + EN) + optional expert insights per stem.
 * Paper/part “expert lens” slices come from `scratch/prompt-segregation-paper-*.txt` (same modules as /mains topic AI).
 */
export function buildPyqAnswersBatchUserPrompt(args: {
  paperNumber: number;
  examYear: number;
  examLabel: string | null;
  questions: PyqBatchQuestion[];
}): string {
  const { scratch13, scratch46 } = loadMainsScratchPromptFiles();
  const partsInBatch = [...new Set(args.questions.map((q) => String(q.part).toUpperCase()))];
  const lensBlocks: string[] = [];
  for (const p of partsInBatch) {
    const slice = mainsPartAddonFromScratch(scratch13, scratch46, args.paperNumber, p);
    if (slice.trim()) {
      lensBlocks.push(
        `\n========== PAPER ${args.paperNumber} PART ${p} — EXPERT MODULE (scratch file; authoritative voice for this part) ==========\n${slice}\n`
      );
    }
  }

  const expertAddon = getMainsPaperExpertAddon(args.paperNumber);
  if (expertAddon.trim()) {
    lensBlocks.push(
      `\n========== PAPER ${args.paperNumber} — DYNAMIC EXPERT RULES ==========\n${expertAddon}\n`
    );
  }

  const stems = args.questions
    .map(
      (q, i) =>
        `### Q${i + 1} [id=${q.id}]\n- ${q.marks} marks · Part ${q.part} · Unit ${q.unitNumber} · ${q.questionType}\n- HI: ${q.questionHi}\n- EN: ${q.questionEn ?? '(none)'}\n`
    )
    .join('\n');

  const isPureHindi = args.paperNumber === 5 || args.paperNumber === 6;
  const isEssay = args.paperNumber === 6;

  return `You are an MPPSC Mains selected-expert (top 0.1% answer quality). Output ONE raw JSON object only — no markdown fences, no commentary outside JSON.

EXAM: ${args.examYear} ${args.examLabel ?? 'MPPSC Mains'} · PAPER ${args.paperNumber}

${MARK_POINT_PRESENTATION(isEssay)}

${SUBJECT_LENS}

${lensBlocks.join('\n')}

STEMS IN THIS BATCH (${args.questions.length}):
${stems}

--- REQUIRED JSON SHAPE (strict) ---
{
  "schema_version": "mains_pyq_answers_batch_v2",
  "paper_number": ${args.paperNumber},
  "exam_year": ${args.examYear},
  "items": [
    {
      "question_id": "<exact id from [id=…] above>",
      "marks": <number>,
      "expert_insights_hi": "<long structured Hindi — see EXPERT INSIGHTS CONTRACT below>",
      "expert_insights_en": ${isPureHindi ? "null" : '"<same strategic depth in independent English — NOT translation>"'},
      "variants": [
        {
          "variant_slot": 1,
          "style_label_hi": "2–6 शब्द · शुद्ध Hindi · same strategic angle · NOT transliteration-only",
          "style_label_en": ${isPureHindi ? "null" : '"2–6 words English — examiner-style angle chip (e.g. definition-first)"'},
          "answer_hi": "ready-to-write Hindi answer string",
          "answer_en": ${isPureHindi ? "null" : '"ready-to-write English answer string"'}
        },
        {
          "variant_slot": 2,
          "style_label_hi": "same idea in independent Hindi wording",
          "style_label_en": ${isPureHindi ? "null" : '"different English angle chip"'},
          "answer_hi": "…",
          "answer_en": ${isPureHindi ? "null" : '"…"'}
        }
      ]
    }
  ]
}

EXPERT INSIGHTS CONTRACT (both languages — readable coaching; ~1000–2600 characters each language typical)
Goal: student should feel guided (not lectured), grasp the play quickly, and trust the structure. **Plain, human language first** — simple words, short lines, natural rhythm — yet every line should still sound mains-ready and professional (no slang, no fluff).

Format for **expert_insights_en** and **expert_insights_hi** (inside the JSON string — still no raw ASCII " in values):
- Use ONLY **##** (level-2) headings — **exactly nine, in this fixed order**, emoji + title. English insights use the EN title line; Hindi insights use the HI title line.

**EN heading lines (copy numbering + emoji; after the title you may shorten in body only, not the heading line):**
## 1 🔍 Stem decoding
## 2 🧩 Pattern recognition
## 3 🏗️ Answer skeleton
## 4 ✅ Intro · body · closure checklist
## 5 📚 Sources & evidence mindset
## 6 📍 MP lens (only if honest)
## 7 ⏱️ Word limit trade-offs
## 8 ✨ Value‑add toolbox
## 9 📖 Topic reading map

**HI heading lines (same numbering/emojis — Hindi titles):**
## 1 🔍 प्रश्न की धुरी क्या है
## 2 🧩 पैटर्न और घुमाव
## 3 🏗️ उत्तर की रूपरेखा
## 4 ✅ भूमिका · मुख्य बिंदु · अंत — चेकलिस्ट
## 5 📚 साक्ष्य और स्रोत की सोच
## 6 📍 मध्यप्रदেশ कोण ‑ केवल सटीक
## 7 ⏱️ शब्द सीमा — क्या छूटे, क्या नहीं
## 8 ✨ वैल्यू‑ऐड औज़ार
## 9 📖 आगे क्या पढ़ें

Under EACH of the nine sections you MUST deliver:
1) **2–4 bullets** starting with **"- "** (easily scannable — our UI renders them softly like tiles).
2) **Mandatory mini-examples**: in every section include at least one bullet whose text starts with **- Example:** (English) or **- उदाहरण:** (Hindi) — that prefix must be exact — then one ultra-short examiner-style illustration (one clause or single sentence max) showing *how that idea shows up on paper for THIS stem’s marks—not abstract theory*.
3) No walls of prose between headings; paragraphs only if unavoidable and ≤ 2 sentences.
4) **Tone**: sound like someone who cracked mains explaining at chai speed — warmth, clarity, zero intimidation jargon; no fake report names/data (see RULES).

LANGUAGE QUALITY (non‑negotiable)
- **Hindi**: शुद्ध, परीक्षा-उपयुक्त, प्राकृतिक बोलचाल से मिलता प्रवाह — **not** English-to-Hindi calque of the EN insight file; वही रणनीति, स्वाभाविक Hindi.
${isPureHindi ? '- **English**: STRICTLY PROHIBITED. All `_en` keys must be null. Do not use English anywhere.' : '- **English**: warm, examiner-sharp; short sentences where possible — still paper-quality.'}
- Model answers (**answer_hi / answer_en**): **ONLY "- " lines** as per MARK_POINT_PRESENTATION; use **double asterisks** only for 3–6 word labels inside a bullet (UI renders bold — no stray single asterisks).

VARIANT STYLE LABELS (for student UI beside “Variant 1/2”; required per variant)
- **style_label_hi** — short Hindi angle (exam register); natively written; parallels the English label’s meaning.
- **style_label_en** — short English angle; tight editorial chip.
- **Legacy**: **style_label** alone is treated as English (same semantic as style_label_en) when newer keys absent.

MARK / LENGTH DISCIPLINE
- Obey **MARK_POINT_PRESENTATION** first; then match word economy to **m** (2m micro ≈20 words; 5m short; 7m ~60-word class; 10/11m long bullet grids; 18m case-style where relevant).
- **Exactly 2 variants** per question; **variant_slot** must be 1 and 2.
- **question_id** must match the batch list exactly (for admin paste).

RULES
- **Valid JSON (critical)**: Never put raw ASCII double-quote marks inside answer_* or expert_insights_* JSON string values (breaks parsers). Prefer single-quoted glosses (e.g. 'Evaluate' as plain text), **bold markdown**, curved quotes (U+201C / U+201D), or hyphens — never phrase-wrapping with ASCII 0x22 inside long insight or answer text.
- Cite only exam-safe, standard sources; no fabricated bodies or URLs.
- Both variants must differ in **opening move**, **ordering**, and **examples** — not shallow paraphrase.
`.trim();
}
