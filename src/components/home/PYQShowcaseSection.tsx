'use client';

import React, { useState, useEffect, memo } from 'react';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { 
  History, 
  ArrowRight, 
  CheckCircle2,
  Lightbulb,
  Brain,
  AlertTriangle,
  Zap,
  TrendingUp,
  BookOpen,
  Scale,
  ChevronDown,
  X,
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// ── DATA FOR VISUALIZATIONS (Moved outside for performance) ───────────────────

const PREVIEW_QUESTIONS = [
  { id: 1, year: '2020', subject: 'GEOGRAPHY OF MP', set: 'SET-Q1', text: 'Panna district of Madhya Pradesh is famous for which mineral?' },
  { id: 2, year: '2025', subject: 'ENVIRONMENT/FORESTRY', set: 'SET-Q96', text: 'During the year 2021, which state had the largest forest cover in India?' },
  { id: 3, year: '2024', subject: 'ICT', set: 'SET-Q42', text: 'A ______ attack comes in the form of deceptive emails or text messages.' },
  { id: 4, year: '2020', subject: 'INFORMATION TECHNOLOGY', set: 'SET-Q91', text: 'Which is not a type of secondary memory?' }
];

const WEIGHTAGE_BARS = [
  { nameEn: 'MP GK', nameHi: 'मध्यप्रदेश सामान्य ज्ञान', pct: 36, color: 'from-amber-400 to-orange-500' },
  { nameEn: 'History', nameHi: 'इतिहास', pct: 14, color: 'from-emerald-400 to-teal-500' },
  { nameEn: 'Polity', nameHi: 'राजव्यवस्था', pct: 12, color: 'from-blue-400 to-indigo-500' },
  { nameEn: 'Geography', nameHi: 'भूगोल', pct: 10, color: 'from-rose-400 to-pink-500' },
];

const SUBJECT_LIST_DETAILED = [
  { name: 'MP GK', count: 188, pct: 31, icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
  { name: 'Polity', count: 95, pct: 16, icon: Scale, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { name: 'History', count: 83, pct: 14, icon: History, color: 'text-pink-500', bg: 'bg-pink-500/10 border-pink-500/20' },
];

const BETWA_EXPLANATION = [
  { id: 'core', icon: CheckCircle2, labelEn: 'Core Logic', labelHi: 'तर्क एवं विश्लेषण', color: 'emerald', contentEn: 'Based on pollution levels like the Ganges, Betwa is called the Ganga of MP.', contentHi: 'प्रदूषण के आधार पर इसे म.प्र. की गंगा कहा जाता है।' },
  { id: 'exam', icon: Lightbulb, labelEn: 'Exam Fact', labelHi: 'इतिहास', color: 'amber', contentEn: 'Origin: Kumra Gaon (Raisen). Total Length: 480 km.', contentHi: 'उद्गम: कुमरा गांव (रायसेन)। कुल लंबाई: 480 किमी।' },
  { id: 'memory', icon: Brain, labelEn: 'Memory Tip', labelHi: 'मेमोरी टिप', color: 'blue', contentEn: '"Betwa = Beta (Son) of Raisen" -> Kumra Gaon.', contentHi: '"Betwa = Beta (Son) of Raisen" -> Kumra Gaon.' },
  { id: 'scam', icon: AlertTriangle, labelEn: 'Scam Alert', labelHi: 'स्कैम अलर्ट', color: 'rose', contentEn: 'Don\'t confuse with Narmada. Narmada is the Lifeline of MP.', contentHi: 'नर्मदा से कंफ्यूज न हों। नर्मदा म.प्र. की जीवन रेखा (Lifeline) है।' }
];

const TABS = [
  { labelEn: 'Year-wise', labelHi: 'वर्ष-अनुसार', id: 0 },
  { labelEn: 'Subjects', labelHi: 'विषय', id: 2 },
  { labelEn: 'Explanations', labelHi: 'बेस्ट व्याख्या', id: 4, badge: 'Premium' },
  { labelEn: 'Weightage', labelHi: 'वेटेज', id: 1 },
  { labelEn: 'Instant', labelHi: 'इंस्टेंट', id: 3 },
];

// Memoized Sub-components for "Light Speed" performance
const QuestionItem = memo(({ q }: { q: typeof PREVIEW_QUESTIONS[0] }) => (
  <div className="relative rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 p-3 sm:p-5 space-y-3 sm:space-y-4 group/q hover:bg-white/[0.08] transition-all overflow-hidden will-change-transform">
    <div className="flex items-start gap-3 sm:gap-4">
      <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 border border-white/5 text-amber-500 text-[9px] sm:text-[10px] font-black">
        {q.id}
      </div>
      <p className="text-[12px] sm:text-sm font-bold leading-relaxed text-slate-100 opacity-90 pt-0.5 sm:pt-1 text-left">
        {q.text}
      </p>
    </div>
    <div className="flex flex-wrap gap-1.5 sm:gap-2 pl-10 sm:pl-12">
      <Badge className="bg-amber-500/10 text-amber-500 border-none px-2 py-0.5 text-[7px] sm:text-[8px] font-black">{q.year}</Badge>
      <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-2 py-0.5 text-[7px] sm:text-[8px] font-black whitespace-nowrap">{q.subject}</Badge>
      <Badge className="bg-white/5 text-slate-500 border-none px-2 py-0.5 text-[7px] sm:text-[8px] font-black">{q.set}</Badge>
    </div>
  </div>
));
QuestionItem.displayName = 'QuestionItem';

const SubjectItem = memo(({ sub }: { sub: typeof SUBJECT_LIST_DETAILED[0] }) => {
  const Icon = sub.icon;
  return (
    <div className="flex items-center justify-between rounded-2xl sm:rounded-3xl border border-white/5 bg-white/[0.03] p-3 sm:p-5 hover:bg-white/5 transition-all will-change-transform text-left">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={cn("h-9 w-9 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border flex items-center justify-center", sub.bg)}>
          <Icon size={16} className={cn("sm:scale-110", sub.color)} />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[13px] sm:text-sm font-black text-white">{sub.name}</span>
            <span className="text-[9px] sm:text-[10px] font-black text-emerald-500">{sub.count}</span>
          </div>
          <p className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-widest">{sub.pct}% weightage</p>
        </div>
      </div>
      <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-600">
        <ChevronDown size={12} className="sm:w-[14px] sm:h-[14px]" />
      </div>
    </div>
  );
});
SubjectItem.displayName = 'SubjectItem';

export function PYQShowcaseSection() {
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';
  const [activeCard, setActiveCard] = useState(0); 
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveCard((prev) => {
        const currentIndex = TABS.findIndex(t => t.id === prev);
        const nextIndex = (currentIndex + 1) % TABS.length;
        return TABS[nextIndex].id;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const handleManualSwitch = (id: number) => {
    setActiveCard(id);
  };

  return (
    <LazyMotion features={domAnimation}>
      <section id="analysis" className="relative overflow-hidden py-16 sm:py-32 contain-layout">
        {/* Background glow effects - hardware accelerated */}
        <div className="pointer-events-none absolute top-1/2 left-[-10%] h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[80px] sm:blur-[120px] will-change-transform" />
        <div className="pointer-events-none absolute right-[-5%] bottom-0 h-[250px] w-[250px] sm:h-[400px] sm:w-[400px] rounded-full bg-pink-500/5 blur-[70px] sm:blur-[100px] will-change-transform" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-24">
            
            {/* LEFT COLUMN: Strategic Copy */}
            <div className="relative z-10 w-full overflow-hidden space-y-8 sm:space-y-12 text-center lg:text-left lg:pt-10">
              <div className="space-y-6 sm:space-y-8">
                {/* Premium Floating Badge with Apple-like Glassmorphism */}
                <m.div
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group relative inline-flex items-center gap-3 rounded-2xl border border-pink-200/40 bg-white/90 sm:bg-white/50 backdrop-blur-xl px-5 py-2.5 text-[10px] sm:text-[11px] font-black tracking-[0.15em] text-pink-600 uppercase shadow-[0_20px_40px_rgba(219,39,119,0.08)] ring-4 ring-pink-50/20"
                >
                  <div className="relative flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/30">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                    <div className="absolute inset-0 animate-pulse rounded-lg bg-white/20" />
                  </div>
                  <span className="relative z-10">{isHindi ? 'PYQ रिवीज़न का समाधान' : 'PYQ Revision Solved'}</span>
                  <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </m.div>

                <m.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="py-1 text-3xl font-black tracking-tighter text-slate-900 drop-shadow-md sm:text-5xl md:text-6xl lg:text-7xl text-balance"
                >
                  <div className="flex flex-col leading-[1.1] sm:leading-[1.15]">
                    <span className="text-slate-800">
                      {isHindi ? 'हर MPPSC PYQ समझो' : 'Master Every PYQ'}
                    </span>
                    <div className="flex items-center justify-center lg:justify-start gap-2 mt-2">
                      <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 bg-clip-text text-transparent italic px-1" style={{ WebkitBackgroundClip: 'text' }}>
                        {isHindi ? 'आसान तरीके से' : 'The Smart Way'}
                      </span>
                      <span className="not-italic text-[1.1em] drop-shadow-sm select-none" style={{ color: 'initial' }}>🎯</span>
                    </div>
                  </div>
                </m.h2>

                <m.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="mx-auto lg:mx-0 max-w-xl text-left text-base sm:text-xl font-medium leading-relaxed text-slate-500 min-h-[4.5rem] sm:min-h-[auto]"
                >
                  {isHindi 
                    ? 'रटना छोड़ो, कॉन्सेप्ट पकड़ो। 2020-2026 तक के 700+ प्रश्नों की ऐसी "Smart Explanations" जो एग्जाम हॉल में आपको दूसरों से आगे रखेगी।'
                    : 'Stop memorizing, start understanding. Decoded insights from 2020-2026 to give you the competitive edge in MPPSC Prelims.'}
                </m.p>
              </div>

              {/* TAB SELECTORS */}
              <m.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center lg:justify-start"
              >
                <div className="relative w-full overflow-hidden">
                  <div className="flex gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-2 max-w-full">
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleManualSwitch(tab.id)}
                        className={cn(
                          "group relative flex shrink-0 items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-[9px] sm:text-[10px] font-black tracking-widest uppercase transition-all active:scale-95",
                          activeCard === tab.id 
                            ? "bg-slate-900 text-white shadow-xl" 
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        )}
                      >
                        <span className="relative z-10">{isHindi ? tab.labelHi : tab.labelEn}</span>
                        {tab.badge && (
                          <span className="relative z-10 rounded bg-emerald-500 px-1 py-0.5 text-[7px] font-black leading-none text-white ml-0.5">
                            {tab.badge}
                          </span>
                        )}
                        {activeCard === tab.id && (
                          <m.div 
                            layoutId="nav-bg"
                            className="absolute inset-0 bg-slate-900 rounded-lg sm:rounded-xl" 
                            transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white/90 to-transparent lg:hidden" />
                </div>
              </m.div>

              {/* CTA BUTTON - Desktop Only (Hidden on mobile) */}
              <m.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="hidden lg:block pt-4"
              >
                <Link 
                  href="/pricing"
                  className="group relative inline-flex items-center gap-4 rounded-3xl bg-[#0F172A] px-10 py-5 text-[11px] font-black tracking-[0.2em] text-white uppercase transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(15,23,42,0.3)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-500 opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="relative z-10">{isHindi ? 'प्रीमियम एक्सेस अनलॉक करें' : 'Unlock Premium Access'}</span>
                  <Sparkles className="relative z-10 h-4 w-4 text-emerald-400 group-hover:animate-pulse" />
                  <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </m.div>
            </div>

            {/* RIGHT COLUMN: Visual Showcase Cards */}
            <div 
              className="group relative flex flex-col items-center lg:items-end -mt-16 sm:-mt-16 lg:mt-0"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Ambient Background Blur */}
              <div className="absolute -inset-4 sm:-inset-10 rounded-[3rem] sm:rounded-[4rem] bg-gradient-to-br from-pink-600/10 via-emerald-500/10 to-rose-600/10 opacity-40 blur-[40px] sm:blur-[80px] group-hover:opacity-60 transition-opacity duration-1000" />

              <div className="relative aspect-[4/5.5] sm:aspect-[3.5/5.4] w-full max-w-[340px] sm:max-w-md">
                <Card className="relative h-full w-full overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border-slate-800 bg-[#06080F] p-0 text-white shadow-2xl ring-1 ring-white/5">
                  {/* Visual Header */}
                  <div className="relative border-b border-white/[0.05] bg-white/[0.02] p-4 sm:p-7 space-y-3 sm:space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                          <span className="text-[8px] sm:text-[9px] font-black tracking-[0.25em] text-[#5E6278] uppercase">MPPSC PRELIMS · INSIGHT</span>
                      </div>
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg shadow-emerald-500/30">
                          <TrendingUp size={14} className="sm:w-4 sm:h-4" />
                      </div>
                    </div>
                    
                    <AnimatePresence mode="wait">
                        <m.h3 
                          key={activeCard}
                          initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "text-xl sm:text-3xl font-black tracking-tighter bg-clip-text text-transparent",
                            activeCard === 0 ? "bg-gradient-to-r from-emerald-400 to-teal-500" :
                            activeCard === 2 ? "bg-gradient-to-r from-blue-400 to-indigo-500" :
                            activeCard === 4 ? "bg-gradient-to-r from-pink-400 to-rose-500" :
                            activeCard === 1 ? "bg-gradient-to-r from-amber-400 to-orange-500" :
                            "bg-gradient-to-r from-emerald-400 to-teal-500"
                          )}
                        >
                          {activeCard === 0 ? (isHindi ? 'वर्ष-अनुसार पेपर्स' : 'Yearly Archives') : 
                          activeCard === 2 ? (isHindi ? 'विषय-अनुसार टॉपिक' : 'Subject Matrix') :
                          activeCard === 4 ? (isHindi ? 'बेस्ट व्याख्या' : 'Best Explanations') :
                          activeCard === 1 ? (isHindi ? 'एग्जाम वेटेज' : 'Overall Weightage') : (isHindi ? 'इंस्टेंट मोड' : 'Instant Mode')}
                        </m.h3>
                    </AnimatePresence>
                  </div>

                  {/* CONTENT AREA */}
                  <div className="h-[calc(100%-120px)] sm:h-[calc(100%-140px)] overflow-y-auto p-4 sm:p-7 no-scrollbar">
                    <AnimatePresence mode="wait">
                      
                      {/* SLIDE 0: YEARLY ARCHIVE */}
                      {activeCard === 0 && (
                        <m.div key="c0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="space-y-5 text-left">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span>Select Exam Year</span>
                            <span className="text-emerald-500">2020-2026</span>
                          </div>
                          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                              {['2026', '2025', '2024', '2023', '2022', '2021', '2020'].map((y, i) => (
                                <Badge key={y} className={cn("px-4 py-2 text-[10px] font-black rounded-xl shrink-0 border-none transition-all", i === 0 ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "bg-white/5 text-slate-500 hover:bg-white/10")}>
                                    {y}
                                </Badge>
                              ))}
                          </div>

                          <div className="space-y-3 pt-2">
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Recent Questions</p>
                              {PREVIEW_QUESTIONS.map((q) => <QuestionItem key={q.id} q={q} />)}
                          </div>
                        </m.div>
                      )}

                      {/* CARD 1: OVERALL WEIGHTAGE (BARS) */}
                      {activeCard === 1 && (
                        <m.div key="c1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="space-y-5 sm:space-y-6 text-left">
                          {WEIGHTAGE_BARS.map((sub) => (
                              <div key={sub.nameEn} className="space-y-2.5 sm:space-y-3">
                                <div className="flex justify-between items-end">
                                  <span className="text-[11px] sm:text-xs font-black text-slate-200">{isHindi ? sub.nameHi : sub.nameEn}</span>
                                  <span className="text-[9px] sm:text-[10px] font-black text-amber-500">{sub.pct}%</span>
                                </div>
                                <div className="h-2.5 sm:h-3 w-full rounded-full bg-white/5 overflow-hidden ring-1 ring-white/5">
                                  <m.div 
                                      initial={{ width: 0 }} animate={{ width: `${sub.pct * 2.5}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                                      className={cn("h-full rounded-full bg-gradient-to-r", sub.color)}
                                  />
                                </div>
                              </div>
                          ))}
                          <div className="pt-4 border-t border-white/5">
                              <Badge className="bg-amber-500/10 text-amber-500 border-none px-3 py-1 font-black text-[8px] sm:text-[9px] uppercase tracking-widest">
                                2020-2026: 700+ Questions Decoded
                              </Badge>
                          </div>
                        </m.div>
                      )}

                      {/* CARD 2: SUBJECT ANALYSIS (CARDS) */}
                      {activeCard === 2 && (
                        <m.div key="c2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="space-y-5 text-left">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span>Topic-wise Mapping</span>
                            <span className="text-blue-500">10+ Subjects</span>
                          </div>
                          <div className="space-y-3 sm:space-y-4">
                            {SUBJECT_LIST_DETAILED.map((sub) => <SubjectItem key={sub.name} sub={sub} />)}
                          </div>
                        </m.div>
                      )}

                      {/* CARD 3: SMART INSTANT MODE */}
                      {activeCard === 3 && (
                        <m.div key="c3" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="space-y-4 sm:space-y-6 text-left">
                          <div className="rounded-[1.5rem] sm:rounded-[2rem] bg-white p-4 sm:p-7 text-slate-900 shadow-2xl space-y-4 sm:space-y-6 min-h-[320px] sm:min-h-[400px] border border-slate-100 relative overflow-hidden">
                              {/* Background Pattern */}
                              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl" />
                              
                              <div className="flex items-start justify-between relative z-10">
                                <div className="space-y-0.5">
                                    <p className="text-[8px] sm:text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">UNIT 1 · MP HISTORY</p>
                                    <h4 className="text-[14px] sm:text-base font-black tracking-tight">Smart Practice Mode</h4>
                                </div>
                                <Badge className="bg-emerald-500 text-white border-none font-black text-[8px] sm:text-[9px] px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1 rounded-full shadow-lg shadow-emerald-500/20">
                                    <Zap size={10} className="fill-white" /> {isHindi ? 'लाइव फीडबैक' : 'Live Feedback'}
                                </Badge>
                              </div>

                              <div className="space-y-2 relative z-10">
                                <p className="text-[12px] sm:text-sm font-bold leading-relaxed text-slate-800">
                                  {isHindi ? 'किस ग्रंथ में ' : 'Which text provides the earliest mention of the '}
                                  <span className="text-rose-600 underline decoration-rose-200 decoration-2 underline-offset-4">{isHindi ? 'चेदि जनपद' : 'Chedi Kingdom'}</span>
                                  {isHindi ? ' का सबसे पहला उल्लेख मिलता है?' : '?'}
                                </p>
                              </div>

                              <div className="space-y-2.5 sm:space-y-3 relative z-10">
                                <div className="flex items-center justify-between rounded-lg sm:rounded-xl border border-rose-100 bg-rose-50/30 p-3 sm:p-4 text-slate-400 group/opt">
                                    <span className="text-[11px] sm:text-xs font-semibold">Mahabharata (महाभारत)</span>
                                    <X size={14} className="text-rose-400 sm:w-4 sm:h-4" />
                                </div>
                                <m.div 
                                  initial={{ x: 0 }} animate={{ x: [0, 2, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                                  className="flex items-center justify-between rounded-lg sm:rounded-xl border-2 border-emerald-500 bg-emerald-50/50 p-3 sm:p-4 text-slate-900 shadow-xl shadow-emerald-500/10"
                                >
                                    <span className="text-[12px] sm:text-sm font-black">Rigveda (ऋग्वेद)</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Correct</span>
                                      <CheckCircle2 size={18} className="text-emerald-600 sm:w-5 sm:h-5" />
                                    </div>
                                </m.div>
                              </div>

                              <div className="rounded-xl sm:rounded-2xl bg-slate-900 p-4 sm:p-5 space-y-2.5 relative z-10 border border-white/10">
                                <div className="flex items-center justify-between">
                                  <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">Smart Solution</Badge>
                                  <Brain size={14} className="text-emerald-400" />
                                </div>
                                <div className="space-y-2">
                                  <p className="text-[10px] sm:text-[11px] font-bold leading-relaxed text-emerald-50">
                                      {isHindi ? 'ऋग्वेद के दानस्तुति सूक्त में चेदि राजा "कशु" का उल्लेख मिलता है।' : 'The Rigveda (Danastuti hymn) mentions the Chedi king "Kashu".'}
                                  </p>
                                  <p className="text-[9px] sm:text-[10px] font-medium leading-relaxed text-slate-400 border-t border-white/5 pt-2 italic">
                                      {isHindi ? 'प्रो टिप: यह 16 महाजनपदों में से एक था जिसकी राजधानी "शुक्तिमती" थी।' : 'Pro Tip: It was one of the 16 Mahajanapadas with capital "Shuktimati".'}
                                  </p>
                                </div>
                              </div>
                          </div>
                        </m.div>
                      )}

                      {/* CARD 4: BEST EXPLANATIONS */}
                      {activeCard === 4 && (
                        <m.div key="c4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="space-y-4 text-left">
                          <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">The "Why" Factor</span>
                              <h4 className="text-xs font-bold text-white">Smart Solution Key 🔑</h4>
                            </div>
                            <Badge className="bg-pink-500 text-black text-[8px] font-black px-2 py-1">PREMIUM</Badge>
                          </div>
                          <div className="space-y-3">
                            {BETWA_EXPLANATION.map((block) => (
                                <div key={block.id} className={cn("rounded-xl sm:rounded-2xl border-l-[3px] border p-3 sm:p-4 space-y-1.5 bg-[#1C1C28]/50 ring-1 ring-white/5", {
                                  'border-emerald-500/50 bg-emerald-500/5': block.color === 'emerald',
                                  'border-amber-500/50 bg-amber-500/5': block.color === 'amber',
                                  'border-blue-500/50 bg-blue-500/5': block.color === 'blue',
                                  'border-rose-500/50 bg-rose-500/5': block.color === 'rose',
                                })}>
                                  <div className="flex items-center gap-2">
                                      <block.icon size={12} className={cn({
                                        'text-emerald-400': block.color === 'emerald', 'text-amber-400': block.color === 'amber',
                                        'text-blue-400': block.color === 'blue', 'text-rose-400': block.color === 'rose',
                                      })} />
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{isHindi ? block.labelHi : block.labelEn}</span>
                                  </div>
                                  <p className="text-[11px] font-bold leading-relaxed text-slate-100">
                                      {isHindi ? block.contentHi : block.contentEn}
                                  </p>
                                </div>
                            ))}
                          </div>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="absolute bottom-5 sm:bottom-6 left-1/2 flex -translate-x-1/2 gap-1.5 sm:gap-2">
                    {TABS.map((_, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleManualSwitch(TABS[i].id)} 
                          aria-label={`Go to slide ${i + 1}`} 
                          aria-current={activeCard === TABS[i].id ? 'step' : undefined}
                          className={cn("h-1 transition-all duration-300 rounded-full", activeCard === TABS[i].id ? "w-6 sm:w-8 bg-pink-600" : "w-1 sm:w-1.5 bg-white/10")} 
                        />
                    ))}
                  </div>
                </Card>
              </div>

              {/* MOBILE CTA BUTTON */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-8 flex justify-center lg:hidden w-full px-4"
              >
                <Link 
                  href="/pricing"
                  className="group relative inline-flex w-full items-center justify-center gap-4 rounded-2xl sm:rounded-3xl bg-[#0F172A] px-6 py-4 sm:px-10 sm:py-5 text-[10px] sm:text-[11px] font-black tracking-[0.2em] text-white uppercase transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(15,23,42,0.3)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-500" />
                  <span className="relative z-10">{isHindi ? 'प्रीमियम अनलॉक करें' : 'Unlock Premium'}</span>
                  <Sparkles className="relative z-10 h-3.5 w-3.5 text-emerald-400" />
                  <ArrowRight className="relative z-10 h-3.5 w-3.5" />
                </Link>
              </m.div>
            </div>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
