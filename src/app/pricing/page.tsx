'use client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 PRICING PAGE — Dynamic prices from backend, marketing-optimized
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// All prices fetched from /api/pricing → admin changes reflect instantly.
// Designed as a lead-gen conversion page:
//   - Urgency banner (FOMO)
//   - Clear "what you get" breakdown
//   - Validity tied to exam dates (Prelims/Mains)
//   - Bilingual (EN/HI)
//   - Trust signals + FAQ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useEffect, useMemo, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronDown,
  Shield,
  Zap,
  Sparkles,
  Target,
  BookOpen,
  BarChart3,
  FileText,
  Flame,
  History,
  Brain,
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { useSettingsStore } from '@/store/useSettingsStore';
import {
  PRICING_DEFAULTS,
  PRO_FEATURES,
} from '@/config/pricing';
import type { MppscPricingSegmentKey } from '@/config/mppsc-product-copy';
import { DEFAULT_MPPSC_PRODUCT_COPY } from '@/config/mppsc-product-copy';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { PricingCard } from '@/components/PricingCard';
import { cn } from '@/lib/utils';
import { getPricingData } from '@/actions/pricing-actions';
import { useQuery } from '@tanstack/react-query';
import { hasMainsAccess, hasPreAccess } from '@/lib/access-grants';

// ── FAQ data — bilingual ────────────────────────────────────
const faqData = [
  {
    q: { en: 'How long is my access valid?', hi: 'मेरा एक्सेस कब तक वैध रहेगा?' },
    a: {
      en: 'Pro access is valid for 6 Months.',
      hi: 'प्रो एक्सेस 6 महीने तक वैध है।',
    },
  },
  {
    q: { en: 'What if the exam is delayed?', hi: 'अगर परीक्षा में देरी हुई तो?' },
    a: {
      en: 'If MPPSC delays the exam, we will extend your access accordingly. No extra charge.',
      hi: 'अगर MPPSC परीक्षा में देरी करता है, तो हम आपका एक्सेस उसी हिसाब से बढ़ा देंगे। कोई अतिरिक्त शुल्क नहीं।',
    },
  },
  {
    q: { en: 'Do you provide bookish textbook notes?', hi: 'क्या आप इसमें पारंपरिक टेक्स्टबुक नोट्स भी देते हैं?' },
    a: {
      en: 'No. We do NOT provide boring, bulky, or outdated textbook notes to blindly memorize. Instead, we focus on deep, structured conceptual clarity for every syllabus topic and exam-ready PYQ model answers with insights engineered for ranks.',
      hi: 'नहीं! हम रटने वाली पारंपरिक और भारी-भरकम पीडीएफ नोट्स नहीं देते हैं। इसके बजाय, हम आपको सिलेबस के हर टॉपिक पर गहरी वैचारिक स्पष्टता (conceptual clarity) और पिछले वर्षों के सटीक मॉडल उत्तर (PYQ Model Answers) प्रदान करते हैं।',
    },
  },
  {
    q: { en: 'How are the Prelims questions and PYQs organized?', hi: 'प्रारंभिक परीक्षा (Prelims) के टेस्ट और PYQs कैसे व्यवस्थित हैं?' },
    a: {
      en: 'Our Prelims content is systematically organized in a highly structured layout: Year-wise (2020–2026), Unit-wise (Unit 1 to 10), and Subject-wise. Every single question features smart, detailed explanations, analytics, and bilingual retention mnemonics to boost your recall.',
      hi: 'हमारा प्रिलिम्स कंटेंट पूरी तरह से व्यवस्थित है: वर्ष-वार (2020-2026), यूनिट-वार (यूनिट 1 से 10) और विषय-वार (Subject-wise)। हर प्रश्न के साथ आपको मिलेगी स्मार्ट व्याख्या, आपके सुधार के लिए रियल-टाइम एनालिटिक्स, और याद रखने के लिए आसान द्विभाषी मेमोनिक्स (स्मृति तकनीक)।',
    },
  },
  {
    q: { en: 'What exactly do we get in the Mains module?', hi: 'मुख्य परीक्षा (Mains) मॉड्यूल में वास्तव में क्या-क्या मिलेगा?' },
    a: {
      en: 'In Mains, you get entire syllabus topic-by-topic deep clarity mapped to the syllabus tree. For PYQs and core topics, every question features 2 completely independent model answers (Double-Style Variations: natural drafts written separately in Hindi & English, not machine translations) along with premium Expert Insights, constitutional articles, landmark cases, and MP-specific authentic data.',
      hi: 'मेंस मॉड्यूल में आपको पूरे सिलेबस ट्री के अनुसार प्रत्येक टॉपिक की गहरी संरचनात्मक समझ मिलती है। इसके अलावा, मुख्य परीक्षा के प्रश्नों के लिए हर प्रश्न के "2 बिल्कुल अलग दृष्टिकोण वाले मॉडल उत्तर" (डबल-स्टाइल उत्तर वेरिएशन) मिलते हैं। ये दोनों भाषाओं (Hindi & English) में बिना मशीन अनुवाद के लिखे गए हैं, साथ ही इनमें रणनीतिक विशेषज्ञ मार्गदर्शन (संवैधानिक अनुच्छेद, कोर्ट फैसले व MP-विशिष्ट डेटा) भी शामिल हैं।',
    },
  },
  {
    q: { en: 'Can I use my account on multiple devices?', hi: 'क्या मैं अपने अकाउंट को एक साथ कई डिवाइसेज पर चला सकता हूँ?' },
    a: {
      en: 'To maintain account security and platform integrity, we follow a strict Single Device Login policy. You can use your account on any device, but logging in on a new device will automatically log you out from the previous one.',
      hi: 'अकाउंट की सुरक्षा के लिए हम Single Device Login पॉलिसी का पालन करते हैं। आप किसी भी डिवाइस पर अपना अकाउंट चला सकते हैं, लेकिन नए डिवाइस पर लॉगिन करने पर पिछले डिवाइस से आप अपने आप लॉग-आउट हो जाएंगे।',
    },
  },
];

