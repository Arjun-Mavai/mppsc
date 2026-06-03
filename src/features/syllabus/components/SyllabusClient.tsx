'use client';

import { useState, useEffect, Fragment, useTransition, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, ChevronDown, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SyllabusLockModal } from '@/features/syllabus/components/SyllabusLockModal';
import { SyllabusTopicCard } from '@/components/SyllabusTopicCard';
import { SyllabusData } from '@/types/syllabus';
interface SyllabusClientProps {
  syllabusData: SyllabusData;
}

function getUnitMetadata(key: string, index: number) {
  const meta: Record<string, { emoji: string; gradient: string; text: string; border: string; glow: string }> = {
    unit_1: {
      emoji: '📜',
      gradient: 'from-blue-500/10 via-indigo-500/5 to-blue-500/5 hover:from-blue-500/15 hover:to-indigo-500/10',
      text: 'text-blue-600',
      border: 'border-blue-100/80 hover:border-blue-300/60',
      glow: 'bg-blue-400/20'
    },
    unit_2: {
      emoji: '🏰',
      gradient: 'from-rose-500/10 via-pink-500/5 to-rose-500/5 hover:from-rose-500/15 hover:to-pink-500/10',
      text: 'text-rose-600',
      border: 'border-rose-100/80 hover:border-rose-300/60',
      glow: 'bg-rose-400/20'
    },
    unit_3: {
      emoji: '🌍',
      gradient: 'from-emerald-500/10 via-teal-500/5 to-emerald-500/5 hover:from-emerald-500/15 hover:to-teal-500/10',
      text: 'text-emerald-600',
      border: 'border-emerald-100/80 hover:border-emerald-300/60',
      glow: 'bg-emerald-400/20'
    },
    unit_4: {
      emoji: '🏞️',
      gradient: 'from-amber-500/10 via-orange-500/5 to-amber-500/5 hover:from-amber-500/15 hover:to-orange-500/10',
      text: 'text-amber-600',
      border: 'border-amber-100/80 hover:border-amber-300/60',
      glow: 'bg-amber-400/20'
    },
    unit_5: {
      emoji: '⚖️',
      gradient: 'from-violet-500/10 via-purple-500/5 to-violet-500/5 hover:from-violet-500/15 hover:to-purple-500/10',
      text: 'text-violet-600',
      border: 'border-violet-100/80 hover:border-violet-300/60',
      glow: 'bg-violet-400/20'
    },
    unit_6: {
      emoji: '📊',
      gradient: 'from-sky-500/10 via-cyan-500/5 to-sky-500/5 hover:from-sky-500/15 hover:to-cyan-500/10',
      text: 'text-sky-600',
      border: 'border-sky-100/80 hover:border-sky-300/60',
      glow: 'bg-sky-400/20'
    },
    unit_7: {
      emoji: '🚀',
      gradient: 'from-teal-500/10 via-emerald-500/5 to-teal-500/5 hover:from-teal-500/15 hover:to-emerald-500/10',
      text: 'text-teal-600',
      border: 'border-teal-100/80 hover:border-teal-300/60',
      glow: 'bg-teal-400/20'
    },
    unit_8: {
      emoji: '🏆',
      gradient: 'from-orange-500/10 via-amber-500/5 to-orange-500/5 hover:from-orange-500/15 hover:to-amber-500/10',
      text: 'text-orange-600',
      border: 'border-orange-100/80 hover:border-orange-300/60',
      glow: 'bg-orange-400/20'
    },
    unit_9: {
      emoji: '💻',
      gradient: 'from-indigo-500/10 via-blue-500/5 to-indigo-500/5 hover:from-indigo-500/15 hover:to-blue-500/10',
      text: 'text-indigo-600',
      border: 'border-indigo-100/80 hover:border-indigo-300/60',
      glow: 'bg-indigo-400/20'
    },
    unit_10: {
      emoji: '🏹',
      gradient: 'from-fuchsia-500/10 via-pink-500/5 to-fuchsia-500/5 hover:from-fuchsia-500/15 hover:to-pink-500/10',
      text: 'text-fuchsia-600',
      border: 'border-fuchsia-100/80 hover:border-fuchsia-300/60',
      glow: 'bg-fuchsia-400/20'
    }
  };

  return meta[key] || {
    emoji: '✨',
    gradient: 'from-slate-500/10 via-zinc-500/5 to-slate-500/5 hover:from-slate-500/15 hover:to-zinc-500/10',
    text: 'text-slate-600',
    border: 'border-slate-100/80 hover:border-slate-300/60',
    glow: 'bg-slate-400/20'
  };
}

