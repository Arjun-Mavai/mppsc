// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 CENTRALIZED PRICING — Single source of truth
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Used by: PremiumMarketing, /pricing page, /admin/pricing, /api/pricing
// Change features/defaults here → reflects everywhere.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PricingData {
  litePrice: number;
  liteOriginalPrice: number;
  liteValidityText: string;
  liteMonths: number;
  proPrice: number;
  proOriginalPrice: number;
  proValidityText: string;
  proMonths: number;
  upgradePrice: number;
  upgradeOriginalPrice: number;
  /** MPPSC Mains syllabus vault — rupees (server ×100 for paise). */
  mainsPrice: number;
  mainsOriginalPrice: number;
  mainsValidityText: string;
  mainsMonths: number;
  /** Pre + Mains bundle — rupees. */
  comboPrice: number;
  comboOriginalPrice: number;
  comboValidityText: string;
  comboMonths: number;
  urgencyText: string;
  urgencyTextHi: string;
  studentsBought: number;
}

export const PRICING_DEFAULTS: PricingData = {
  litePrice: 99,
  liteOriginalPrice: 299,
  liteValidityText: 'Valid till MPPSC 2026 Prelims',
  liteMonths: 8,
  proPrice: 199,
  proOriginalPrice: 999,
  proValidityText: 'Valid for 6 Months',
  proMonths: 6,
  upgradePrice: 199,
  upgradeOriginalPrice: 299,
  mainsPrice: 1499,
  mainsOriginalPrice: 2499,
  mainsValidityText: 'Valid till MPPSC 2026 Mains',
  mainsMonths: 12,
  comboPrice: 2499,
  comboOriginalPrice: 3999,
  comboValidityText: 'Pre + Mains — full access',
  comboMonths: 12,
  urgencyText: 'Special pricing for first 100 students',
  urgencyTextHi: 'पहले 100 छात्रों के लिए विशेष मूल्य',
  studentsBought: 23,
};

// Icon types for pricing page (lucide icon components)
export interface PlanFeature {
  en: string;
  hi: string;
}

export interface PlanFeatureWithIcon extends PlanFeature {
  icon?: string; // lucide icon name for mapping
}

// ── Lite Plan Features ────────────────────────────────────
export const LITE_FEATURES: PlanFeatureWithIcon[] = [
  {
    en: '6 Years PYQs with Detailed Analysis',
    hi: '6 वर्षों के PYQ पेपर्स (सटीक Analysis के साथ)',
    icon: 'BookOpen',
  },
  { en: 'CSAT Mock Papers ×2', hi: 'CSAT मॉक पेपर ×2', icon: 'BookOpen' },
  { en: 'Full Length Tests ×2', hi: 'फुल लेंथ टेस्ट ×2', icon: 'FileText' },
  // { en: '2 Topic Tests per Unit', hi: '2 टॉपिक टेस्ट प्रति यूनिट', icon: 'Target' },
  { en: 'Limited Tests in Topic-wise', hi: 'टॉपिक वाइज़ में सीमित टेस्ट', icon: 'Target' },
  {
    en: 'Limited Syllabus Topics Analysis',
    hi: 'सीमित सिलेबस टॉपिक्स एनालिसिस',
    icon: 'BarChart3',
  },
  { en: 'Premium Study Blogs (Limited)', hi: 'प्रीमियम स्टडी ब्लॉग्स (सीमित)', icon: 'FileText' },
  // { en: '5+ Years PYQs (With Explanations)', hi: '5+ साल के PYQ (उत्तर सहित)', icon: 'History' },
];

// ── Pro Plan Features ─────────────────────────────────────
export const PRO_FEATURES: PlanFeatureWithIcon[] = [
  { en: 'Unlimited Topic & Unit Tests', hi: 'अनलिमिटेड टॉपिक और यूनिट टेस्ट', icon: 'Target' },
  { en: 'Full Length Mock Tests (100Q)', hi: 'फुल लेंथ मॉक टेस्ट (100 प्रश्न)', icon: 'FileText' },
  { en: 'CSAT Mock Papers', hi: 'CSAT मॉक पेपर', icon: 'BookOpen' },
  { en: 'PYQ Papers (2020-2026)', hi: 'PYQ पेपर (2020-2026)', icon: 'BookOpen' },
  {
    en: 'PYQ Intelligence: Topic Trends, Weightage & Exam DNA',
    hi: 'PYQ इंटेलिजेंस: टॉपिक ट्रेंड, वेटेज और एग्जाम DNA',
    icon: 'BarChart3',
  },
  { en: 'Smart Analytics Dashboard', hi: 'स्मार्ट एनालिटिक्स डैशबोर्ड', icon: 'BarChart3' },
  { en: 'Premium Study Blogs', hi: 'प्रीमियम स्टडी ब्लॉग्स', icon: 'FileText' },
  { en: 'Test History for Revision', hi: 'रिवीज़न के लिए टेस्ट हिस्ट्री', icon: 'History' },
];

// Helper: compute discount percentage
export function calcDiscount(price: number, originalPrice: number): number {
  return Math.round((1 - price / originalPrice) * 100);
}

// Helper: compute monthly cost
export function calcMonthly(price: number, months: number): number {
  return Math.round(price / months);
}