// ── Feature lists from centralized config ───────────────
const proFeatures = PRO_FEATURES;

// ── Pricing data from centralized config ────────────────

// ── FAQ Accordion Item ──────────────────────────────────────
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="group flex w-full cursor-pointer items-center justify-between py-5 text-left"
      >
        <span className="pr-4 text-sm font-semibold text-slate-800 md:text-base">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-sm leading-relaxed text-slate-600">{answer}</p>
        </div>
      </div>
    </div>
  );
}

const preValueCards = [
  {
    icon: Target,
    label: { en: 'What to study, what to skip', hi: 'क्या पढ़ना है, क्या छोड़ना है' },
    sub: { en: 'Understand the real exam relevance of every topic and set the exact boundary of your study.', hi: 'हर टॉपिक की वास्तविक परीक्षा-प्रासंगिकता और तैयारी की सही सीमा समझें।' },
    highlight: true,
  },
  {
    icon: History,
    label: { en: 'Identify patterns through PYQs', hi: 'PYQ से पैटर्न पहचानें' },
    sub: { en: 'Spot high-frequency repeating areas via unit-wise, subject-wise, and year-wise PYQs.', hi: 'Unit-wise, Subject-wise और Year-wise PYQs से बार-बार पूछे जाने वाले विषय पहचानें।' },
    badges: { en: ['Year-wise', 'Subject-wise', 'Unit-wise'], hi: ['वर्ष-वार', 'विषय-वार', 'यूनिट-वार'] },
    highlight: true,
  },
  {
    icon: BookOpen,
    label: { en: 'Deep syllabus understanding', hi: 'सिलेबस की गहरी समझ' },
    sub: { en: 'Don’t just read a list of topics—grasp the true meaning and exam-weight of every syllabus line.', hi: 'सिर्फ सूची नहीं, बल्कि हर सिलेबस लाइन का वास्तविक अर्थ और महत्व समझें।' },
    highlight: true,
  },
  {
    icon: BarChart3,
    label: { en: 'What can be asked in the exam?', hi: 'परीक्षा में क्या पूछा जा सकता है?' },
    sub: { en: 'Anticipate future question patterns and trends based on scientific PYQ analysis.', hi: 'पिछले वर्षों के प्रश्नों और ट्रेंड्स के आधार पर संभावित परीक्षा दिशा समझें।' },
    highlight: true,
  },
  {
    icon: Brain,
    label: { en: 'Understand the examiner’s mindset', hi: 'परीक्षक की सोच समझें' },
    sub: { en: 'Learn how priority weights are assigned and how tricky questions are framed.', hi: 'किस विषय को कितनी प्राथमिकता मिलती है और प्रश्न कैसे घुमाकर पूछे जाते हैं, जानें।' },
    highlight: true,
  },
  {
    icon: Zap,
    label: { en: 'Master every single Unit', hi: 'हर यूनिट पर महारत' },
    sub: { en: 'PYQs, core concepts, and high-yield revision points for all 10 units, centralized.', hi: 'प्रत्येक यूनिट के साथ जुड़े PYQs, अवधारणाएँ और परीक्षा-योग्य बिंदु एक ही स्थान पर।' },
  },
  {
    icon: Sparkles,
    label: { en: 'Remember complex facts easily', hi: 'कठिन तथ्य आसानी से याद रखें' },
    sub: { en: 'Store places, MP history, and hard dates permanently using simplified memory hacks.', hi: 'महत्वपूर्ण तथ्यों, स्थानों, इतिहास और अवधारणाओं को सरल ट्रिक्स व संबंधों से याद रखें।' },
    highlight: true,
  },
  {
    icon: FileText,
    label: { en: 'Pre-to-Mains connection', hi: 'Pre से Mains तक कनेक्शन' },
    sub: { en: 'Connect factual prelims topics to conceptual Mains dimensions wherever necessary.', hi: 'जहाँ आवश्यक हो, विषयों के गहरे आयाम और Mains दृष्टिकोण भी समझें।' },
  },
];

