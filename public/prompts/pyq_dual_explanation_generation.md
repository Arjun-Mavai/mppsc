# PYQ (PDF → JSON) Upload Prompt — Dual Explanation (Classic + Expert)

Use this prompt with **Gemini Pro** when you paste a **new PYQ PDF** (or OCR text) and want output that works with this project’s **Admin → Content Manager → Tests upload** flow.

This generates **both**:

- **Classic explanations** (for backward compatibility + lightweight view)
- **Expert structured `extendedData`** (premium cards / structured mentor view)

---

## Instruction to the AI (paste this as-is)

You are an expert MPPSC PYQ data engineer and chief mentor.

I will provide MPPSC Prelims PYQ content (PDF text / OCR). You must output a **single valid JSON array** (no markdown, no backticks, no commentary).

### Non‑negotiable output rules

1. **Return ONLY raw JSON array**: `[{...}, {...}]`
2. **Strict JSON**: escape all newlines inside strings as `\\n`. No trailing commas.
3. **Bilingual**: Provide Hindi + English everywhere asked.
4. **Do not hallucinate**: if something is missing/unclear in the PDF, set it to `null` or `\"\"` and add a short note inside `source_notes` (string).
5. **Correct answer** must be a **numeric option index** only: **`0` | `1` | `2` | `3`** — meaning **0 = A, 1 = B, 2 = C, 3 = D** (same order as `options` array). Do **not** use letter strings like `\"A\"`; the upload + quiz UI expect a number.
6. If question is **assertion-reason / matching / table**, set `type` accordingly and include `matchPairs`.

### Target JSON schema (array items)

Each question object MUST look like:

```json
{
  "questionText": "Hindi question (HTML allowed if present in source)",
  "questionTextEn": "English translation (or null if not needed)",
  "options": [
    { "id": "A", "text": "Hindi option", "text_en": "English option" },
    { "id": "B", "text": "Hindi option", "text_en": "English option" },
    { "id": "C", "text": "Hindi option", "text_en": "English option" },
    { "id": "D", "text": "Hindi option", "text_en": "English option" }
  ],
  "correctAnswer": 0,

  "type": "standard",
  "matchPairs": null,

  "subject": "History | Polity | Geography | Economy | Science | MP GK | Current Affairs | ...",
  "year": 2026,
  "paper": "Prelims",

  "marks": 2,
  "negativeMarks": 0,
  "idealTime": 60,

  "explanation_hi": "Use classic structure (markers or JSON string — see section Classic: Exam Fact, Memory Tip, Scam Alert).",
  "explanation_en": "Same structure in English (markers or JSON string).",

  "explanation": {
    "stream": "mppsc_expert",
    "topic_micro_mapping_hi": "Top-right tag in Expert card (Hindi), e.g. भूगोल – गंगा नदी तंत्र | …",
    "topic_micro_mapping_en": "Same tag in English, e.g. Indian Geography – Ganga River system",
    "topic_micro_mapping": "Optional single-string fallback; prefer _hi + _en so the language toggle is correct.",

    "conceptual_depth_hi": "Mentor-style depth in Hindi",
    "conceptual_depth_en": "Mentor-style depth in English",

    "interdisciplinary_link_hi": "Cross-links in Hindi",
    "interdisciplinary_link_en": "Cross-links in English",

    "historical_trend_hi": "PYQ trend / veteran insight in Hindi",
    "historical_trend_en": "PYQ trend / veteran insight in English",

    "elimination_strategy_hi": "Option elimination in Hindi",
    "elimination_strategy_en": "Option elimination in English",

    "memory_mnemonic_hi": "Mnemonic in Hindi",
    "memory_mnemonic_en": "Mnemonic in English",

    "toppers_mantra_hi": "One-liner mantra in Hindi",
    "toppers_mantra_en": "One-liner mantra in English",

    "mains_application_hi": "Optional mains linkage in Hindi",
    "mains_application_en": "Optional mains linkage in English",

    "ncert_reference": "If known, NCERT reference else empty string",

    "high_yield_facts_hi": ["Fact 1", "Fact 2"],
    "high_yield_facts_en": ["Fact 1", "Fact 2"]
  },

  "source_notes": "Any ambiguity notes (short)."
}
```

