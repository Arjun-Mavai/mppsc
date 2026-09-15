// ============================================================================
// MPPSC Prelims 7-Year (2020–2026) Intelligence & Exam Cracking Data Store
// Derived empirically from 700 canonical questions, 1,400 marks, and question repetition analysis.
// Fully bilingual (Hindi & English) for instant static serving.
// ============================================================================

export interface LocalizedString {
  en: string;
  hi: string;
}

export interface UnitWeightageRow {
  unitId: number;
  unitKey: string;
  title: LocalizedString;
  years: {
    2020: { q: number; m: number; m2026?: number };
    2021: { q: number; m: number; m2026?: number };
    2022: { q: number; m: number; m2026?: number };
    2023: { q: number; m: number; m2026?: number };
    2024: { q: number; m: number; m2026?: number };
    2025: { q: number; m: number; m2026?: number };
    2026: { q: number; m: number; m2026?: number };
  };
  totalQuestions: number;
  avgQuestions: number;
  avgMarks: number; // Historical 2 Marks/Q baseline (200 Total Marks)
  avgMarks2026: number; // New 2026+ 3 Marks/Q pattern (300 Total Marks)
  trend: LocalizedString;
  trendType: 'evergreen' | 'rising' | 'stable' | 'moderate' | 'high';
  color: string;
}

export interface MarkingSchemeDetails {
  id: 'current-2026' | 'legacy-2020-2025';
  name: LocalizedString;
  marksPerQuestion: number;
  negativeMarking: number;
  negativeRatio: string;
  totalQuestions: number;
  totalMarks: number;
  safeCutoffMarks: string;
  safeCutoffMarksHi: string;
  safeCutoffQuestions: string;
  core4Marks: string;
  core4MarksHi: string;
  summaryNote: LocalizedString;
  strategicWarning: LocalizedString;
}

export interface VectorPattern {
  id: string;
  rank: number;
  title: LocalizedString;
  frequency: LocalizedString;
  vectorDistance: string;
  similarityBadge: LocalizedString;
  summary: LocalizedString;
  questions: {
    year: number;
    qNum: string;
    text: LocalizedString;
    answer?: LocalizedString;
  }[];
}

export interface CheatSheetItem {
  category: LocalizedString;
  items: LocalizedString[];
}

export interface RealQuestionProof {
  year: number;
  qNum: string;
  question: LocalizedString;
  answer?: LocalizedString;
}

export interface MicroHotTopic {
  id: string;
  topicNumber: string;
  title: LocalizedString;
  consistencyScore: string;
  starRating: number; // 1, 2, or 3
  frequencyLabel: LocalizedString;
  examinerMindset: LocalizedString;
  realQuestions: RealQuestionProof[];
  cheatSheet: CheatSheetItem[];
  highYieldTips?: LocalizedString[];
}

export interface UnitIntelligence {
  unitId: number;
  unitCode: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  icon: string;
  color: string;
  stats: {
    avgQuestions: number;
    avgMarks: number;
    consistencyLabel: LocalizedString;
    trendDescription: LocalizedString;
  };
  coreSyllabusFocus: LocalizedString[];
  hotTopics: MicroHotTopic[];
  predictions2026_2027: LocalizedString[];
}

export interface StudyStep {
  stepNumber: number;
  title: LocalizedString;
  units: string;
  targetQuestions: string;
  targetMarks: string;
  description: LocalizedString;
  keyTopics: LocalizedString[];
  color: string;
}

export interface PriorityLevel {
  level: number;
  title: LocalizedString;
  marksRange: string;
  badge: LocalizedString;
  color: string;
  items: LocalizedString[];
}

// ============================================================================
// 1. Marking Schemes: 2026 New Pattern (+3 / -1) vs 2020–2025 Legacy (+2 / 0)
// ============================================================================
export const MARKING_SCHEMES: {
  new2026: MarkingSchemeDetails;
  legacyPre2026: MarkingSchemeDetails;
} = {
  new2026: {
    id: 'current-2026',
    name: {
      en: 'New 2026 Pattern (Current & Test Series)',
      hi: 'नवीनतम 2026 परीक्षा पैटर्न (वर्तमान एवं टेस्ट सीरीज)',
    },
    marksPerQuestion: 3,
    negativeMarking: 1, // 1/3rd penalty (-1 mark per wrong question)
    negativeRatio: '1/3 (-1 अंक प्रति गलत उत्तर)',
    totalQuestions: 100,
    totalMarks: 300,
    safeCutoffMarks: '231–246 Marks',
    safeCutoffMarksHi: '231–246 अंक',
    safeCutoffQuestions: '77–82 Net Correct Questions (77–82%)',
    core4Marks: '~195 Marks',
    core4MarksHi: '~195 अंक',
    summaryNote: {
      en: 'From 2026 onwards, each question carries 3 marks with strict 1/3rd negative marking (-1 mark per incorrect answer). Total paper is 300 marks.',
      hi: 'वर्ष 2026 से प्रत्येक प्रश्न 3 अंक का है एवं 1/3 नकारात्मक अंकन (-1 अंक प्रति गलत उत्तर) लागू है। कुल प्रश्नपत्र 300 अंकों का है।',
    },
    strategicWarning: {
      en: 'CRITICAL SHIFT: In 2026, wrong answers incur a -1 mark penalty. Blind guessing can ruin your cutoff. High accuracy in the 4 Core Units is the strongest foundation for clearance.',
      hi: 'रणनीतिक चेतावनी: 2026 में गलत उत्तर पर 1 अंक कटेगा। अंधाधुंध तुक्के लगाने से कटऑफ खतरे में पड़ जाएगी। कोर 4 यूनिट्स में उच्च सटीकता ही सुरक्षित स्कोर का सबसे मजबूत आधार (डेटा-आधारित पूर्वानुमान) है।',
    },
  },
  legacyPre2026: {
    id: 'legacy-2020-2025',
    name: {
      en: '2020–2025 Legacy Pattern (Historical Baseline)',
      hi: '2020–2025 पूर्व पैटर्न (ऐतिहासिक आधार)',
    },
    marksPerQuestion: 2,
    negativeMarking: 0,
    negativeRatio: 'No Negative Marking',
    totalQuestions: 100,
    totalMarks: 200,
    safeCutoffMarks: '154–164 Marks',
    safeCutoffMarksHi: '154–164 अंक',
    safeCutoffQuestions: '77–82 Correct Questions (77–82%)',
    core4Marks: '~130 Marks',
    core4MarksHi: '~130 अंक',
    summaryNote: {
      en: 'Historical papers (2020–2025) had 2 marks per question with zero negative marking (200 total marks).',
      hi: '2020 से 2025 तक के प्रश्नपत्रों में प्रत्येक प्रश्न 2 अंक का था और कोई नेगेटिव मार्किंग नहीं थी (कुल 200 अंक)।',
    },
    strategicWarning: {
      en: 'Past cutoffs (154–164 marks) reflect a zero-penalty regime. Use this historical data as question frequency benchmarks while training under 2026 rules.',
      hi: 'पुराना कटऑफ (154–164 अंक) बिना नेगेटिव मार्किंग का था। इस ऐतिहासिक डेटा को प्रश्न आवृत्ति समझने के लिए उपयोग करें।',
    },
  },
};

// ============================================================================
// 2. Executive Summary & Cutoff Formula (Synced with 2026 & Pre-2026)
// ============================================================================
export const EXECUTIVE_SUMMARY = {
  cutoffRange: '231–246 Marks (2026: 300M) · 154–164 Marks (Pre-2026: 200M)',
  cutoffRangeHi: '231–246 अंक (2026: 300 अंक) · 154–164 अंक (पूर्व: 200 अंक)',
  cutoffRange2026: '231–246 Marks (300 Marks Total)',
  cutoffRange2026Hi: '231–246 अंक (कुल 300 अंक)',
  cutoffRangeLegacy: '154–164 Marks (200 Marks Total)',
  cutoffRangeLegacyHi: '154–164 अंक (कुल 200 अंक)',
  totalPaper: '100 Questions = 300 Marks (2026 Pattern: +3 Correct / -1 Wrong)',
  totalPaperHi: '100 प्रश्न = 300 अंक (2026 पैटर्न: +3 सही / -1 गलत)',
  totalPaperLegacy: '100 Questions = 200 Marks (2020–2025: +2 Correct / 0 Negative)',
  totalPaperLegacyHi: '100 प्रश्न = 200 अंक (2020–2025: +2 सही / कोई नेगेटिव नहीं)',
  ruleOf65Title: {
    en: 'The "Rule of 65%": 4 Units = ~195 Marks in 2026 (65–70% of Paper)',
    hi: '65% का स्वर्णिम नियम: सिर्फ 4 यूनिट्स = 2026 में ~195 अंक (65–70% पेपर)',
  },
  ruleOf65Subtitle: {
    en: 'Empirical analysis of 2020–2026 data shows that just 4 units deliver ~65 questions (~195 marks in 2026 / ~130 marks in pre-2026) before touching Geography, Science, ICT, or Economy!',
    hi: '2020–2026 के आंकड़ों का विश्लेषण सिद्ध करता है कि केवल 4 यूनिट्स से ~65 प्रश्न (2026 में ~195 अंक / पूर्व में ~130 अंक) सीधे आते हैं, इससे पहले कि आप भूगोल, विज्ञान, आईसीटी या अर्थव्यवस्था को छुएं!',
  },
  coreUnits: [
    {
      unit: 'MP GK (Units 2 + 4 + 10)',
      unitHi: 'एमपी सामान्य ज्ञान (यूनिट 2 + 4 + 10)',
      range: '27–32 Questions',
      marks2026: '81–96 Marks',
      marks2026Hi: '81–96 अंक',
      marks: '54–64 Marks (Pre-2026)',
      marksHi: '54–64 अंक (पूर्व)',
      share: '30%',
      color: 'amber',
      tag: 'Backbone',
      tagHi: 'मेरुदंड',
    },
    {
      unit: 'Unit 5 (Polity & Governance)',
      unitHi: 'यूनिट 5 (संवैधानिक व्यवस्था एवं आयोग)',
      range: '11–24 Questions',
      marks2026: '33–72 Marks',
      marks2026Hi: '33–72 अंक',
      marks: '22–48 Marks (Pre-2026)',
      marksHi: '22–48 अंक (पूर्व)',
      share: '17%',
      color: 'emerald',
      tag: 'Rank Decider',
      tagHi: 'रैंक डिसाइडर',
    },
    {
      unit: 'Unit 1 (History of India)',
      unitHi: 'यूनिट 1 (भारत का इतिहास)',
      range: '11–18 Questions',
      marks2026: '33–54 Marks',
      marks2026Hi: '33–54 अंक',
      marks: '22–36 Marks (Pre-2026)',
      marksHi: '22–36 अंक (पूर्व)',
      share: '13%',
      color: 'rose',
      tag: 'Evergreen Anchor',
      tagHi: 'सदाबहार स्तंभ',
    },
    {
      unit: 'Unit 8 (Current Affairs & Sports)',
      unitHi: 'यूनिट 8 (समसामयिकी, खेल एवं पुरस्कार)',
      range: '12–14 Questions',
      marks2026: '36–42 Marks',
      marks2026Hi: '36–42 अंक',
      marks: '24–28 Marks (Pre-2026)',
      marksHi: '24–28 अंक (पूर्व)',
      share: '11%',
      color: 'indigo',
      tag: 'Rising Star',
      tagHi: 'तेजी से बढ़ता क्षेत्र',
    },
  ],
  combinedYield: {
    questions: '~65 Questions',
    questionsHi: '~65 प्रश्न',
    marks: '~195 Marks (2026) · ~130 Marks (Pre-2026)',
    marksHi: '~195 अंक (2026) · ~130 अंक (पूर्व)',
    marks2026: '~195 Marks',
    marks2026Hi: '~195 अंक',
    marksLegacy: '~130 Marks',
    marksLegacyHi: '~130 अंक',
  },
};

// ============================================================================
// 2. 7-Year Unit Weightage & Marks Matrix (2020–2026)
// ============================================================================
export const UNIT_WEIGHTAGE_MATRIX: UnitWeightageRow[] = [
  {
    unitId: 1,
    unitKey: 'unit-1',
    title: { en: 'History of India', hi: 'भारत का इतिहास' },
    years: {
      2020: { q: 15, m: 30, m2026: 45 },
      2021: { q: 18, m: 36, m2026: 54 },
      2022: { q: 13, m: 26, m2026: 39 },
      2023: { q: 11, m: 22, m2026: 33 },
      2024: { q: 13, m: 26, m2026: 39 },
      2025: { q: 12, m: 24, m2026: 36 },
      2026: { q: 11, m: 22, m2026: 33 },
    },
    totalQuestions: 93,
    avgQuestions: 13.3,
    avgMarks: 26.6,
    avgMarks2026: 39.9,
    trend: { en: '🟢 Evergreen (11-13 Qs)', hi: '🟢 सदाबहार (11-13 प्रश्न)' },
    trendType: 'evergreen',
    color: 'rose',
  },
  {
    unitId: 2,
    unitKey: 'unit-2',
    title: { en: 'MP History, Culture & Literature', hi: 'म.प्र. का इतिहास, संस्कृति व साहित्य' },
    years: {
      2020: { q: 11, m: 22, m2026: 33 },
      2021: { q: 15, m: 30, m2026: 45 },
      2022: { q: 12, m: 24, m2026: 36 },
      2023: { q: 8, m: 16, m2026: 24 },
      2024: { q: 15, m: 30, m2026: 45 },
      2025: { q: 14, m: 28, m2026: 42 },
      2026: { q: 12, m: 24, m2026: 36 },
    },
    totalQuestions: 87,
    avgQuestions: 12.4,
    avgMarks: 24.8,
    avgMarks2026: 37.2,
    trend: { en: '🟢 Evergreen (12-15 Qs)', hi: '🟢 सदाबहार (12-15 प्रश्न)' },
    trendType: 'evergreen',
    color: 'amber',
  },
  {
    unitId: 3,
    unitKey: 'unit-3',
    title: { en: 'Geography of India & World', hi: 'भारत एवं विश्व का भूगोल' },
    years: {
      2020: { q: 9, m: 18, m2026: 27 },
      2021: { q: 13, m: 26, m2026: 39 },
      2022: { q: 9, m: 18, m2026: 27 },
      2023: { q: 7, m: 14, m2026: 21 },
      2024: { q: 9, m: 18, m2026: 27 },
      2025: { q: 6, m: 12, m2026: 18 },
      2026: { q: 6, m: 12, m2026: 18 },
    },
    totalQuestions: 59,
    avgQuestions: 8.4,
    avgMarks: 16.8,
    avgMarks2026: 25.2,
    trend: { en: '🟡 Stable (6-9 Qs)', hi: '🟡 स्थिर (6-9 प्रश्न)' },
    trendType: 'stable',
    color: 'blue',
  },
  {
    unitId: 4,
    unitKey: 'unit-4',
    title: { en: 'Geography of Madhya Pradesh', hi: 'मध्य प्रदेश का भूगोल' },
    years: {
      2020: { q: 12, m: 24, m2026: 36 },
      2021: { q: 6, m: 12, m2026: 18 },
      2022: { q: 11, m: 22, m2026: 33 },
      2023: { q: 9, m: 18, m2026: 27 },
      2024: { q: 12, m: 24, m2026: 36 },
      2025: { q: 8, m: 16, m2026: 24 },
      2026: { q: 4, m: 8, m2026: 12 },
    },
    totalQuestions: 62,
    avgQuestions: 8.9,
    avgMarks: 17.8,
    avgMarks2026: 26.7,
    trend: { en: '🟡 Moderate (8-12 Qs)', hi: '🟡 मध्यम (8-12 प्रश्न)' },
    trendType: 'moderate',
    color: 'emerald',
  },
  {
    unitId: 5,
    unitKey: 'unit-5',
    title: { en: 'Constitutional System of India & MP', hi: 'भारत व म.प्र. की संवैधानिक व्यवस्था' },
    years: {
      2020: { q: 23, m: 46, m2026: 69 },
      2021: { q: 22, m: 44, m2026: 66 },
      2022: { q: 24, m: 48, m2026: 72 },
      2023: { q: 18, m: 36, m2026: 54 },
      2024: { q: 10, m: 20, m2026: 30 },
      2025: { q: 11, m: 22, m2026: 33 },
      2026: { q: 11, m: 22, m2026: 33 },
    },
    totalQuestions: 119,
    avgQuestions: 17.0,
    avgMarks: 34.0,
    avgMarks2026: 51.0,
    trend: { en: '🔵 High Anchor (Normalized to 11 Qs)', hi: '🔵 शीर्ष स्कोरिंग (11 Qs पर स्थिर)' },
    trendType: 'high',
    color: 'purple',
  },
  {
    unitId: 6,
    unitKey: 'unit-6',
    title: { en: 'Economy of India & MP', hi: 'भारत एवं मध्य प्रदेश की अर्थव्यवस्था' },
    years: {
      2020: { q: 6, m: 12, m2026: 18 },
      2021: { q: 7, m: 14, m2026: 21 },
      2022: { q: 2, m: 4, m2026: 6 },
      2023: { q: 10, m: 20, m2026: 30 },
      2024: { q: 4, m: 8, m2026: 12 },
      2025: { q: 12, m: 24, m2026: 36 },
      2026: { q: 17, m: 34, m2026: 51 },
    },
    totalQuestions: 58,
    avgQuestions: 8.3,
    avgMarks: 16.6,
    avgMarks2026: 24.9,
    trend: { en: '🚀 Sharp Rise (Surged to 17 Qs in 2026!)', hi: '🚀 तीव्र उछाल (2026 में 17 प्रश्न!)' },
    trendType: 'rising',
    color: 'cyan',
  },
  {
    unitId: 7,
    unitKey: 'unit-7',
    title: { en: 'Science, Environment & Health', hi: 'विज्ञान, पर्यावरण एवं स्वास्थ्य' },
    years: {
      2020: { q: 10, m: 20, m2026: 30 },
      2021: { q: 6, m: 12, m2026: 18 },
      2022: { q: 12, m: 24, m2026: 36 },
      2023: { q: 11, m: 22, m2026: 33 },
      2024: { q: 9, m: 18, m2026: 27 },
      2025: { q: 9, m: 18, m2026: 27 },
      2026: { q: 9, m: 18, m2026: 27 },
    },
    totalQuestions: 66,
    avgQuestions: 9.4,
    avgMarks: 18.8,
    avgMarks2026: 28.2,
    trend: { en: '🟢 Stable Anchor (~9 Qs/yr)', hi: '🟢 स्थिर स्तंभ (औसत 9 प्रश्न/वर्ष)' },
    trendType: 'evergreen',
    color: 'indigo',
  },
  {
    unitId: 8,
    unitKey: 'unit-8',
    title: { en: 'Current Affairs, Sports & Awards', hi: 'समसामयिक घटनाएं, खेलकूद, पुरस्कार' },
    years: {
      2020: { q: 8, m: 16, m2026: 24 },
      2021: { q: 5, m: 10, m2026: 15 },
      2022: { q: 7, m: 14, m2026: 21 },
      2023: { q: 12, m: 24, m2026: 36 },
      2024: { q: 13, m: 26, m2026: 39 },
      2025: { q: 12, m: 24, m2026: 36 },
      2026: { q: 14, m: 28, m2026: 42 },
    },
    totalQuestions: 71,
    avgQuestions: 10.1,
    avgMarks: 20.2,
    avgMarks2026: 30.3,
    trend: { en: '🚀 Rising Star (12-14 Qs consistent)', hi: '🚀 तेजी से बढ़ता (12-14 प्रश्न निरंतर)' },
    trendType: 'rising',
    color: 'amber',
  },
  {
    unitId: 9,
    unitKey: 'unit-9',
    title: { en: 'Information & Communication Tech (ICT)', hi: 'सूचना एवं संचार प्रौद्योगिकी (ICT)' },
    years: {
      2020: { q: 2, m: 4, m2026: 6 },
      2021: { q: 6, m: 12, m2026: 18 },
      2022: { q: 8, m: 16, m2026: 24 },
      2023: { q: 10, m: 20, m2026: 30 },
      2024: { q: 10, m: 20, m2026: 30 },
      2025: { q: 9, m: 18, m2026: 27 },
      2026: { q: 6, m: 12, m2026: 18 },
    },
    totalQuestions: 51,
    avgQuestions: 7.3,
    avgMarks: 14.6,
    avgMarks2026: 21.9,
    trend: { en: '🟡 Stable (8-10 Qs baseline)', hi: '🟡 स्थिर आधार (8-10 प्रश्न)' },
    trendType: 'stable',
    color: 'rose',
  },
  {
    unitId: 10,
    unitKey: 'unit-10',
    title: { en: 'Tribes of MP, Heritage & Culture', hi: 'म.प्र. की जनजातियाँ व लोक संस्कृति' },
    years: {
      2020: { q: 4, m: 8, m2026: 12 },
      2021: { q: 2, m: 4, m2026: 6 },
      2022: { q: 2, m: 4, m2026: 6 },
      2023: { q: 4, m: 8, m2026: 12 },
      2024: { q: 5, m: 10, m2026: 15 },
      2025: { q: 7, m: 14, m2026: 21 },
      2026: { q: 10, m: 20, m2026: 30 },
    },
    totalQuestions: 34,
    avgQuestions: 4.9,
    avgMarks: 9.8,
    avgMarks2026: 14.7,
    trend: { en: '🚀 Surging Anchor (10 Qs / 30M in 2026!)', hi: '🚀 नए सिलेबस का केंद्र (2026 में 10 Qs / 30M!)' },
    trendType: 'rising',
    color: 'emerald',
  },
];

