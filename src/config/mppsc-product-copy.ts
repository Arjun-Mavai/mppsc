/**
 * Central MPPSC merchandising copy: defaults + merge with DB `pricing_config.mppsc_product_copy_json`.
 * UPSC / MP Police rows ignore this JSON; only merged when examType === 'mppsc'.
 */

export type MppscPricingSegmentKey = 'pre' | 'mains' | 'combo';

/** One segment: pricing bullets, thank-you, and welcome email lines (English email for deliverability parity with existing flow). */
export type MppscSegmentCopyBlock = {
  bulletsEn: string[];
  bulletsHi: string[];
  thankYouBadgeEn: string;
  thankYouBadgeHi: string;
  thankYouHeadlineEn: string;
  thankYouHeadlineHi: string;
  thankYouSubtitleEn: string;
  thankYouSubtitleHi: string;
  thankYouFeatureLinesEn: string[];
  thankYouFeatureLinesHi: string[];
  emailSubjectEn: string;
  emailBrandLineEn: string;
  emailBrandTaglineEn: string;
  emailLeadEn: string;
  emailFeaturesEn: string[];
};

export type MppscProductCopyV1 = Record<MppscPricingSegmentKey, MppscSegmentCopyBlock>;

export const DEFAULT_MPPSC_PRODUCT_COPY: MppscProductCopyV1 = {
  pre: {
    bulletsEn: [
      'What to study, what to skip — Understand the actual exam-relevance and boundaries of every syllabus topic.',
      'High-frequency repeating areas — Identify repeating high-yield patterns through Unit-wise and Subject-wise PYQ analysis.',
      'Instantly know your real preparation status — Track your readiness on every topic and review your test history effortlessly.',
    ],
    bulletsHi: [
      'क्या पढ़ना है, क्या छोड़ना है — हर टॉपिक की वास्तविक परीक्षा-प्रासंगिकता और तैयारी की सही सीमा समझें।',
      'बार-बार पूछे जाने वाले विषय — Unit-wise, Subject-wise और PYQs से बार-बार आने वाले टॉपिक्स पहचानें।',
      'अपनी तैयारी की वास्तविक स्थिति जानें — हर टॉपिक पर अपनी तैयारी को ट्रैक करें और पुरानी गलतियों को रीविजिट करें।',
    ],
    thankYouBadgeEn: 'Prelims unlocked',
    thankYouBadgeHi: 'प्रीलिम्स एक्टिव',
    thankYouHeadlineEn: 'Payment successful!',
    thankYouHeadlineHi: 'भुगतान सफल!',
    thankYouSubtitleEn: 'Your Full Prelims (Pro) stack is active — practice hard.',
    thankYouSubtitleHi:
      'आपका फुल प्रीलिम्स (प्रो) एक्सेस चालू हो गया है — अब जमकर अभ्यास करें।',
    thankYouFeatureLinesEn: [
      'Unlimited topic & unit tests',
      'Full mocks (100Q) & CSAT',
      'PYQ Intelligence & analytics',
      'Premium blogs + test history',
    ],
    thankYouFeatureLinesHi: [
      'अनलिमिटेड टॉपिक व यूनिट टेस्ट',
      'फुल मॉक (100Q) व CSAT',
      'PYQ इंटेलिजेंस व एनालिटिक्स',
      'प्रीमियम ब्लॉग्स + टेस्ट हिस्ट्री',
    ],
    emailSubjectEn: '🎉 Welcome to MPPSC ZEN — set your password (Prelims)',
    emailBrandLineEn: 'MPPSC Prelims 2026',
    emailBrandTaglineEn: 'Smart test series',
    emailLeadEn:
      "Welcome aboard! Your Prelims-focused plan is on. Set your password to unlock mocks, PYQ intelligence, and analytics — we've built everything around the latest MPPSC syllabus pattern.",
    emailFeaturesEn: [
      '✅ Unlimited topic-wise & unit-wise tests',
      '✅ Full-length mocks (100Q) + CSAT papers',
      '✅ PYQ Intelligence: topics, weightage, exam DNA (2020–2026)',
    ],
  },
  mains: {
    bulletsEn: [
      'What to study — Understand the unique subject-expert perspectives and precise boundaries for all Mains papers.',
      'What angle questions can be asked from — Recognize the examiner\'s actual pattern and question weightage from official PYQs.',
      'How to think and write answers — Master multiple high-scoring approaches and Double-Style Variations for every answer.',
    ],
    bulletsHi: [
      'क्या पढ़ना है — सभी पेपर्स के लिए विषय-विशेषज्ञों के अनूठे नज़रिए और सटीक संरचनात्मक ढाँचे को समझें।',
      'प्रश्न किस दृष्टिकोण से पूछा जा सकता है — पिछले वर्षों के प्रश्नों (PYQs) से परीक्षक के वास्तविक प्रश्न-निर्माण पैटर्न को पहचानें।',
      'उत्तर कैसे सोचना और लिखना है — एक ही प्रश्न को अलग-अलग स्कोरिंग एप्रोच और डबल-स्टाइल उत्तर वेरिएशन से लिखना सीखें।',
    ],
    thankYouBadgeEn: 'Mains Gyan Kosh live',
    thankYouBadgeHi: 'मेंस ज्ञानकोश लाइव',
    thankYouHeadlineEn: 'Mains Gyan Kosh activated!',
    thankYouHeadlineHi: 'मेंस ज्ञानकोश चालू!',
    thankYouSubtitleEn:
      'You now carry the complete English & Hindi mains desks — PYQs, model answers, expert cues & syllabus arcs.',
    thankYouSubtitleHi:
      'आपके पास मेंस डेस्क पूरा है — PYQ, मॉडल उत्तर, एक्सपर्ट रणनीति व सिलेबस ट्रैक।',
    thankYouFeatureLinesEn: [
      'Official mains PYQs with model grids',
      'Expert insights + pitfalls',
      'English & Hindi model answers you can study',
      'Syllabus + PYQ drill views',
    ],
    thankYouFeatureLinesHi: [
      'आधिकारिक PYQ व मॉडल उत्तर',
      'एक्सपर्ट टिप्स + ट्रैप अलर्ट',
      'दो भाषाओं में मॉडल उत्तर शैली',
      'सिलेबस ट्रैक + PYQ ड्रिल दृष्टि',
    ],
    emailSubjectEn: '🎉 MPPSC ZEN — Mains Gyan Kosh unlocked, set password',
    emailBrandLineEn: 'MPPSC Mains desk',
    emailBrandTaglineEn: 'PYQs • Model answers • Expert cues',
    emailLeadEn:
      'Congrats! Your Mains Gyan Kosh unlocks dual-style English & Hindi model answers layered with coaching insights, syllabus-tracked arcs, plus the mains PYQ library for serious study.',
    emailFeaturesEn: [
      '✅ Official mains PYQs with ready-to-study outlines',
      '✅ Hindi + English drafts & examiner-style commentary',
      '✅ Syllabus units/topics mapped for disciplined revision',
      '✅ Library mode for drills & multi-year PYQ patterns',
    ],
  },
  combo: {
    bulletsEn: [
      'Predict what is highly likely to be asked in Prelims',
      'Learn how to think and write high-scoring answers in Mains',
      'Understand actual exam patterns through active PYQ analysis',
      'Solidify your learning with targeted revision and instant mock tests',
      'A single, unified workflow from Prelims selection all the way to Mains success',
    ],
    bulletsHi: [
      'Prelims में क्या पूछे जाने की संभावना है',
      'Mains में उत्तर कैसे सोचना और लिखना है',
      'PYQs से परीक्षा का पैटर्न समझना',
      'पढ़ाई को Revision और Test से मजबूत करना',
      'Prelims से Mains तक एक ही तैयारी प्रणाली',
    ],
    thankYouBadgeEn: 'Combo active',
    thankYouBadgeHi: 'कॉम्बो एक्टिव',
    thankYouHeadlineEn: 'Pre + Mains combined!',
    thankYouHeadlineHi: 'प्री + मेंस एक साथ!',
    thankYouSubtitleEn:
      'You now wield the objective stack plus the complete English & Hindi mains desks — study both stages without juggling logins.',
    thankYouSubtitleHi:
      'आपके पास अब प्रीलिम्स स्टैक भी है और मेंस डेस्क भी — एक ही एकाउंट में दोनों पेपर।',
    thankYouFeatureLinesEn: [
      'Full prelims Pro stack — mocks & analytics',
      'Mains syllabus + PYQ Gyan Kosh unlocked',
      'English & Hindi model answers on tap',
      'One account for both papers',
    ],
    thankYouFeatureLinesHi: [
      'पूरा प्रो प्रीलिम्स स्टैक — मॉक व एनालिटिक्स',
      'मेंस सिलेबस + PYQ ज्ञानकोश अनलॉक',
      'हिंदी व इंग्लिश मॉडल उत्तर और एक्सपर्ट टिप्स',
      'दोनों पेपर के लिए एक एकाउंट',
    ],
    emailSubjectEn: '🎉 MPPSC ZEN — Pre+Mains unlocked, finish setup',
    emailBrandLineEn: 'MPPSC Pre + Mains',
    emailBrandTaglineEn: 'Unified subscription',
    emailLeadEn:
      'Huge win — you subscribed to BOTH stacks. Activate your password once, then roam between full prelims mocks, PYQ intelligence, mains syllabus structures and dual-style model answers.',
    emailFeaturesEn: [
      '✅ Everything in Pro tests + dashboards',
      '✅ Mains PYQs, model drafts & expert cues',
      '✅ One workflow for syllabus + study days',
      '✅ Admin-tuned perks — revisit /pricing anytime for latest bundles',
    ],
  },
};