### Classic: Exam Fact, Memory Tip, Scam Alert (old + new dono)

`explanation_hi` and `explanation_en` are saved to the DB as **plain text** and rendered by **`PremiumExplanation`**. They must support **both** legacy “coaching card” style **and** a short fallback, alongside the nested **`explanation`** expert object.

Use **at least one** of these two styles per language (Hindi + English each).

#### Style A — Section markers (recommended for PYQ)

Put **one string** per language; separate blocks with newlines (`\\n` in JSON). Each block starts with a marker; optional **emoji** prefix is allowed (app strips them cleanly).

| Card (UI label) | English markers | Hindi markers | Emoji (optional) |
|-----------------|-----------------|---------------|-------------------|
| Core / correct logic | `**Correct Logic` or `**Core Logic` or `**तर्क` | `**सही तर्क` | `✅` |
| Exam fact | `**Exam Fact` | `**एग्जाम फैक्ट` | `💡` |
| Memory tip / trick | `**Memory Tip` | `**मेमोरी टिप` | `🧠` |
| Scam / trap alert | `**Scam Alert` | `**स्कैम अलर्ट` | `🚫` |

- **Order:** Logic → Exam Fact → Memory Tip → Scam Alert (skip any block you have nothing for).
- **Minimum:** a clear logic block (2–4 lines). Add **Exam Fact** (high-yield fact), **Memory Tip** (mnemonic / elimination trick), **Scam Alert** (wrong options / examiner trap) when they add real value.
- **Bilingual:** Hindi string uses Hindi markers; English string uses English markers. Do **not** mix both languages inside one string.

#### Style B — Single JSON object as string (legacy parser)

If the entire `explanation_hi` (or `explanation_en`) is **one JSON object** (as a string), the app maps keys to the same four cards. Use any of:

- Logic: `verdict`, `core_logic`, `logic`
- Exam fact: `exam_fact`, `fact`, `core_concept`
- Memory / trick: `memory_tip`, `tip`, `memory_trick`, `elimination_wisdom`
- Scam: `scam_alert`, `scam`, `trap_alert`, `trap_alerts`

Prefer **Style A** for readability in Admin preview; use **Style B** only if you already have machine JSON.

#### Relation to expert `explanation` object

- **Classic** (`explanation_hi` / `explanation_en`): exam-hall short, markers or small JSON — **always fill** for Expert upload (they become `explanation` / `explanation_en` columns).
- **Expert** (nested `explanation` with `stream: "mppsc_expert"`): mentor depth, trends, elimination, `high_yield_facts_*`, etc. **Also fill** when using Expert mode.
- Avoid copy-pasting the same long paragraph into both; classic = tight cards, expert = depth.

### Matching question format (if applicable)

If the PDF shows a matching table, set:

- `"type": "matching"`
- `"options"` still present (A–D) if the exam uses options, otherwise keep options as 4 derived choices.
- `"matchPairs"` as an array like:

```json
[{ "id": "1", "left": "List-I item", "right": "List-II item", "left_en": "...", "right_en": "..." }]
```

### Quality bar

- Classic strings should stay **short and safe** per section (logic 2–5 lines; fact/tip/scam 1–3 lines each unless essential).
- Expert explanation should be **structured and premium** but not overly long.
- Keep all strings clean (escape newlines as `\\n`; avoid raw control characters that break JSON).

### Input starts below

<PASTE PDF TEXT / OCR HERE>

---

## How keys map to the database (avoid “upload ho gaya par DB mein nahi”)

The app’s SQLite tables use these column names: **`explanation`** (Hindi) and **`explanation_en`** (English). The JSON you generate uses **longer** names; the admin upload **maps** them. You must not invent keys that the parser ignores.

| Your JSON (what you output) | Saved to DB column | Used for |
|----------------------------|--------------------|----------|
| `explanation_hi` **or** a **string** `explanation` (not an object) | `explanation` (Hindi) | Classic / `PremiumExplanation` |
| `explanation_en` **or** `explanationEn` | `explanation_en` (English) | Classic / `PremiumExplanation` |
| `explanation` as **object** with `"stream": "mppsc_expert"` | `extended_data` (JSON) | Expert / `StructuredExplanation` expert panel |