// ============================================================================
// 3. Visual Unit Weightage Summary
// ============================================================================
export const UNIT_BARS = [
  { unit: 'Unit 5 (Polity & Governance)', unitHi: 'यूनिट 5 (संवैधानिक व्यवस्था)', marks: 34.0, marks2026: 51.0, pct: 17.0, color: 'bg-purple-500' },
  { unit: 'Unit 1 (History of India)', unitHi: 'यूनिट 1 (भारत का इतिहास)', marks: 26.6, marks2026: 39.9, pct: 13.3, color: 'bg-rose-500' },
  { unit: 'Unit 2 (MP History & Culture)', unitHi: 'यूनिट 2 (म.प्र. इतिहास व संस्कृति)', marks: 24.8, marks2026: 37.2, pct: 12.4, color: 'bg-amber-500' },
  { unit: 'Unit 8 (Current & Sports)', unitHi: 'यूनिट 8 (समसामयिकी एवं खेल)', marks: 20.2, marks2026: 30.3, pct: 10.1, color: 'bg-amber-600' },
  { unit: 'Unit 7 (Science & Health)', unitHi: 'यूनिट 7 (विज्ञान एवं स्वास्थ्य)', marks: 18.8, marks2026: 28.2, pct: 9.4, color: 'bg-indigo-500' },
  { unit: 'Unit 4 (MP Geography)', unitHi: 'यूनिट 4 (मध्य प्रदेश का भूगोल)', marks: 17.8, marks2026: 26.7, pct: 8.9, color: 'bg-emerald-500' },
  { unit: 'Unit 3 (Geography of India)', unitHi: 'यूनिट 3 (भारत एवं विश्व भूगोल)', marks: 16.8, marks2026: 25.2, pct: 8.4, color: 'bg-blue-500' },
  { unit: 'Unit 6 (Economy)', unitHi: 'यूनिट 6 (अर्थव्यवस्था)', marks: 16.6, marks2026: 24.9, pct: 8.3, color: 'bg-cyan-500', note: 'Surged to 51M in 2026!' },
  { unit: 'Unit 9 (ICT / Tech)', unitHi: 'यूनिट 9 (सूचना प्रौद्योगिकी)', marks: 14.6, marks2026: 21.9, pct: 7.3, color: 'bg-pink-500' },
  { unit: 'Unit 10 (MP Tribes)', unitHi: 'यूनिट 10 (म.प्र. की जनजातियाँ)', marks: 9.8, marks2026: 14.7, pct: 4.9, color: 'bg-teal-500', note: 'Surged to 30M in 2026!' },
];

// ============================================================================
// 4. Top 8 Most Repeated Question Patterns (Real Exam Proofs)
// ============================================================================
export const VECTOR_PATTERNS: VectorPattern[] = [
  {
    id: 'census-2011',
    rank: 1,
    title: {
      en: 'Census 2011 (Density, Decadal Growth & Literacy)',
      hi: 'जनगणना 2011 (जनसंख्या घनत्व, दशकीय वृद्धि दर एवं साक्षरता)',
    },
    frequency: { en: 'Repeated in 5 out of 7 Years!', hi: '7 में से 5 वर्षों में सीधे दोहराया गया!' },
    vectorDistance: '99% Match',
    similarityBadge: { en: '99% Match · Direct Repetition', hi: '99% मैच · सीधा दोहराव' },
    summary: {
      en: 'Census 2011 states rankings (highest/lowest decadal growth, lowest density, literacy) recur almost every consecutive year.',
      hi: 'राज्यों की न्यूनतम/अधिकतम दशकीय वृद्धि दर, न्यूनतम घनत्व और साक्षरता क्रम पर लगभग हर साल सीधा सवाल पूछा गया है।',
    },
    questions: [
      {
        year: 2020,
        qNum: 'Q61',
        text: {
          en: 'According to Census 2011, which state had the lowest decadal population growth rate?',
          hi: 'वर्ष 2011 की जनगणना के अनुसार किस राज्य में जनसंख्या की दशकीय वृद्धि दर न्यूनतम रही?',
        },
        answer: { en: 'Nagaland (-0.6%)', hi: 'नागालैंड (-0.6%)' },
      },
      {
        year: 2022,
        qNum: 'Q51',
        text: {
          en: 'According to Census 2011, which state recorded the highest population growth rate?',
          hi: 'वर्ष 2011 की जनगणना के अनुसार किस राज्य में जनसंख्या वृद्धि दर सर्वाधिक थी?',
        },
        answer: { en: 'Meghalaya (27.95%)', hi: 'मेघालय (27.95%)' },
      },
      {
        year: 2024,
        qNum: 'Q80',
        text: {
          en: 'According to Census 2011, which of the following states recorded the lowest population growth rate?',
          hi: 'जनगणना वर्ष 2011 के अनुसार, भारत के निम्नलिखित राज्यों में से कौन-से राज्य में जनसंख्या वृद्धि दर न्यूनतम थी?',
        },
        answer: { en: 'Nagaland', hi: 'नागालैंड' },
      },
      {
        year: 2026,
        qNum: 'Q9',
        text: {
          en: 'According to Census 2011, which state had the lowest population density in the country?',
          hi: 'वर्ष 2011 की जनगणना के अनुसार, देश में किस राज्य की जनसंख्या घनत्व न्यूनतम थी?',
        },
        answer: { en: 'Arunachal Pradesh (17 persons/sq km)', hi: 'अरुणाचल प्रदेश (17 व्यक्ति/वर्ग किमी)' },
      },
    ],
  },
  {
    id: 'mp-soils',
    rank: 2,
    title: {
      en: 'Soils of Madhya Pradesh (Black Soil & Chambal Basin)',
      hi: 'मध्य प्रदेश की मिट्टियां (विशेषकर काली मिट्टी एवं चंबल बेसिन)',
    },
    frequency: { en: 'Repeated in 4 out of 7 Years!', hi: '7 में से 4 वर्षों में दोहराया गया!' },
    vectorDistance: '98% Match',
    similarityBadge: { en: 'Near Exact Match · High Yield', hi: 'लगभग हूबहू मैच · उच्च अंक' },
    summary: {
      en: 'Geographical distribution of black soil, Baghelkhand soil traits, and alluvium in Chambal ravine region.',
      hi: 'काली मिट्टी का भौगोलिक विस्तार, बघेलखंड में लाल-पीली मिट्टी की स्थिति और चंबल बेसिन की कछारी/जलोढ़ मिट्टी पर सतत प्रश्न।',
    },
    questions: [
      {
        year: 2021,
        qNum: 'Q5',
        text: {
          en: 'In which region of Madhya Pradesh is black soil not found?',
          hi: 'मध्यप्रदेश के किस क्षेत्र में काली मिट्टी नहीं पायी जाती है?',
        },
        answer: { en: 'Baghelkhand (Red-Yellow soil)', hi: 'बघेलखंड (लाल-पीली मिट्टी पाई जाती है)' },
      },
      {
        year: 2023,
        qNum: 'Q73',
        text: {
          en: 'Which of the following characteristics is not correct with reference to black soil of Madhya Pradesh?',
          hi: 'निम्नलिखित में से कौन-सी विशेषता मध्य प्रदेश की काली मिट्टी के संदर्भ में सही नहीं है?',
        },
        answer: { en: 'High clay content, rich in lime and iron', hi: 'उच्च जलधारण क्षमता, चूना-लौह युक्त' },
      },
      {
        year: 2026,
        qNum: 'Q78',
        text: {
          en: 'Which of the following soil types is found in the Chambal Basin?',
          hi: 'चम्बल बेसिन में निम्नलिखित में से कौन-सी मिट्टी पायी जाती है?',
        },
        answer: { en: 'Alluvial / Kachhari Soil', hi: 'कछारी / जलोढ़ मिट्टी' },
      },
    ],
  },
  {
    id: 'mp-governors',
    rank: 3,
    title: {
      en: 'Governors of MP (Backgrounds, Former Chief Ministers & Tenures)',
      hi: 'मध्य प्रदेश के राज्यपाल (पृष्ठभूमि, पूर्व मुख्यमंत्री पद व कार्यकाल)',
    },
    frequency: { en: '6 out of 7 Years — MPPSC Top Favorite!', hi: '7 में से 6 वर्ष — MPPSC का सबसे चहेता विषय!' },
    vectorDistance: '98% Match',
    similarityBadge: { en: 'Super Consistent · 6/7 Years', hi: 'अत्यंत सुसंगत · 7 में से 6 वर्ष' },
    summary: {
      en: 'Questions test specific biographical facts of MP Governors: who served as CM of Haryana, who were in Constituent Assembly, shortest tenure.',
      hi: 'राज्यपालों के व्यक्तिगत जीवन, अन्य राज्यों के मुख्यमंत्री पद, संविधान सभा सदस्यता एवं राष्ट्रपति शासन के समय राज्यपाल पर सवाल।',
    },
    questions: [
      {
        year: 2020,
        qNum: 'Q76',
        text: {
          en: 'Which of the following Governors of MP served as Chief Minister of Haryana?',
          hi: 'मध्य प्रदेश के निम्नांकित राज्यपालों में से कौन हरियाणा के मुख्यमंत्री रहे हैं?',
        },
        answer: { en: 'Dr. Bhagwat Dayal Sharma', hi: 'डॉ. भगवत दयाल शर्मा' },
      },
      {
        year: 2021,
        qNum: 'Q4',
        text: {
          en: 'Which of the following Governors of Madhya Pradesh was not a member of the Constituent Assembly?',
          hi: 'मध्य प्रदेश के निम्नलिखित राज्यपालों में से कौन भारत की संविधान सभा के सदस्य नहीं रहे हैं?',
        },
        answer: { en: 'N.N. Wanchoo / Satya Narayan Sinha', hi: 'एन.एन. वांचू / सत्यनारायण सिन्हा' },
      },
      {
        year: 2022,
        qNum: 'Q68',
        text: {
          en: 'Which Governor of MP also served as the Chief Minister of Haryana?',
          hi: 'मध्य प्रदेश के किस राज्यपाल ने हरियाणा के मुख्यमंत्री के रूप में भी कार्य किया?',
        },
        answer: { en: 'Dr. Bhagwat Dayal Sharma (Direct Repeat!)', hi: 'डॉ. भगवत दयाल शर्मा (हूबहू रिपीट!)' },
      },
      {
        year: 2026,
        qNum: 'Q16',
        text: {
          en: 'Which of the following statements about the Governor of Madhya Pradesh is not correct?',
          hi: 'मध्य प्रदेश के राज्यपाल के बारे में निम्नलिखित में से कौन-सा सही नहीं है?',
        },
        answer: { en: 'Constitutional tenure & powers review', hi: 'संवैधानिक शक्तियां एवं कार्यकाल का तथ्यात्मक परीक्षण' },
      },
    ],
  },
  {
    id: 'human-rights-commission',
    rank: 4,
    title: {
      en: 'State Human Rights Commission (Selection Committee & Appointments)',
      hi: 'राज्य मानवाधिकार आयोग (चयन समिति एवं नियुक्तियां)',
    },
    frequency: { en: 'Appeared in 4 Years', hi: '4 वर्षों में दोहराया गया!' },
    vectorDistance: '97% Match',
    similarityBadge: { en: 'Direct PYQ Repeat', hi: 'प्रत्यक्ष PYQ रिपीट' },
    summary: {
      en: 'The 4-member appointment recommendation committee under Section 21 of Protection of Human Rights Act 1993 (CM, Home Minister, Speaker, Leader of Opposition).',
      hi: 'मानवाधिकार संरक्षण अधिनियम 1993 की धारा 21 एवं नियुक्ति सिफारिश समिति (मुख्यमंत्री, गृह मंत्री, विधानसभा अध्यक्ष, नेता प्रतिपक्ष) पर बार-बार सवाल।',
    },
    questions: [
      {
        year: 2020,
        qNum: 'Q18',
        text: {
          en: 'The committee recommending appointments of Chairman and members of State Human Rights Commission is headed by...',
          hi: 'राज्य मानवाधिकार आयोग के अध्यक्ष और सदस्यों की नियुक्ति के नामों की सिफारिश करने वाली समिति के प्रमुख कौन होते हैं?',
        },
        answer: { en: 'Chief Minister', hi: 'मुख्यमंत्री' },
      },
      {
        year: 2021,
        qNum: 'Q56',
        text: {
          en: 'Who is included in the committee recommending names for Chairman and members of State Human Rights Commission?',
          hi: 'राज्य मानवाधिकार आयोग के अध्यक्ष एवं सदस्यों की नियुक्ति के नामों की सिफारिश करने वाली समिति में कौन शामिल है?',
        },
        answer: { en: 'Chief Minister, Home Minister, Speaker, Leader of Opposition', hi: 'मुख्यमंत्री, गृह मंत्री, विधानसभा अध्यक्ष, नेता प्रतिपक्ष' },
      },
      {
        year: 2022,
        qNum: 'Q21',
        text: {
          en: 'Who amongst the following is not a member of the selection committee for State Human Rights Commission members?',
          hi: 'राज्य मानवाधिकार आयोग के सदस्यों की नियुक्ति के नामों की सिफारिश करने वाली समिति में कौन शामिल नहीं होता?',
        },
        answer: { en: 'Governor / Chief Justice of High Court', hi: 'राज्यपाल / उच्च न्यायालय के मुख्य न्यायाधीश शामिल नहीं होते' },
      },
    ],
  },
  {
    id: 'state-reorg-1956',
    rank: 5,
    title: {
      en: 'State Reorganisation Act 1956 (States & Union Territories count)',
      hi: '1956 का राज्य पुनर्गठन अधिनियम (राज्यों एवं UTs की संख्या)',
    },
    frequency: { en: 'Word-for-word Repeat in 2020 & 2025!', hi: '2020 और 2025 में हूबहू दोहराया गया!' },
    vectorDistance: '95% Match',
    similarityBadge: { en: 'Word-for-Word Repeat', hi: 'शब्दशः हूबहू सवाल' },
    summary: {
      en: 'Factual question regarding how many states and Union Territories were created under Fazal Ali commission & 1956 Act.',
      hi: 'फजल अली आयोग एवं 1956 के राज्य पुनर्गठन अधिनियम द्वारा गठित 14 राज्यों व 6 संघ राज्य क्षेत्रों पर प्रश्न।',
    },
    questions: [
      {
        year: 2020,
        qNum: 'Q54',
        text: {
          en: 'How many States and Union Territories were created by the State Reorganisation Act, 1956?',
          hi: '1956 के राज्य पुनर्गठन अधिनियम द्वारा कितने राज्य और केंद्र शासित प्रदेश बनाए गए थे?',
        },
        answer: { en: '14 States and 6 UTs', hi: '14 राज्य और 6 केंद्र शासित प्रदेश' },
      },
      {
        year: 2025,
        qNum: 'Q3',
        text: {
          en: 'According to the State Reorganisation Act, 1956, how many states and union territories were created?',
          hi: 'राज्य पुनर्गठन अधिनियम, 1956 के अनुसार कितने राज्य और संघ राज्य क्षेत्र बनाए गए थे?',
        },
        answer: { en: '14 States and 6 UTs (Identical question!)', hi: '14 राज्य और 6 संघ राज्य क्षेत्र (हूबहू सवाल!)' },
      },
    ],
  },
  {
    id: 'longest-river',
    rank: 6,
    title: {
      en: 'Longest River & Drainage System in India',
      hi: 'भारत की सबसे लंबी नदी एवं अपवाह तंत्र',
    },
    frequency: { en: 'Consecutive Year Repeat (2024 & 2025)', hi: 'लगातार 2 वर्षों में हूबहू प्रश्न (2024 व 2025)!' },
    vectorDistance: '100% Match',
    similarityBadge: { en: 'Consecutive Year Duplicate', hi: 'लगातार दो वर्षों में समान प्रश्न' },
    summary: {
      en: 'The highest repeat rate in the entire 7-year dataset — an exact verbatim duplicate across consecutive examination cycles.',
      hi: 'संपूर्ण 7-वर्षीय डेटासेट में सबसे सटीक दोहराव — लगातार दो वर्षों में शब्दशः वही प्रश्न दोहराया गया।',
    },
    questions: [
      {
        year: 2024,
        qNum: 'Q77',
        text: {
          en: 'Which of the following is the longest river?',
          hi: 'निम्नलिखित में से कौन-सी सबसे लम्बी नदी है?',
        },
        answer: { en: 'Ganga / Godavari (peninsular)', hi: 'गंगा / प्रायद्वीपीय भारत में गोदावरी' },
      },
      {
        year: 2025,
        qNum: 'Q100',
        text: {
          en: 'Which of the following is the longest river?',
          hi: 'निम्नलिखित में से सबसे लंबी नदी कौन-सी है?',
        },
        answer: { en: 'Identical options & question (Word-for-Word Repeat)', hi: 'समान विकल्प एवं प्रश्न (शब्दशः दोहराव)' },
      },
    ],
  },
  {
    id: 'mp-tribes-culture',
    rank: 7,
    title: {
      en: 'Tribes of MP (Bhil, Pithora, Bhagoria & Freedom Fighters)',
      hi: 'मध्य प्रदेश की जनजातियाँ (भील, पिथोरा, भगोरिया एवं स्वतंत्रता सेनानी)',
    },
    frequency: { en: 'Present in All 7 Years — Surging in New Syllabus', hi: 'सभी 7 वर्षों में उपस्थित — नए पाठ्यक्रम में सर्वोच्च प्राथमिकता' },
    vectorDistance: '94% Match',
    similarityBadge: { en: 'Core Thematic Cluster', hi: 'प्रमुख थीम क्लस्टर' },
    summary: {
      en: 'Pithora art artists (Pema Fatya, Bhuri Bai), Tantya Bhil, Bhima Nayak, Shankar Shah, and tribal musical instruments like Gudum Baja.',
      hi: 'पिथोरा चित्रकार (पेमा फत्या, भूरी बाई), टंट्या भील, भीमा नायक, शंकर शाह-रघुनाथ शाह एवं जनजातीय वाद्य (गुदुम बाजा)।',
    },
    questions: [
      {
        year: 2021,
        qNum: 'Q8',
        text: {
          en: 'Famous artist of Bhil tribe Pithora painting who received Padma Shri?',
          hi: 'भील जनजाति की पिथोरा चित्रकला के प्रसिद्ध चित्रकार जिन्हें पद्मश्री मिला?',
        },
        answer: { en: 'Bhuri Bai / Pema Fatya', hi: 'भूरी बाई / पेमा फत्या' },
      },
      {
        year: 2024,
        qNum: 'Q29',
        text: {
          en: 'Self-employment scheme named after tribal freedom fighter in MP?',
          hi: 'मध्यप्रदेश में आदिवासियों के लिए स्वरोजगार योजना किसके नाम पर है?',
        },
        answer: { en: 'Tantya Bhil Swarojgar Yojana', hi: 'टंट्या भील स्वरोजगार योजना' },
      },
      {
        year: 2026,
        qNum: 'Q64 & Q70',
        text: {
          en: 'Traditional musical instrument "Gudum Baja" & clan system "Netam" associated with which tribe?',
          hi: 'आदिवासियों का पारंपरिक वाद्य "गुदुम बाजा" एवं गोत्र व्यवस्था "नेतम" किस जनजाति से है?',
        },
        answer: { en: 'Gond / Dhurwa tribe', hi: 'धुर्वा / गोंड जनजाति' },
      },
    ],
  },
  {
    id: 'cyber-security',
    rank: 8,
    title: {
      en: 'Cyber Security (Malware, Phishing & Firewall)',
      hi: 'साइबर सुरक्षा (मैलवेयर, फ़िशिंग एवं फ़ायरवॉल)',
    },
    frequency: { en: '5 out of 7 Years in Unit 9', hi: 'यूनिट 9 में 7 में से 5 वर्ष निरंतर' },
    vectorDistance: '93% Match',
    similarityBadge: { en: 'High Repeat Topic · Unit 9', hi: 'उच्च रिपीट टॉपिक · यूनिट 9' },
    summary: {
      en: 'Distinctions between Trojan, Virus, Worm, Ransomware, Phishing email attacks, and network Firewalls.',
      hi: 'ट्रोजन, वर्म, रैनसमवेयर, फ़िशिंग सोशल इंजीनियरिंग हमले एवं नेटवर्क फ़ायरवॉल के कार्यों पर लगातार प्रश्न।',
    },
    questions: [
      {
        year: 2021,
        qNum: 'Q91',
        text: {
          en: 'What is unsolicited commercial email called?',
          hi: 'अनपेक्षित व्यावसायिक ई-मेल को क्या कहते हैं?',
        },
        answer: { en: 'Spam', hi: 'स्पैम (Spam)' },
      },
      {
        year: 2023,
        qNum: 'Q15',
        text: {
          en: 'What is the primary function of a Firewall in computer networks?',
          hi: 'कंप्यूटर नेटवर्क में फ़ायरवॉल का मुख्य कार्य क्या है?',
        },
        answer: { en: 'Filter network packets & block unauthorized access', hi: 'अनधिकृत पहुंच को रोकना एवं पैकेट फ़िल्टरिंग' },
      },
      {
        year: 2024,
        qNum: 'Q18',
        text: {
          en: 'Social engineering method where users are tricked into revealing sensitive info?',
          hi: 'सोशल इंजीनियरिंग का वह तरीका जिसमें उपयोगकर्ता को संवेदनशील जानकारी प्रकट करने के लिए छल किया जाता है?',
        },
        answer: { en: 'Phishing', hi: 'फ़िशिंग (Phishing)' },
      },
      {
        year: 2025,
        qNum: 'Q22',
        text: {
          en: 'Malware that pretends to be a useful software?',
          hi: 'एक मैलवेयर जो उपयोगी सॉफ्टवेयर का दिखावा करता है?',
        },
        answer: { en: 'Trojan Horse', hi: 'ट्रोजन हॉर्स (Trojan Horse)' },
      },
    ],
  },
];

