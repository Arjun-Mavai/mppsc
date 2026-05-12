/**
 * MPPSC State Service Mains 2026 — scheme copy for UI / tooltips / LLM context.
 * Aligns with official notification: 6 descriptive papers, 1500 written + 185 interview = 1685.
 */

export type MainsPatternBlock =
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string }
  | {
      type: 'table';
      head: string[];
      body: string[][];
      instruction?: string;
    }
  | {
      type: 'exam_pattern';
      topic: string;
      analysis: string;
      stats: string[];
      trend?: string;
    }
  | { type: 'highlight'; level: 'important' | 'info'; text: string };

export type MainsPatternLocale = {
  introduction: string;
  blocks: MainsPatternBlock[];
  conclusion: string;
};

export const MPPSC_MAINS_2026_PATTERN: { hi: MainsPatternLocale; en: MainsPatternLocale } = {
  hi: {
    introduction:
      'MPPSC ने साल 2026 के लिए राज्य सेवा मुख्य परीक्षा का नया पैटर्न और सिलेबस जारी किया है। लिखित परीक्षा 1500 अंक, साक्षात्कार 185 अंक — कुल 1685 अंक।',
    blocks: [
      { type: 'h2', text: 'मुख्य परीक्षा योजना 2026 (Overview)' },
      {
        type: 'p',
        text: 'मुख्य परीक्षा में कुल 06 वर्णनात्मक (Descriptive) प्रश्नपत्र होंगे। सभी अनिवार्य। प्रश्न उप-प्रश्नों सहित पूछे जा सकते हैं; उत्तर पुस्तिका में स्थान अधिक हो त भी शब्द सीमा का पालन अनिवार्य है।',
      },
      {
        type: 'table',
        head: ['प्रश्नपत्र', 'विषय', 'अंक', 'अवधि', 'माध्यम'],
        body: [
          ['GS I', 'इतिहास एवं भूगोल (खंड अ+ब)', '300', '3 घंटे', 'हिन्दी/अंग्रेजी'],
          ['GS II', 'राजनीति विज्ञान एवं समाजशास्त्र', '300', '3 घंटे', 'हिन्दी/अंग्रेजी'],
          ['GS III', 'अर्थशास्त्र; विज्ञान, तकनीकी एवं जन स्वास्थ्य', '300', '3 घंटे', 'हिन्दी/अंग्रेजी'],
          ['GS IV', 'दर्शनशास्त्र, मनोविज्ञान, लोक प्रशासन व केस स्टडी; उद्यमिता, प्रबंधन व केस स्टडी', '300', '3 घंटे', 'हिन्दी/अंग्रेजी'],
          ['पंचम', 'सामान्य हिन्दी एवं व्याकरण', '200', '2 घंटे', 'केवल हिन्दी'],
          ['षष्ठ', 'हिन्दी निबंध एवं प्रारूप लेखन', '100', '2:30 घंटे', 'केवल हिन्दी'],
        ],
        instruction: 'साक्षात्कार 185 अंक। साक्षात्कार हेतु विज्ञापित पदों प्रति श्रेणीवार लगभग 3 गुना अभ्यर्थी बुलाए जा सकते हैं (समान अंक सहित)।',
      },
      { type: 'h2', text: 'GS I, II व III — प्रत्येक खंड (अ या ब) 150 अंक' },
      {
        type: 'exam_pattern',
        topic: 'प्रश्नों का स्वरूप (प्रति खंड)',
        analysis: 'प्रत्येक GS पत्र दो खंडों में; प्रत्येक खंड 150 अंक, 30 प्रश्न।',
        stats: [
          'अति लघुत्तरीय: 15 × 2 अंक — अधिकतम 20 शब्द (कुल 30 अंक)',
          'लघुत्तरीय: 10 × 7 अंक — अधिकतम 60 शब्द (कुल 70 अंक)',
          'दीर्घ उत्तरीय: 5 × 10 अंक — अधिकतम 200 शब्द (कुल 50 अंक)',
        ],
        trend: 'खंड योग 150 अंक।',
      },
      { type: 'h2', text: 'GS IV — प्रत्येक खंड 150 अंक (केस स्टडी सहित)' },
      {
        type: 'exam_pattern',
        topic: 'चतुर्थ पत्र का स्वरूप (प्रति खंड)',
        analysis: 'दीर्घ उत्तर 11 अंक तथा एक केस स्टडी 18 अंक; शेष अति लघु व लघु पैटर्न ऊपर जैसा परिमाण भिन्न है।',
        stats: [
          'अति लघुत्तरीय: 16 × 2 अंक (कुल 32)',
          'लघुत्तरीय: 8 × 7 अंक (कुल 56)',
          'दीर्घ उत्तरीय: 4 × 11 अंक — अधिकतम 200 शब्द (कुल 44)',
          'केस स्टडी: 1 × 18 अंक — शब्द सीमा निर्देशानुसार',
        ],
        trend: 'प्रति खंड 29 प्रश्न, 150 अंक।',
      },
      { type: 'h2', text: 'षष्ठ प्रश्नपत्र — अंक विभाजन (निबंध व लेखन)' },
      {
        type: 'exam_pattern',
        topic: 'हिन्दी निबंध एवं प्रारूप लेखन',
        analysis: 'कुल 100 अंक; विस्तार अधिसूचना के अनुसार।',
        stats: [
          'प्रथम निबंध: 1 प्रश्न, लगभग 1000 शब्द, 50 अंक',
          'द्वितीय निबंध: 1 प्रश्न, लगभग 500 शब्द, 20 अंक',
          'प्रारूप लेखन: 1 प्रश्न, लगभग 250 शब्द, 15 अंक',
          'प्रतिवेदन / अधिसूचना / ज्ञापन / टिप्पण: 1 प्रश्न, लगभग 250 शब्द, 15 अंक',
        ],
      },
      {
        type: 'highlight',
        level: 'important',
        text: 'न्यूनतम अर्हकारी अंक: अनारक्षित (पुरुष/महिला) 40% प्रति पत्र (खंड अ+ब मिलाकर); आरक्षित श्रेणियाँ 30% प्रति पत्र।',
      },
    ],
    conclusion:
      'तैयारी में शब्द सीमा व प्रश्न-प्रकार (2/7/10 या 11 व केस 18) को ध्यान में रखकर अभ्यास करें; MPPSC स्तर पर सटीक, संरचित उत्तर लिखना अहम है।',
  },
  en: {
    introduction:
      'MPPSC’s 2026 State Service Main Examination scheme: six compulsory descriptive papers, 1500 marks written plus 185 marks interview (1685 total).',
    blocks: [
      { type: 'h2', text: 'Mains scheme 2026 (overview)' },
      {
        type: 'p',
        text: 'Six compulsory descriptive papers. Questions may include sub-parts; word limits are mandatory even if extra space is printed in the answer booklet.',
      },
      {
        type: 'table',
        head: ['Paper', 'Subject', 'Marks', 'Duration', 'Medium'],
        body: [
          ['GS I', 'History & Geography (Sec A+B)', '300', '3 hours', 'Hindi/English'],
          ['GS II', 'Political Science & Sociology', '300', '3 hours', 'Hindi/English'],
          ['GS III', 'Economics; Science, Tech & Public Health', '300', '3 hours', 'Hindi/English'],
          ['GS IV', 'Philosophy, Psychology, Pub Ad + case; Entrepreneurship, Mgmt + case', '300', '3 hours', 'Hindi/English'],
          ['Paper V', 'General Hindi & Grammar', '200', '2 hours', 'Hindi only'],
          ['Paper VI', 'Hindi essay & drafting', '100', '2:30 hours', 'Hindi only'],
        ],
        instruction:
          'Interview 185 marks. Candidates may be called at ~3× advertised posts per category (including ties at cutoff).',
      },
      { type: 'h2', text: 'GS I, II & III — each section (A or B) = 150 marks' },
      {
        type: 'exam_pattern',
        topic: 'Question mix (per section)',
        analysis: 'Each GS paper has two sections; each section carries 150 marks across 30 questions.',
        stats: [
          'Very short: 15 × 2 marks — max 20 words (30 marks)',
          'Short: 10 × 7 marks — max 60 words (70 marks)',
          'Long: 5 × 10 marks — max 200 words (50 marks)',
        ],
        trend: '150 marks per section.',
      },
      { type: 'h2', text: 'GS IV — each section = 150 marks (includes case study)' },
      {
        type: 'exam_pattern',
        topic: 'Paper IV pattern (per section)',
        analysis: 'Long answers are 11 marks; one case study carries 18 marks; very short/short counts differ from GS I–III.',
        stats: [
          'Very short: 16 × 2 marks (32)',
          'Short: 8 × 7 marks (56)',
          'Long: 4 × 11 marks — max 200 words (44)',
          'Case study: 1 × 18 marks — word limit as directed',
        ],
        trend: '29 questions, 150 marks per section.',
      },
      { type: 'h2', text: 'Paper VI — mark break-up' },
      {
        type: 'exam_pattern',
        topic: 'Hindi essay & drafting',
        analysis: 'Total 100 marks as per notification.',
        stats: [
          'First essay: 1 question, ~1000 words, 50 marks',
          'Second essay: 1 question, ~500 words, 20 marks',
          'Draft writing: 1 question, ~250 words, 15 marks',
          'Report / notification / memo / note: 1 question, ~250 words, 15 marks',
        ],
      },
      {
        type: 'highlight',
        level: 'important',
        text: 'Qualifying marks per paper (sections A+B combined): 40% for UR (male/female); 30% for reserved categories.',
      },
    ],
    conclusion:
      'Train by question type and strict word limits; MPPSC rewards structured, relevant answers rather than UPSC-level optional depth.',
  },
};