const mainsValueCards = [
  {
    icon: History,
    label: { en: 'Recognize Examiner\'s Pattern', hi: 'परीक्षक का वास्तविक पैटर्न पहचानें' },
    sub: { en: 'Learn how official answers are structured for maximum marks in all 6 papers', hi: 'सीखें कि सभी 6 पेपर्स में अधिकतम अंकों के लिए उत्तर कैसे लिखे जाते हैं' },
    badges: { en: ['Paper 1-6', 'Strategic Answers'], hi: ['पेपर 1-6', 'रणनीतिक उत्तर'] },
    highlight: true,
  },
  {
    icon: Target,
    label: { en: 'Know Exact Syllabus Depth', hi: 'हर टॉपिक में कितनी डेप्थ तक पढ़ना है, क्लियर' },
    sub: { en: 'Clear guidelines on what to focus on and what to leave for every single unit', hi: 'प्रत्येक यूनिट के लिए क्या पढ़ना है और क्या छोड़ना है, इसकी बिल्कुल स्पष्ट गाइडलाइन्स' },
    highlight: true,
  },
  {
    icon: Sparkles,
    label: { en: 'Master Multiple Scoring Approaches', hi: 'एक ही प्रश्न को अलग-अलग तरीकों से लिखना सीखें' },
    sub: { en: 'Compare and master 2 completely distinct natural model drafts for each question', hi: 'हर प्रश्न के लिए 2 बिल्कुल अलग दृष्टिकोण वाले शानदार मॉडल उत्तरों का विश्लेषण' },
    highlight: true,
  },
  {
    icon: Zap,
    label: { en: '⚡ Save Hours of Page-Juggling', hi: '⚡ PDFs के झंझट से मुक्ति, समय बचाएं' },
    sub: { 
      en: 'Switch between any topic or paper of GS 1-6 instantly without losing focus', 
      hi: 'बिना फोकस खोए पेपर 1 से 6 के किसी भी टॉपिक पर 1 क्लिक में तुरंत स्विच करें' 
    },
    highlight: true,
  },
  {
    icon: BookOpen,
    label: { en: 'Write Like an Expert', hi: 'विशेषज्ञ की तरह प्रभावशाली उत्तर लिखें' },
    sub: { en: 'Learn exact scoring tricks, what to underline, and examiner mindset rules', hi: 'सीखें कि उत्तर में क्या अंडरलाइन करना है, और सामान्य गलतियों से कैसे बचना है' },
    highlight: true,
  },
  {
    icon: History,
    label: { en: 'See Syllabus Evolve Into Questions', hi: 'देखें कि सिलेबस से प्रश्न कैसे बनते हैं' },
    sub: { en: 'Read past years\' questions mapped directly under the topic you are revising', hi: 'जो टॉपिक आप पढ़ रहे हैं, उसके ठीक नीचे पिछले वर्षों के प्रश्नों का सीधा लाइव कवरेज' },
  },
  {
    icon: Zap,
    label: { en: 'Remember Complex Topics Permanently', hi: 'कठिन विषयों को लंबे समय तक याद रखें' },
    sub: { en: 'Store hard acts, constitutional articles, and MP facts using smart associations', hi: 'कठिन अधिनियमों, अनुच्छेदों और MP के फैक्ट्स को आसान मेमोरी ट्रिक्स से याद रखें' },
  },
];

