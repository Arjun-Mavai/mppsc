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
5. **Correct answer** must be one of: `\"A\" | \"B\" | \"C\" | \"D\"` (NOT an index).
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
  "correctAnswer": "A",

  "type": "standard",
  "matchPairs": null,

  "subject": "History | Polity | Geography | Economy | Science | MP GK | Current Affairs | ...",
  "year": 2026,
  "paper": "Prelims",

  "marks": 2,
  "negativeMarks": 0,
  "idealTime": 60,

  "explanation_hi": "Classic explanation in Hindi (simple, exam-ready).",
  "explanation_en": "Classic explanation in English (simple, exam-ready).",

  "explanation": {
    "stream": "mppsc_expert",
    "topic_micro_mapping": "Micro topic mapping (bilingual allowed; keep short)",

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

### Matching question format (if applicable)
If the PDF shows a matching table, set:
- `"type": "matching"`
- `"options"` still present (A–D) if the exam uses options, otherwise keep options as 4 derived choices.
- `"matchPairs"` as an array like:

```json
[
  { "id": "1", "left": "List-I item", "right": "List-II item", "left_en": "...", "right_en": "..." }
]
```

### Quality bar
- Classic explanation should be **short and safe** (2–5 lines).
- Expert explanation should be **structured and premium** but not overly long.
- Keep all strings clean (no raw bullets that break JSON).

### Input starts below
<PASTE PDF TEXT / OCR HERE>

---

## Notes (for you / uploader)
- In Admin Upload, choose **Explanation Format = Expert** if you want `extendedData` saved.
- This prompt includes both formats so even if you later switch to Classic UI, users still see a good explanation.