function mergeBlock(
  base: MppscSegmentCopyBlock,
  patch?: Partial<MppscSegmentCopyBlock>
): MppscSegmentCopyBlock {
  if (!patch) return base;

  const mergeString = (b: string, p: string | null | undefined): string => {
    return p && typeof p === 'string' && p.trim() ? p : b;
  };

  const mergeArray = (b: string[], p: string[] | null | undefined): string[] => {
    return Array.isArray(p) && p.length > 0 ? p.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : b;
  };

  return {
    bulletsEn: mergeArray(base.bulletsEn, patch.bulletsEn),
    bulletsHi: mergeArray(base.bulletsHi, patch.bulletsHi),
    thankYouBadgeEn: mergeString(base.thankYouBadgeEn, patch.thankYouBadgeEn),
    thankYouBadgeHi: mergeString(base.thankYouBadgeHi, patch.thankYouBadgeHi),
    thankYouHeadlineEn: mergeString(base.thankYouHeadlineEn, patch.thankYouHeadlineEn),
    thankYouHeadlineHi: mergeString(base.thankYouHeadlineHi, patch.thankYouHeadlineHi),
    thankYouSubtitleEn: mergeString(base.thankYouSubtitleEn, patch.thankYouSubtitleEn),
    thankYouSubtitleHi: mergeString(base.thankYouSubtitleHi, patch.thankYouSubtitleHi),
    thankYouFeatureLinesEn: mergeArray(base.thankYouFeatureLinesEn, patch.thankYouFeatureLinesEn),
    thankYouFeatureLinesHi: mergeArray(base.thankYouFeatureLinesHi, patch.thankYouFeatureLinesHi),
    emailSubjectEn: mergeString(base.emailSubjectEn, patch.emailSubjectEn),
    emailBrandLineEn: mergeString(base.emailBrandLineEn, patch.emailBrandLineEn),
    emailBrandTaglineEn: mergeString(base.emailBrandTaglineEn, patch.emailBrandTaglineEn),
    emailLeadEn: mergeString(base.emailLeadEn, patch.emailLeadEn),
    emailFeaturesEn: mergeArray(base.emailFeaturesEn, patch.emailFeaturesEn),
  };
}

/** Deep-merge defaults with JSON blob from pricing_config.mppsc_product_copy_json (invalid JSON → defaults). */
export function mergeMppscProductCopy(raw: string | null | undefined): MppscProductCopyV1 {
  let patch: Partial<MppscProductCopyV1> | null = null;
  if (raw && typeof raw === 'string' && raw.trim()) {
    try {
      patch = JSON.parse(raw) as Partial<MppscProductCopyV1>;
    } catch {
      patch = null;
    }
  }
  const d = DEFAULT_MPPSC_PRODUCT_COPY;
  return {
    pre: mergeBlock(d.pre, patch?.pre),
    mains: mergeBlock(d.mains, patch?.mains),
    combo: mergeBlock(d.combo, patch?.combo),
  };
}

/** Map Razorpay / payment_notes label → slider segment defaults. Lite & upgrade behave like Pre copy. */
export function paymentLabelToMppscSegment(
  paymentLabel: string | null | undefined
): MppscPricingSegmentKey {
  const pl = String(paymentLabel ?? '').toLowerCase();
  if (pl === 'mains') return 'mains';
  if (pl === 'combo') return 'combo';
  return 'pre';
}