export function SyllabusClient({ syllabusData }: SyllabusClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMounted, setIsMounted] = useState(false);
  const { user, isSubscribed, setUser, language, setLanguage } = useSettingsStore();
  const [isPending, startTransition] = useTransition();
  const prefetchedUnitsRef = useRef<Set<string>>(new Set());

  const prefetchUnit = useCallback(
    (unitId: string) => {
      if (prefetchedUnitsRef.current.has(unitId)) return;
      prefetchedUnitsRef.current.add(unitId);
      router.prefetch(`/syllabus/${unitId}`);
    },
    [router]
  );

  const navigateToUnit = useCallback(
    (unitId: string, isLocked: boolean) => {
      if (isLocked) {
        setUnlockModalOpen(true);
        return;
      }

      prefetchUnit(unitId);
      // Removed setNavigatingId to let Next.js instantly transition to the new loading.tsx
      startTransition(() => {
        router.push(`/syllabus/${unitId}`);
      });
    },
    [prefetchUnit, router]
  );

  // Hydration fix for Persist middleware & URL Sync
  useEffect(() => {
    setIsMounted(true);
    const urlLang = searchParams.get('lang');
    if ((urlLang === 'en' || urlLang === 'hi') && urlLang !== language) {
      setLanguage(urlLang);
    }
  }, [searchParams, language, setLanguage]);

  // Keyboard shortcut for Command Palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!isMounted) return null; // Prevent hydration mismatch

  return (
    <Fragment>
      <div className="relative min-h-screen overflow-hidden bg-[#fafbfc] pb-20 font-sans selection:bg-slate-900 selection:text-white">
        {/* 🎭 PREMIUM BACKGROUND BLURS */}
        <div className="pointer-events-none absolute top-0 left-0 h-[600px] w-full bg-gradient-to-b from-slate-100/50 to-transparent" />
        <div className="pointer-events-none absolute top-[20%] left-[-150px] h-[500px] w-[500px] rounded-full bg-emerald-50/30 blur-[100px]" />

        {/* --- Main Content --- */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 pt-0 md:pt-36 space-y-6 md:space-y-16">
          
          {/* 📱 Mobile-Only Compact Header - Keeps cards at the very top of mobile page */}
          <div className="flex md:hidden items-center justify-between w-full pt-12 pb-2">
            <div className="flex flex-col">
              {/* MPPSC 2027 badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[8px] font-black tracking-widest text-emerald-600 uppercase w-fit mb-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                </span>
                MPPSC 2027
              </div>
              
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight uppercase">
                {language === 'hi' ? (
                  <Fragment>
                    सिलेबस मत पढ़ो।<br />
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">सिलेबस को समझो।</span>
                  </Fragment>
                ) : (
                  <Fragment>
                    Don't just study.<br />
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Understand the syllabus.</span>
                  </Fragment>
                )}
              </h1>
            </div>

            {/* Info Circle Button with Indian Flag Saffron-White-Green Gradient Border */}
            <button
              onClick={() => setInfoModalOpen(true)}
              className="group relative flex h-9 w-9 items-center justify-center rounded-full p-[2px] bg-gradient-to-tr from-[#FF9933] via-slate-200 to-[#138808] active:scale-95 transition-all shadow-md"
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-slate-700 transition-colors group-hover:bg-slate-50">
                <Info className="h-4 w-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              </div>
            </button>
          </div>

          {/* 💻 Desktop/Tablet Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="hidden md:flex flex-col items-center space-y-8 text-center"
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-5 py-2 text-[10px] font-black tracking-widest text-slate-500 uppercase shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              {syllabusData.exam_name}
            </div>

            <div className="max-w-4xl space-y-4">
              <h1 className="text-5xl leading-[0.95] font-black tracking-tighter text-slate-900 md:text-8xl md:leading-[0.9]">
                {language === 'hi' ? 'तैयारी का ' : 'Master your'} <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent">
                  {language === 'hi' ? 'नया दौर।' : 'Syllabus.'}
                </span>
              </h1>
              <p className="mx-auto max-w-xl text-lg leading-relaxed font-medium text-slate-500 md:text-xl">
                {language === 'hi'
                  ? 'एमपीपीएससी प्रीलिम्स 2027 के लिए आधुनिक रणनीति। 100+ टॉपिक्स, नेमोनिक्स और टेस्ट सीरीज।'
                  : 'The most comprehensive roadmap for MPPSC 2027. 100+ topics, smart mnemonics, and real-time assessments.'}
              </p>
            </div>

            {/* 🔽 SCROLL INDICATOR */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="flex flex-col items-center gap-2 pt-4"
            >
              <div 
                onClick={() => {
                  const target = document.getElementById('units-grid');
                  target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="group flex flex-col items-center gap-2 cursor-pointer"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-600 transition-colors">
                  {language === 'hi' ? '10 यूनिट्स के लिए नीचे स्क्रॉल करें' : 'Scroll for all 10 units'}
                </div>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm group-hover:border-slate-300 group-hover:shadow-md transition-all"
                >
                  <ChevronDown className="h-5 w-5 text-slate-500 group-hover:text-slate-900" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

        {/* Units Grid/List */}
        <div id="units-grid" className="scroll-mt-32">
          {viewMode === 'grid' ? (
            <Fragment>
              {/* Desktop/Tablet Grid - Renders elegant classic cards */}
              <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                {Object.entries(syllabusData.units).map(([key, unit], index) => {
                  const title =
                    language === 'en' && unit.title_en
                      ? unit.title_en
                      : unit.unit_title || unit.title;
                  const topics = language === 'en' && unit.topics_en ? unit.topics_en : unit.topics;
                  const isLocked = key !== 'unit_1' && !isSubscribed;

                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 + 0.4 }}
                    >
                      <SyllabusTopicCard
                        id={key}
                        title={title ?? ''}
                        subtitle={`${topics?.length || 0} ${language === 'hi' ? 'टॉपिक्स' : 'Topics'}`}
                        impactEmoji="📚"
                        colorVariant={(['blue', 'pink', 'emerald', 'amber'] as const)[index % 4]}
                        variant="unit"
                        isLocked={isLocked}
                        onClick={() => navigateToUnit(key, isLocked)}
                        onPointerEnter={() => {
                          if (!isLocked) prefetchUnit(key);
                        }}
                        onTouchStart={() => {
                          if (!isLocked) prefetchUnit(key);
                        }}
                        labels={{
                          search: language === 'hi' ? 'सर्च' : 'Search',
                          topic: language === 'hi' ? 'विषय' : 'Topic',
                          unit: language === 'hi' ? 'यूनिट' : 'Unit',
                        }}
                      />
                    </motion.div>
                  );
                })}
              </div>

              {/* Mobile-Only Gorgeous High-Density Glassmorphic Bento Grid */}
              <div className="grid md:hidden grid-cols-2 gap-4 pb-32">
                {Object.entries(syllabusData.units).map(([key, unit], index) => {
                  const title =
                    language === 'en' && unit.title_en
                      ? unit.title_en
                      : unit.unit_title || unit.title;
                  const topics = language === 'en' && unit.topics_en ? unit.topics_en : unit.topics;
                  const isLocked = key !== 'unit_1' && !isSubscribed;
                  
                  const meta = getUnitMetadata(key, index);

                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: index * 0.03 }}
                      whileTap={{ scale: 0.95 }}
                      onPointerEnter={() => {
                        if (!isLocked) prefetchUnit(key);
                      }}
                      onTouchStart={() => {
                        if (!isLocked) prefetchUnit(key);
                      }}
                      onClick={() => navigateToUnit(key, isLocked)}
                      className={cn(
                        "group relative flex h-[195px] flex-col justify-between p-4 rounded-[2rem] border bg-gradient-to-br backdrop-blur-md overflow-hidden transition-all duration-300 shadow-sm active:shadow-md cursor-pointer",
                        meta.gradient,
                        meta.border,
                        isLocked && "grayscale-[0.4]"
                      )}
                    >
                      {/* Top Row: Unit Badge + Lock/Premium */}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-white/70 border border-white text-[8px] font-black tracking-widest text-slate-500 shadow-sm backdrop-blur-sm uppercase">
                          {language === 'hi' ? 'यूनिट' : 'Unit'} {key.replace('unit_', '')}
                        </span>

                        {isLocked ? (
                          <div className="h-5 w-5 rounded-full flex items-center justify-center bg-white shadow-sm border border-slate-100 text-amber-500">
                            <Lock size={10} className="fill-amber-500/10" />
                          </div>
                        ) : key === 'unit_1' ? (
                          <div className="relative">
                            {/* Premium FREE Badge */}
                            <div className="relative z-10 flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-0.5 shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-300">
                              <div className="absolute inset-0 rounded-full animate-ping bg-emerald-400/40 blur-[2px] -z-10" />
                              <span className="text-[9px] font-black tracking-widest text-white uppercase drop-shadow-sm">
                                FREE
                              </span>
                            </div>

                            {/* Arrow and Boy pointing UP */}
                            <motion.div
                              initial={{ opacity: 0, y: 15, scale: 0.8 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
                              className="absolute right-1 top-full mt-1.5 pointer-events-none select-none z-30 flex flex-col items-center"
                            >
                              <svg width="35" height="40" viewBox="0 0 35 40" fill="none" className="filter drop-shadow-[0_2.5px_4px_rgba(236,72,153,0.6)]">
                                {/* Sweep from bottom left to top right */}
                                <path d="M 5 35 Q 10 15 25 5" stroke="#ec4899" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                                {/* Arrowhead pointing Up/Right */}
                                <path d="M 17 8 L 25 5 L 26 14" stroke="#ec4899" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                              </svg>
                              <div className="text-2xl filter drop-shadow-md -mt-3 -ml-4 -scale-x-100">
                                🚶‍♂️
                              </div>
                            </motion.div>
                          </div>
                        ) : null}
                      </div>

                      {/* Center Emojis with glowing radial shadow */}
                      <div className="relative flex-1 flex items-center justify-center -mt-2">
                        {/* Glow effect behind emoji */}
                        <div className={cn("absolute h-12 w-12 rounded-full blur-xl opacity-50", meta.glow)} />
                        <span className="text-5xl drop-shadow-md transform transition-transform group-active:scale-110 active:scale-110 select-none">
                          {meta.emoji}
                        </span>
                      </div>

                      {/* Footer Details */}
                      <div className="relative z-10 space-y-1 mt-1">
                        <h3 className="line-clamp-2 text-xs font-black tracking-tight text-slate-800 leading-snug">
                          {title}
                        </h3>
                        
                        <div className="flex items-center gap-1 text-[8px] font-extrabold uppercase tracking-widest text-slate-400 mt-1">
                          <div className={cn("h-1 w-1 rounded-full animate-pulse", isLocked ? "bg-slate-300" : "bg-emerald-500")} />
                          {topics?.length || 0} {language === 'hi' ? 'टॉपिक्स' : 'Topics'}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Fragment>
          ) : (
            <div className="mx-auto max-w-4xl space-y-4 pb-20">
              {Object.entries(syllabusData.units).map(([key, unit], index) => {
                const title =
                  language === 'en' && unit.title_en
                    ? unit.title_en
                    : unit.unit_title || unit.title;
                const topicsCount = (
                  language === 'en' && unit.topics_en ? unit.topics_en : unit.topics
                ).length;
                const isLocked = key !== 'unit_1' && !isSubscribed;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  >
                    <div
                      onPointerEnter={() => {
                        if (!isLocked) prefetchUnit(key);
                      }}
                      onTouchStart={() => {
                        if (!isLocked) prefetchUnit(key);
                      }}
                      onClick={() => navigateToUnit(key, isLocked)}
                      className="cursor-pointer relative"
                    >
                      <div
                        className={cn(
                          'group relative flex items-center gap-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md',
                          isLocked && 'grayscale-[0.8]'
                        )}
                      >
                        <div
                          className={cn(
                            'font-display z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border text-xl font-bold transition-colors',
                            isLocked
                              ? 'border-slate-200 bg-slate-100 text-slate-400'
                              : 'border-slate-200 bg-white text-slate-900 group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white'
                          )}
                        >
                          {isLocked ? <Lock size={18} /> : index + 1}
                        </div>

                        <div className="z-10 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3
                              className={cn(
                                'truncate text-lg font-bold transition-colors',
                                isLocked
                                  ? 'text-slate-500'
                                  : 'text-slate-900 group-hover:text-slate-700'
                              )}
                            >
                              {title}
                            </h3>
                            {!isLocked && key === 'unit_1' && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                FREE
                              </span>
                            )}
                            {isLocked && (
                              <span 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUnlockModalOpen(true);
                                }}
                                className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-slate-200 cursor-pointer transition-all"
                              >
                                <Lock size={10} /> PREMIUM
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-500">
                            {topicsCount} {language === 'hi' ? 'विषय' : 'Topics'}
                          </p>
                        </div>

                        <div
                          className={cn(
                            'z-10 transition-all',
                            isLocked
                              ? 'text-slate-300'
                              : 'text-slate-300 group-hover:translate-x-1 group-hover:text-slate-600'
                          )}
                        >
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <SyllabusLockModal open={unlockModalOpen} onOpenChange={setUnlockModalOpen} />
        
        {/* ℹ️ Custom Info Modal for Mobile Details Dialog */}
        <AnimatePresence>
          {infoModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setInfoModalOpen(false)}
                className="absolute inset-0 bg-slate-950/45 backdrop-blur-md"
              />
              
              {/* Modal Body */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-2xl z-10 overflow-hidden"
              >
                {/* Premium Background Blurs inside Modal */}
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-indigo-100/50 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-100/40 blur-2xl pointer-events-none" />
                
                <div className="flex flex-col space-y-5 relative z-10">
                  {/* Top Bar: Icon + Title */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
                      <Info className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">
                        {language === 'hi' ? 'स्मार्ट रणनीति गाइड' : 'Smart Strategy Guide'}
                      </h3>
                      <p className="text-[9px] font-black tracking-widest text-indigo-500 uppercase mt-1">
                        MPPSC PRELIMS 2027
                      </p>
                    </div>
                  </div>
                  
                  <div className="h-[1px] w-full bg-slate-100" />
                  
                  {/* High impact copy in points */}
                  <div className="space-y-4 text-left">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                      {language === 'hi' ? 'पाठ्यक्रम समझने के 4 सुनहरे नियम:' : '4 Golden Rules to Decode the Syllabus:'}
                    </p>
                    
                    <div className="space-y-4">
                      {language === 'hi' ? (
                        <Fragment>
                          <div className="flex items-start gap-3">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">🎯</div>
                            <div>
                              <p className="text-xs font-black text-slate-800">1. क्या पढ़ना है, क्या छोड़ना है</p>
                              <p className="text-[10px] font-semibold text-slate-500 mt-0.5 leading-relaxed">सिलेबस को परीक्षक की नज़र से समझें। हर टॉपिक की वास्तविक परीक्षा-प्रासंगिकता जानें।</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-50 text-xs font-bold text-purple-600">🧠</div>
                            <div>
                              <p className="text-xs font-black text-slate-800">2. याद नहीं, समझ कर सीखें</p>
                              <p className="text-[10px] font-semibold text-slate-500 mt-0.5 leading-relaxed">कठिन तथ्यों, स्थानों, नदियों, इतिहास और अवधारणाओं को सरल ट्रिक्स, कहानियों और संबंधों के माध्यम से लंबे समय तक याद रखें।</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-600">🛑</div>
                            <div>
                              <p className="text-xs font-black text-slate-800">3. परीक्षक की सोच पहचानें</p>
                              <p className="text-[10px] font-semibold text-slate-500 mt-0.5 leading-relaxed">बार-बार पूछे जाने वाले पैटर्न, महत्वपूर्ण टॉपिक्स और सामान्य गलतियों को पहचानकर तैयारी को सही दिशा दें।</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">✍️</div>
                            <div>
                              <p className="text-xs font-black text-slate-800">4. पढ़ाई को उत्तरों में बदलें</p>
                              <p className="text-[10px] font-semibold text-slate-500 mt-0.5 leading-relaxed">PYQs, Self-Checks और Mains Linkages के माध्यम से समझें कि पढ़ा हुआ परीक्षा में कैसे उपयोग करना है।</p>
                            </div>
                          </div>
                        </Fragment>
                      ) : (
                        <Fragment>
                          <div className="flex items-start gap-3">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">🎯</div>
                            <div>
                              <p className="text-xs font-black text-slate-800">1. Know What to Study — and What to Skip</p>
                              <p className="text-[10px] font-semibold text-slate-500 mt-0.5 leading-relaxed">Understand the syllabus from the examiner's perspective and identify the real exam relevance of every topic.</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-50 text-xs font-bold text-purple-600">🧠</div>
                            <div>
                              <p className="text-xs font-black text-slate-800">2. Learn with Understanding, Not Memorization</p>
                              <p className="text-[10px] font-semibold text-slate-500 mt-0.5 leading-relaxed">Retain difficult facts, places, rivers, history, and concepts through smart associations, stories, and memory techniques.</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-600">🛑</div>
                            <div>
                              <p className="text-xs font-black text-slate-800">3. Recognize the Examiner's Pattern</p>
                              <p className="text-[10px] font-semibold text-slate-500 mt-0.5 leading-relaxed">Identify frequently asked themes, high-priority topics, and common mistakes to keep your preparation focused.</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">✍️</div>
                            <div>
                              <p className="text-xs font-black text-slate-800">4. Turn Knowledge into Answers</p>
                              <p className="text-[10px] font-semibold text-slate-500 mt-0.5 leading-relaxed">Use PYQs, Self-Checks, and Mains Linkages to understand how your preparation translates into performance in the exam.</p>
                            </div>
                          </div>
                        </Fragment>
                      )}
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-slate-100 my-1" />

                  {/* High Impact Footer Tagline */}
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex items-start gap-3 text-left">
                    <div className="text-lg shrink-0">💡</div>
                    <p className="text-xs font-bold text-slate-700 leading-relaxed">
                      {language === 'hi' ? (
                        <Fragment>
                          सिर्फ सिलेबस मत पढ़िए,<br />
                          <span className="text-indigo-600">सिलेबस की मांग समझिए।</span>
                        </Fragment>
                      ) : (
                        <Fragment>
                          Don't just study the syllabus.<br />
                          <span className="text-indigo-600">Understand what the syllabus demands.</span>
                        </Fragment>
                      )}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setInfoModalOpen(false)}
                    className="w-full py-3.5 rounded-full bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-colors shadow-md mt-2"
                  >
                    {language === 'hi' ? 'मिशन शुरू करें' : 'Start My Mission'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </Fragment>
  );
}
