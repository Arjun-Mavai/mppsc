/**
 * Paper-wise “expert mode” instructions for the external LLM (Gemini / ChatGPT).
 * Injected into topic prompts so every paper gets subject-appropriate depth.
 */

export const MAINS_PAPER_AI_ADDON: Record<number, string> = {
  1: `PAPER I — HISTORY + GEOGRAPHY (GS-I style, bilingual depth)
**OUTPUT NOTE:** Topic prompts for Paper I use the **History‑Rich JSON v1** schema (see TOPIC TASK appendix). Follow that schema when generating the final JSON.

STRUCTURE & VALUE ADDITION (MANDATORY):
1. **Real Meaning & Practical Feel (असली मतलब और व्यावहारिक जीवन से जुड़ाव)**: Start by explaining the true essence of the topic. Make the student FEEL the topic by connecting it to real-life practical examples or current events, rather than just bookish definitions.
2. **Interconnection (बहुआयामी दृष्टिकोण)**: Explicitly show what is included in this topic and how it connects to other subjects (e.g., History connecting to Geography, Polity, or Economy). 
3. **Topper's Secret & Proof (टॉपर सीक्रेट और प्रमाण)**: Provide a specific "Topper's Secret" on how to score maximum marks in this topic. Don't just give a tip; PROVE IT by showing a mini-example of *how to implement it* in the answer (e.g., "Use this specific map or flowchart here to gain +1 mark").
4. **Strict Points & Headings Format (बिंदुवार और उचित शीर्षक)**: The entire model answer must be heavily points-based with proper, engaging headings. Avoid long paragraphs. 

MARK DISCIPLINE (5m & 7m Focus):
- **5 Marks & 7 Marks**: Both must follow the SAME high-quality structure — crisp intro, proper heading, 4-6 bullet points for 5m, and 5-8 bullet points for 7m, ending with a 1-line conclusion. ALWAYS use vertical bullet points.
- **2 Marks**: Ultra-tight definition or two linked facts.
- **11 / 10 Marks**: Intro → Body (Multi-angle headings) → Diagram/Flowchart → Conclusion.

SUBJECT SPECIFICS:
- **History**: Cause → Process → Consequence chain. Add MP linkage (dynasties, revolt, culture, sites). 
- **Geography**: Map + Mechanism + Data. Connect physical features to human response and MP/Indian agriculture.`,

  2: `PAPER II — POLITICAL SCIENCE + SOCIOLOGY
STRUCTURE & VALUE ADDITION (MANDATORY):
1. **Real Meaning & Practical Feel**: Explain the concept practically. For Polity, connect it to daily citizen life or current news. For Sociology, use a relatable Indian society example.
2. **Interconnection**: Weave the topic into other disciplines (Polity ↔ Sociology ↔ Economy). 
3. **Topper's Secret & Proof (टॉपर सीक्रेट और प्रमाण)**: Share a top-tier strategy (like linking an Article with a Supreme Court case or a Sociological thinker) and PROVE how to write it in the exam sheet.
4. **Strict Points & Headings Format**: Use proper markdown headings and bullet points. 

MARK DISCIPLINE (5m & 7m Focus):
- **5 Marks & 7 Marks**: Treat them with the same structural respect. Clear heading, vertical bullet points (4-6 points for 5m, 5-8 points for 7m), and a powerful 1-line synthesis. No long paragraphs!
- **2 Marks**: Precise constitutional language or exact sociological definition.

SUBJECT SPECIFICS:
- **Polity**: Weave Articles (e.g., 14, 19, 21, 32, etc.) and landmark SC cases (Name + Year + Core ratio).
- **Sociology**: Indian concepts with empirical MP flavour (schemes, migration). Avoid empty jargon.`,

  3: `PAPER III — ECONOMICS + SCIENCE, TECHNOLOGY & PUBLIC HEALTH
STRUCTURE & VALUE ADDITION (MANDATORY):
1. **Real Meaning & Practical Feel**: Explain Economics/Science mechanisms simply, as if explaining to a layman. Show how this topic impacts everyday life, cost of living, or public health.
2. **Interconnection**: Show the "Economy ↔ Science/Health bridge" (cost, access, equity, externalities).
3. **Topper's Secret & Proof (टॉपर सीक्रेट और प्रमाण)**: Give a "Topper's Secret" such as a specific data point, SDG goal, or index to quote. Provide a tangible example of how implementing this boosts the score.
4. **Strict Points & Headings Format**: Heavily points-based. Use step-by-step headings for science mechanisms.

MARK DISCIPLINE (5m & 7m Focus):
- **5 Marks & 7 Marks**: Must be highly structured. Intro → Subheading → 4-8 bullet points based on marks → 1-line way forward.
- **2 Marks**: Definition + One application/example.
- **11 / 10 Marks**: Problem → Evidence/Data → Policy/Mechanism → Way Forward with MP/India example.

SUBJECT SPECIFICS:
- **Economics**: Structure + Current relevance. Add MP/India statistics or schemes only if accurate.
- **Sci-Tech/Health**: Mechanism first (how it works) → Application → India/MP angle (e.g., telemedicine). Keep MPPSC depth, not PhD depth.`,

  4: `PAPER IV — PHILOSOPHY / PSYCHOLOGY / PUB AD + ETHICS CASES + MANAGEMENT + CASE STUDY PATTERN
This paper uses **11-mark long answers** and **18/20-mark case studies** (per MPPSC scheme). 

STRUCTURE & VALUE ADDITION (MANDATORY):
1. **Real Meaning & Administrative Link**: Explain concepts like Philosophy or Psychology by linking them directly to civil services, public administration, or a District Magistrate's daily life.
2. **Topper's Secret & Proof**: Share an expert strategy (e.g., "Use this specific ethical framework or administrative rule here") and PROVE it by showing a quick diagram layout or an exact catchy phrase to gain +1 mark.
3. **Strict Points & Headings**: Avoid long paragraphs. Use clear, vertical bullet points.

SUBJECT SPECIFICS:
- **Philosophy / thinkers**: Concise biography is useless without **idea → method → ethics/public service link**.
- **Psychology / attitude**: Link trait → behaviour → admin life → ethical safeguard.
- **Public administration / Management**: Principles + Indian constitutional context + small governance examples.

CASE STUDY EXCELLENCE (CRITICAL INSTRUCTION):
When answering a Case Study (प्रकरण अध्ययन), you MUST follow these strict rules:
1. **Multi-Part Questions (e.g., 4.1(1), 4.1(2), etc.)**: If the case study stem contains multiple sub-questions at the bottom, YOU MUST ANSWER EVERY SINGLE SUB-QUESTION sequentially. Use Markdown headings for each sub-question (e.g., \`## (4.1)(1) जिलाधिकारी की प्रमुख जिम्मेदारी\`, \`## (4.1)(2) विकास संबंधी कार्य\`). Do not merge them into one generic essay.
2. **Expert Format**: For the analytical parts of the case, you MUST use the standard ethical framework headings: \`## Stakeholders Involved (हितधारक)\`, \`## Core Values / Ethical Dilemma (नैतिक दुविधा)\`, and \`## Action Plan / Decision (निर्णय एवं कार्यवाही)\`. Write with the commanding tone of a Senior IAS Officer.
3. **Deep Expert Insights (छात्रों के लिए मार्गदर्शन)**: In the 'expert insights' or intro section, explicitly teach the student HOW to read this case study. Break down the hidden administrative challenges and show them how a topper maps the syllabus (e.g., "This case tests your coordination skills and crisis management"). Make it immensely helpful for the student.`,

  5: `PAPER V — GENERAL HINDI & GRAMMAR (PURE HINDI ONLY)
This is **NOT** GS: focus on **Vyakaran rules, exceptions, examples**, sandhi-samās, upsarg-pratyay, muhavare, alankār recognition, apathit / pathit style precision. 
Model answers should sound like **exam Hindi** — शुद्ध, संयत. Use a strict **Rule → Example → Common Trap** pattern. Make the content extremely "learning-focused" so students feel they are getting expert insights. Give exact marks formatting.
CRITICAL: Since this is a pure Hindi paper, you MUST set all \`_en\` keys to \`null\` or empty arrays. Write the pure Hindi content ONLY in the \`_hi\` keys. Do not use English anywhere unless explaining a transliteration rule.`,

  6: `PAPER VI — HINDI ESSAY + DRAFT / REPORT / MEMO (100 marks; PURE HINDI ONLY)
WORD LIMITS & FORMATTING RULES:
- 50 Marks Essay: Target ~1000 words. Provide a highly dense, expert essay spanning this length. At the very top, label it explicitly: "**निबंध (लगभग 1000 शब्द)**".
- 25 Marks Essay: Target ~500 words. At the very top, label it explicitly: "**निबंध (लगभग 500 शब्द)**".
- 25 Marks or 15 Marks / 12.5 Marks Draft/Report (प्रारूप लेखन):
  The format MUST look exactly like an authentic MPPSC mains handwritten answer sheet draft using our official alignment tags.

  CRITICAL LAYOUT RULES (DO NOT USE BOX DRAWINGS):
  ✓ STRICTLY FORBIDDEN: DO NOT use ASCII/Unicode box borders (NO ┌, ─, │, ├, └, ┘, ━, etc.).
  ✓ STRICTLY FORBIDDEN: DO NOT wrap the draft in markdown code fences (\`\`\`text or \`text).
  ✓ Use standard alignment tags at the start of specific lines so our interactive UI renders examiners' placement hints:
    • [मध्य में/Center Align] - for Ministry, Department, Title, Subject, etc.
    • [दाईं ओर/Right Align] - for Place and Date (e.g. [दाईं ओर/Right Align] भोपाल, दिनांक : 15 नवंबर 2026)
    • [दाईं ओर नीचे/Bottom Right] - for Signatory block (e.g. आदेशानुसार / भवदीय, हस्ताक्षर, नाम, पदनाम)
    • [बाईं ओर/Left Align] - for reference numbers, dispatch, recipients (प्रति / सेवा में)
    • [बाईं ओर नीचे/Bottom Left] - for left-aligned footers/annexures if any
    • [मुख्य कलेवर / Body] - optional marker before the main content paragraphs/points
  ✓ For body text, use numbered points (1., 2., 3. or क, ख, ग) or clear indented paragraphs.
  ✓ Show पृष्ठांकन (Endorsement) with प्रतिलिपि सूचनार्थ when appropriate for circulars/orders.
  ✓ Directly generate the clean formatted draft without meta-commentary.

  Standard Example Layout (MPPSC Topper Format):
  [मध्य में/Center Align] मध्य प्रदेश शासन, स्कूल शिक्षा विभाग
  [मध्य में/Center Align] मंत्रालय, वल्लभ भवन, भोपाल

  क्रमांक : एफ-12/2026/20-1
  [दाईं ओर/Right Align] भोपाल, दिनांक : 15 नवंबर 2026

  [मध्य में/Center Align] :: आदेश ::

  [मुख्य कलेवर / Body]
  राज्य शासन द्वारा 'राष्ट्रीय शिक्षा नीति 2020' के सुचारू क्रियान्वयन एवं प्रदेश के विद्यालयों में गुणवत्तापूर्ण शिक्षा सुनिश्चित करने हेतु एक 'राज्य सलाहकार परिषद्' का एतद्द्वारा गठन किया जाता है।

  2. परिषद् का स्वरूप निम्नानुसार होगा:
  (i) माननीय मंत्री, स्कूल शिक्षा विभाग - अध्यक्ष
  (ii) प्रमुख सचिव, स्कूल शिक्षा विभाग - उपाध्यक्ष
  (iii) आयुक्त, लोक शिक्षण संचालनालय - सदस्य सचिव

  3. यह आदेश तत्काल प्रभाव से लागू होगा।

  [दाईं ओर नीचे/Bottom Right] मध्य प्रदेश के राज्यपाल के नाम से तथा आदेशानुसार,
  [दाईं ओर नीचे/Bottom Right] (हस्ताक्षर)
  [दाईं ओर नीचे/Bottom Right] (नाम ...........)
  [दाईं ओर नीचे/Bottom Right] अवर सचिव
  [दाईं ओर नीचे/Bottom Right] स्कूल शिक्षा विभाग, मध्य प्रदेश शासन

  पृष्ठांकन क्र.: एफ-12/2026/20-1/प्रतिलिपि
  [दाईं ओर/Right Align] भोपाल, दिनांक : 15 नवंबर 2026
  प्रतिलिपि सूचनार्थ एवं आवश्यक कार्यवाही हेतु:
  1. निज सचिव, माननीय मुख्यमंत्री, मध्य प्रदेश शासन।
  2. संबंधित अधिकारी/सदस्य।

  [दाईं ओर नीचे/Bottom Right] (हस्ताक्षर)
  [दाईं ओर नीचे/Bottom Right] अवर सचिव
  [दाईं ओर नीचे/Bottom Right] स्कूल शिक्षा विभाग
STRUCTURE & FLOW (The Golden Thread):
1. **Dynamic Engaging Start (प्रस्तावना)**: Start with a powerful, engaging hook. ALWAYS begin with a quote from a relevant philosopher, a famous Indian personality, or a precise Constitutional Article / legal backing (especially for Polity/Social issues). Use Markdown blockquotes \`> \` for these quotes so the UI highlights them beautifully.
2. **Multidimensional Interconnection (बहुआयामी दृष्टिकोण)**: The essay MUST interconnect multiple subjects. Show the student how a single topic weaves through History, Geography, Polity, Economy, Environment, and Society. Demonstrate a broad "Administrator's Mindset" (प्रशासकीय सोच).
3. **Seamless Flow (प्रवाह)**: Maintain a single unbroken thread (एक सूत्र) from start to finish. Paragraphs must transition naturally into each other.
4. **Powerful Conclusion (निष्कर्ष)**: Summarize the core thesis beautifully. End with a forward-looking, visionary statement or a solution-oriented closing thought. It should feel like a satisfying, definitive end.

EXPERT INSIGHTS & COACHING (expert_insights_hi):
- Teach the student HOW to brainstorm this specific essay.
- Show them the "Interconnection Mind Map" (कि कैसे इस विषय को इतिहास, भूगोल, राजनीति और अर्थशास्त्र से जोड़ा जाए).
- Explain the psychology of the examiner and why starting with the chosen quote/article creates maximum impact.
- Give them a checklist for the flow (Intro -> Body -> Interconnections -> Conclusion).

TONE: Pure, literate, expert-level Hindi (उम्दा और प्रवाहमयी हिंदी निबंध विशेषज्ञ की तरह). 
CRITICAL: Since this is a pure Hindi paper, you MUST set all \`_en\` keys to \`null\` or empty arrays. Write the pure Hindi content ONLY in the \`_hi\` keys. No English allowed.`,
};

export function getMainsPaperExpertAddon(paperNumber: number): string {
  const n = Math.min(6, Math.max(1, Math.floor(paperNumber) || 1));
  return MAINS_PAPER_AI_ADDON[n] ?? MAINS_PAPER_AI_ADDON[1];
}

/** Copy when calibrating the model for a whole paper (no topic yet). */
export function buildPaperLevelPromptForExternalAi(paperNumber: number, paperTitleEn: string): string {
  return [
    '══════════════════════════════════════════════════════════════════',
    'MPPSC MAINS — PAPER-LEVEL EXPERT MODE (calibration prompt)',
    '══════════════════════════════════════════════════════════════════',
    '',
    `Target: Paper ${paperNumber} — ${paperTitleEn}`,
    '',
    'Use this block together with the GLOBAL RULES document you already have (or paste the “Copy rules only” from admin).',
    'This is NOT the final JSON for a topic; it teaches tone, depth, and subject-specific “what to award marks for”.',
    '',
    '--- PAPER-SPECIFIC EXPERT ADD-ON ---',
    getMainsPaperExpertAddon(paperNumber),
    '',
    'When you later receive a topic prompt for this paper, apply this lens strictly.',
  ].join('\n');
}
