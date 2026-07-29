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
  /** Specific renewal pricing for returning/expiring users */
  renewalProPrice: number;
  renewalProOriginalPrice: number;
  renewalMainsPrice: number;
  renewalMainsOriginalPrice: number;
  renewalComboPrice: number;
  renewalComboOriginalPrice: number;
  urgencyText: string;
  urgencyTextHi: string;
  studentsBought: number;
}

export const PRICING_DEFAULTS: PricingData = {
  litePrice: 99,
  liteOriginalPrice: 299,
  liteValidityText: 'Valid for 6 Months',
  liteMonths: 6,
  proPrice: 199,
  proOriginalPrice: 999,
  proValidityText: 'Valid for 6 Months',
  proMonths: 6,
  upgradePrice: 199,
  upgradeOriginalPrice: 299,
  mainsPrice: 1499,
  mainsOriginalPrice: 2499,
  mainsValidityText: 'Valid for 6 Months',
  mainsMonths: 6,
  comboPrice: 2499,
  comboOriginalPrice: 3999,
  comboValidityText: 'Pre + Mains — Valid for 6 Months',
  comboMonths: 6,
  renewalProPrice: 299,
  renewalProOriginalPrice: 999,
  renewalMainsPrice: 399,
  renewalMainsOriginalPrice: 1499,
  renewalComboPrice: 499,
  renewalComboOriginalPrice: 599,
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
  { en: 'Instantly test your preparation on every topic', hi: 'हर टॉपिक पर अपनी तैयारी तुरंत जाँचें', icon: 'Target' },
  { en: 'Test your real exam temperament with simulated mocks', hi: 'वास्तविक परीक्षा जैसी समय प्रबंधन के साथ फुल मॉक टेस्ट', icon: 'FileText' },
  { en: 'Secure your CSAT qualifying score with targeted papers', hi: 'लक्ष्यित पेपर्स के साथ अपना CSAT स्कोर सुरक्षित करें', icon: 'BookOpen' },
  { en: 'Understand the real exam pattern through past years\' questions', hi: 'पिछले वर्षों के प्रश्नों से वास्तविक परीक्षा पैटर्न समझें', icon: 'History' },
  {
    en: 'Identify high-frequency repeat topics instantly',
    hi: 'कौन से टॉपिक्स बार-बार पूछे जाते हैं, तुरंत पहचानें',
    icon: 'BarChart3',
  },
  { en: 'Identify your strong and weak units instantly', hi: 'अपनी कमजोर और मजबूत यूनिट्स तुरंत जानें', icon: 'BarChart3' },
  { en: 'Learn rankers strategies to score well above the cutoff', hi: 'टॉपर्स की गुप्त रणनीतियों से कटऑफ के ऊपर स्कोर करना सीखें', icon: 'FileText' },
  { en: 'Revisit past mistakes during revision to ensure zero repeat errors', hi: 'Revision के समय पुरानी गलतियाँ दोबारा देखें', icon: 'History' },
];

// Helper: compute discount percentage
export function calcDiscount(price: number, originalPrice: number): number {
  return Math.round((1 - price / originalPrice) * 100);
}

// Helper: compute monthly cost
export function calcMonthly(price: number, months: number): number {
  return Math.round(price / months);
}