**Common mistakes to avoid**

1. Putting classic Hindi/English only inside the nested `explanation` object and leaving `explanation_hi` / `explanation_en` empty — then the **legacy Classic columns** stay empty. For **Admin → Tests** with **Expert** format, always **still fill** `explanation_hi` and `explanation_en` (see the **Classic: Exam Fact, Memory Tip, Scam Alert** section above).
2. Using a top-level key like `hindi_explanation` or `classic_hi` — they are **not** read by the uploader (Classic-by-`questionId` batch **does** accept `explanationHi` and a few English key spellings; still prefer `explanation_hi` / `explanationEn`).
3. For **expert** nested object, the key is **`explanation`** (one object with `stream`, `conceptual_depth_hi`, …). Do not duplicate that entire blob as a string in the Hindi column.

---

## Working in batches of 25

For long papers, ask the model to return **at most 25 questions per array**, then run multiple passes (Batch 1: Q1–Q25, Batch 2: Q26–Q50, …). Same schema each time. This keeps JSON parse errors and context limits under control.

---

## Already in DB? Classic-only patch by `questionId` (Content Manager)

If questions are **already imported** (e.g. 2026 paper) and you only need to **add or fix** classic Hindi/English text, use **Admin → Content Manager → Expert Upgrade tab → “Classic explanations by question ID”** (no test re-upload). Paste a **raw JSON array** the model can also produce; each item is:

```json
[
  {
    "questionId": "use_exact_id_from_app_or_admin_list",
    "explanation_hi": "Hindi: Style A markers (✅ **सही तर्क, 💡 **एग्जाम फैक्ट, …)",
    "explanationEn": "English: **Correct Logic, **Exam Fact, **Memory Tip, …"
  }
]
```

- **`questionId`**: from `/syllabus/quiz/pyq/intelligence/questions` (or your internal question list) — must match the row `id` in the `questions` table.
- Aliases supported by the app: `explanation_hi` or string `explanation` for Hindi; `explanationEn` or `explanation_en` for English.
- **2026 Prelims (canonical paper) test id** (for your notes / filtering): `n9Zy8u3ytAf1ZPB9W_Rbk` (see `src/lib/pyq-constants.ts` `CANONICAL_TEST_IDS[2026]`).
- Work in **batches of 25** the same way: one JSON array, up to 25 objects, paste into the admin panel, **Upsert classic text**; repeat for the next 25 `questionId`s.

**Mini-prompt to give the AI** (for this flow only): *“I will paste 25 `questionId` values and optional one-line context per question. Return only a JSON array of objects with `questionId`, `explanation_hi`, `explanationEn` as specified above. Escape newlines in strings as `\\n`. No markdown code fences.”*

**Strict JSON for this array (upload will fail otherwise)**

1. **Do not use a raw ASCII double quote (`"`, U+0022) inside any string value** except to **open/close** that value. For short quoted phrases or “Festival of Letters” style emphasis, either: use **markdown bold** (`**...**`), use **single quotes** `'...'`, or escape as `\\"Festival of Letters\\"`. The same applies to Hindi mixed with English terms.
2. Prefer **curly apostrophes** `’` or devanagari quotes for inner nuance if needed; avoid surrounding a word with ASCII `"` inside the big string.
3. Keys: use exactly `questionId`, `explanation_hi`, and `explanationEn` (or `explanation_en` for English). Aliases like `explanationHi` / `explanationEN` are tolerated by the server if the JSON parses.
4. After generation, **validate** with a JSON validator: one stray unescaped `"` in a long explanation breaks the whole array.

---

## Notes (for you / uploader)

- In Admin → Content Manager → **Tests** tab, choose **Explanation Format = Expert** if you want nested `explanation` + `extendedData` saved; the **same** object should still include **filled** `explanation_hi` and `explanation_en` for Classic columns.
- This prompt includes both formats so the Classic view and the Expert panel both have real content.
- **`correctAnswer`**: always **integer 0–3** (first option = 0).
- **`explanation_hi` / `explanation_en`**: use marker blocks (Exam Fact, Memory Tip, Scam Alert) or legacy JSON keys so `PremiumExplanation` shows the same four cards as old PYQ content.