// ============================================================================
// 5. Unit-by-Unit Microscopic Hot Topics & Consistency Analysis (Units 1 to 10)
// ============================================================================
export const UNITS_INTELLIGENCE: UnitIntelligence[] = [
  {
    unitId: 1,
    unitCode: 'Unit 1',
    title: { en: 'History of India', hi: 'भारत का इतिहास' },
    subtitle: { en: 'Ancient Knowledge Tradition, National Freedom Struggle & Philosophical Schools', hi: 'प्राचीन ज्ञान परंपरा, स्वतंत्रता संग्राम एवं प्रमुख दर्शन' },
    icon: '🏛️',
    color: 'rose',
    stats: {
      avgQuestions: 13.3,
      avgMarks: 26.6,
      consistencyLabel: { en: 'Evergreen Anchor (11-18 Qs)', hi: 'सदाबहार स्तंभ (11-18 प्रश्न)' },
      trendDescription: { en: 'Never drops below 11 questions. Heavy tilt towards Vedic texts and philosophy in the revised syllabus.', hi: 'कभी भी 11 प्रश्नों से नीचे नहीं जाता। नए सिलेबस में वैदिक साहित्य और दर्शन पर भारी जोर।' },
    },
    coreSyllabusFocus: [
      { en: 'Ancient Indian Knowledge Tradition, Vedas, Upanishads & Ashrams', hi: 'प्राचीन भारतीय ज्ञान परंपरा, वेद, उपनिषद एवं आश्रम व्यवस्था' },
      { en: 'Six Schools of Philosophy (Shad-Darshan) & Founders', hi: 'षड्दर्शन (सांख्य, योग, न्याय आदि) एवं प्रवर्तक' },
      { en: '1857 Revolt, Revolutionary Movements & Freedom Struggle', hi: '1857 क्रांति, क्रांतिकारी आंदोलन एवं राष्ट्रीय स्वतंत्रता संघर्ष' },
      { en: 'Major Historical Novels, Documents & Newspapers', hi: 'प्रमुख ऐतिहासिक उपन्यास, क्रांतिकारी दस्तावेज एवं समाचार पत्र' },
    ],
    hotTopics: [
      {
        id: 'ht-1-1',
        topicNumber: 'Hot Topic 1.1',
        title: {
          en: 'Ancient Indian Knowledge Tradition, Vedic Literature & Philosophy',
          hi: 'प्राचीन भारतीय ज्ञान परंपरा, वैदिक साहित्य एवं दर्शन',
        },
        consistencyScore: '100% (7/7 years)',
        starRating: 3,
        frequencyLabel: { en: 'Predicted: 3–4 Questions Every Year', hi: 'पूर्वानुमान: हर साल 3-4 संभावित प्रश्न' },
        examinerMindset: {
          en: 'In the revised syllabus, "Ancient Indian Knowledge Tradition" is placed right at top. Examiners focus on Brahmanas of Vedas, Upanishadic dialogues, Ashrams, and Philosophical schools rather than conventional medieval battles.',
          hi: '2024 के नए सिलेबस में "प्राचीन भारतीय ज्ञान परंपरा" शीर्ष पर है। परीक्षक अब युद्धों के बजाय वेदों के ब्राह्मण ग्रंथों, उपनिषद संवादों, आश्रम व्यवस्था और दर्शन पर सीधे सवाल पूछ रहा है।',
        },
        realQuestions: [
          {
            year: 2026,
            qNum: 'Q51',
            question: {
              en: 'In Vedic literature, Sabha and Samiti are referred to as two daughters of which deity?',
              hi: 'वैदिक साहित्य में सभा और समिति को किस देवता की दो पुत्रियाँ कहा गया है?',
            },
            answer: { en: 'Prajapati (Atharva Veda)', hi: 'प्रजापति (अथर्ववेद में)' },
          },
          {
            year: 2026,
            qNum: 'Q53',
            question: {
              en: 'In which text was the mention of all four Ashramas first made?',
              hi: 'चारों आश्रमों का उल्लेख सर्वप्रथम किस ग्रन्थ में किया गया है?',
            },
            answer: { en: 'Jabala Upanishad', hi: 'जाबालोपनिषद' },
          },
          {
            year: 2025,
            qNum: 'Q20',
            question: {
              en: 'In which Upanishad does the famous dialogue between Yajnavalkya and Gargi appear?',
              hi: 'किस उपनिषद में याज्ञवल्क्य और गार्गी का प्रसिद्ध संवाद मिलता है?',
            },
            answer: { en: 'Brihadaranyaka Upanishad', hi: 'बृहदारण्यक उपनिषद' },
          },
          {
            year: 2025,
            qNum: 'Q86',
            question: {
              en: "'Satkaryavada' is the main basis of which philosophical school?",
              hi: "'सत्कार्यवाद' (Satkaryavada) किस दर्शन का मुख्य आधार है?",
            },
            answer: { en: 'Samkhya Philosophy (Kapila Muni)', hi: 'सांख्य दर्शन (कपिल मुनि)' },
          },
          {
            year: 2025,
            qNum: 'Q90',
            question: {
              en: 'Which Brahmana text is associated with Yajurveda?',
              hi: 'यजुर्वेद से संबंधित ब्राह्मण ग्रंथ कौन-सा है?',
            },
            answer: { en: 'Shatapatha / Taittiriya Brahmana', hi: 'शतपथ / तैत्तिरीय' },
          },
          {
            year: 2024,
            qNum: 'Q67',
            question: {
              en: 'Which mantra was prescribed for the Upanayana ceremony of Kshatriya varna?',
              hi: 'क्षत्रिय वर्णों के उपनयन संस्कार में किस मन्त्र के सम्पादन का प्रावधान था?',
            },
            answer: { en: 'Trishtubh Mantra', hi: 'त्रिष्टुप मन्त्र (ब्राह्मण = गायत्री, वैश्य = जगती)' },
          },
          {
            year: 2024,
            qNum: 'Q70',
            question: {
              en: 'Under Ashtanga Yoga, what constitutes internal practice (Antaranga)?',
              hi: 'अष्टांग योग के अन्तर्गत किसे अन्तरंग साधना कहा जाता है?',
            },
            answer: { en: 'Dharana, Dhyana, Samadhi', hi: 'धारणा, ध्यान, समाधि' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'Vedas & Their Brahmanas', hi: 'वेदों के ब्राह्मण ग्रंथ' },
            items: [
              { en: 'Rigveda = Aitareya, Kaushitaki', hi: 'ऋग्वेद = ऐतरेय, कौषीतकी' },
              { en: 'Samaveda = Panchavimsha (Tandya), Jaiminiya', hi: 'सामवेद = पंचविंश (ताण्ड्य), जैमिनीय' },
              { en: 'Yajurveda = Shatapatha (White), Taittiriya (Black)', hi: 'यजुर्वेद = शतपथ (शुक्ल), तैत्तिरीय (कृष्ण)' },
              { en: 'Atharvaveda = Gopath Brahmana', hi: 'अथर्ववेद = गोपथ ब्राह्मण' },
            ],
          },
          {
            category: { en: 'Famous Upanishadic Dialogues & Dictums', hi: 'प्रमुख उपनिषद संवाद एवं सूक्तियां' },
            items: [
              { en: 'Satyameva Jayate = Mundaka Upanishad', hi: 'सत्यमेव जयते = मुण्डकोपनिषद' },
              { en: 'Yama-Nachiketa Dialogue = Katha Upanishad', hi: 'यम-नचिकेता संवाद = कठोपनिषद' },
              { en: 'Yajnavalkya-Gargi Dialogue = Brihadaranyaka Upanishad', hi: 'याज्ञवल्क्य-गार्गी संवाद = बृहदारण्यक' },
              { en: 'Four Ashramas first mention = Jabala Upanishad', hi: 'चारों आश्रमों का प्रथम उल्लेख = जाबालोपनिषद' },
              { en: 'Tattvamasi (That thou art) = Chandogya Upanishad', hi: 'तत्वमसि = छांदोग्य उपनिषद' },
            ],
          },
          {
            category: { en: 'Six Schools of Philosophy (Shad-Darshan)', hi: 'षड्दर्शन एवं उनके प्रवर्तक' },
            items: [
              { en: 'Samkhya = Kapila Muni (Satkaryavada)', hi: 'सांख्य = कपिल मुनि (सत्कार्यवाद)' },
              { en: 'Yoga = Maharshi Patanjali', hi: 'योग = महर्षि पतंजलि (अष्टांग योग)' },
              { en: 'Nyaya = Gautama Rishi (Pramana system)', hi: 'न्याय = गौतम ऋषि (तर्क एवं प्रमाण)' },
              { en: 'Vaisheshika = Kanada (Atomic theory)', hi: 'वैशेषिक = कणाद (परमाणु सिद्धांत)' },
              { en: 'Purva Mimamsa = Jaimini (Vedic rituals)', hi: 'पूर्व मीमांसा = जैमिनी (कर्मकांड)' },
              { en: 'Uttara Mimamsa (Vedanta) = Badarayana', hi: 'उत्तर मीमांसा = बादरायण (वेदान्त)' },
            ],
          },
          {
            category: { en: 'Pancha Mahayajnas (Householder)', hi: 'पंच महायज्ञ (गृहस्थ आश्रम)' },
            items: [
              { en: 'Brahma Yajna (Rishi Yajna) = Study of Vedas', hi: 'ब्रह्मयज्ञ (ऋषियज्ञ) = स्वाध्याय व अध्यापन' },
              { en: 'Deva Yajna = Havan to gods', hi: 'देवयज्ञ = देवताओं की आहुति' },
              { en: 'Pitri Yajna = Tarpan to ancestors', hi: 'पितृयज्ञ = श्राद्ध व तर्पण' },
              { en: 'Manushya Yajna (Nri Yajna) = Hospitality to guests', hi: 'मनुष्ययज्ञ (नृयज्ञ) = अतिथि सत्कार' },
              { en: 'Bhuta Yajna = Feeding animals and living creatures', hi: 'भूतयज्ञ = पशु-पक्षियों को भोजन' },
            ],
          },
        ],
      },
      {
        id: 'ht-1-2',
        topicNumber: 'Hot Topic 1.2',
        title: {
          en: 'National Freedom Struggle, Revolutionary Documents & Historical Novels',
          hi: 'राष्ट्रीय स्वतंत्रता संघर्ष, क्रांतिकारी आंदोलन एवं प्रमुख पुस्तकें',
        },
        consistencyScore: '100% (7/7 years)',
        starRating: 3,
        frequencyLabel: { en: 'Predicted: 2–3 Questions Every Year', hi: 'पूर्वानुमान: हर साल 2-3 संभावित प्रश्न' },
        examinerMindset: {
          en: 'Precise dates of crucial freedom movement events, revolutionary secret literature, and authors of nationalistic novels.',
          hi: 'स्वतंत्रता आंदोलन की प्रमुख घटनाओं की सटीक तिथियां, क्रांतिकारी संगठन और उस दौर के ऐतिहासिक उपन्यास/समाचार पत्रों के लेखक।',
        },
        realQuestions: [
          {
            year: 2026,
            qNum: 'Q52',
            question: {
              en: 'When did the Tebhaga Movement start in Bengal?',
              hi: 'बंगाल में तेभागा आन्दोलन कब प्रारम्भ हुआ था?',
            },
            answer: { en: '1946 (Kisan Sabha)', hi: '1946 (किसान सभा द्वारा)' },
          },
          {
            year: 2026,
            qNum: 'Q55',
            question: {
              en: 'At whose request did Bhagwati Charan Vohra prepare the document "The Philosophy of the Bomb"?',
              hi: 'दस्तावेज - "द फिलॉसफी ऑफ द बॉम्ब" किसके अनुरोध पर भगवती चरण वोहरा ने तैयार किया था?',
            },
            answer: { en: 'Chandrashekhar Azad', hi: 'चंद्रशेखर आजाद के अनुरोध पर' },
          },
          {
            year: 2026,
            qNum: 'Q99',
            question: {
              en: 'In Bankim Chandra Chatterjee\'s novel "Anandamath", which character sang "Vande Mataram"?',
              hi: 'बंकिम चन्द्र चटर्जी के उपन्यास "आनंदमठ" में किस पात्र द्वारा "वंदे मातरम" गाया गया?',
            },
            answer: { en: 'Bhavananda', hi: 'भवानंद' },
          },
          {
            year: 2025,
            qNum: 'Q4',
            question: {
              en: 'When did Muslim League observe Direct Action Day?',
              hi: 'मुस्लिम लीग ने "सीधी कार्यवाही" (Direct Action Day) की घोषणा कब की?',
            },
            answer: { en: '16 August 1946', hi: '16 अगस्त 1946' },
          },
          {
            year: 2025,
            qNum: 'Q5',
            question: {
              en: 'Why is 6th April 1930 famous in Indian history?',
              hi: '6 अप्रैल, 1930 की तिथि इतिहास में क्यों प्रसिद्ध है?',
            },
            answer: { en: 'Conclusion of Dandi March / Breaking Salt Law', hi: 'दांडी मार्च समाप्ति / नमक कानून भंग' },
          },
          {
            year: 2024,
            qNum: 'Q61',
            question: {
              en: 'Who is the author of the historical novel "Durgesh Nandini"?',
              hi: 'ऐतिहासिक उपन्यास "दुर्गेश नन्दिनी" के लेखक कौन हैं?',
            },
            answer: { en: 'Bankim Chandra Chattopadhyay (1865)', hi: 'बंकिम चंद्र चट्टोपाध्याय' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'Must-Remember Historic Dates', hi: 'अहम ऐतिहासिक तिथियां' },
            items: [
              { en: '6 April 1930 = Salt Law broken at Dandi', hi: '6 अप्रैल 1930 = दांडी में नमक कानून तोड़ा' },
              { en: '23 March 1931 = Martyrdom of Bhagat Singh, Rajguru, Sukhdev', hi: '23 मार्च 1931 = भगत सिंह, सुखदेव, राजगुरु का बलिदान' },
              { en: '8 August 1942 = Quit India Resolution passed in Bombay', hi: '8 अगस्त 1942 = भारत छोड़ो प्रस्ताव पारित' },
              { en: '16 August 1946 = Direct Action Day by Muslim League', hi: '16 अगस्त 1946 = प्रत्यक्ष कार्रवाई दिवस' },
            ],
          },
          {
            category: { en: 'Revolutionary Documents & Books', hi: 'क्रांतिकारी दस्तावेज एवं रचनाएं' },
            items: [
              { en: '"The Philosophy of the Bomb" = Bhagwati Charan Vohra', hi: '"द फिलॉसफी ऑफ द बॉम्ब" = भगवती चरण वोहरा' },
              { en: '"Bandi Jeevan" = Sachindra Nath Sanyal (Bible of Revolutionaries)', hi: '"बंदी जीवन" = शचींद्रनाथ सान्याल (क्रांतिकारियों की बाइबिल)' },
              { en: '"Pather Dabi" = Sarat Chandra Chattopadhyay', hi: '"पथेर दाबी" = शरतचंद्र चट्टोपाध्याय' },
              { en: '"Anandamath" & "Durgesh Nandini" = Bankim Chandra', hi: '"आनंदमठ" एवं "दुर्गेश नन्दिनी" = बंकिम चंद्र चटर्जी' },
            ],
          },
        ],
      },
    ],
    predictions2026_2027: [
      { en: 'A question from Brahmanas of the Vedas or Aranyakas is predicted as high probability.', hi: 'वेदों के ब्राह्मण ग्रंथ या आरण्यक से 1 प्रश्न पूछे जाने का प्रबल पूर्वानुमान है।' },
      { en: 'Ancient administrative designation (e.g. Mauryan Pradeshta or Gupta Kumaramatya) is expected based on repeat patterns.', hi: 'प्राचीन काल के प्रशासनिक अधिकारी (मौर्य "प्रदेष्टा" या गुप्त "कुमारामात्य") पर प्रश्न पूछे जाने की उच्च संभावना है।' },
    ],
  },
  {
    unitId: 2,
    unitCode: 'Unit 2',
    title: { en: 'MP History, Culture & Literature', hi: 'म.प्र. का इतिहास, संस्कृति व साहित्य' },
    subtitle: { en: 'Major Dynasties, Folk Dramas, Folk Music, Archaeological Inscriptions & Literature', hi: 'प्रमुख राजवंश, साहित्यकार, लोकनाट्य, लोकनृत्य एवं ऐतिहासिक अभिलेख' },
    icon: '🏰',
    color: 'amber',
    stats: {
      avgQuestions: 12.4,
      avgMarks: 24.8,
      consistencyLabel: { en: 'High-Yield Backbone (12-15 Qs)', hi: 'हाई-यील्ड मेरुदंड (12-15 प्रश्न)' },
      trendDescription: { en: 'Consistently provides 24–30 marks every single year. Essential core for prelims cutoff.', hi: 'हर साल 24–30 अंक प्रदान करती है। कटऑफ निकालने का मुख्य आधार।' },
    },
    coreSyllabusFocus: [
      { en: 'Paramaras (Bhoj), Chandelas (Khajuraho), Bundelas & Holkars', hi: 'परमार (राजा भोज), चंदेल (खजुराहो), बुंदेला एवं होलकर राजवंश' },
      { en: 'Literary Masters: Kalidasa, Banabhatta, Bhavabhuti, Keshavdas, Makhanlal', hi: 'साहित्यकार: कालिदास, बाणभट्ट, भवभूति, केशवदास, माखनलाल चतुर्वेदी' },
      { en: 'Folk Theatre: Maach (Malwa), Gammat (Nimar), Mansukha, Swang', hi: 'लोकनाट्य: माच (मालवा), गम्मत (निमाड़), मनसुखा (बघेलखंड), स्वांग' },
      { en: 'Inscriptions: Gurjarra (Ashoka name), Eran (Sati), Dashpur (Silk weavers)', hi: 'अभिलेख: गुर्जर्रा (अशोक नाम), एरण (सती प्रथा), दशपुर (रेशम बुनकर)' },
    ],
    hotTopics: [
      {
        id: 'ht-2-1',
        topicNumber: 'Hot Topic 2.1',
        title: {
          en: 'Literary Figures of Madhya Pradesh & Their Masterpieces',
          hi: 'मध्य प्रदेश के साहित्यकार एवं उनकी अमर कृतियां',
        },
        consistencyScore: '100% (7/7 years)',
        starRating: 3,
        frequencyLabel: { en: 'Predicted: 2–3 Questions Every Year', hi: 'पूर्वानुमान: हर साल 2-3 संभावित प्रश्न' },
        examinerMindset: {
          en: 'Match-the-following questions pairing authors with books across Ancient (Kalidasa, Bhavabhuti), Medieval (Keshavdas, Padmakar), and Modern (Makhanlal, Sharad Joshi).',
          hi: 'प्राचीन, मध्यकालीन और आधुनिक साहित्यकारों की कृतियों का सीधा सुमेलन पूछा जाता है।',
        },
        realQuestions: [
          {
            year: 2026,
            qNum: 'Q97',
            question: {
              en: 'Match the literature figures with their works (Kalidasa, Banabhatta, Bhavabhuti, Padmakar).',
              hi: 'मध्य प्रदेश के साहित्यकारों का उनकी कृतियों से सुमेलन (कालिदास, बाणभट्ट, भवभूति, पद्माकर)।',
            },
            answer: { en: 'Bhavabhuti = Malatimadhava, Banabhatta = Kadambari, Padmakar = Prabodh Pachasa', hi: 'भवभूति = मालतीमाधव, बाणभट्ट = कादंबरी, पद्माकर = प्रबोध पचासा' },
          },
          {
            year: 2025,
            qNum: 'Q81',
            question: {
              en: 'Who is the author of "Alhakhand"?',
              hi: '"आल्हाखण्ड" (Alhakhand) के लेखक कौन हैं?',
            },
            answer: { en: 'Jagnik (Chandel court poet)', hi: 'जगनिक (चंदेल दरबारी कवि)' },
          },
          {
            year: 2025,
            qNum: 'Q82',
            question: {
              en: 'Which book is not written by Keshavdas?',
              hi: 'कौन-सी पुस्तक केशवदास द्वारा नहीं लिखी गई है?',
            },
            answer: { en: 'Rasikpriya, Kavipriya, Ramchandrika were written by him', hi: 'रसिकप्रिया, कविप्रिया, रामचंद्रिका केशवदास की हैं' },
          },
          {
            year: 2024,
            qNum: 'Q95',
            question: {
              en: 'Shankar Rao Pandit was associated with which musical genre / Gharana?',
              hi: 'शंकर राव पंडित का संबंध किस विधा/घराने से था?',
            },
            answer: { en: 'Gwalior Gharana, Khayal singing', hi: 'ग्वालियर घराना, ख्याल गायकी' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'Ancient Masters', hi: 'प्राचीन साहित्यकार' },
            items: [
              { en: 'Kalidasa: Abhijñānaśākuntalam, Meghadutam, Ritusamharam, Raghuvamsham', hi: 'कालिदास: अभिज्ञानशाकुंतलम्, मेघदूतम्, ऋतुसंहारम्, रघुवंशम्' },
              { en: 'Banabhatta: Harshacharita, Kadambari, Parvatiparinaya', hi: 'बाणभट्ट: हर्षचरित, कादंबरी, पार्वतीपरिणय' },
              { en: 'Bhavabhuti: Malatimadhava, Uttararamacharita ("Poet of Karuna Rasa")', hi: 'भवभूति: मालतीमाधव, उत्तररामचरित ("करुण रस के कवि")' },
              { en: 'Bhartrihari: Nitisatakam, Shringarasatakam, Vairagyasatakam', hi: 'भरथरी: नीतिशतक, शृंगारशतक, वैराग्यशतक (उज्जैन गुफाएं)' },
            ],
          },
          {
            category: { en: 'Medieval & Modern Masters', hi: 'मध्यकालीन व आधुनिक साहित्यकार' },
            items: [
              { en: 'Keshavdas (Orchha): "Pret of Difficult Poetry", Rasikpriya, Ramchandrika', hi: 'केशवदास (ओरछा): "कठिन काव्य का प्रेत", रसिकप्रिया, रामचंद्रिका' },
              { en: 'Padmakar (Sagar): Prabodh Pachasa, Himmat Bahadur Virudavali', hi: 'पद्माकर (सागर): प्रबोध पचासा, हिम्मतबहादुर विरुदावली' },
              { en: 'Jagnik: Alhakhand (Alha-Udal heroism), Parmal Raso', hi: 'जगनिक: आल्हाखण्ड (आल्हा-ऊदल की 52 लड़ाइयों का वर्णन)' },
              { en: 'Makhanlal Chaturvedi: "Ek Bharatiya Atma", Him Kiritini, Pushp ki Abhilasha', hi: 'माखनलाल चतुर्वेदी: "एक भारतीय आत्मा", हिमकिरीटिनी, पुष्प की अभिलाषा' },
              { en: 'Subhadra Kumari Chauhan: Jhansi ki Rani, Bikhre Moti, Tridhara', hi: 'सुभद्रा कुमारी चौहान: झांसी की रानी, बिखरे मोती, त्रिधारा' },
              { en: 'Sharad Joshi: Jeep par Sawar Illiyan, Andhon ka Hathi', hi: 'शरद जोशी: जीप पर सवार इल्लियां, अंधों का हाथी' },
            ],
          },
        ],
      },
      {
        id: 'ht-2-2',
        topicNumber: 'Hot Topic 2.2',
        title: {
          en: 'Folk Theatre, Folk Dances, Folk Songs & Traditional Crafts',
          hi: 'लोक नाट्य, लोक नृत्य, लोकगीत एवं शिल्प कलाएं',
        },
        consistencyScore: '100% (7/7 years)',
        starRating: 3,
        frequencyLabel: { en: 'Predicted: ~2 Questions Every Year', hi: 'पूर्वानुमान: हर साल ~2 संभावित प्रश्न' },
        examinerMindset: {
          en: 'Exact geographic mapping of folk dances/theatres across Malwa, Nimar, Bundelkhand, and Baghelkhand, plus craft centers.',
          hi: 'मालवा, निमाड़, बुंदेलखंड व बघेलखंड के लोकनाट्यों और पारंपरिक शिल्पों के भौगोलिक केंद्रों पर सवाल।',
        },
        realQuestions: [
          {
            year: 2026,
            qNum: 'Q98',
            question: {
              en: 'Match the folk songs with their special features (Faag, Alha, Sanja, Barsati Barta).',
              hi: 'लोकगीतों और उनकी विशेषताओं का मिलान (फाग, आल्हा, संजा, बरसाती बारता)।',
            },
            answer: { en: 'Barsati Barta = Malwa monsoon, Sanja = Unmarried girls, Alha = Heroic ballad', hi: 'बरसाती बारता = मालवा ऋतु गीत, संजा = कुंआरी कन्याएं, आल्हा = वीर रस' },
          },
          {
            year: 2026,
            qNum: 'Q100',
            question: {
              en: 'Pioneer who modernized the Maach folk theatre tradition of Malwa?',
              hi: 'मालवा की माच लोक रंगशैली को आधुनिक विधा में बदलने वाले प्रणेता कौन थे?',
            },
            answer: { en: 'Siddheshwar Sen / Gopalji Guru', hi: 'सिद्धेश्वर सेन / गोपालजी गुरु' },
          },
          {
            year: 2025,
            qNum: 'Q76',
            question: {
              en: 'Uchehara is a major craft center for which craft in MP?',
              hi: 'उचेहरा (Uchehara) किस शिल्प का बड़ा केंद्र है?',
            },
            answer: { en: 'Bell Metal / Bronze Craft, Satna', hi: 'कांस्य / बेल मेटल शिल्प (सतना)' },
          },
          {
            year: 2025,
            qNum: 'Q85',
            question: {
              en: 'In which region is "Mansukha" folk drama popular?',
              hi: '"मनसुखा" (Mansukha) लोक नाट्य किस क्षेत्र में प्रचलित है?',
            },
            answer: { en: 'Baghelkhand (Humor & satire)', hi: 'बघेलखंड (हास्य-व्यंग्य विधा)' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'Folk Theatres of MP', hi: 'मध्य प्रदेश के प्रमुख लोकनाट्य' },
            items: [
              { en: 'Maach = Malwa (State Folk Theatre of MP, Ujjain origin)', hi: 'माच = मालवा (मध्य प्रदेश का राजकीय लोकनाट्य, उज्जैन)' },
              { en: 'Gammat = Nimar (Mridang & Jhanjh, satirical)', hi: 'गम्मत = निमाड़ (मृदंग व झांझ, हास्य-व्यंग्य)' },
              { en: 'Mansukha = Baghelkhand (Chhail-Chhabili comedy)', hi: 'मनसुखा = बघेलखंड (हास्य-व्यंग्य, छैल-छबीली)' },
              { en: 'Swang / Raas = Bundelkhand', hi: 'स्वांग / रास = बुंदेलखंड' },
              { en: 'Hingola = Baghelkhand (Inter-village banter)', hi: 'हिंगोला = बघेलखंड (ग्रामों के बीच नोकझोंक)' },
            ],
          },
          {
            category: { en: 'Traditional Handicrafts & GI Tags', hi: 'पारंपरिक शिल्प एवं प्रमुख केंद्र' },
            items: [
              { en: 'Chanderi Sarees = Ashoknagar (GI Tag)', hi: 'चंदेरी साड़ी = अशोकनगर (GI टैग)' },
              { en: 'Maheshwari Sarees = Khargone (Ahilyabai patronized)', hi: 'महेश्वरी साड़ी = खरगोन (अहिल्याबाई द्वारा संरक्षण)' },
              { en: 'Bagh Print = Dhar (Geometrical wooden block print)', hi: 'बाघ प्रिंट = धार (लकड़ी के ठप्पा छापे)' },
              { en: 'Batik Print = Bhairavgarh (Ujjain)', hi: 'बटिक प्रिंट = भैरवगढ़ (उज्जैन)' },
              { en: 'Bell Metal Craft = Uchehara (Satna), Datia, Tikamgarh', hi: 'कांस्य/बेल मेटल शिल्प = उचेहरा (सतना), दतिया, टीकमगढ़' },
              { en: 'Betel Nut (Supari) Toys = Rewa', hi: 'सुपारी शिल्प = रीवा' },
              { en: 'Wood Lathe (Kharad) Art = Sheopur, Budhni', hi: 'काष्ठ खराद कला = श्योपुर, बुधनी' },
            ],
          },
        ],
      },
      {
        id: 'ht-2-3',
        topicNumber: 'Hot Topic 2.3',
        title: {
          en: 'Historical Inscriptions, Archaeological Sites & Caves',
          hi: 'ऐतिहासिक अभिलेख, पुरातात्विक स्थल एवं गुफाएं',
        },
        consistencyScore: '100% (7/7 years)',
        starRating: 3,
        frequencyLabel: { en: 'Predicted: ~2 Questions Every Year', hi: 'पूर्वानुमान: हर साल ~2 संभावित प्रश्न' },
        examinerMindset: {
          en: 'Sites of Ashokan minor rock edicts, Gupta period inscriptions, and key cave discoveries (Wakankar, R.V. Joshi).',
          hi: 'अशोक के लघु शिलालेख, गुप्तकालीन अभिलेख एवं गुफा खोजकर्ता (वाकणकर, आर.वी. जोशी)।',
        },
        realQuestions: [
          {
            year: 2026,
            qNum: 'Q91',
            question: {
              en: 'In which minor rock edict of MP does the personal name of Emperor Ashoka appear?',
              hi: 'मौर्य सम्राट अशोक का व्यक्तिगत नाम म.प्र. के किस लघु शिलालेख में मिलता है?',
            },
            answer: { en: 'Gurjarra (Datia - Devanampriya Priyadasi Ashokarajas)', hi: 'गुर्जर्रा (दतिया - "देवनामप्रिय प्रियदर्शी अशोकराजस")' },
          },
          {
            year: 2026,
            qNum: 'Q96',
            question: {
              en: 'Who excavated the Adamgarh prehistoric site in Narmadapuram?',
              hi: 'नर्मदापुरम जिले के आदमगढ़ पुरास्थल का उत्खनन किसने किया?',
            },
            answer: { en: 'R.V. Joshi and M.D. Khare (1960-61)', hi: 'आर.वी. जोशी एवं एम.डी. खरे' },
          },
          {
            year: 2025,
            qNum: 'Q74',
            question: {
              en: 'When did Dr. V.S. Wakankar discover the rock shelters of Bhimbetka?',
              hi: 'डॉ. विष्णु श्रीधर वाकणकर ने भीमबेटका के शैलाश्रयों की खोज कब की थी?',
            },
            answer: { en: '1957–1958', hi: '1957–58 (1957)' },
          },
          {
            year: 2025,
            qNum: 'Q77',
            question: {
              en: 'Which cave of Bagh (Dhar) is known as "Rang Mahal"?',
              hi: 'बाग (धार) की किस गुफा को "रंग महल" कहा जाता है?',
            },
            answer: { en: 'Cave Number 4', hi: 'गुफा संख्या 4' },
          },
          {
            year: 2024,
            qNum: 'Q100',
            question: {
              en: 'Where is the Sondhani pillar inscription of Yashodharman located?',
              hi: 'यशोधर्मन का सौंदनी अभिलेख कहाँ स्थित है?',
            },
            answer: { en: 'Mandsaur (Dashpur)', hi: 'मंदसौर' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'Inscriptions of MP', hi: 'मध्य प्रदेश के प्रमुख अभिलेख' },
            items: [
              { en: 'Gurjarra (Datia): Mentions Ashoka name', hi: 'गुर्जर्रा (दतिया): अशोक का वास्तविक नाम उल्लेखित' },
              { en: 'Roopnath (Katni/Jabalpur): Ashoka edict', hi: 'रूपनाथ (कटनी/जबलपुर): अशोक का लघु शिलालेख' },
              { en: 'Panguraria (Sehore): Ashoka named "Maharajkumar"', hi: 'पानगुराड़िया (सीहोर): अशोक को "महाराजकुमार" कहा गया' },
              { en: 'Eran (Sagar): 510 AD Bhanugupta, 1st Sati inscription evidence', hi: 'एरण (सागर): 510 ई. भानुगुप्त, प्रथम सती प्रथा साक्ष्य (गोपराज की पत्नी)' },
              { en: 'Dashpur (Mandsaur): Kumaragupta & Bandhuvarman, Sun temple & silk weavers', hi: 'दशपुर (मंदसौर): कुमारगुप्त व बंधुवर्मन, सूर्य मंदिर व तंतुवाय (रेशम बुनकर) श्रेणी' },
              { en: 'Udayagiri (Vidisha): Chandragupta II minister Virasena cave inscription', hi: 'उदयगिरि (विदिशा): चंद्रगुप्त द्वितीय के मंत्री वीरसेन का अभिलेख' },
            ],
          },
        ],
      },
    ],
    predictions2026_2027: [
      { en: 'High probability prediction for a question on a specific temple or palace of Khajuraho or Mandu.', hi: 'खजुराहो या मांडू के किसी विशेष मंदिर/महल पर प्रश्न पूछे जाने का प्रबल पूर्वानुमान है।' },
      { en: 'Projected Match-the-following on folk theatre styles or performers (Maach / Gammat).', hi: 'लोकनाट्य के कलाकारों या शैलियों (माच/गम्मत) पर मिलान प्रश्न की उच्च संभावना है।' },
    ],
  },
  {
    unitId: 3,
    unitCode: 'Unit 3',
    title: { en: 'Geography of India & World', hi: 'भारत एवं विश्व का भूगोल' },
    subtitle: { en: 'Census 2011 Statistics, ENSO Phenomena, Minerals & Drainage', hi: 'जनगणना 2011, अल नीनो-ला नीना, खनिज पेटियां एवं नदी तंत्र' },
    icon: '🗺️',
    color: 'blue',
    stats: {
      avgQuestions: 8.4,
      avgMarks: 16.8,
      consistencyLabel: { en: 'Stable Balanced Anchor (6-9 Qs)', hi: 'स्थिर संतुलित स्तंभ (6-9 प्रश्न)' },
      trendDescription: { en: 'Balanced weightage. Census 2011 has been a consistent recurring pattern across 7 years.', hi: 'संतुलित वेटेज। 2011 की जनगणना 7 वर्षों से निरंतर पूछा जाने वाला सबसे मजबूत पैटर्न है।' },
    },
    coreSyllabusFocus: [
      { en: 'Census 2011: Density, Literacy, Sex Ratio, Decadal Growth Rates', hi: 'जनगणना 2011: घनत्व, साक्षरता, लिंगानुपात, दशकीय वृद्धि दर' },
      { en: 'Climate: ENSO, El Nino, La Nina, Western Disturbances', hi: 'जलवायु: अल नीनो, ला नीना, दक्षिणी दोलन, पश्चिमी विक्षोभ' },
      { en: 'Major Mineral Belts & Top Producing States in India', hi: 'भारत की प्रमुख खनिज पेटियां एवं शीर्ष उत्पादक राज्य' },
      { en: 'Peninsular Rivers: Godavari, Krishna, Cauvery & Tributaries', hi: 'प्रायद्वीपीय नदियां: गोदावरी, कृष्णा, कावेरी एवं सहायक नदियां' },
    ],
    hotTopics: [
      {
        id: 'ht-3-1',
        topicNumber: 'Hot Topic 3.1',
        title: {
          en: 'Census 2011 (India & State-wise Statistics)',
          hi: 'जनगणना 2011 (भारत एवं राज्यवार सांख्यिकी)',
        },
        consistencyScore: '100% PYQ Frequency (7/7 years)',
        starRating: 3,
        frequencyLabel: { en: 'Predicted: 1–2 Questions Every Year', hi: 'पूर्वानुमान: हर साल 1-2 संभावित प्रश्न' },
        examinerMindset: {
          en: 'Examiner tests lowest/highest decadal growth states, density extremes, and child sex ratio facts.',
          hi: 'परीक्षक न्यूनतम/अधिकतम दशकीय वृद्धि दर, घनत्व और बाल लिंगानुपात के शीर्ष राज्यों को पूछता है।',
        },
        realQuestions: [
          {
            year: 2026,
            qNum: 'Q9',
            question: {
              en: 'Lowest population density state in India as per Census 2011?',
              hi: '2011 की जनगणना के अनुसार देश में न्यूनतम जनसंख्या घनत्व वाला राज्य?',
            },
            answer: { en: 'Arunachal Pradesh (17 persons/sq km)', hi: 'अरुणाचल प्रदेश (17 व्यक्ति/वर्ग किमी)' },
          },
          {
            year: 2025,
            qNum: 'Q17',
            question: {
              en: 'Which state recorded the highest population growth rate during 2001-2011?',
              hi: 'दशक 2001-2011 में किस राज्य की जनसंख्या वृद्धि दर सर्वाधिक रही?',
            },
            answer: { en: 'Meghalaya (27.95%)', hi: 'मेघालय (27.95%)' },
          },
          {
            year: 2024,
            qNum: 'Q80',
            question: {
              en: 'Lowest population growth rate state as per Census 2011?',
              hi: 'जनगणना वर्ष 2011 के अनुसार न्यूनतम जनसंख्या वृद्धि दर वाला राज्य?',
            },
            answer: { en: 'Nagaland (-0.6% negative)', hi: 'नागालैंड (-0.6% ऋणात्मक)' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'Census 2011 High-Yield Extremes', hi: 'जनगणना 2011 के महत्वपूर्ण आंकड़े' },
            items: [
              { en: 'Decadal Growth: Highest = Meghalaya (27.95%), Arunachal (26.03%); Lowest = Nagaland (-0.6%), Kerala (4.9%)', hi: 'दशकीय वृद्धि दर: सर्वाधिक = मेघालय (27.95%), अरुणाचल (26.03%); न्यूनतम = नागालैंड (-0.6%), केरल (4.9%)' },
              { en: 'Density: Highest = Bihar (1106), West Bengal (1028); Lowest = Arunachal (17), Mizoram (52)', hi: 'जनसंख्या घनत्व: सर्वाधिक = बिहार (1106), प. बंगाल (1028); न्यूनतम = अरुणाचल (17), मिजोरम (52)' },
              { en: 'Sex Ratio: Highest = Kerala (1084), Tamil Nadu (996); Lowest = Haryana (879), J&K (889)', hi: 'लिंगानुपात: सर्वाधिक = केरल (1084), तमिलनाडु (996); न्यूनतम = हरियाणा (879), जम्मू-कश्मीर (889)' },
              { en: 'Literacy: Highest = Kerala (94%), Mizoram (91.3%); Lowest = Bihar (61.8%), Arunachal (65.4%)', hi: 'साक्षरता: सर्वाधिक = केरल (94%), मिजोरम (91.3%); न्यूनतम = बिहार (61.8%), अरुणाचल (65.4%)' },
            ],
          },
        ],
      },
      {
        id: 'ht-3-2',
        topicNumber: 'Hot Topic 3.2',
        title: {
          en: 'Climate Phenomena: ENSO, El Nino, La Nina & Western Disturbances',
          hi: 'जलवायु परिघटनाएं (ENSO, अल नीनो, ला नीना, पश्चिमी विक्षोभ)',
        },
        consistencyScore: '71.4% (5/7 years — Focused in 2024–2026)',
        starRating: 2,
        frequencyLabel: { en: 'High Frequency in Recent Papers', hi: 'हालिया वर्षों में अत्यधिक महत्वपूर्ण' },
        examinerMindset: {
          en: 'Conceptual questions on ocean-atmosphere interactions impacting Indian monsoon.',
          hi: 'भारतीय मानसून पर प्रभाव डालने वाली महासागरीय एवं वायुमंडलीय परिघटनाओं पर सैद्धांतिक प्रश्न।',
        },
        realQuestions: [
          {
            year: 2026,
            qNum: 'Q4',
            question: {
              en: 'Origin of Western Disturbances bringing winter rainfall in India?',
              hi: 'भारत में शीतकालीन वर्षा लाने वाले पश्चिमी विक्षोभ (Western Disturbances) की उत्पत्ति कहाँ होती है?',
            },
            answer: { en: 'Mediterranean Sea', hi: 'भूमध्य सागर (Mediterranean Sea)' },
          },
          {
            year: 2025,
            qNum: 'Q98',
            question: {
              en: 'Southern Oscillation is an oscillation between which two oceans?',
              hi: 'दक्षिणी दोलन (Southern Oscillation) किन दो महासागरों के मध्य दोलन है?',
            },
            answer: { en: 'Tropical Pacific & Indian Oceans', hi: 'उष्णकटिबंधीय प्रशांत एवं हिंद महासागर' },
          },
          {
            year: 2024,
            qNum: 'Q75',
            question: {
              en: 'Characteristics of El Nino and impact on Indian monsoon?',
              hi: 'एल नीनो (El Nino) की विशेषताएं एवं भारतीय मानसून पर प्रभाव?',
            },
            answer: { en: 'Warm current off Peru coast, suppresses Indian monsoon rainfall', hi: 'पेरू तट पर गर्म जलधारा, भारतीय मानसून को कमजोर करता है' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'ENSO Cheat Sheet', hi: 'जलवायु परिघटनाओं का सार' },
            items: [
              { en: 'El Nino: Warm current off Peru/Chile coast; weakens Walker circulation; drought/deficit rain in India', hi: 'अल नीनो: पेरू तट पर गर्म समुद्री धारा; वॉकर चक्र कमजोर; भारतीय मानसून में सूखे/कम वर्षा की संभावना' },
              { en: 'La Nina: Abnormally cold water off Peru; highly favorable for Indian monsoon (surplus rain)', hi: 'ला नीना: पेरू तट पर अत्यधिक ठंडा जल; भारतीय मानसून हेतु अत्यंत अनुकूल (अधिशेष वर्षा)' },
              { en: 'Southern Oscillation Index (SOI): Pressure difference between Tahiti (Pacific) and Darwin (Australia/Indian Ocean)', hi: 'दक्षिणी दोलन सूचकांक: ताहिती (प्रशांत) और डार्विन (ऑस्ट्रेलिया/हिंद महासागर) के वायुदाब का अंतर' },
              { en: 'Western Disturbances: Originate in Mediterranean Sea; brought by subtropical westerly jet streams; winter rain (Mahawat) beneficial for Rabi crops (Wheat)', hi: 'पश्चिमी विक्षोभ: भूमध्य सागर से उत्पत्ति; पछुआ जेट स्ट्रीम द्वारा आगमन; शीतकालीन वर्षा (मावठ) रबी फसल (गेहूं) हेतु अमृत' },
            ],
          },
        ],
      },
    ],
    predictions2026_2027: [
      { en: '1 factual question on Census 2011 (literacy, density, or child sex ratio) carries high prediction probability based on 7-year repetition.', hi: '2011 की जनगणना से 1 तथ्यात्मक प्रश्न (साक्षरता, घनत्व या बाल लिंगानुपात) पूछे जाने का मजबूत पूर्वानुमान है।' },
      { en: 'India mineral reserves ranking (Coal / Bauxite / Iron Ore) will be tested.', hi: 'भारत की प्रमुख खनिज उत्पादन रैंकिंग पर प्रश्न पूछा जाएगा।' },
    ],
  },
  {
    unitId: 4,
    unitCode: 'Unit 4',
    title: { en: 'Geography of Madhya Pradesh', hi: 'मध्य प्रदेश का भूगोल' },
    subtitle: { en: 'Rivers & Dams, Mountain Peaks, Mines & Minerals, Soils & Forest Types', hi: 'नदियां एवं बांध, पर्वत चोटियां, प्रमुख खनिज एवं खदानें, मिट्टियां' },
    icon: '🏞️',
    color: 'emerald',
    stats: {
      avgQuestions: 8.9,
      avgMarks: 17.8,
      consistencyLabel: { en: 'Consistent Core (8-12 Qs)', hi: 'निरंतर मजबूत कोर (8-12 प्रश्न)' },
      trendDescription: { en: 'Direct, factual, scoring. Rivers, minerals, and mountain ranges are high-frequency focus areas.', hi: 'सीधे, तथ्यात्मक एवं स्कोरिंग प्रश्न। नदियां, खनिज और पर्वत चोटियां सबसे प्रमुख और अनुमानित क्षेत्र हैं।' },
    },
    coreSyllabusFocus: [
      { en: 'Rivers & Dams: Narmada, Chambal, Betwa, Bansagar, Gandhi Sagar', hi: 'नदियां व बांध: नर्मदा, चंबल, बेतवा, बाणसागर, गांधी सागर' },
      { en: 'Mountain Peaks: Dhupgarh (1350m), Mahadev, Maikal, Amarkantak', hi: 'पर्वत चोटियां: धूपगढ़ (1350 मी), महादेव पहाड़ियां, मैकाल, अमरकंटक' },
      { en: 'Minerals: Malanjkhand (Copper), Bharweli (Manganese), Majhgawan (Diamond)', hi: 'खनिज: मलांजखंड (तांबा), भारवेली (मैंगनीज), मझगवां (हीरा), सुहागपुर (कोयला)' },
      { en: 'Soils: Alluvial (Chambal), Deep Black (Narmada), Red-Yellow (Baghelkhand)', hi: 'मिट्टियां: जलोढ़ (चंबल), गहरी काली (नर्मदा घाटी), लाल-पीली (बघेलखंड)' },
    ],
    hotTopics: [
      {
        id: 'ht-4-1',
        topicNumber: 'Hot Topic 4.1',
        title: {
          en: 'Major Minerals, Mines & Industrial Centers of MP',
          hi: 'मध्य प्रदेश के प्रमुख खनिज, खदानें एवं औद्योगिक केंद्र',
        },
        consistencyScore: '100% (7/7 years)',
        starRating: 3,
        frequencyLabel: { en: 'Predicted: ~2 Questions Every Year', hi: 'पूर्वानुमान: हर साल ~2 संभावित प्रश्न' },
        examinerMindset: {
          en: 'Precise mine names matched with districts (e.g. Bharweli, Malanjkhand, Majhgawan, Suhagpur).',
          hi: 'विशिष्ट खदानों के नाम और उनके जिले (भारवेली, मलांजखंड, मझगवां, सुहागपुर) का सीधा सुमेलन।',
        },
        realQuestions: [
          {
            year: 2026,
            qNum: 'Q73',
            question: {
              en: 'Baihar plateau of Balaghat is famous for reserves of which mineral?',
              hi: 'बालाघाट का बैहर पठार किस खनिज के संचय के लिए प्रसिद्ध है?',
            },
            answer: { en: 'Bauxite / Copper', hi: 'बॉक्साइट / तांबा' },
          },
          {
            year: 2025,
            qNum: 'Q24',
            question: {
              en: 'Top producing mine of manganese in Madhya Pradesh?',
              hi: 'म.प्र. में मैंगनीज के उत्पादन में शीर्ष स्थान कौन-सी खदान रखती है?',
            },
            answer: { en: 'Bharweli Mine, Balaghat (Largest underground mine in Asia)', hi: 'भारवेली खदान, बालाघाट (एशिया की सबसे बड़ी भूमिगत खदान)' },
          },
          {
            year: 2025,
            qNum: 'Q59',
            question: {
              en: 'Match mineral with prominent area: Diamond, Copper, Coal, Limestone.',
              hi: 'खनिज और प्रमुख क्षेत्र का सुमेलन: हीरा, तांबा, कोयला, चूना पत्थर।',
            },
            answer: { en: 'Diamond = Majhgawan, Copper = Malanjkhand, Coal = Suhagpur, Limestone = Katni', hi: 'हीरा = मझगवां (पन्ना), तांबा = मलांजखंड (बालाघाट), कोयला = सुहागपुर, चूना = कटनी' },
          },
          {
            year: 2024,
            qNum: 'Q53',
            question: {
              en: 'Rock phosphate is utilized in which industry in MP?',
              hi: 'रॉक फॉस्फेट का उपयोग किस उद्योग में होता है?',
            },
            answer: { en: 'Phosphatic Fertilizers (Jhabua/Sagar reserves)', hi: 'रासायनिक उर्वरक / फास्फेटिक फर्टिलाइजर' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'Top Mineral Belts of MP', hi: 'मध्य प्रदेश की प्रमुख खदानें एवं खनिज' },
            items: [
              { en: 'Diamond: Majhgawan, Hinota (Panna), Buxwaha (Chhatarpur) — 100% monopoly in India', hi: 'हीरा: मझगवां, हिनौता (पन्ना), बकस्वाहा (छतरपुर) — भारत में 100% एकाधिकार' },
              { en: 'Copper: Malanjkhand (Balaghat - "Copper City") — ~53% of India reserves', hi: 'तांबा: मलांजखंड (बालाघाट - "तांबा नगरी") — भारत का ~53% संचित भंडार' },
              { en: 'Manganese: Bharweli (Balaghat) — Asia\'s largest underground manganese mine', hi: 'मैंगनीज: भारवेली (बालाघाट) — एशिया की सबसे बड़ी भूमिगत मैंगनीज खदान' },
              { en: 'Coal: Suhagpur (Shahdol - largest coalfield); Singrauli (thickest coal seam - 136m)', hi: 'कोयला: सुहागपुर (शहडोल - सबसे बड़ा कोयला क्षेत्र); सिंगरौली (सबसे मोटी परत - 136 मी)' },
              { en: 'Bauxite: Amarkantak (Anuppur), Baihar Plateau (Balaghat), Katni', hi: 'बॉक्साइट: अमरकंटक (अनूपपुर), बैहर पठार (बालाघाट), कटनी' },
              { en: 'Slate: Mandsaur — Only slate producing district in India', hi: 'स्लेट: मंदसौर — भारत में एकमात्र उत्पादक जिला' },
            ],
          },
        ],
      },
      {
        id: 'ht-4-2',
        topicNumber: 'Hot Topic 4.2',
        title: {
          en: 'Rivers, Waterfalls & Multipurpose River Valley Projects of MP',
          hi: 'म.प्र. की नदियां, जलप्रपात एवं बहुउद्देशीय परियोजनाएं',
        },
        consistencyScore: '100% (7/7 years)',
        starRating: 3,
        frequencyLabel: { en: 'Predicted: 2–3 Questions Every Year', hi: 'पूर्वानुमान: हर साल 2-3 संभावित प्रश्न' },
        examinerMindset: {
          en: 'Origin points, river lengths, left/right bank tributaries, and towns situated on riverbanks.',
          hi: 'उद्गम स्थल, कुल लंबाई, दाएं/बाएं तट की सहायक नदियां और तट पर बसे ऐतिहासिक नगर।',
        },
        realQuestions: [
          {
            year: 2025,
            qNum: 'Q57',
            question: {
              en: 'Match town with river: Orchha, Maheshwar, Ujjain, Mandsaur.',
              hi: 'नदी और नगर का सुमेलन: ओरछा, महेश्वर, उज्जैन, मंदसौर।',
            },
            answer: { en: 'Orchha = Betwa, Maheshwar = Narmada, Ujjain = Shipra, Mandsaur = Shivna', hi: 'ओरछा = बेतवा, महेश्वर = नर्मदा, उज्जैन = क्षिप्रा, मंदसौर = शिवना' },
          },
          {
            year: 2023,
            qNum: 'Q6',
            question: {
              en: 'Chachai and Keoti waterfalls are situated on which rivers?',
              hi: 'चचाई एवं केवटी जलप्रपात किस नदी पर हैं?',
            },
            answer: { en: 'Bihad and Mahana rivers (Rewa)', hi: 'बीहड़ एवं महाना नदी (रीवा)' },
          },
          {
            year: 2021,
            qNum: 'Q7',
            question: {
              en: 'Bansagar project is a joint project of which states?',
              hi: 'बाणसागर परियोजना किन राज्यों की संयुक्त परियोजना है?',
            },
            answer: { en: 'MP, UP, Bihar (Ratio 2:1:1 on Son river)', hi: 'म.प्र., यू.पी., बिहार (2:1:1 अनुपात, सोन नदी पर)' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'Narmada & Chambal Quick Facts', hi: 'नर्मदा एवं चंबल नदी का त्वरित सार' },
            items: [
              { en: 'Narmada River: 1312 km total (1077 km in MP); Amarkantak origin; 41 tributaries (22 left, 19 right - Tawa, Hiran, Sher, Shakkar); Waterfalls: Kapildhara, Dughdhara (Anuppur), Dhuandhar (Bhedaghat), Sahastradhara (Maheshwar)', hi: 'नर्मदा: 1312 किमी (म.प्र. में 1077 किमी); उद्गम अमरकंटक; 41 सहायक नदियां (बाएं 22, दाएं 19 - तवा, हिरण, शेर, शक्कर); जलप्रपात: कपिलधारा, दुग्धधारा, धुआंधार, सहस्त्रधारा' },
              { en: 'Chambal River: 965 km; Janapav (Mhow) origin; Dams: Gandhi Sagar (Mandsaur), Rana Pratap Sagar (Rawatbhata), Jawahar Sagar & Kota Barrage (Rajasthan)', hi: 'चंबल: 965 किमी; उद्गम जानापाव (महू); बांध: गांधी सागर (मंदसौर), राणा प्रताप सागर, जवाहर सागर, कोटा बैराज' },
              { en: 'Ken-Betwa Link Project: India\'s 1st river interlinking project (Daudhan dam, passes through Panna National Park)', hi: 'केन-बेतवा लिंक: भारत की प्रथम नदी जोड़ो परियोजना (दौधन बांध, पन्ना नेशनल पार्क से गुजरती है)' },
            ],
          },
        ],
      },
    ],
    predictions2026_2027: [
      { en: 'Balaghat minerals (Copper/Manganese) or Panna diamonds has high predicted probability for 1 question.', hi: 'बालाघाट के खनिज (तांबा/मैंगनीज) या पन्ना के हीरे पर प्रश्न पूछे जाने का प्रबल पूर्वानुमान है।' },
      { en: 'Tributary origin of Narmada or Chambal is expected based on historical recurrence.', hi: 'नर्मदा या चंबल की किसी सहायक नदी के उद्गम पर प्रश्न पूछे जाने की उच्च संभावना है।' },
    ],
  },
  {
    unitId: 5,
    unitCode: 'Unit 5',
    title: { en: 'Constitutional System of India & MP', hi: 'भारत व म.प्र. की संवैधानिक व्यवस्था' },
    subtitle: { en: 'Constitutional & Statutory Commissions, MP Governors, High Court & Panchayati Raj', hi: 'संवैधानिक एवं सांविधिक आयोग, म.प्र. के राज्यपाल, उच्च न्यायालय एवं पंचायती राज' },
    icon: '⚖️',
    color: 'purple',
    stats: {
      avgQuestions: 17.0,
      avgMarks: 34.0,
      consistencyLabel: { en: 'Highest Scoring Anchor (11-24 Qs)', hi: 'सर्वोच्च स्कोरिंग क्षेत्र (11-24 प्रश्न)' },
      trendDescription: { en: 'The ultimate rank decider. Has averaged 34 marks per paper over the 7-year span.', hi: 'रैंक तय करने वाला सबसे बड़ा विषय। 7 वर्षों में औसत 34 अंक प्रति वर्ष।' },
    },
    coreSyllabusFocus: [
      { en: 'Constitutional Commissions: ECI (Art 324), UPSC/MPPSC (Art 315), CAG (Art 148), NCSC/NCST', hi: 'संवैधानिक आयोग: निर्वाचन आयोग (324), UPSC/MPPSC (315), CAG (148), NCSC/NCST (338/338A)' },
      { en: 'Statutory Commissions: NHRC/SHRC, NITI Aayog, Central Vigilance Commission, CIC', hi: 'सांविधिक आयोग: राष्ट्रीय व राज्य मानवाधिकार आयोग, NITI आयोग, CVC, सूचना आयोग' },
      { en: 'Governors of MP: Detailed personal backgrounds, former CMs, Constituent Assembly members', hi: 'मध्य प्रदेश के राज्यपाल: व्यक्तिगत पृष्ठभूमि, पूर्व मुख्यमंत्री पद, संविधान सभा सदस्य' },
      { en: 'Panchayati Raj: 73rd & 74th Amendments, 11th Schedule 29 subjects, MP PR Act 1993', hi: 'पंचायती राज: 73वां/74वां संशोधन, 11वीं अनुसूची के 29 विषय, म.प्र. पंचायती राज अधिनियम 1993' },
    ],
    hotTopics: [
      {
        id: 'ht-5-1',
        topicNumber: 'Hot Topic 5.1',
        title: {
          en: 'Governors of Madhya Pradesh (Tenures, Former Posts & Historical Facts)',
          hi: 'मध्य प्रदेश के राज्यपाल (कार्यकाल, पूर्व पद व संवैधानिक इतिहास)',
        },
        consistencyScore: '100% PYQ Frequency (7/7 years)',
        starRating: 3,
        frequencyLabel: { en: 'Predicted: ~2 Questions Every Year', hi: 'पूर्वानुमान: हर साल ~2 संभावित प्रश्न' },
        examinerMindset: {
          en: 'Deep biographical facts: who served as CM of other states, who was Governor during President\'s Rule, who served the shortest tenure.',
          hi: 'गहन जीवनी संबंधी तथ्य: किस राज्यपाल ने अन्य राज्यों के CM के रूप में कार्य किया, राष्ट्रपति शासन के समय कौन थे, किसका कार्यकाल सबसे छोटा था।',
        },
        realQuestions: [
          {
            year: 2026,
            qNum: 'Q16',
            question: {
              en: 'Which of the following statements about the Governor of Madhya Pradesh is false?',
              hi: 'मध्य प्रदेश के राज्यपाल के बारे में कौन-सा कथन असत्य है?',
            },
            answer: { en: 'Factual verification of powers and previous posts', hi: 'शक्तियों एवं पूर्व पदों का तथ्यात्मक परीक्षण' },
          },
          {
            year: 2025,
            qNum: 'Q14',
            question: {
              en: 'Who was the Governor when President\'s Rule was imposed in MP for the first time in 1977?',
              hi: '1977 में जब म.प्र. में पहली बार राष्ट्रपति शासन लगा, तब राज्यपाल कौन थे?',
            },
            answer: { en: 'Satya Narayan Sinha (S.N. Sinha)', hi: 'सत्यनारायण सिन्हा (एस.एन. सिन्हा)' },
          },
          {
            year: 2025,
            qNum: 'Q15',
            question: {
              en: 'Which Governor had the shortest tenure in Madhya Pradesh?',
              hi: 'म.प्र. के राज्यपालों में से किसका कार्यकाल सबसे छोटा रहा?',
            },
            answer: { en: 'Justice P.V. Dixit (Acting - only 7 days)', hi: 'न्यायमूर्ति पी.वी. दीक्षित (कार्यवाहक - केवल 7 दिन)' },
          },
          {
            year: 2022,
            qNum: 'Q68 & 2020 Q76',
            question: {
              en: 'Which Governor of MP also served as the Chief Minister of Haryana?',
              hi: 'मध्य प्रदेश के कौन-से राज्यपाल हरियाणा के मुख्यमंत्री रहे हैं?',
            },
            answer: { en: 'Dr. Bhagwat Dayal Sharma (Repeated twice!)', hi: 'डॉ. भगवत दयाल शर्मा (दो बार दोहराया गया!)' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'Complete MP Governor Facts', hi: 'म.प्र. के राज्यपालों का संपूर्ण चीट शीट' },
            items: [
              { en: '1st Governor: Dr. B. Pattabhi Sitaramayya (1956-1957)', hi: 'प्रथम राज्यपाल: डॉ. बी. पट्टाभि सीतारमैया (1956-1957)' },
              { en: 'Longest Tenure: H.V. Pataskar (7 years 7 months - awarded Padma Vibhushan in office)', hi: 'सर्वाधिक लंबा कार्यकाल: एच.वी. पाटस्कर (7 वर्ष 7 माह - पद पर रहते हुए पद्म विभूषण मिला)' },
              { en: 'Shortest Tenure: Justice P.V. Dixit (Acting - 7 days only)', hi: 'न्यूनतम कार्यकाल: न्यायमूर्ति पी.वी. दीक्षित (कार्यवाहक - केवल 7 दिन)' },
              { en: 'Constituent Assembly Members: Pattabhi Sitaramayya, H.V. Pataskar, K.C. Reddy, C.M. Poonacha', hi: 'संविधान सभा के सदस्य रहे: पट्टाभि सीतारमैया, एच.वी. पाटस्कर, के.सी. रेड्डी, सी.एम. पुनाचा' },
              { en: 'CMs of other states: K.C. Reddy (Mysore/Karnataka); Dr. Bhagwat Dayal Sharma (Haryana); C.M. Poonacha (Coorg)', hi: 'अन्य राज्यों के CM रहे: के.सी. रेड्डी (मैसूर/कर्नाटक); डॉ. भगवत दयाल शर्मा (हरियाणा); सी.एम. पुनाचा (कुर्ग)' },
              { en: '1st Woman Governor: Ms. Sarla Grewal (1989-1990 - youngest female IAS officer)', hi: 'प्रथम महिला राज्यपाल: सुश्री सरला ग्रेवाल (1989-1990 - भारत की द्वितीय महिला IAS)' },
              { en: 'Governors during President\'s Rule: 1977 = S.N. Sinha; 1980 = C.M. Poonacha; 1992 = Kunwar Mehmood Ali Khan', hi: 'राष्ट्रपति शासन के समय राज्यपाल: 1977 = एस.एन. सिन्हा; 1980 = सी.एम. पुनाचा; 1992 = कुंवर महमूद अली खान' },
            ],
          },
        ],
      },
      {
        id: 'ht-5-2',
        topicNumber: 'Hot Topic 5.2',
        title: {
          en: 'Constitutional & Statutory Commissions (Articles, Composition & Tenures)',
          hi: 'संवैधानिक एवं सांविधिक आयोग (अनुच्छेद, संरचना एवं कार्यकाल)',
        },
        consistencyScore: '100% (7/7 years)',
        starRating: 3,
        frequencyLabel: { en: 'Predicted: 3–4 Questions Every Year', hi: 'पूर्वानुमान: हर साल 3-4 संभावित प्रश्न' },
        examinerMindset: {
          en: 'Tenure limits (6yr/65yr vs 5yr/70yr), appointment committees, constitutional articles, and MP state commission first chairpersons.',
          hi: 'कार्यकाल सीमाएं (6 वर्ष/65 वर्ष), नियुक्ति समितियां, संवैधानिक अनुच्छेद और म.प्र. राज्य आयोगों के प्रथम अध्यक्ष।',
        },
        realQuestions: [
          {
            year: 2026,
            qNum: 'Q12',
            question: {
              en: 'Service conditions of Supreme Court judges governed under which Article?',
              hi: 'उच्चतम न्यायालय के न्यायाधीशों की सेवा शर्तें किस अनुच्छेद में हैं?',
            },
            answer: { en: 'Article 125', hi: 'अनुच्छेद 125' },
          },
          {
            year: 2026,
            qNum: 'Q20 & 2025 Q12',
            question: {
              en: 'National Commission for Scheduled Castes (NCSC) established under which Article?',
              hi: 'राष्ट्रीय अनुसूचित जाति आयोग (NCSC) किस अनुच्छेद के तहत है?',
            },
            answer: { en: 'Article 338 (NCST = 338A, NCBC = 338B)', hi: 'अनुच्छेद 338 (NCST = 338A, NCBC = 338B)' },
          },
          {
            year: 2022,
            qNum: 'Q21',
            question: {
              en: 'Selection committee members for State Human Rights Commission under Section 21?',
              hi: 'राज्य मानवाधिकार आयोग की नियुक्ति सिफारिश समिति में कौन-कौन होते हैं?',
            },
            answer: { en: 'CM (Head), Home Minister, Speaker, Leader of Opposition', hi: 'मुख्यमंत्री (अध्यक्ष), गृह मंत्री, वि.स. अध्यक्ष, नेता प्रतिपक्ष' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'Master Commissions Table', hi: 'प्रमुख संवैधानिक एवं सांविधिक आयोग' },
            items: [
              { en: 'Election Commission of India (ECI): Art 324; 1 CEC + 2 ECs; 6 yrs or 65 yrs age', hi: 'भारत निर्वाचन आयोग: अनुच्छेद 324; 1 मुख्य + 2 चुनाव आयुक्त; कार्यकाल 6 वर्ष या 65 वर्ष' },
              { en: 'MP State Election Commission: Art 243K; Est. 1 Feb 1994; 1st Commissioner: N.B. Lohani; Motto: "Har Vote Keemti, Har Nikay Mahatvapurna"', hi: 'म.प्र. राज्य निर्वाचन आयोग: अनुच्छेद 243K; गठन 1 फरवरी 1994; प्रथम आयुक्त: एन.बी. लोहानी; ध्येय: "हर वोट कीमती, हर निकाय महत्वपूर्ण"' },
              { en: 'UPSC / MPPSC: Art 315; MPPSC Est. 1 Nov 1956; 1st Chairman: D.V. Rege; HQ: Indore; 6 yrs or 62 yrs age (State)', hi: 'UPSC / MPPSC: अनुच्छेद 315; MPPSC गठन 1 नवंबर 1956; प्रथम अध्यक्ष: डी.वी. रेगे; मुख्यालय इंदौर; कार्यकाल 6 वर्ष या 62 वर्ष' },
              { en: 'CAG: Art 148; 6 yrs or 65 yrs; "Guardian of Public Purse", Friend & Philosopher of PAC', hi: 'CAG: अनुच्छेद 148; कार्यकाल 6 वर्ष या 65 वर्ष; "सार्वजनिक धन का संरक्षक", PAC का मार्गदर्शक' },
              { en: 'NHRC / SHRC: Protection of HR Act 1993; State commission = Sec 21; Selection Committee: CM, Home Minister, Speaker, Opposition Leader', hi: 'मानवाधिकार आयोग: 1993 अधिनियम; राज्य आयोग = धारा 21; 4 सदस्यीय समिति: CM, गृहमंत्री, स्पीकर, नेता प्रतिपक्ष' },
            ],
          },
        ],
      },
    ],
    predictions2026_2027: [
      { en: 'A question on the background of a former MP Governor (CM of other state / committee) is a top prediction based on 5-year trend.', hi: 'म.प्र. के किसी पूर्व राज्यपाल के बैकग्राउंड (किस राज्य के CM रहे या किस समिति में थे) पर प्रश्न पूछे जाने का मुख्य पूर्वानुमान है।' },
      { en: 'CAG or Election Commissioner tenure/appointment carries strong prediction likelihood.', hi: 'CAG या चुनाव आयुक्त के कार्यकाल/नियुक्ति पर प्रश्न आने की प्रबल संभावना है।' },
    ],
  },
  {
    unitId: 6,
    unitCode: 'Unit 6',
    title: { en: 'Economy of India & MP', hi: 'भारत एवं मध्य प्रदेश की अर्थव्यवस्था' },
    subtitle: { en: 'MP Economic Survey, One District One Product (ODOP), RBI & Monetary Policy', hi: 'म.प्र. आर्थिक सर्वेक्षण, एक जिला एक उत्पाद (ODOP), RBI मौद्रिक नीति एवं कृषि' },
    icon: '📈',
    color: 'cyan',
    stats: {
      avgQuestions: 8.3,
      avgMarks: 16.6,
      consistencyLabel: { en: 'Sharp Rise (Surged to 17 Qs in 2026!)', hi: 'तीव्र उछाल (2026 में 17 प्रश्न / 34 अंक!)' },
      trendDescription: { en: 'Exponential growth from 4 questions in 2024 to 17 questions in 2026. The new gamechanger unit.', hi: '2024 में 4 प्रश्नों से बढ़कर 2026 में 17 प्रश्न (34 Marks)। अब सबसे निर्णायक यूनिट।' },
    },
    coreSyllabusFocus: [
      { en: 'MP Economic Survey: Agriculture growth, Solar capacity, GSDP, Per Capita Income', hi: 'म.प्र. आर्थिक सर्वेक्षण: कृषि विकास दर, सौर ऊर्जा क्षमता, प्रति व्यक्ति आय' },
      { en: 'One District One Product (ODOP) Mapping across 55 districts', hi: 'एक जिला एक उत्पाद (ODOP) का जिलावार आवंटन' },
      { en: 'Industrial Corridors: Pithampur, Mandideep, Malanpur, Pilukhedi', hi: 'औद्योगिक गलियारे: पीथमपुर (डेट्रायट), मंडीदीप, मालनपुर, पीलूखेड़ी' },
      { en: 'RBI & Monetary Policy: Repo Rate, CRR, SLR, Financial Inclusion Index (FI-Index)', hi: 'RBI एवं मौद्रिक नीति: रेपो रेट, CRR, SLR, वित्तीय समावेशन सूचकांक' },
    ],
    hotTopics: [
      {
        id: 'ht-6-1',
        topicNumber: 'Hot Topic 6.1',
        title: {
          en: 'MP Economic Survey, Industrial Policies & Welfare Schemes',
          hi: 'मध्य प्रदेश का आर्थिक सर्वेक्षण, नीतियां एवं कल्याणकारी योजनाएं',
        },
        consistencyScore: '100% (Recent papers emphasize this heavily)',
        starRating: 3,
        frequencyLabel: { en: 'Surged to 6–8 Questions in 2025–2026', hi: '2025-2026 में 6-8 प्रश्नों की भारी वृद्धि' },
        examinerMindset: {
          en: 'Latest survey numbers: solar targets, ODOP flagship items, Krishi Karman awards, and youth employment subsidies.',
          hi: 'नवीनतम सर्वेक्षण आंकड़े: सौर ऊर्जा लक्ष्य, ODOP उत्पाद, कृषि कर्मण पुरस्कार और युवा स्वरोजगार योजनाएं।',
        },
        realQuestions: [
          {
            year: 2026,
            qNum: 'Q82',
            question: {
              en: 'Solar power installed capacity of MP according to Economic Survey 2024-25?',
              hi: 'म.प्र. आर्थिक सर्वेक्षण 2024-25 के अनुसार सौर ऊर्जा क्षमता?',
            },
            answer: { en: 'Surpassed 3,000+ MW capacity benchmark', hi: '3,000+ मेगावाट की सीमा पार' },
          },
          {
            year: 2026,
            qNum: 'Q83',
            question: {
              en: 'Selected product under "One District One Product" (ODOP) for MP districts?',
              hi: '"एक जिला एक उत्पाद" (ODOP) के तहत चयनित उत्पाद?',
            },
            answer: { en: 'Dindori = Kodo-Kutki, Balaghat = Chinnor Rice, Mandsaur = Garlic', hi: 'डिंडोरी = कोदो-कुटकी, बालाघाट = चिन्नौर चावल, मंदसौर = लहसुन' },
          },
          {
            year: 2025,
            qNum: 'Q13',
            question: {
              en: 'Mukhyamantri Ladli Behna Yojana assistance amount and launch date?',
              hi: 'मुख्यमंत्री लाडली बहना योजना कब शुरू हुई एवं वर्तमान राशि?',
            },
            answer: { en: '10 June 2023, ₹1250 per month', hi: '10 जून 2023 से, ₹1250 प्रतिमाह' },
          },
          {
            year: 2025,
            qNum: 'Q38',
            question: {
              en: 'Mukhyamantri Udyam Kranti Yojana loan ceiling and interest subsidy?',
              hi: 'मुख्यमंत्री उद्यम क्रांति योजना में ऋण सीमा एवं ब्याज अनुदान?',
            },
            answer: { en: '₹1 Lakh to ₹50 Lakh loan with 3% interest subsidy', hi: '₹1 लाख से ₹50 लाख तक ऋण गारंटी व 3% ब्याज अनुदान' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'MP Agricultural Supremacy & ODOP', hi: 'कृषि में म.प्र. की स्थिति एवं प्रमुख ODOP' },
            items: [
              { en: 'Pulses Production = Rank #1 in India; Soyabean = #1; Oilseeds = #1; Total Foodgrains = #2 (after UP)', hi: 'दलहन उत्पादन = देश में #1; सोयाबीन = #1; तिलहन = #1; कुल खाद्यान्न = #2 (उ.प्र. के बाद)' },
              { en: 'Krishi Karman Award: MP won consecutively 7 times', hi: 'कृषि कर्मण पुरस्कार: म.प्र. को लगातार 7 बार प्राप्त' },
              { en: 'Industrial Corridors: Pithampur (Dhar - "Detroit of India", Automobile hub); Mandideep (Raisen - Optical fibre factory); Malanpur (Bhind - Defence); Pilukhedi (Rajgarh)', hi: 'औद्योगिक केंद्र: पीथमपुर (धार - "भारत का डेट्रायट"); मंडीदीप (रायसेन - ऑप्टिकल फाइबर कारखाना); मालनपुर (भिंड); पीलूखेड़ी (राजगढ़)' },
              { en: 'ODOP Highlights: Dindori = Kodo-Kutki; Balaghat = Chinnor Rice (GI Tag); Ratlam = Ratlami Sev; Burhanpur = Banana; Mandsaur = Garlic; Narsinghpur = Tuwar Dal', hi: 'प्रमुख ODOP: डिंडोरी = कोदो-कुटकी; बालाघाट = चिन्नौर चावल (GI टैग); रतलाम = रतलामी सेव; बुरहानपुर = केला; मंदसौर = लहसुन; नरसिंहपुर = तुअर दाल' },
            ],
          },
        ],
      },
      {
        id: 'ht-6-2',
        topicNumber: 'Hot Topic 6.2',
        title: {
          en: 'Money, Banking & Reserve Bank of India (RBI)',
          hi: 'मुद्रा, बैंकिंग एवं भारतीय रिजर्व बैंक (RBI)',
        },
        consistencyScore: '71.4% (5/7 years)',
        starRating: 2,
        frequencyLabel: { en: 'High Scoring Conceptual Area', hi: 'उच्च स्कोरिंग सैद्धांतिक क्षेत्र' },
        examinerMindset: {
          en: 'Functions of RBI, Monetary Policy Committee (MPC) structure, quantitative credit control tools, and CPI inflation base years.',
          hi: 'RBI के कार्य, मौद्रिक नीति समिति संरचना, साख नियंत्रण उपकरण एवं CPI मुद्रास्फीति आधार वर्ष।',
        },
        realQuestions: [
          {
            year: 2026,
            qNum: 'Q84',
            question: {
              en: 'Financial Inclusion Index (FI-Index) is published by which organization?',
              hi: 'भारतीय रिजर्व बैंक का वित्तीय समावेशन सूचकांक (FI-Index) कौन जारी करता है?',
            },
            answer: { en: 'Reserve Bank of India (RBI)', hi: 'भारतीय रिजर्व बैंक (RBI)' },
          },
          {
            year: 2025,
            qNum: 'Q31',
            question: {
              en: 'Primary objective of Monetary Policy in India?',
              hi: 'भारत में मौद्रिक नीति का प्राथमिक उद्देश्य क्या है?',
            },
            answer: { en: 'Maintain price stability while keeping in mind growth', hi: 'मूल्य स्थिरता बनाए रखते हुए आर्थिक संवृद्धि को बढ़ावा देना' },
          },
          {
            year: 2026,
            qNum: 'Q49',
            question: {
              en: 'Base year of Consumer Price Index (CPI) combined in India?',
              hi: 'उपभोक्ता मूल्य सूचकांक (CPI) का आधार वर्ष क्या है?',
            },
            answer: { en: '2012 = 100', hi: '2012 = 100' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'RBI & Monetary Policy Cheat Sheet', hi: 'RBI एवं मौद्रिक नीति का त्वरित सार' },
            items: [
              { en: 'RBI Est: 1 April 1935 (Hilton Young Commission); Nationalised 1 Jan 1949; 1st Governor: Sir Osborne Smith; 1st Indian: C.D. Deshmukh', hi: 'RBI स्थापना: 1 अप्रैल 1935 (हिल्टन यंग आयोग); राष्ट्रीयकरण 1 जनवरी 1949; प्रथम गवर्नर: सर ओसबोर्न स्मिथ; प्रथम भारतीय: सी.डी. देशमुख' },
              { en: 'Monetary Policy Committee (MPC): 6 members (3 RBI + 3 Govt appointed); Ex-officio Chairman = RBI Governor; Minimum 4 meetings per year', hi: 'मौद्रिक नीति समिति: 6 सदस्य (3 RBI + 3 सरकार द्वारा); पदेन अध्यक्ष = RBI गवर्नर; वर्ष में कम से कम 4 बैठकें' },
              { en: 'Tools: Quantitative (CRR, SLR, Repo Rate, Reverse Repo, Bank Rate, MSF, OMO) vs Qualitative (Margin requirements, Moral suasion)', hi: 'उपकरण: मात्रात्मक (CRR, SLR, रेपो रेट, रिवर्स रेपो, MSF, खुले बाजार की क्रियाएं) बनाम गुणात्मक (मार्जिन, नैतिक दबाव)' },
            ],
          },
        ],
      },
    ],
    predictions2026_2027: [
      { en: 'One theoretical question on RBI monetary policy or Bank Rate is predicted with high likelihood.', hi: 'RBI की मौद्रिक नीति या बैंक दर पर 1 सैद्धांतिक प्रश्न पूछे जाने का पूर्वानुमान है।' },
      { en: 'One question on MP district ODOP product or pulse/oilseed rank is expected as a high-probability trend.', hi: 'म.प्र. के किसी जिले के ODOP या दलहन/तिलहन उत्पादन रैंकिंग पर प्रश्न पूछे जाने की प्रबल संभावना है।' },
    ],
  },
  {
    unitId: 7,
    unitCode: 'Unit 7',
    title: { en: 'Science, Environment & Health', hi: 'विज्ञान, पर्यावरण एवं स्वास्थ्य' },
    subtitle: { en: 'Human Body & Nutrition, Vitamins & Diseases, ISRO Missions, Ecology & Disaster Mgmt', hi: 'मानव शरीर एवं पोषण, विटामिन व हीनताजन्य रोग, इसरो मिशन एवं पर्यावरण' },
    icon: '🔬',
    color: 'indigo',
    stats: {
      avgQuestions: 9.4,
      avgMarks: 18.8,
      consistencyLabel: { en: 'Consistent High-Yield Anchor (~9 Qs/yr)', hi: 'निरंतर मजबूत स्तंभ (औसत 9 प्रश्न/वर्ष)' },
      trendDescription: { en: 'The most predictable unit across all 7 years. 9–10 questions without fail.', hi: 'सभी 7 वर्षों में सबसे अधिक अनुमानित इकाई। हर साल बिना चूके 9-10 प्रश्न।' },
    },
    coreSyllabusFocus: [
      { en: 'Human Anatomy: Brain (Hypothalamus), Smallest muscle (Stapedius), Cervical vertebrae (7)', hi: 'मानव शरीर: मस्तिष्क (हाइपोथैलेमस), सबसे छोटी मांसपेशी (स्टैपेडियस), ग्रीवा कशेरुकाएं (7)' },
      { en: 'Nutrition & Vitamins: Chemical names, Deficiency diseases, Sickle Cell Mission 2047', hi: 'पोषण एवं विटामिन: रासायनिक नाम, हीनताजन्य रोग, सिकल सेल मिशन 2047' },
      { en: 'Space Technology: ISRO satellite launch vehicles (PSLV, LVM3), Chandrayaan-3, Aditya L1', hi: 'अंतरिक्ष तकनीक: इसरो प्रक्षेपण यान (PSLV, LVM3), चंद्रयान-3, आदित्य L1' },
      { en: 'Environment: Ozone layer (Dobson unit), Montreal Protocol, Greenhouse gases', hi: 'पर्यावरण: ओजोन परत (डॉबसन इकाई), मॉन्ट्रियल प्रोटोकॉल, ग्रीनहाउस गैसें' },
    ],
    hotTopics: [
      {
        id: 'ht-7-1',
        topicNumber: 'Hot Topic 7.1',
        title: {
          en: 'Human Body, Nutrition & Deficiency / Genetic Disorders',
          hi: 'मानव शरीर, पोषण एवं प्रमुख हीनताजन्य रोग',
        },
        consistencyScore: '100% (7/7 years)',
        starRating: 3,
        frequencyLabel: { en: 'Predicted: 3–4 Questions Every Year', hi: 'पूर्वानुमान: हर साल 3-4 संभावित प्रश्न' },
        examinerMindset: {
          en: 'Sickle cell anemia eradication mission (Shahdol), vitamins chemical names, chromosomal anomalies (Down syndrome trisomy 21).',
          hi: 'सिकल सेल उन्मूलन मिशन (शहडोल), विटामिनों के रासायनिक नाम एवं गुणसूत्रीय विकार (डाउन सिंड्रोम)।',
        },
        realQuestions: [
          {
            year: 2026,
            qNum: 'Q23 & 2025 Q75',
            question: {
              en: 'Target year for National Sickle Cell Anemia Elimination Mission inaugurated in Shahdol?',
              hi: 'शहडोल से शुरू किए गए राष्ट्रीय सिकल सेल एनीमिया उन्मूलन मिशन का लक्ष्य वर्ष?',
            },
            answer: { en: 'Year 2047', hi: 'वर्ष 2047' },
          },
          {
            year: 2026,
            qNum: 'Q30',
            question: {
              en: 'Which part of human brain controls body temperature?',
              hi: 'मानव मस्तिष्क का कौन-सा भाग शरीर के तापमान को नियंत्रित करता है?',
            },
            answer: { en: 'Hypothalamus', hi: 'हाइपोथैलेमस (Hypothalamus)' },
          },
          {
            year: 2025,
            qNum: 'Q84',
            question: {
              en: 'Which is the smallest muscle in the human body?',
              hi: 'मानव शरीर की सबसे छोटी मांसपेशी कौन-सी है?',
            },
            answer: { en: 'Stapedius (in middle ear)', hi: 'स्टैपेडियस (कान में)' },
          },
          {
            year: 2024,
            qNum: 'Q1',
            question: {
              en: 'Disorder caused due to Trisomy of Chromosome 21?',
              hi: 'गुणसूत्र संख्या 21 की ट्राइसोमी के कारण होने वाला विकार?',
            },
            answer: { en: 'Down Syndrome', hi: 'डाउन सिंड्रोम (Down Syndrome)' },
          },
          {
            year: 2024,
            qNum: 'Q3',
            question: {
              en: 'Excessive consumption of which pulse causes Lathyrism?',
              hi: 'किस दाल के अधिक सेवन से लेथाइरिज्म रोग होता है?',
            },
            answer: { en: 'Khesari Dal (Lathyrus sativus)', hi: 'खेसारी दाल (Lathyrus sativus)' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'Vitamins Chemical Names & Deficiencies', hi: 'विटामिनों के रासायनिक नाम एवं हीनताजन्य रोग' },
            items: [
              { en: 'Vitamin A (Retinol) = Night blindness, Xerophthalmia', hi: 'विटामिन A (रेटिनॉल) = रतौंधी, जेरोफ्थैल्मिया' },
              { en: 'Vitamin B1 (Thiamine) = Beri-Beri; B3 (Niacin) = Pellagra', hi: 'विटामिन B1 (थायमिन) = बेरी-बेरी; B3 (नियासिन) = पेलाग्रा' },
              { en: 'Vitamin B12 (Cyanocobalamin - contains Cobalt) = Pernicious Anemia', hi: 'विटामिन B12 (सायनोकोबालामिन - कोबाल्ट युक्त) = परनिशियस एनीमिया' },
              { en: 'Vitamin C (Ascorbic Acid) = Scurvy, bleeding gums', hi: 'विटामिन C (एस्कॉर्बिक एसिड) = स्कर्वी, मसूड़ों से रक्त' },
              { en: 'Vitamin D (Calciferol) = Rickets in children, Osteomalacia in adults', hi: 'विटामिन D (कैल्सीफेरॉल) = रिकेट्स (बच्चों में), ऑस्टियोमलेशिया (वयस्कों में)' },
              { en: 'Vitamin K (Phylloquinone) = Failure of blood clotting', hi: 'विटामिन K (फिलोक्विनोन) = रक्त का थक्का न जमना' },
            ],
          },
          {
            category: { en: 'Genetic Disorders', hi: 'प्रमुख आनुवंशिक विकार' },
            items: [
              { en: 'Down Syndrome = Trisomy of Chromosome 21 (47 chromosomes)', hi: 'डाउन सिंड्रोम = गुणसूत्र 21 की ट्राइसोमी (कुल 47 गुणसूत्र)' },
              { en: 'Turner Syndrome = Monosomy 45, XO (Females only, sterile)', hi: 'टर्नर सिंड्रोम = 45, XO (केवल महिलाओं में, बांझपन)' },
              { en: 'Klinefelter Syndrome = 47, XXY (Males with feminine traits)', hi: 'क्लाइनफेल्टर सिंड्रोम = 47, XXY (पुरुषों में स्त्रीयोचित लक्षण)' },
              { en: 'Sickle Cell Anemia = Autosomal recessive mutation in beta-globin chain (Glutamic acid to Valine at codon 6)', hi: 'सिकल सेल एनीमिया = बीटा-ग्लोबिन श्रृंखला में बिंदु उत्परिवर्तन (ग्लूटामिक एसिड से वैलीन)' },
            ],
          },
        ],
      },
      {
        id: 'ht-7-2',
        topicNumber: 'Hot Topic 7.2',
        title: {
          en: 'Space Technology, ISRO Launch Vehicles & Lunar / Solar Missions',
          hi: 'अंतरिक्ष प्रौद्योगिकी एवं इसरो (ISRO)',
        },
        consistencyScore: '71.4% (5/7 years)',
        starRating: 2,
        frequencyLabel: { en: 'Regular Technical Question', hi: 'नियमित तकनीकी प्रश्न' },
        examinerMindset: {
          en: 'Chandrayaan-3 landing points, National Space Day, launch vehicle propulsion stages (solid/liquid/cryogenic), and Indian astronauts.',
          hi: 'चंद्रयान-3 लैंडिंग स्थल (शिव शक्ति बिंदु), राष्ट्रीय अंतरिक्ष दिवस, प्रक्षेपण यान के चरण एवं भारतीय अंतरिक्ष यात्री।',
        },
        realQuestions: [
          {
            year: 2026,
            qNum: 'Q29',
            question: {
              en: 'Landing site name of Chandrayaan-3 and National Space Day date?',
              hi: 'चंद्रयान-3 के लैंडिंग स्थल का नाम एवं राष्ट्रीय अंतरिक्ष दिवस की तिथि?',
            },
            answer: { en: 'Shiv Shakti Point, 23 August (National Space Day)', hi: 'शिव शक्ति बिंदु, 23 अगस्त (राष्ट्रीय अंतरिक्ष दिवस)' },
          },
          {
            year: 2026,
            qNum: 'Q28',
            question: {
              en: 'Group Captain Shubhanshu Shukla selected for which international mission?',
              hi: 'ग्रुप कैप्टन शुभांशु शुक्ला का चयन किस अंतरराष्ट्रीय अंतरिक्ष मिशन हेतु हुआ?',
            },
            answer: { en: 'Axiom-4 mission to International Space Station (ISS)', hi: 'Axiom-4 अंतरराष्ट्रीय अंतरिक्ष स्टेशन मिशन' },
          },
          {
            year: 2024,
            qNum: 'Q4',
            question: {
              en: 'ISRO rocket that launched record 104 satellites in a single mission in 2017?',
              hi: '2017 में 104 उपग्रह प्रक्षेपित करने वाला ISRO का ऐतिहासिक रॉकेट कौन-सा था?',
            },
            answer: { en: 'PSLV-C37', hi: 'PSLV-C37' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'ISRO Centers & Rockets', hi: 'ISRO के प्रमुख केंद्र एवं प्रक्षेपण यान' },
            items: [
              { en: 'ISRO Est: 15 August 1969; HQ: Bengaluru; 1st Chairman: Dr. Vikram Sarabhai', hi: 'ISRO स्थापना: 15 अगस्त 1969; मुख्यालय बेंगलुरु; प्रथम अध्यक्ष: डॉ. विक्रम साराभाई' },
              { en: 'Launch Centers: Satish Dhawan Space Centre (SDSC SHAR, Sriharikota, AP); Thumba Equatorial Rocket Launching Station (TERLS, Kerala)', hi: 'प्रक्षेपण केंद्र: सतीश धवन अंतरिक्ष केंद्र (श्रीहरिकोटा, आ.प्र.); थुम्बा (केरल)' },
              { en: 'PSLV: Polar Satellite Launch Vehicle (4 stages: Solid, Liquid, Solid, Liquid)', hi: 'PSLV: चार चरण (ठोस, द्रव, ठोस, द्रव)' },
              { en: 'LVM3 / GSLV Mk III: "Bahubali" heavy lifter with C25 cryogenic upper stage; launched Chandrayaan-2, Chandrayaan-3, and Gaganyaan test missions', hi: 'LVM3 / GSLV Mk III: चंद्रयान-3 एवं गगनयान हेतु क्रायोजेनिक C25 चरण युक्त बाहुबली रॉकेट' },
            ],
          },
        ],
      },
    ],
    predictions2026_2027: [
      { en: 'One question on ISRO latest satellite launch vehicle or Gaganyaan/Aditya L1 is a top prediction.', hi: 'ISRO के नवीनतम सैटेलाइट लॉन्च व्हीकल या गगनयान/आदित्य L1 से 1 प्रश्न पूछे जाने का मुख्य पूर्वानुमान है।' },
      { en: 'A question on Vitamin deficiency disorders or Nutrition is projected with high confidence.', hi: 'विटामिन हीनताजन्य रोग (Scurvy, Rickets) या पोषण पर प्रश्न पूछे जाने की प्रबल संभावना है।' },
    ],
  },
  {
    unitId: 8,
    unitCode: 'Unit 8',
    title: { en: 'Current Affairs, Sports & Awards', hi: 'समसामयिक घटनाएं, खेलकूद, पुरस्कार' },
    subtitle: { en: 'MP Sports Awards, Olympic / Asian Games, Padma Awards Recipients & Summits', hi: 'म.प्र. के खेल पुरस्कार, एशियाई व पैरालंपिक खेल, पद्म पुरस्कार एवं प्रमुख योजनाएं' },
    icon: '🏆',
    color: 'amber',
    stats: {
      avgQuestions: 10.1,
      avgMarks: 20.2,
      consistencyLabel: { en: 'Aggressive Rise (12-14 Qs)', hi: 'तेजी से बढ़ता क्षेत्र (12-14 प्रश्न)' },
      trendDescription: { en: 'Grown from 8 questions in 2020 to 14 questions (28 marks) in 2026.', hi: '2020 में 8 प्रश्नों से बढ़कर 2026 में 14 प्रश्न (28 Marks)।' },
    },
    coreSyllabusFocus: [
      { en: 'MP Sports Awards: Vikram (₹2L), Eklavya (₹1L), Vishwamitra, Prabhash Joshi', hi: 'म.प्र. खेल पुरस्कार: विक्रम (₹2 लाख), एकलव्य (₹1 लाख), विश्वामित्र, प्रभाष जोशी' },
      { en: 'State Sport of MP: Malkhamb (Declared 2013, Academy at Ujjain)', hi: 'राजकीय खेल: मलखंभ (2013 घोषित, मलखंभ अकादमी उज्जैन)' },
      { en: 'Padma Awards & MP Personalities (2024–2026)', hi: 'पद्म पुरस्कार से सम्मानित म.प्र. की प्रमुख विभूतियां (2024-2026)' },
      { en: 'National Cultural Awards of MP: Kalidas, Tansen, Kabir, Lata Mangeshkar', hi: 'म.प्र. के राष्ट्रीय सम्मान: कालिदास, तानसेन, कबीर, लता मंगेशकर सम्मान (₹5 लाख)' },
    ],
    hotTopics: [
      {
        id: 'ht-8-1',
        topicNumber: 'Hot Topic 8.1',
        title: {
          en: 'Sports Landscape, Personalities & MP State Sports Awards',
          hi: 'खेल परिदृश्य, खिलाड़ी एवं म.प्र. के खेल पुरस्कार',
        },
        consistencyScore: '100% (7/7 years)',
        starRating: 3,
        frequencyLabel: { en: 'Predicted: ~3 Questions Every Year', hi: 'पूर्वानुमान: हर साल ~3 संभावित प्रश्न' },
        examinerMindset: {
          en: 'Prize amounts, eligibility criteria for Vikram/Eklavya/Prabhash Joshi awards, and athletes from MP in Olympics/Paralympics.',
          hi: 'पुरस्कार राशि, पात्रता मानदंड और ओलंपिक/पैरालंपिक में भाग लेने वाले म.प्र. के खिलाड़ी।',
        },
        realQuestions: [
          {
            year: 2026,
            qNum: 'Q41',
            question: {
              en: 'Award given by Madhya Pradesh Government for excellence in Malkhamb sport?',
              hi: 'मलखंभ खेल के लिए मध्य प्रदेश सरकार द्वारा दिया जाने वाला पुरस्कार कौन-सा है?',
            },
            answer: { en: 'Prabhash Joshi Award (Est. 2013, ₹2 Lakh prize)', hi: 'प्रभाष जोशी पुरस्कार (स्थापना 2013, ₹2 लाख राशि)' },
          },
          {
            year: 2026,
            qNum: 'Q44',
            question: {
              en: 'Host country for ICC Women\'s T20 World Cup 2026?',
              hi: '2026 का महिला T20 वर्ल्ड कप आयोजक देश कौन-सा है?',
            },
            answer: { en: 'England and Wales', hi: 'इंग्लैंड एवं वेल्स' },
          },
          {
            year: 2024,
            qNum: 'Q83',
            question: {
              en: 'Prachi Yadav (Gwalior - Arjuna Award 2023) is associated with which sport?',
              hi: 'म.प्र. की प्राची यादव (ग्वालियर - अर्जुन पुरस्कार 2023) किस खेल से संबंधित हैं?',
            },
            answer: { en: 'Para Canoe', hi: 'पैरा-कैनो (Para Canoe)' },
          },
          {
            year: 2024,
            qNum: 'Q86',
            question: {
              en: 'Youngest player to win FIDE Candidates Chess Tournament?',
              hi: 'सबसे कम उम्र में FIDE कैंडिडेट्स चेस टूर्नामेंट जीतने वाले खिलाड़ी?',
            },
            answer: { en: 'D. Gukesh', hi: 'डी. गुकेश' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'MP Sports Awards Cheat Sheet', hi: 'मध्य प्रदेश खेल पुरस्कार (खेल एवं युवा कल्याण विभाग)' },
            items: [
              { en: 'Vikram Award: Senior players (₹2 Lakh prize - MP\'s highest sports award; 5 years performance)', hi: 'विक्रम पुरस्कार: वरिष्ठ खिलाड़ी (₹2 लाख राशि - म.प्र. का सर्वोच्च खेल पुरस्कार)' },
              { en: 'Eklavya Award: Junior players under 19 years (₹1 Lakh prize)', hi: 'एकलव्य पुरस्कार: 19 वर्ष से कम जूनियर खिलाड़ी (₹1 लाख राशि)' },
              { en: 'Vishwamitra Award: Sports coaches / trainers (₹2 Lakh prize)', hi: 'विश्वामित्र पुरस्कार: खेल प्रशिक्षक / कोच (₹2 लाख राशि)' },
              { en: 'Prabhash Joshi Award: Dedicated to Malkhamb (Est. 2013, ₹2 Lakh prize)', hi: 'प्रभाष जोशी पुरस्कार: मलखंभ खेल हेतु (स्थापना 2013, ₹2 लाख राशि)' },
              { en: 'Lifetime Achievement Award: In memory of Captain Roop Singh (₹2 Lakh prize)', hi: 'लाइफटाइम अचीवमेंट पुरस्कार: कैप्टन रूपसिंह की स्मृति में (₹2 लाख राशि)' },
            ],
          },
        ],
      },
      {
        id: 'ht-8-2',
        topicNumber: 'Hot Topic 8.2',
        title: {
          en: 'National & State Level Honors (Padma Awards, Kalidas, Tansen, Kabir)',
          hi: 'राष्ट्रीय एवं राज्य स्तरीय सम्मान (पद्म पुरस्कार, कालिदास, तानसेन)',
        },
        consistencyScore: '100% (7/7 years)',
        starRating: 3,
        frequencyLabel: { en: 'Predicted: ~2 Questions Every Year', hi: 'पूर्वानुमान: हर साल ~2 संभावित प्रश्न' },
        examinerMindset: {
          en: 'Recipients of Padma awards belonging to MP and fields of national cultural honors instituted by MP Culture Dept.',
          hi: 'म.प्र. की हस्तियां जिन्हें पद्म पुरस्कार मिला और संस्कृति विभाग द्वारा प्रदत्त राष्ट्रीय सम्मानों के क्षेत्र।',
        },
        realQuestions: [
          {
            year: 2026,
            qNum: 'Q43',
            question: {
              en: 'Mohan Nagar (MP) received Padma Shri 2026 in which field?',
              hi: 'मोहन नागर (म.प्र.) को किस क्षेत्र में 2026 में पद्मश्री मिला?',
            },
            answer: { en: 'Art / Folk Culture', hi: 'कला / लोक संस्कृति' },
          },
          {
            year: 2023,
            qNum: 'Q12',
            question: {
              en: 'Kalidas Samman is given in which four fields by MP government?',
              hi: 'कालिदास सम्मान किस-किस क्षेत्र में दिया जाता है?',
            },
            answer: { en: 'Classical Music, Classical Dance, Visual Arts, Theatre (₹5 Lakh prize)', hi: 'शास्त्रीय संगीत, शास्त्रीय नृत्य, रूपंकर कलाएं, रंगकर्म (राशि ₹5 लाख)' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'MP National Cultural Awards (Prize ₹5 Lakh each)', hi: 'म.प्र. के राष्ट्रीय सम्मान (संस्कृति विभाग - राशि ₹5 लाख)' },
            items: [
              { en: 'Kabir Samman = Indian Poetry (Est. 1986)', hi: 'कबीर सम्मान = भारतीय कविता (स्थापना 1986)' },
              { en: 'Kalidas Samman = Classical Music, Dance, Theatre, Fine Arts (Est. 1980)', hi: 'कालिदास सम्मान = 4 विधाएं (शास्त्रीय संगीत, नृत्य, रंगकर्म, रूपंकर)' },
              { en: 'Tansen Samman = Hindustani Classical Music (Gwalior festival, Est. 1980)', hi: 'तानसेन सम्मान = हिंदुस्तानी शास्त्रीय संगीत (ग्वालियर)' },
              { en: 'Lata Mangeshkar Samman = Light Music (Sugam Sangeet - Indore, Est. 1984)', hi: 'लता मंगेशकर सम्मान = सुगम संगीत (इंदौर)' },
              { en: 'Maithilisharan Gupt Samman = Hindi Literature (Est. 1987)', hi: 'मैथिलीशरण गुप्त सम्मान = हिंदी साहित्य' },
              { en: 'Kishore Kumar Samman = Cinema direction, acting, scriptwriting (Khandwa, Est. 1997)', hi: 'किशोर कुमार सम्मान = सिनेमा निर्देशन/अभिनय (खंडवा)' },
            ],
          },
        ],
      },
    ],
    predictions2026_2027: [
      { en: 'Sport discipline of an Arjuna / Vikram awardee from MP will be questioned.', hi: 'म.प्र. के किसी खिलाड़ी जिसे अर्जुन पुरस्कार या विक्रम पुरस्कार मिला हो, उसका खेल पूछा जाएगा।' },
      { en: 'District / field of a Padma Shri awardee from MP is projected as a high-probability question.', hi: 'पद्म पुरस्कार से सम्मानित म.प्र. की किसी विभूति का क्षेत्र/जिला पूछे जाने का मजबूत पूर्वानुमान है।' },
    ],
  },
  {
    unitId: 9,
    unitCode: 'Unit 9',
    title: { en: 'Information & Communication Tech (ICT)', hi: 'सूचना एवं संचार प्रौद्योगिकी (ICT)' },
    subtitle: { en: 'Cyber Security & Malware, Artificial Intelligence, Robotics, Networking & E-Governance', hi: 'साइबर सुरक्षा व मैलवेयर, आर्टिफिशियल इंटेलिजेंस, रोबोटिक्स एवं कंप्यूटर मूल तत्व' },
    icon: '💻',
    color: 'rose',
    stats: {
      avgQuestions: 7.3,
      avgMarks: 14.6,
      consistencyLabel: { en: 'Stable & High Scoring (8-10 Qs baseline)', hi: 'स्थिर एवं उच्च स्कोरिंग (8-10 प्रश्न)' },
      trendDescription: { en: 'Technical yet repetitive questions on cyber attacks, AI history, and networking protocols.', hi: 'तकनीकी किंतु अत्यधिक दोहराव वाले प्रश्न — साइबर सुरक्षा, एआई और प्रोटोकॉल।' },
    },
    coreSyllabusFocus: [
      { en: 'Cyber Security: Virus vs Worm vs Trojan vs Ransomware vs Phishing vs Spoofing', hi: 'साइबर सुरक्षा: वायरस, वर्म, ट्रोजन हॉर्स, रैनसमवेयर, फ़िशिंग एवं स्पूफिंग' },
      { en: 'Artificial Intelligence: John McCarthy (Father of AI), Alan Turing, ChatGPT (OpenAI)', hi: 'आर्टिफिशियल इंटेलिजेंस: जॉन मैकार्थी (AI के जनक), एलन ट्यूरिंग, चैटजीपीटी' },
      { en: 'Robotics: Isaac Asimov laws, Components (Sensors, Controllers, Actuators, End-effectors)', hi: 'रोबोटिक्स: इसाक असिमोव के नियम, घटक (सेंसर, कंट्रोलर, एक्ट्यूएटर)' },
      { en: 'Internet & Protocols: HTTP (80), HTTPS (443), FTP (20/21), SMTP (25), POP3 (110)', hi: 'इंटरनेट एवं पोर्ट: HTTP (80), HTTPS (443), FTP (20/21), SMTP (25), DNS' },
    ],
    hotTopics: [
      {
        id: 'ht-9-1',
        topicNumber: 'Hot Topic 9.1',
        title: {
          en: 'Cyber Security: Malware Types, Social Engineering & Firewalls',
          hi: 'साइबर सुरक्षा (मैलवेयर, साइबर हमले एवं सुरक्षा प्रोटोकॉल)',
        },
        consistencyScore: '100% (7/7 years)',
        starRating: 3,
        frequencyLabel: { en: 'Predicted: 2–3 Questions Every Year', hi: 'पूर्वानुमान: हर साल 2-3 संभावित प्रश्न' },
        examinerMindset: {
          en: 'Definitional precision: distinguishing self-replicating worms from host-dependent viruses, trojan disguise, and ransomware extortion.',
          hi: 'परिभाषागत शुद्धता: स्व-प्रतिकृति बनाने वाले वर्म और वायरस में अंतर, ट्रोजन का दिखावा, और रैनसमवेयर की फिरौती।',
        },
        realQuestions: [
          {
            year: 2025,
            qNum: 'Q22',
            question: {
              en: 'A malware that disguises itself as a useful software is called?',
              hi: 'एक मैलवेयर जो उपयोगी सॉफ्टवेयर का दिखावा करता है?',
            },
            answer: { en: 'Trojan Horse', hi: 'ट्रोजन हॉर्स (Trojan Horse)' },
          },
          {
            year: 2024,
            qNum: 'Q18',
            question: {
              en: 'Social engineering attack aimed at stealing sensitive credentials?',
              hi: 'वह सोशल इंजीनियरिंग हमला जिसमें संवेदनशील जानकारी चुराई जाती है?',
            },
            answer: { en: 'Phishing', hi: 'फ़िशिंग (Phishing)' },
          },
          {
            year: 2023,
            qNum: 'Q15',
            question: {
              en: 'Primary role of Firewall in computer network security?',
              hi: 'कंप्यूटर नेटवर्क में फ़ायरवॉल (Firewall) का मुख्य कार्य क्या है?',
            },
            answer: { en: 'Packet filtering & blocking unauthorized incoming traffic', hi: 'अनधिकृत पहुंच को रोकना / पैकेट फ़िल्टरिंग' },
          },
          {
            year: 2022,
            qNum: 'Q34',
            question: {
              en: 'Malware that encrypts user files and demands ransom for decryption key?',
              hi: 'वह मैलवेयर जो फाइलों को एनक्रिप्ट करके फिरौती मांगता है?',
            },
            answer: { en: 'Ransomware (e.g. WannaCry, Petya)', hi: 'रैनसमवेयर (जैसे WannaCry, Petya)' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'Malware Master Classification', hi: 'मैलवेयर का संपूर्ण वर्गीकरण' },
            items: [
              { en: 'Virus: Attaches to host program/file, replicates only when executed', hi: 'वायरस: किसी होस्ट फाइल/प्रोग्राम से जुड़ता है, निष्पादित होने पर फैलता है' },
              { en: 'Worm: Standalone program, replicates across network automatically without human intervention', hi: 'वर्म: नेटवर्क में बिना किसी मानवीय हस्तक्षेप के स्वतंत्र रूप से अपनी प्रतिलिपियां बनाता है' },
              { en: 'Trojan Horse: Disguised as legitimate utility, creates backdoor (does not self-replicate)', hi: 'ट्रोजन हॉर्स: उपयोगी दिखने वाला दुर्भावनापूर्ण सॉफ्टवेयर (कोई सेल्फ-रेप्लिकेशन नहीं)' },
              { en: 'Ransomware: Encrypts victim data and demands crypto ransom (WannaCry)', hi: 'रैनसमवेयर: डेटा को लॉक/एन्क्रिप्ट करके डिक्रिप्शन की के बदले फिरौती मांगता है' },
              { en: 'Phishing vs Spoofing: Phishing steals credentials via fake links; Spoofing forges identity/header to masquerade as trusted source', hi: 'फ़िशिंग = फर्जी ई-मेल/लिंक से पासवर्ड चुराना; स्पूफिंग = अपनी पहचान छिपाकर किसी का छद्म रूप धारण करना' },
            ],
          },
        ],
      },
      {
        id: 'ht-9-2',
        topicNumber: 'Hot Topic 9.2',
        title: {
          en: 'Artificial Intelligence, Robotics & Computer Fundamentals',
          hi: 'आर्टिफिशियल इंटेलिजेंस (AI), रोबोटिक्स एवं कंप्यूटर मूल तत्व',
        },
        consistencyScore: '85.7% (6/7 years)',
        starRating: 2,
        frequencyLabel: { en: 'High Scoring Technical Area', hi: 'उच्च स्कोरिंग तकनीकी क्षेत्र' },
        examinerMindset: {
          en: 'Pioneers of AI, Turing test, components of robotics (actuators, sensors), and computer memory types (ROM, EPROM, BIOS).',
          hi: 'AI के जनक, ट्यूरिंग परीक्षण, रोबोटिक्स के घटक (सेंसर, एक्ट्यूएटर), एवं मेमोरी प्रकार (ROM, EPROM, BIOS)।',
        },
        realQuestions: [
          {
            year: 2026,
            qNum: 'Q31 & Q36',
            question: {
              en: 'EPROM (Erasable Programmable Read Only Memory) and BIOS functions?',
              hi: 'EPROM (इरेजेबल प्रोग्रामेबल रीड ओनली मेमोरी) एवं BIOS (बेसिक इनपुट आउटपुट सिस्टम) के कार्य?',
            },
            answer: { en: 'UV light erasable ROM, hardware booting system', hi: 'पराबैंगनी प्रकाश द्वारा मिटाई जाने वाली मेमोरी, बूटिंग सिस्टम' },
          },
          {
            year: 2026,
            qNum: 'Q39',
            question: {
              en: 'Who coined the term "Artificial Intelligence"?',
              hi: '"आर्टिफिशियल इंटेलिजेंस" शब्द का सर्वप्रथम प्रयोग किसने किया था?',
            },
            answer: { en: 'John McCarthy (1956 Dartmouth Conference)', hi: 'जॉन मैकार्थी (1956 डार्टमाउथ सम्मेलन)' },
          },
          {
            year: 2024,
            qNum: 'Q12',
            question: {
              en: 'ChatGPT has been developed by which organization?',
              hi: 'चैटजीपीटी (ChatGPT) किस कंपनी द्वारा विकसित किया गया है?',
            },
            answer: { en: 'OpenAI', hi: 'OpenAI' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'AI & Robotics Cheat Sheet', hi: 'AI एवं रोबोटिक्स का त्वरित सार' },
            items: [
              { en: 'Father of AI: John McCarthy; Turing Test = Alan Turing (1950 - to check machine intelligence); 1st Chatbot = ELIZA (Joseph Weizenbaum, 1966)', hi: 'AI के जनक: जॉन मैकार्थी; ट्यूरिंग टेस्ट = एलन ट्यूरिंग (मशीन बुद्धिमत्ता जांच हेतु); प्रथम चैटबॉट = ELIZA (1966)' },
              { en: 'Robotics 3 Laws: Formulated by Isaac Asimov; Components: Sensors (Input/Eyes), Controller (Brain), Actuators (Muscles/Motors), End-effector (Hand/Tool)', hi: 'रोबोटिक्स के नियम: इसाक असिमोव; घटक: सेंसर (इनपुट), कंट्रोलर (मस्तिष्क), एक्ट्यूएटर (मांसपेशियां/मूवमेंट), एंड-इफेक्टर (हाथ)' },
              { en: 'Ports & Protocols: HTTP (80); HTTPS (443 - SSL/TLS); FTP (20/21); SMTP (25 - sending mail); POP3 (110 - retrieving mail); DNS (Domain name to IP)', hi: 'प्रोटोकॉल व पोर्ट: HTTP (Port 80); HTTPS (Port 443); FTP (20/21); SMTP (25 - मेल भेजना); POP3 (110 - मेल पाना); DNS' },
            ],
          },
        ],
      },
    ],
    predictions2026_2027: [
      { en: 'One question on a specific cyber attack (Phishing / Ransomware / Trojan) is predicted with high confidence.', hi: 'साइबर सुरक्षा के किसी हमले (Phishing / Ransomware / Trojan) पर प्रश्न पूछे जाने का मुख्य पूर्वानुमान है।' },
      { en: 'One question on AI pioneers / LLMs or Robotics components (Sensors / Actuators) is expected based on recent syllabus shift.', hi: 'AI या रोबोटिक्स के किसी बेसिक सिद्धांत (सेंसर/एक्ट्यूएटर/LLM) पर प्रश्न पूछे जाने की प्रबल संभावना है।' },
    ],
  },
  {
    unitId: 10,
    unitCode: 'Unit 10',
    title: { en: 'Tribes of MP, Heritage & Culture', hi: 'म.प्र. की जनजातियाँ व लोक संस्कृति' },
    subtitle: { en: 'Bhil, Gond, Baiga, Bhariya, Sahariya, PVTGs, Tribal Revolts & Freedom Fighters', hi: 'भील, गोंड, बैगा, भारिया, सहरिया, विशेष पिछड़ी जनजातियाँ एवं जनजातीय स्वतंत्रता सेनानी' },
    icon: '🏹',
    color: 'emerald',
    stats: {
      avgQuestions: 4.9,
      avgMarks: 9.8,
      consistencyLabel: { en: 'Fastest Rising Anchor (10 Qs / 20M in 2026!)', hi: 'नए सिलेबस का सबसे बड़ा पॉवरहाउस (10 प्रश्न / 20 अंक)' },
      trendDescription: { en: 'Re-centered as an independent dedicated Unit in 2024. Projected 8-10 questions in current exam pattern.', hi: '2024 में अलग स्वतंत्र इकाई बनी। वर्तमान परीक्षा पैटर्न में 8-10 संभावित प्रश्न।' },
    },
    coreSyllabusFocus: [
      { en: 'Bhil & Gond: Sub-tribes, Pithora art (Pema Fatya, Bhuri Bai), Bhagoria festival, Karma dance', hi: 'भील एवं गोंड: उपजातियां, पिथोरा कला, भगोरिया उत्सव, करमा नृत्य' },
      { en: 'Particularly Vulnerable Tribal Groups (PVTGs): Baiga (Bewar), Bhariya (Patalkot), Sahariya (Sheopur)', hi: 'विशेष पिछड़ी जनजातियाँ (PVTG): बैगा (बेवर), भारिया (पातालकोट), सहरिया (श्योपुर)' },
      { en: 'Tribal Freedom Fighters: Tantya Bhil, Bhima Nayak, Raja Shankar Shah, Raghunath Shah, Badal Bhoi', hi: 'स्वतंत्रता सेनानी: टंट्या भील, भीमा नायक, राजा शंकर शाह, रघुनाथ शाह, बादल भोई' },
      { en: 'Constitutional Provisions: 5th & 6th Schedules, Article 244, Article 342', hi: 'संवैधानिक प्रावधान: 5वीं व 6वीं अनुसूची, अनुच्छेद 244, अनुच्छेद 342' },
    ],
    hotTopics: [
      {
        id: 'ht-10-1',
        topicNumber: 'Hot Topic 10.1',
        title: {
          en: 'Major Tribes of MP (Bhil, Gond, Baiga, Bhariya, Sahariya PVTGs)',
          hi: 'म.प्र. की प्रमुख जनजातियाँ (भील, गोंड, बैगा, भारिया, सहरिया)',
        },
        consistencyScore: 'High-Confidence Prediction (Projected 6–8 Questions)',
        starRating: 3,
        frequencyLabel: { en: 'Predicted: 6–8 Questions in Revised Syllabus', hi: 'पूर्वानुमान: नए सिलेबस में 6-8 संभावित प्रश्न' },
        examinerMindset: {
          en: 'Clan totems (Netam), sub-tribes matching, traditional worship (Indal), musical instruments (Gudum Baja), shifting cultivation (Bewar), and Patalkot Bhariya.',
          hi: 'गोत्र व्यवस्था (नेतम), उप-जनजातियों का सुमेलन, इंदल पूजा, गुदुम बाजा, बेवर कृषि, और पातालकोट के भारिया।',
        },
        realQuestions: [
          {
            year: 2026,
            qNum: 'Q63',
            question: {
              en: '"Indal Puja" is associated with which tribal community?',
              hi: '"इंदल पूजा" का संबंध किस जनजाति से है?',
            },
            answer: { en: 'Bhil / Barela tribe', hi: 'भील / बारेला जनजाति' },
          },
          {
            year: 2026,
            qNum: 'Q64',
            question: {
              en: 'Traditional musical instrument "Gudum Baja" belongs to which tribe?',
              hi: 'पारंपरिक संगीत वाद्य "गुदुम बाजा" किस जनजाति से संबंधित है?',
            },
            answer: { en: 'Dhurwa / Gond tribe', hi: 'धुर्वा / गोंड जनजाति' },
          },
          {
            year: 2026,
            qNum: 'Q69',
            question: {
              en: 'In Gond tribe, what does the term "Bari" signify?',
              hi: 'गोंड जनजाति में "बारी" का क्या तात्पर्य है?',
            },
            answer: { en: 'Vegetable garden / homestead farming behind the house', hi: 'घर के पीछे की सब्जी की बाड़ी / कृषि' },
          },
          {
            year: 2026,
            qNum: 'Q70',
            question: {
              en: 'The word "Netam" among tribals signifies what?',
              hi: '"नेतम" शब्द का संबंध किससे है?',
            },
            answer: { en: 'Gotra / Clan Totem system', hi: 'गोत्र / टोटम व्यवस्था' },
          },
          {
            year: 2026,
            qNum: 'Q95',
            question: {
              en: 'Match tribes with their sub-tribes: Bhil, Gond, Baiga.',
              hi: 'जनजातियों और उनकी उप-जनजातियों का सुमेलन:',
            },
            answer: { en: 'Bhil = Bhilala, Barela, Patlia; Gond = Pradhan, Agariya, Ojha; Baiga = Bijhwar, Narotia, Bharotia', hi: 'भील = भिलाला, बारेला, पटलिया; गोंड = प्रधान, अगरिया, ओझा; बैगा = बिझवार, नरोतिया, भरौतिया' },
          },
          {
            year: 2025,
            qNum: 'Q29',
            question: {
              en: '"Aahar Anudan Yojana" is meant for which tribal communities in MP?',
              hi: '"आहार अनुदान योजना" किस जनजाति समुदाय के लिए है?',
            },
            answer: { en: 'Special Vulnerable Tribal Groups: Baiga, Bhariya, Sahariya (₹1500 per month)', hi: 'विशेष पिछड़ी जनजातियाँ - बैगा, भारिया, सहरिया (₹1500 प्रतिमाह)' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'Bhil Tribe Complete Summary', hi: 'भील जनजाति का संपूर्ण विवरण' },
            items: [
              { en: 'Demography: Largest tribe of MP (Dhar, Jhabua, Alirajpur, Barwani)', hi: 'जनसांख्यिकी: म.प्र. की सबसे बड़ी जनजाति (धार, झाबुआ, अलीराजपुर, बड़वानी)' },
              { en: 'Sub-tribes: Bhilala (highest status), Barela, Patlia, Tadvi (Muslim Bhil), Rathiyas', hi: 'उपजातियां: भिलाला (सर्वोच्च दर्जा), बारेला, पटलिया, तड़वी (मुस्लिम भील), रथियास' },
              { en: 'Festival: Bhagoria (7 days on Holi: Gulaliya, Gol Gadhedo, Ujariya)', hi: 'त्योहार: भगोरिया (होली के 7 दिन: गुलालिया, गोल गधेड़ो, उजाड़िया)' },
              { en: 'Art: Pithora wall paintings (Pema Fatya, Bhuri Bai); Drink: Tadi, Mahua', hi: 'कला: पिथोरा भित्ति चित्रकला (पेमा फत्या, भूरी बाई); पेय: ताड़ी, महुआ' },
            ],
          },
          {
            category: { en: 'Gond Tribe Complete Summary', hi: 'गोंड जनजाति का संपूर्ण विवरण' },
            items: [
              { en: 'Demography: 2nd largest group in MP and India; Dravidian linguistic family', hi: 'जनसांख्यिकी: म.प्र. व भारत का दूसरा सबसे बड़ा समूह; द्रविड़ भाषा परिवार' },
              { en: 'Sub-tribes: Raj Gond (aristocrats), Dhur Gond (commoners), Pradhan (priests), Agariya (iron smelters), Ojha (soothsayers), Nagarchi (musicians), Solhas (carpenters)', hi: 'उपजातियां: राजगोंड (कुलीन), धुरगोंड (साधारण), प्रधान (पुजारी), अगरिया (लोहा पिघलाने वाले), ओझा (तांत्रिक), नागरची, सोल्हास' },
              { en: 'Marriages: Lamsena (service), Doodh Lautawa (cross-cousin); Youth Dormitory: Ghotul', hi: 'विवाह: लमसेना (सेवा विवाह), दूध लौटावा (ममेरे-फुफेरे विवाह); युवा गृह: घोटुल' },
              { en: 'Dances: Karma (Guinness Record), Saila, Reena, Kaharwa', hi: 'नृत्य: करमा (गिनीज बुक में दर्ज), सैला, रीना, कहरवा' },
            ],
          },
          {
            category: { en: 'Particularly Vulnerable Tribal Groups (PVTGs)', hi: 'विशेष पिछड़ी जनजातियाँ (PVTGs)' },
            items: [
              { en: '1. Baiga: "Priests/Pandas of wild tribes" (Mandla, Dindori, Balaghat); Shifting cultivation: "Bewar" or "Dahiya"; Staple food: Pej; Tattoo loving women', hi: '1. बैगा: "जंगली जातियों का पंडा/पुजारी" (मंडला, डिंडोरी, बालाघाट); स्थानांतरित कृषि = "बेवर" / "दहिया"; प्रिय भोजन = पेज; गुदना प्रिय' },
              { en: '2. Bhariya: Patalkot (Chhindwara - "Wildest of the wild"); Traditional dialect: Bharnoti; Dance: Bhadam and Setam', hi: '2. भारिया: पातालकोट (छिंदवाड़ा - "जंगलों के जंगली"); पारंपरिक बोली = भर्नोटी; नृत्य = भड़म और सेतम' },
              { en: '3. Sahariya: Sheopur, Guna, Shivpuri ("Sahrana" settlements); Most malnourished; Museum at Sheopur; Dance: Duldul Ghodi, Lahangi', hi: '3. सहरिया: श्योपुर, गुना, शिवपुरी ("सहराना" निवास); कुपोषण से सर्वाधिक ग्रसित; संग्रहालय = श्योपुर; नृत्य = दुलदुल घोड़ी, लहंगी' },
            ],
          },
        ],
      },
      {
        id: 'ht-10-2',
        topicNumber: 'Hot Topic 10.2',
        title: {
          en: 'Tribal Freedom Fighters & National Icons of MP',
          hi: 'जनजातीय स्वतंत्रता सेनानी एवं विभूतियां',
        },
        consistencyScore: 'High Frequency (Predicted 2–3 Questions)',
        starRating: 3,
        frequencyLabel: { en: 'Predicted: 2–3 Questions Every Year', hi: 'पूर्वानुमान: हर साल 2-3 संभावित प्रश्न' },
        examinerMindset: {
          en: 'Birthplace, operational region during 1857 or Jungle Satyagraha, sacrifice date, and memorial locations.',
          hi: 'जन्मस्थल, 1857 या जंगल सत्याग्रह में कार्यक्षेत्र, शहादत दिवस और समाधि स्थल।',
        },
        realQuestions: [
          {
            year: 2024,
            qNum: 'Q29',
            question: {
              en: 'Tantya Bhil Swarojgar Yojana loan limit and objectives?',
              hi: 'टंट्या भील स्वरोजगार योजना?',
            },
            answer: { en: 'Self-employment scheme for scheduled tribes', hi: 'अनुसूचित जनजातियों के लिए स्वरोजगार योजना' },
          },
          {
            year: 2023,
            qNum: 'Q10',
            question: {
              en: 'Operational region of revolutionary Bhima Nayak during 1857 revolt?',
              hi: '1857 की क्रांति में भीमा नायक का कार्यक्षेत्र कौन-सा था?',
            },
            answer: { en: 'Barwani / Sendhwa ("Robinhood of Nimar")', hi: 'बड़वानी / सेंधवा ("निमाड़ का रॉबिनहुड")' },
          },
          {
            year: 2022,
            qNum: 'Q15',
            question: {
              en: 'Martyrdom day of Gondwana rulers Raja Shankar Shah and Kunwar Raghunath Shah?',
              hi: 'राजा शंकर शाह एवं कुंवर रघुनाथ शाह का शहादत दिवस?',
            },
            answer: { en: '18 September 1857 (Jabalpur - blown from cannon)', hi: '18 सितंबर 1857 (जबलपुर में तोप के मुंह से बांधकर उड़ाया गया)' },
          },
          {
            year: 2021,
            qNum: 'Q12',
            question: {
              en: 'Khajya Nayak was an 1857 revolutionary from which region?',
              hi: 'खाज्या नायक 1857 के किस क्षेत्र के क्रांतिकारी थे?',
            },
            answer: { en: 'Barwani / Nimar', hi: 'बड़वानी / निमाड़' },
          },
        ],
        cheatSheet: [
          {
            category: { en: 'Great Tribal Martyrs of MP', hi: 'म.प्र. के अमर जनजातीय बलिदानी' },
            items: [
              { en: 'Tantya Bhil: Born Barda (Pandhana, Khandwa); Real name Tantiya; Titled "Indian Robinhood" by British; Samadhi at Patalpani (Indore railway station renamed)', hi: 'जननायक टंट्या भील: जन्म बड़दा (पंधाना, खंडवा); वास्तविक नाम तांतिया; "इंडियन रॉबिनहुड"; समाधि = पातालपानी (इंदौर)' },
              { en: 'Bhima Nayak: Born Dhauba Bawli (Barwani); Battle of Ambapani (1858); Hanged in Port Blair (Kala Pani)', hi: 'भीमा नायक: जन्म धौबा बावली (बड़वानी); अंबापानी का युद्ध (1858); पोर्ट ब्लेयर (कालापानी) में फांसी' },
              { en: 'Raja Shankar Shah & Raghunath Shah: 54th ruler of Garha-Mandla Gondwana; Blown from cannons in Jabalpur on 18 Sept 1857', hi: 'राजा शंकर शाह एवं रघुनाथ शाह: गोंडवाना के 54वें शासक; 18 सितंबर 1857 को जबलपुर में तोप से उड़ाया गया' },
              { en: 'Badal Bhoi: Born Parasia (Chhindwara); Led collectorate gherao in 1923; Tribal Museum named after him in Chhindwara', hi: 'बादल भोई: जन्म परासिया (छिंदवाड़ा); 1923 कलेक्ट्रेट घेराव; बादल भोई जनजातीय संग्रहालय छिंदवाड़ा में' },
              { en: 'Ganjan Singh Korku: Led 1930 Ghoda Dongri Jungle Satyagraha (Betul)', hi: 'गंजन सिंह कोरकू: 1930 का घोड़ाडोंगरी जंगल सत्याग्रह (बैतूल)' },
            ],
          },
        ],
      },
    ],
    predictions2026_2027: [
      { en: 'Traditions of Baiga or Patalkot Bhariya PVTG is a predicted focus area for 1 question.', hi: 'पातालकोट के भारिया या बैगा जनजाति की परंपराओं पर 1 प्रश्न पूछे जाने का प्रबल पूर्वानुमान है।' },
      { en: 'Operational field or martyrdom site of Tantya Bhil or Shankar Shah is projected as a high-yield topic.', hi: 'टंट्या भील या शंकर शाह के क्रांति क्षेत्र/बलिदान स्थल पर प्रश्न पूछे जाने की उच्च संभावना है।' },
    ],
  },
];

