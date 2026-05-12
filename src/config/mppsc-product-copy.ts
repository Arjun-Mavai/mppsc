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
      'Full MPPSC Prelims test series — unlimited topic & unit tests',
      '100-question full-length mocks + CSAT mocks',
      'PYQ Intelligence: trends, weightage & exam DNA (2020–2026 papers)',
      'Premium study blogs and smart analytics + revision-ready test history',
    ],
    bulletsHi: [
      'पूरा MPPSC प्रीलिम्स टेस्ट सीरीज़ — असीमित टॉपिक व यूनिट टेस्ट',
      '100 प्रश्नों वाली फुल-लेंथ मॉक + CSAT मॉक',
      'PYQ इंटेलिजेंस: ट्रेंड, वेटेज व एग्ज़ाम DNA (2020–2026 पेपर)',
      'प्रीमियम ब्लॉग्स, स्मार्ट एनालिटिक्स व रिवीज़न-फ्रेंडली टेस्ट हिस्ट्री',
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
      'Double-Style Answer Variations — Every question has 2 completely distinct ways to write the model answer (practice multiple structures & writing angles)',
      '6-Paper Expert Mind Framework — All 6 Mains papers handled with dedicated subject-expert perspectives, framework-building, and paper-specific demands',
      'Deep Syllabus Detailing — Every single topic mapped with conceptual structures, breakdowns, high-yield facts, state-specific acts, and case studies',
      'Expert Strategy & Value Addition — Deeply researched constitutional articles, landmark judgments, MP-specific data & retention tricks',
      'Premium Mains PYQ Library — Standard PYQ patterns with best-explained dual-style model answers & expert analytical insights',
    ],
    bulletsHi: [
      'डबल-स्टाइल उत्तर वेरिएशन — हर प्रश्न के 2 अलग-अलग तरीकों और एंगल्स से लिखे उत्तर (एक ही उत्तर को दो अलग दृष्टिकोणों से लिखने की शैली)',
      '6-पेपर एक्सपर्ट माइंड फ्रेमवर्क — सभी 6 मुख्य परीक्षा पेपर्स को उनके विषय-विशेषज्ञों के अनूठे नज़रिए, माइंड-फ्रेम और सटीक पेपर-वाइज़ रणनीतियों से हैंडल किया गया है',
      'डीप सिलेबस डिटेलिंग — सिलेबस के हर टॉपिक की स्पष्ट व सूक्ष्म संरचनात्मक समझ, विषय-वार व्याख्या, विस्तृत फैक्ट्स, राज्य विशेष अधिनियम और डीप केस स्टडीज के साथ',
      'रणनीतिक मूल्यवर्धन व विशेषज्ञ रणनीति — गहरी रिसर्च वाले संवैधानिक अनुच्छेद, प्रमुख कोर्ट फैसले, MP-विशिष्ट प्रामाणिक डेटा और याद रखने की ट्रिक्स',
      'मेंस PYQ लाइब्रेरी — सर्वश्रेष्ठ विश्लेषण, हिंदी व इंग्लिश में 2 अलग-अलग स्टाइल के सटीक मॉडल उत्तर और एक्सपर्ट इनसाइट्स के साथ पिछले वर्षों के प्रश्नों (PYQs) का संपूर्ण संग्रह',
    ],
    thankYouBadgeEn: 'Mains vault live',
    thankYouBadgeHi: 'मेंस वॉल्ट लाइव',
    thankYouHeadlineEn: 'Mains vault activated!',
    thankYouHeadlineHi: 'मेंस वॉल्ट चालू!',
    thankYouSubtitleEn:
      'You now carry the complete English & Hindi mains desks — PYQs, model answers, expert cues & syllabus arcs.',
    thankYouSubtitleHi:
      'आपके पास मेंस डेस्क पूरा है — PYQ, मॉडल उत्तर, एक्सपर्ट रणनीति व सिलेबस ट्रैक।',
    thankYouFeatureLinesEn: [
      'Official mains PYQs with model grids',
      'Expert insights + pitfalls',
      'English & Hindi drafts you can practise',
      'Syllabus + PYQ drill views',
    ],
    thankYouFeatureLinesHi: [
 'आधिकारिक PYQ व मॉडल उत्तर',
           'एक्सपर्ट टिप्स + ट्रैप अलर्ट',
      'दो भाषाओं में ड्राफ़्ट शैली',
      'सिलेबस ट्रैक + PYQ ड्रिल दृष्टि',
    ],
    emailSubjectEn: '🎉 MPPSC ZEN — Mains vault unlocked, set password',
    emailBrandLineEn: 'MPPSC Mains desk',
    emailBrandTaglineEn: 'PYQs • Model answers • Expert cues',
    emailLeadEn:
      'Congrats! Your Mains vault unlocks dual-style English & Hindi model answers layered with coaching insights, syllabus-tracked arcs, plus the mains PYQ library for serious writing practice.',
    emailFeaturesEn: [
      '✅ Official mains PYQs with ready-to-submit outlines',
      '✅ Hindi + English drafts & examiner-style commentary',
      '✅ Syllabus units/topics mapped for disciplined revision',
      '✅ Library mode for drills & multi-year PYQ patterns',
    ],
  },
  combo: {
    bulletsEn: [
      'Everything in Full Prelims (Pro) — unlimited tests, PYQ Intelligence, dashboards & blogs',
      'Full Mains vault — official previous years\' questions, dual-style English & Hindi model answers & expert coaching overlays',
      'One dashboard for objective drills and mains writing — aligned to MPPSC 2026 pattern',
      'Smart pick when you are committed to clearing both stages in one attempt',
      'Single login: switch between prelims mocks and mains syllabus / PYQ desk anytime',
    ],
    bulletsHi: [
      'फुल प्रीलिम्स (प्रो) की पूरी शक्ति — अनलिमिटेड टेस्ट, PYQ इंटेलिजेंस, डैशबोर्ड व ब्लॉग',
      'पूरा मेंस वॉल्ट — आधिकारिक पिछले वर्षों के PYQ, हिंदी व इंग्लिश में 2 अलग-अलग स्टाइल के सटीक मॉडल उत्तर व एक्सपर्ट कोचिंग',
      'एक ही डैशबोर्ड में ऑब्जेक्टिव ड्रिल और मेंस लेखन — MPPSC 2026 पैटर्न अनुकूल',
      'जब दोनों चरणों की तैयारी एक ही सत्र में करनी हो तो सर्वोत्तम पैकेज',
      'एक लॉगिन — कभी प्रीलिम्स मॉक, कभी मेंस सिलेबस व PYQ डेस्क',
    ],
    thankYouBadgeEn: 'Combo active',
    thankYouBadgeHi: 'कॉम्बो एक्टिव',
    thankYouHeadlineEn: 'Pre + Mains combined!',
    thankYouHeadlineHi: 'प्री + मेंस एक साथ!',
    thankYouSubtitleEn:
      'You now wield the objective stack plus the complete English & Hindi mains desks — practise both papers without juggling logins.',
    thankYouSubtitleHi:
      'आपके पास अब प्रीलिम्स स्टैक भी है और मेंस डेस्क भी — एक ही एकाउंट में दोनों पेपर।',
    thankYouFeatureLinesEn: [
      'Full prelims Pro stack — mocks & analytics',
      'Mains syllabus + PYQ vault unlocked',
      'English & Hindi answers on tap',
      'One account for both papers',
    ],
    thankYouFeatureLinesHi: [
      'पूरा प्रो प्रीलिम्स स्टैक — मॉक व एनालिटिक्स',
      'मेंस सिलेबस + PYQ वॉल्ट अनलॉक',
      'हिंदी व इंग्लिश उत्तर और एक्सपर्ट टिप्स',
      'दोनों पेपर के लिए एक एकाउंट',
    ],
    emailSubjectEn: '🎉 MPPSC ZEN — Pre+Mains unlocked, finish setup',
    emailBrandLineEn: 'MPPSC Pre + Mains',
    emailBrandTaglineEn: 'Unified subscription',
    emailLeadEn:
      'Huge win — you subscribed to BOTH stacks. Activate your password once, then roam between full prelims mocks, PYQ intelligence, and mains writing vaults curated for English & Hindi answers.',
    emailFeaturesEn: [
      '✅ Everything in Pro tests + dashboards',
      '✅ Mains PYQs, model drafts & expert cues',
      '✅ One workflow for syllabus + practise days',
      '✅ Admin-tuned perks — revisit /pricing anytime for latest bundles',
    ],
  },
};

function mergeBlock(
  base: MppscSegmentCopyBlock,
  patch?: Partial<MppscSegmentCopyBlock>
): MppscSegmentCopyBlock {
  if (!patch) return base;
  return {
    ...base,
    ...patch,
    bulletsEn: patch.bulletsEn ?? base.bulletsEn,
    bulletsHi: patch.bulletsHi ?? base.bulletsHi,
    thankYouFeatureLinesEn: patch.thankYouFeatureLinesEn ?? base.thankYouFeatureLinesEn,
    thankYouFeatureLinesHi: patch.thankYouFeatureLinesHi ?? base.thankYouFeatureLinesHi,
    emailFeaturesEn: patch.emailFeaturesEn ?? base.emailFeaturesEn,
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