function PricingPageInner() {
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({
    planType: 'pro' as 'lite' | 'pro' | 'upgrade' | 'mains' | 'combo',
    name: '',
  });

  const { language, user } = useSettingsStore();
  const hi = language === 'hi';
  const router = useRouter();
  const searchParams = useSearchParams();
  const planTier = user?.planTier ?? 'free';
  const isProUser = planTier === 'pro';
  const isLiteUser = planTier === 'lite';
  const [mppscSegment, setMppscSegment] = useState<MppscPricingSegmentKey>(
    () => (searchParams.get('need') === 'mains' ? 'mains' : 'combo')
  );
  const [showAllMainsCards, setShowAllMainsCards] = useState(false);

  // 🔒 Fetch pricing with React Query + Server Action
  const { data: pricingData, isLoading } = useQuery({
    queryKey: ['pricing', 'mppsc'],
    queryFn: async () => await getPricingData('mppsc'),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const p = pricingData?.pricing || PRICING_DEFAULTS;
  const mppscCopy =
    pricingData?.mppscProductCopy ??
    DEFAULT_MPPSC_PRODUCT_COPY;

  /** Mains/Combo cards use API-merged copy; Pre keeps classic `PRO_FEATURES` list. */
  const mainsComboCardFeatures = useMemo(() => {
    if (mppscSegment === 'pre') return null;
    const block = mppscCopy[mppscSegment];
    return block.bulletsEn.map((en, i) => ({
      en,
      hi: block.bulletsHi[i] ?? en,
      icon: 'Target',
    }));
  }, [mppscCopy, mppscSegment]);

  // Pre Pro users without Mains — old behaviour: skip pricing noise
  const needsMainsUpsell = searchParams.get('need') === 'mains';

  useEffect(() => {
    if (!needsMainsUpsell && isProUser && hasPreAccess(user) && !hasMainsAccess(user)) {
      router.replace('/syllabus/quiz/pyq');
    }
  }, [isProUser, needsMainsUpsell, user, router]);

  const handleSegmentChange = useCallback((key: MppscPricingSegmentKey) => {
    setMppscSegment(key);
    setShowAllMainsCards(false);
  }, []);

  const handleBuy = (plan: 'lite' | 'pro' | 'upgrade' | 'mains' | 'combo') => {
    if (plan === 'lite') {
      setSelectedPlan({ planType: 'lite', name: `Lite Plan — ₹${p.litePrice}` });
    } else if (plan === 'pro') {
      setSelectedPlan({ planType: 'pro', name: `Pro (full Prelims) — ₹${p.proPrice}` });
    } else if (plan === 'upgrade') {
      setSelectedPlan({ planType: 'upgrade', name: `Pro Upgrade — ₹${p.upgradePrice}` });
    } else if (plan === 'mains') {
      setSelectedPlan({
        planType: 'mains',
        name: `Mains Gyan Kosh — ₹${p.mainsPrice}`,
      });
    } else if (plan === 'combo') {
      setSelectedPlan({
        planType: 'combo',
        name: `MPPSC Complete Preparation System — ₹${p.comboPrice}`,
      });
    }
    setShowPaymentModal(true);
  };

  // 🦴 SKELETON LOADING STATE (Correct Placement)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 space-y-4 text-center">
            <Skeleton className="mx-auto h-8 w-48 rounded-full" />
            <Skeleton className="mx-auto h-12 w-3/4 max-w-lg rounded-xl" />
            <Skeleton className="mx-auto h-6 w-1/2 max-w-md rounded-lg" />
          </div>
          <div className="mx-auto flex max-w-lg justify-center">
            <div className="h-[560px] w-full animate-pulse rounded-3xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffdfa] font-sans selection:bg-amber-100 selection:text-amber-900 overflow-hidden relative">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      {/* ── Hero Header ──────────────────────────────────── */}
      <section className="relative z-10 px-4 pt-24 pb-4 text-center md:pt-32 md:pb-8">
        <h1 className="font-display mb-4 text-4xl leading-[1.28] py-1 font-black tracking-tight text-slate-900 md:text-7xl">
          {hi ? (
            <>
              रटना छोड़ें,
              <br />
              <span className="text-emerald-600 block mt-2">रणनीति चुनें</span>
            </>
          ) : (
            <>
              Stop Rote Learning,
              <br />
              <span className="text-emerald-600 block mt-2">Choose Strategy</span>
            </>
          )}
        </h1>
        <p className="mx-auto mb-6 max-w-2xl text-lg font-black text-slate-700 md:text-2xl leading-relaxed">
          {hi ? (
            <>
              सिलेबस की <span className="text-amber-600">असली समझ</span> से <span className="text-emerald-600 font-black bg-emerald-50/80 px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-sm inline-block">मॉडल उत्तरों तक</span>
            </>
          ) : (
            <>
              From Deep <span className="text-amber-600">Syllabus Clarity</span> to <span className="text-emerald-600 font-black bg-emerald-50/80 px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-sm inline-block">Model Answers</span>
            </>
          )}
        </p>
        <p className="mx-auto max-w-xl text-xs font-semibold text-slate-500">
          {hi
            ? 'टॉगल से प्लान बदलें — कीमत, वैधता व बुलेट्स एक ही कार्ड में अपडेट होंगे।'
            : 'Use the Pre / Mains / Combo toggle — price, perks & validity refresh in one card.'}
        </p>
      </section>

      {/* ── Pro user gets redirected by useEffect above ────── */}

      {/* ── Lite user — unlock full Prelims (Pro) ─────────── */}
      {isLiteUser && (
        <section className="px-4 pb-8">
          <div className="mx-auto flex max-w-lg flex-col gap-6">
            <p className="text-center text-sm font-bold text-slate-600">
              {hi ? 'लाइट से पूरा प्रीलिम्स (प्रो)' : 'Lite → full MPPSC Prelims (Pro)'}
            </p>
            <PricingCard
              planType="pro"
              pricing={p}
              features={proFeatures}
              language={language}
              onBuy={() => handleBuy('pro')}
            />
            {!hasMainsAccess(user) && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center shadow-sm">
                <p className="mb-3 text-sm font-bold text-emerald-900">
                  {hi ? 'मेन्स ज्ञानकोश जोड़ें' : 'Add Mains Gyan Kosh'}
                </p>
                <p className="mb-4 text-xs text-emerald-800">
                  {hi
                    ? 'MPPSC Mains की तैयारी अलग से — सिलेबस + मॉडल उत्तर।'
                    : 'MPPSC Mains preparation — syllabus + model answers.'}
                </p>
                <button
                  type="button"
                  onClick={() => handleBuy('mains')}
                  className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-black text-white shadow-lg hover:bg-emerald-700"
                >
                  {hi ? `मेन्स — ₹${p.mainsPrice}` : `Mains — ₹${p.mainsPrice}`}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Free users — both plans ──────────────────────── */}
      {!isProUser && !isLiteUser && (
        <section className="px-4 pb-16">
          
          {/* ── What You Get Section (Value First) ───────── */}
          <div className="mx-auto mb-16 max-w-6xl">
            <div className="mb-8 flex flex-col items-center gap-2">
               <h2 className="text-2xl font-black text-slate-900 md:text-3xl tracking-tight">
                {hi ? 'आपको क्या मिलता है?' : 'What do you get?'}
              </h2>
              <div className="h-1.5 w-20 rounded-full bg-amber-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {(showAllMainsCards 
                ? (mppscSegment === 'pre' ? preValueCards : mainsValueCards) 
                : (mppscSegment === 'pre' ? preValueCards : mainsValueCards).slice(0, 4)
              ).map((item, idx) => {
                const { icon: Icon, highlight } = item;
                const label = hi ? item.label.hi : item.label.en;
                const sub = hi ? item.sub.hi : item.sub.en;
                const badges = item.badges ? (hi ? item.badges.hi : item.badges.en) : undefined;
                
                return (
                  <div
                    key={idx}
                    className={cn(
                      "group relative rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 shadow-sm",
                      highlight 
                        ? "border-amber-200 bg-amber-50/20 shadow-amber-500/5 hover:shadow-amber-500/10 hover:border-amber-300" 
                        : "border-slate-100 bg-white hover:border-amber-100 hover:shadow-lg"
                    )}
                  >
                    {/* Unique Sparkle for Highlighted PYQ Card */}
                    {badges && (
                      <div className="absolute -top-1.5 -right-1.5 flex h-7 w-7 animate-bounce items-center justify-center rounded-full bg-amber-400 text-white shadow-lg">
                        <Sparkles size={14} className="animate-pulse" />
                      </div>
                    )}

                    <div className={cn(
                      "mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                      highlight ? "bg-amber-500 text-white shadow-xl shadow-amber-500/20" : "bg-slate-100 text-slate-700 group-hover:bg-amber-100 group-hover:text-amber-600"
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <p className="mb-1 text-sm font-black text-slate-900 md:text-base tracking-tight">{label}</p>
                    
                    {/* Badges Organized Flow */}
                    {badges && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {badges.map((badge: string) => (
                          <span 
                            key={badge} 
                            className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-black tracking-widest text-emerald-700 uppercase"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{sub}</p>
                  </div>
                );
              })}
            </div>

            {/* Read More Button */}
            {((mppscSegment === 'pre' ? preValueCards : mainsValueCards).length > (showAllMainsCards ? 999 : 4)) && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllMainsCards(true)}
                  className="group flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-6 py-3 text-xs font-black tracking-widest text-amber-700 uppercase transition-all hover:bg-amber-500/10 hover:border-amber-500/40 active:scale-95"
                >
                  {hi ? 'और विशेषताएं देखें (Read More)' : 'Read More Features'}
                  <ChevronDown size={14} className="transition-transform group-hover:translate-y-0.5" />
                </button>
              </div>
            )}
          </div>

          {/* FOMO badge — Now just above pricing */}
          <div className="mb-10 flex justify-center">
            <div className="relative inline-flex items-center gap-3 rounded-full border border-amber-200 bg-amber-50/80 backdrop-blur-sm px-5 py-2.5 shadow-xl shadow-amber-500/5">
              <Flame className="h-4 w-4 text-orange-600 animate-pulse" />
              <span className="text-sm font-black text-amber-900 uppercase tracking-tight">
                {hi ? '🚀 MPPSC 2027 संस्थापक बैच' : '🚀 MPPSC 2027 Founding Batch'}
              </span>
            </div>
          </div>

          {/* ── Pricing: single card + Pre / Mains / Combo toggle ───── */}
          <div className="mx-auto w-full max-w-lg space-y-6">
            <div
              role="tablist"
              aria-label={hi ? 'प्लान टॉगल' : 'Plan toggle'}
              className="flex gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm"
            >
              {(
                [
                  { key: 'pre' as const, lab: hi ? 'प्री' : 'Pre' },
                  { key: 'mains' as const, lab: hi ? 'मेन्स' : 'Mains' },
                  { key: 'combo' as const, lab: hi ? 'कॉम्बो' : 'Combo' },
                ] as const
              ).map(({ key, lab }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={mppscSegment === key}
                  onClick={() => handleSegmentChange(key)}
                  className={cn(
                    'relative flex-1 rounded-xl py-3 text-center text-xs font-black uppercase tracking-wide transition-all',
                    mppscSegment === key
                      ? key === 'mains'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : key === 'combo'
                          ? 'bg-amber-500 text-slate-900 shadow-md'
                          : 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  {lab}
                </button>
              ))}
            </div>

            {mppscSegment === 'pre' ? (
              <PricingCard
                planType="pro"
                pricing={p}
                features={proFeatures}
                language={language}
                onBuy={() => handleBuy('pro')}
                isPopular
              />
            ) : mainsComboCardFeatures ? (
              <PricingCard
                planType={mppscSegment === 'mains' ? 'mains' : 'combo'}
                pricing={p}
                features={mainsComboCardFeatures}
                language={language}
                onBuy={() => handleBuy(mppscSegment === 'mains' ? 'mains' : 'combo')}
                isPopular={mppscSegment === 'combo'}
              />
            ) : null}
          </div>

          {/* Trust signals */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <Shield className="h-4 w-4 text-slate-400" />
            <p className="text-xs font-medium text-slate-400">
              {hi
                ? 'सुरक्षित भुगतान • कोई ऑटो-रिन्यूअल नहीं • RazorPay से एक्टिवेट'
                : 'Secure Payment • No Auto-Renewal • Activate via RazorPay'}
            </p>
          </div>
        </section>
      )}

      {/* ── FAQ Section ──────────────────────────────────── */}
      <section className="px-4 pt-4 pb-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display mb-12 text-center text-2xl font-bold text-slate-900 md:text-3xl">
            {hi ? 'अक्सर पूछे जाने वाले सवाल' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-4">
            {faqData.map((item, i) => (
              <FaqItem
                key={i}
                question={hi ? item.q.hi : item.q.en}
                answer={hi ? item.a.hi : item.a.en}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Payment Modal Integration */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        planType={selectedPlan.planType}
        planName={selectedPlan.name}
      />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fffdfa]">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-200 border-t-amber-600" />
        </div>
      }
    >
      <PricingPageInner />
    </Suspense>
  );
}