// ============================================================================
// 6. The 5-Step "Crack Prelims" Study Sequence
// ============================================================================
export const STUDY_STEPS: StudyStep[] = [
  {
    stepNumber: 1,
    title: { en: 'MP GK Mastery (Units 2, 4, 10)', hi: 'एमपी सामान्य ज्ञान में महारत (यूनिट 2, 4, 10)' },
    units: 'Units 2 + 4 + 10',
    targetQuestions: '25–30 Questions',
    targetMarks: '75–90 Marks (2026) · 50–60M (Pre-2026)',
    description: {
      en: 'Master MP History, Dynasties, Rivers, Minerals, Tribes, and Folk Culture. This is the unshakeable foundation of MPPSC Prelims.',
      hi: 'म.प्र. का इतिहास, राजवंश, नदियां, खनिज, जनजातियाँ एवं लोक संस्कृति। यह MPPSC प्रीलिम्स की सबसे मजबूत नींव है।',
    },
    keyTopics: [
      { en: 'Bhil, Gond & PVTGs (Baiga, Bhariya, Sahariya)', hi: 'भील, गोंड एवं PVTG (बैगा, भारिया, सहरिया)' },
      { en: 'Narmada, Chambal & Malanjkhand, Bharweli mines', hi: 'नर्मदा, चंबल एवं मलांजखंड, भारवेली खदानें' },
      { en: 'Literature, Folk Theatre (Maach, Gammat) & Inscriptions', hi: 'साहित्यकार, लोकनाट्य (माच, गम्मत) व अभिलेख' },
    ],
    color: 'amber',
  },
  {
    stepNumber: 2,
    title: { en: 'Polity & Constitutional Commissions (Unit 5)', hi: 'राजव्यवस्था एवं संवैधानिक आयोग (यूनिट 5)' },
    units: 'Unit 5',
    targetQuestions: '11–15 Questions',
    targetMarks: '33–45 Marks (2026) · 22–30M (Pre-2026)',
    description: {
      en: 'Focus on Fundamental Rights, DPSP, MP Governors backgrounds, High Court, Election Commission, CAG, and Panchayati Raj.',
      hi: 'मौलिक अधिकार, नीति निदेशक तत्व, म.प्र. राज्यपालों की पृष्ठभूमि, उच्च न्यायालय, चुनाव आयोग, CAG एवं पंचायती राज।',
    },
    keyTopics: [
      { en: 'Articles 12 to 51A & Major Amendments', hi: 'अनुच्छेद 12 से 51A एवं प्रमुख संविधान संशोधन' },
      { en: 'MP Governors backgrounds & former posts', hi: 'म.प्र. के राज्यपालों की पृष्ठभूमि व पूर्व पद' },
      { en: 'ECI (324), CAG (148), UPSC/MPPSC (315), SHRC', hi: 'ECI (324), CAG (148), MPPSC (315), मानवाधिकार आयोग' },
    ],
    color: 'purple',
  },
  {
    stepNumber: 3,
    title: { en: 'Current Affairs, Sports & ICT (Units 8 & 9)', hi: 'समसामयिकी, खेलकूद एवं आईटी (यूनिट 8 & 9)' },
    units: 'Units 8 + 9',
    targetQuestions: '20–22 Questions',
    targetMarks: '60–66 Marks (2026) · 40–44M (Pre-2026)',
    description: {
      en: 'High-growth scoring units: Olympic winners, MP sports awards, Padma recipients, Cyber security malware, and AI fundamentals.',
      hi: 'तेजी से बढ़ते अंक: खेल पदक विजेता, म.प्र. खेल पुरस्कार, पद्म सम्मान, साइबर सुरक्षा मैलवेयर एवं AI के मूल तत्व।',
    },
    keyTopics: [
      { en: 'MP Sports Awards: Vikram, Eklavya, Prabhash Joshi', hi: 'म.प्र. खेल पुरस्कार: विक्रम, एकलव्य, प्रभाष जोशी' },
      { en: 'Padma Awards (MP personalities) & State Honors', hi: 'पद्म पुरस्कार (म.प्र. विभूतियां) एवं राज्य सम्मान' },
      { en: 'Cyber Security (Virus, Worm, Phishing) & AI', hi: 'साइबर सुरक्षा (वायरस, वर्म, फ़िशिंग) एवं AI' },
    ],
    color: 'indigo',
  },
  {
    stepNumber: 4,
    title: { en: 'Science & General History (Units 1 & 7)', hi: 'विज्ञान एवं सामान्य इतिहास (यूनिट 1 & 7)' },
    units: 'Units 1 + 7',
    targetQuestions: '20–22 Questions',
    targetMarks: '60–66 Marks (2026) · 40–44M (Pre-2026)',
    description: {
      en: 'Vedic age literature, 1857 revolutionaries, Indian National Congress, ISRO launch vehicles, Vitamins, and Sickle Cell Mission.',
      hi: 'वैदिक साहित्य, 1857 के क्रांतिकारी, कांग्रेस अधिवेशन, इसरो प्रक्षेपण यान, विटामिन एवं सिकल सेल मिशन 2047।',
    },
    keyTopics: [
      { en: 'Vedic Texts, Ashrams & Six Darshanas', hi: 'वेदों के ब्राह्मण ग्रंथ, आश्रम एवं षड्दर्शन' },
      { en: '1857 & National Freedom Movements dates', hi: '1857 क्रांति एवं स्वतंत्रता संघर्ष की सटीक तिथियां' },
      { en: 'ISRO rockets, Vitamins & Human Anatomy', hi: 'ISRO रॉकेट, विटामिन एवं मानव शरीर क्रिया' },
    ],
    color: 'rose',
  },
  {
    stepNumber: 5,
    title: { en: 'Geography & Economy (Units 3 & 6)', hi: 'भूगोल एवं अर्थव्यवस्था (यूनिट 3 & 6)' },
    units: 'Units 3 + 6',
    targetQuestions: '15–20 Questions',
    targetMarks: '45–60 Marks (2026) · 30–40M (Pre-2026)',
    description: {
      en: 'Census 2011 figures, Peninsular rivers, Minerals ranking, MP Economic Survey, ODOP items, and RBI monetary policy.',
      hi: 'जनगणना 2011, प्रायद्वीपीय नदियां, खनिज रैंकिंग, म.प्र. आर्थिक सर्वेक्षण, ODOP उत्पाद एवं RBI मौद्रिक नीति।',
    },
    keyTopics: [
      { en: 'Census 2011 extremes (Density, Decadal Growth)', hi: 'जनगणना 2011 के चरम बिंदु (घनत्व, दशकीय वृद्धि)' },
      { en: 'MP Economic Survey: Solar, ODOP, Pulse rank', hi: 'म.प्र. आर्थिक सर्वेक्षण: सौर ऊर्जा, ODOP, दलहन रैंक' },
      { en: 'RBI Monetary Policy & Inflation indices', hi: 'RBI मौद्रिक नीति उपकरण एवं मुद्रास्फीति सूचकांक' },
    ],
    color: 'cyan',
  },
];

