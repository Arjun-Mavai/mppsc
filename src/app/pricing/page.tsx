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

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronDown,
  Shield,
  Zap,
  Clock,
  Users,
  Sparkles,
  Target,
  BookOpen,
  BarChart3,
  FileText,
  Flame,
  History,
  Newspaper,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettingsStore } from '@/store/useSettingsStore';
import {
  PRICING_DEFAULTS,
  LITE_FEATURES,
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
      en: 'Pro access is valid till MPPSC 2026 Mains.',
      hi: 'प्रो एक्सेस MPPSC 2026 मेन्स तक वैध है।',
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
];

// ── Feature lists from centralized config ───────────────
// Icon mapping for pricing page
const ICON_MAP: Record<string, any> = {
  Target,
  BookOpen,
  Sparkles,
  FileText,
  Clock,
  Zap,
  BarChart3,
  History,
};

// const liteFeatures = LITE_FEATURES.map((f) => ({ ...f, icon: ICON_MAP[f.icon || ''] || Target }));
const proFeatures = PRO_FEATURES.map((f) => ({ ...f, icon: ICON_MAP[f.icon || ''] || Target }));

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
    icon: BarChart3,
    label: { en: 'Exam DNA Analysis', hi: 'एग्जाम DNA विश्लेषण' },
    sub: { en: 'Topic Distribution & Trends', hi: 'विषय वितरण और रुझान' },
    highlight: true,
  },
  {
    icon: Target,
    label: { en: 'Master Your Syllabus', hi: 'सिलेबस पर महारत' },
    sub: { en: 'Basic understanding of all 10 units', hi: 'सभी 10 यूनिट्स की पूरी समझ' },
    highlight: true,
  },
  {
    icon: Sparkles,
    label: { en: 'Premium Facts Library', hi: 'प्रीमियम फैक्ट्स लाइब्रेरी' },
    sub: { en: 'High-yield Exam Facts', hi: 'हाई-यील्ड एग्जाम फैक्ट्स' },
    highlight: true,
  },
  {
    icon: Zap,
    label: { en: '5000+ Questions', hi: '5000+ प्रश्न' },
    sub: { en: 'Across all topics', hi: 'सभी विषयों में' },
  },
  {
    icon: FileText,
    label: { en: 'Full Mock Tests', hi: 'फुल मॉक टेस्ट' },
    sub: { en: '100Q each', hi: '100 प्रश्न प्रत्येक' },
  },
  {
    icon: History,
    label: { en: '5+ Years PYQs', hi: '5+ साल के PYQ' },
    sub: { en: 'With Explanations', hi: 'विस्तृत उत्तर सहित' },
    badges: { en: ['Year-wise', 'Subject-wise', 'Unit-wise'], hi: ['वर्ष-वार', 'विषय-वार', 'यूनिट-वार'] },
    highlight: true,
  },
  {
    icon: Newspaper,
    label: { en: 'Premium Blogs', hi: 'प्रीमियम ब्लॉग्स' },
    sub: { en: 'Basic understanding of all 10 units of MPPSC', hi: 'MPPSC की सभी 10 यूनिट्स की बेसिक समझ' },
  },
  {
    icon: BookOpen,
    label: { en: 'Master The Concept', hi: 'कॉन्सेप्ट पर महारत' },
    sub: { en: 'Structured Breakdowns & Shortcuts', hi: 'विस्तृत व्याख्या और शॉर्ट-कट' },
    highlight: true,
  },
];