// ============================================================================
// 7. 3-Level Priority Success Matrix
// ============================================================================
export const PRIORITY_MATRIX: PriorityLevel[] = [
  {
    level: 1,
    title: { en: 'Level 1: High-Yield Foundation Core', hi: 'लेवल 1: आधारभूत कोर (High-Yield Foundation)' },
    marksRange: '82–90 Marks (2026) / 55–60M (Pre-2026)',
    badge: { en: 'Highest Return on Investment', hi: 'सर्वोच्च रिटर्न ऑन इनवेस्टमेंट' },
    color: 'emerald',
    items: [
      { en: 'Unit 10 (MP Tribes) + Unit 2 (MP Culture) + Unit 4 (MP Geography)', hi: 'यूनिट 10 (जनजातियां) + यूनिट 2 (म.प्र. संस्कृति) + यूनिट 4 (म.प्र. भूगोल)' },
      { en: 'Census 2011 (India & MP Rankings & Growth rates)', hi: 'जनगणना 2011 (भारत एवं म.प्र. रैंकिंग व वृद्धि दरें)' },
      { en: 'MP Governors & High Court Chief Justices tenure history', hi: 'म.प्र. के राज्यपाल एवं मुख्य न्यायाधीशों का कार्यकाल इतिहास' },
    ],
  },
  {
    level: 2,
    title: { en: 'Level 2: High-Yield Low-Hanging Fruit', hi: 'लेवल 2: हाई-यील्ड आसान अंक (Low-Hanging Fruit)' },
    marksRange: '60–68 Marks (2026) / 40–45M (Pre-2026)',
    badge: { en: 'Quick Revision Yield', hi: 'त्वरित रिविजन से अधिकतम अंक' },
    color: 'amber',
    items: [
      { en: 'Unit 5 (Articles 12-51A, Commissions: ECI, CAG, UPSC, SHRC)', hi: 'यूनिट 5 (अनुच्छेद 12-51A, आयोग: ECI, CAG, UPSC, मानवाधिकार आयोग)' },
      { en: 'Unit 8 (Padma Awards, MP Sports: Vikram/Eklavya & Schemes)', hi: 'यूनिट 8 (पद्म पुरस्कार, म.प्र. खेल पुरस्कार एवं फ्लैगशिप योजनाएं)' },
      { en: 'Unit 9 (Cyber Security: Malware types, AI history, OS, Ports)', hi: 'यूनिट 9 (साइबर सुरक्षा: मैलवेयर प्रकार, AI इतिहास, नेटवर्किंग पोर्ट)' },
    ],
  },
  {
    level: 3,
    title: { en: 'Level 3: Conceptual Stabilizers', hi: 'लेवल 3: वैचारिक स्थायित्व (Conceptual Stabilizers)' },
    marksRange: '60–68 Marks (2026) / 40–45M (Pre-2026)',
    badge: { en: 'Cutoff Safety Buffer', hi: 'कटऑफ सुरक्षा बफर' },
    color: 'blue',
    items: [
      { en: 'Unit 1 (Vedic texts, Ashrams, Darshanas, 1857 events)', hi: 'यूनिट 1 (वैदिक ग्रंथ, आश्रम, षड्दर्शन, 1857 की घटनाएं)' },
      { en: 'Unit 7 (Vitamins & Diseases, ISRO rockets, Sickle Cell 2047)', hi: 'यूनिट 7 (विटामिन व हीनताजन्य रोग, इसरो रॉकेट, सिकल सेल 2047)' },
      { en: 'Unit 6 (RBI Monetary Policy, MP Economic Survey, ODOP products)', hi: 'यूनिट 6 (RBI मौद्रिक नीति, म.प्र. आर्थिक सर्वेक्षण, ODOP उत्पाद)' },
      { en: 'Unit 3 (Rivers, Mountain Peaks, Minerals production rankings)', hi: 'यूनिट 3 (नदियां, पर्वत चोटियां, खनिज उत्पादन रैंकिंग)' },
    ],
  },
];