const mainsValueCards = [
  {
    icon: History,
    label: { en: '5 Years Mains PYQs (2020-2024)', hi: '5 साल के मुख्य PYQs (2020-2024)' },
    sub: { en: 'Authentic strategic answers for all 6 papers', hi: 'सभी 6 पेपर्स के प्रामाणिक रणनीतिक उत्तर' },
    badges: { en: ['Paper 1-6', 'Strategic Answers'], hi: ['पेपर 1-6', 'रणनीतिक उत्तर'] },
    highlight: true,
  },
  {
    icon: Target,
    label: { en: 'Deep Syllabus Detailing', hi: 'डीप सिलेबस डिटेलिंग' },
    sub: { en: 'Every topic mapped with conceptual structures, breakdowns, high-yield facts, and state acts', hi: 'सिलेबस के हर topic की स्पष्ट व सूक्ष्म संरचनात्मक समझ, विषय-वार व्याख्या, विस्तृत facts और राज्य विशेष अधिनियम' },
    highlight: true,
  },
  {
    icon: Sparkles,
    label: { en: 'Double-Style Answer Variations', hi: 'डबल-स्टाइल उत्तर वेरिएशन' },
    sub: { en: 'Every question has 2 completely distinct model answers (compare multiple structures & styles)', hi: 'हर प्रश्न के 2 alag तरीकों व angles से लिखे मॉडल उत्तर (एक ही उत्तर को दो alag दृष्टिकोणों से समझने की शैली)' },
    highlight: true,
  },
  {
    icon: BookOpen,
    label: { en: 'Strategic Expert Blueprint', hi: 'रणनीतिक रूपरेखा' },
    sub: { en: 'What to study & how to secure marks', hi: 'क्या पढ़ना है और कैसे स्कोर बढ़ाना है' },
    highlight: true,
  },
  {
    icon: Zap,
    label: { en: '⚡ Ultra-Fast 1-Click Syllabus Navigator', hi: '⚡ अल्ट्रा-फास्ट 1-क्लिक सिलेबस नेविगेटर' },
    sub: { 
      en: 'No more opening 10 PDFs! Our Syllabus Menu is so fast you can switch between any unit or topic of Paper 1-6 in 1 click without page reloads. Zero context switch time.', 
      hi: 'सिलेबस चेक करने में 10 PDFs खोलने का झंझट खत्म! हमारा "सिलेबस मेन्यू" इतना फास्ट है कि छात्र बिना पेज रीलोड किए, पेपर 1 से पेपर 6 के किसी भी टॉपिक पर 1 क्लिक में स्विच कर सकते हैं।' 
    },
    highlight: true,
  },
  {
    icon: History,
    label: { en: 'Syllabus-Mapped PYQ Matrix', hi: 'सिलेबस-मैप्ड PYQ मैट्रिक्स' },
    sub: { en: 'See exam patterns evolve directly under the topic you are reading.', hi: 'जो टॉपिक आप पढ़ रहे हैं, उसके ठीक नीचे देखें कि पिछले सालों में क्या पूछा गया।' },
  },
  {
    icon: Zap,
    label: { en: 'Bilingual Mnemonics', hi: 'द्विभाषी मेमोनिक्स' },
    sub: { en: 'Effortless retention keywords & triggers', hi: 'याद रखने की आसान ट्रिक्स व कीवर्ड्स' },
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
  const [mppscSegment, setMppscSegment] = useState<MppscPricingSegmentKey>('combo');
  const [showAllMainsCards, setShowAllMainsCards] = useState(false);

  useEffect(() => {
    setShowAllMainsCards(false);
  }, [mppscSegment]);

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

  useEffect(() => {
    if (searchParams.get('need') === 'mains') {
      setMppscSegment('mains');
    }
  }, [searchParams]);

  // Pre Pro users without Mains — old behaviour: skip pricing noise
  useEffect(() => {
    if (isProUser && hasPreAccess(user as any) && !hasMainsAccess(user as any)) {
      router.replace('/syllabus/quiz/pyq');
    }
  }, [isProUser, user, router]);

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
        name: `Pre + Mains Combo — ₹${p.comboPrice}`,
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
        <Badge className="mb-6 cursor-default border-amber-200 bg-amber-50 px-5 py-2 text-xs font-black tracking-widest text-amber-800 uppercase shadow-sm">
          MPPSC 2026 Special
        </Badge>
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
            {!hasMainsAccess(user as any) && (
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
                {hi ? p.urgencyTextHi : p.urgencyText}
              </span>
              <div className="h-4 w-px bg-amber-200 mx-1" />
              <Badge className="h-6 border-emerald-200 bg-emerald-100 px-2 py-0 text-xs font-black text-emerald-800 hover:bg-emerald-100">
                <Users className="mr-1 h-3 w-3" />
                {p.studentsBought || PRICING_DEFAULTS.studentsBought} joined
              </Badge>
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
                  onClick={() => setMppscSegment(key)}
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
