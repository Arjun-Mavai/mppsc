'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Search, PlayCircle, Lock, SlidersHorizontal } from 'lucide-react';
import FlipCard from '@/components/FlipCard';
import { SyllabusTopicCard } from '@/components/SyllabusTopicCard';
import { cn } from '@/lib/utils';
import { SideDrawer } from '@/components/SideDrawer';
import { SyllabusSearch } from '@/features/syllabus/components/SyllabusSearch';
import { ViewToggle } from '@/components/ViewToggle';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SyllabusLockModal } from '@/features/syllabus/components/SyllabusLockModal';
import { Button } from '@/components/ui/button';
import { SyllabusTopicSheet } from '@/features/syllabus/components/SyllabusTopicSheet';
import { isSyllabusTopicLocked } from '@/features/syllabus/utils/locks';

// Type definition matching the DB Schema / Fallback Data
export interface TopicData {
  id: string | number;
  unitId: string;
  front: string;
  back: string;
  details?: string;
  mnemonic?: string;
  pro_tip?: string;
  impact_emoji?: string;
  important_facts?: string[];
  pyq?: {
    year: number | string;
    question: string;
    strategy?: string;
    type?: string;
  }[];
  // ── Elite Expert Fields (Standard) ──────────
  topic_intro?: string;
  topic_significance?: string;
  priority_level?: string;
  trend_shift_alert?: string;
  examiner_focus?: string;
  common_pitfall?: string;
  must_know_micro_topics?: string[];
  retention_trick?: string;
  litmus_test?: string;
  mains_integration?: string;
  pyq_pre_examples?: string[];
  pyq_mains_examples?: string[];
  ideal_study_format?: string;

  // ── New AI Enrichment Fields (MPPSC Specialist) ──────────
  quote?: string;
  introduction?: string;
  key_concepts?: string[];
  ai_details?: string;
  facts_for_prelims?: string[];
  potential_mains_questions?: string[];
  
  official_details?: string;
  isFree?: boolean;
  // ── Access control flags (DB se aate hain) ──────────────────
  isLiteAccess?: boolean | null;
  isProAccess?: boolean | null;
  image_url?: string;
}

interface UnitContentProps {
  unitId: string;
  unitTitle: string;
  unitTitleEn: string;
  topics: TopicData[]; // Hindi (Default)
  topicsEn: TopicData[]; // English
}

export default function UnitContent({
  unitId,
  unitTitle,
  unitTitleEn,
  topics,
  topicsEn,
}: UnitContentProps) {
  const router = useRouter();

  // Language from global Zustand store — same toggle as navbar
  // This replaces the old ?lang= URL param approach for consistency
  const globalLanguage = useSettingsStore((state) => state.language);
  const language = globalLanguage;

  // Language setter from global store
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'revision'>('grid');

  // Revision Mode State
  const [revisionIndex, setRevisionIndex] = useState(0);

  // Lazy Loading State
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Reset lazy load on search or view change
  useEffect(() => {
    setVisibleCount(20);
  }, [searchTerm, viewMode, unitId]);

  // New Flip State: Only one card flipped at a time
  const [activeFlippedId, setActiveFlippedId] = useState<string | number | null>(null);

  // Keyboard shortcut for Command Palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // SideDrawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicData | null>(null);
  const [isTopicSheetOpen, setIsTopicSheetOpen] = useState(false);

  // Premium/Lock State
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const { isSubscribed, user } = useSettingsStore();

  const isTopicLocked = (topic: TopicData, _filteredIndex: number) => {
    // Use the original index in rawTopics (not the filtered index) so
    // search filtering doesn't accidentally unlock premium topics.
    const originalIndex = rawTopics.findIndex((t) => t.id === topic.id);
    return isSyllabusTopicLocked(
      topic,
      originalIndex >= 0 ? originalIndex : _filteredIndex,
      { isSubscribed: !!isSubscribed, plan_tier: user?.planTier },
      unitId,
      rawTopics.length
    );
  };

  const handleQuizClick = (type: 'topic' | 'unit', topicId?: string | number) => {
    if (type === 'unit') {
      // Unit Test: Free users can only access first 5 topics in Unit 1, logged users get full access
      if (user || isSubscribed) {
        router.push(`/syllabus/quiz/units`);
        return;
      }
      // Free non-logged users: Only Unit 1 allowed
      if (unitId === 'unit_1') {
        router.push(`/syllabus/quiz/topic`);
        return;
      }
      setIsUnlockModalOpen(true);
      return;
    }

    if (type === 'topic' && topicId) {
      const index = currentTopics.findIndex((t) => t.id === topicId);
      if (!isTopicLocked(currentTopics[index], index)) {
        router.push(`/syllabus/quiz/topic`);
      } else {
        setIsUnlockModalOpen(true);
      }
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  // Select topics based on language
  const currentTitle = language === 'en' ? unitTitleEn : unitTitle;
  const rawTopics = language === 'en' ? topicsEn : topics;

  // Filter topics based on search
  const currentTopics = rawTopics.filter(
    (t) =>
      t.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.mnemonic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.pro_tip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toString() === searchTerm
  );

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 20, currentTopics.length));
        }
      },
      { rootMargin: '200px' }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [currentTopics]);

  const handleOpenDetails = (topic: TopicData, index: number) => {
    if (isTopicLocked(topic, index)) {
      setIsUnlockModalOpen(true);
      return;
    }
    setSelectedTopic(topic);
    setIsTopicSheetOpen(true);
  };

  // Progress Calculation
  const freeTopicsCount = rawTopics.filter((t) => t.isFree).length;
  // If subscribed, user has access to all topics, so 'unlocked' progress is 100%
  // If not subscribed, user has access only to free topics
  const progressPercent = isSubscribed ? 100 : (freeTopicsCount / (rawTopics.length || 1)) * 100;

  // Helper to render markdown-like bold text
  const renderText = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => (
      <span key={i} className="mb-2 block">
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={j} className="font-bold text-slate-900 dark:text-white">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        })}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 font-sans">
      {/* Sub-header: Unit title + Language toggle + Progress bar */}
      {/* 🧭 PREMIUM SUB-NAV: Unit Title + Progress */}
      <div className="sticky top-[56px] z-30 border-b border-slate-200/40 bg-white/70 backdrop-blur-xl transition-all duration-300 md:top-[56px]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
          <div className="flex min-w-0 items-center gap-4">
            <button
              onClick={() => router.push('/syllabus')}
              className="group shrink-0 rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-all hover:text-slate-900 hover:shadow-md"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </button>
            <div className="flex flex-col">
              <span className="mb-1 text-[10px] leading-none font-black tracking-[0.2em] text-slate-400 uppercase">
                {language === 'hi' ? 'यूनिट' : 'Unit'} {unitId.replace('unit_', '')}
              </span>
              <h1 className="max-w-[180px] truncate text-lg leading-tight font-black text-slate-900 sm:max-w-md md:text-xl">
                {currentTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Desktop Progress Indicator */}
            <div className="hidden items-center gap-3 md:flex">
              <div className="text-right">
                <div className="text-sm font-black text-slate-900">
                  {Math.round(progressPercent)}%
                </div>
                <div className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                  {language === 'hi' ? 'पूर्ण' : 'Complete'}
                </div>
              </div>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </div>

            {/* Action: Search Shortcut (Visual Only) */}
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200/50 bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-400 sm:flex">
              <Search className="h-3.5 w-3.5" />
              <span>CMD+K</span>
            </div>

            {/* 🎛️ Premium Controls Toggle Circular Button */}
            <button
              onClick={() => setIsControlsOpen(!isControlsOpen)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border transition-all active:scale-95 shrink-0 shadow-sm",
                isControlsOpen
                  ? "bg-slate-900 border-slate-950 text-white shadow-md shadow-slate-900/10 scale-105"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
              title={language === 'hi' ? 'सेटिंग्स व व्यू' : 'Settings & View'}
            >
              <SlidersHorizontal className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Mobile Progress Bar (Slimmer) */}
        <div className="h-[2px] w-full bg-slate-100 md:hidden">
          <motion.div
            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      <SyllabusSearch open={isSearchOpen} setOpen={setIsSearchOpen} />

      <main className="mx-auto max-w-7xl px-6 pt-6">
        {/* Collapsing Settings/Controls Drawer */}
        <AnimatePresence>
          {isControlsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.97 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.97 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="mb-8 overflow-hidden"
            >
              <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200/60 bg-white p-5 shadow-sm text-center">
                <div className="relative">
                  <span className="relative inline-flex items-center rounded-full bg-slate-900 px-5 py-1.5 text-[11px] font-black tracking-widest text-white uppercase shadow-md">
                    <Sparkles className="mr-2 h-3.5 w-3.5 text-amber-400 fill-amber-400/20 animate-pulse" />
                    {currentTopics.length} {language === 'hi' ? 'टॉपिक्स' : 'Topics'}
                  </span>
                </div>
                <div className="flex w-full items-center justify-center">
                  <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {viewMode === 'grid' ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mb-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {currentTopics.slice(0, visibleCount).map((topic, idx) => {
              const locked = isTopicLocked(topic, idx);
              const isFree = !locked && !isSubscribed && !user && topic.isFree;

              // Rotate color variants
              const variants: ('blue' | 'pink' | 'emerald' | 'amber')[] = [
                'blue',
                'pink',
                'emerald',
                'amber',
              ];
              const colorVariant = variants[idx % variants.length];

              return (
                <motion.div key={topic.id} variants={item}>
                  <SyllabusTopicCard
                    id={topic.id}
                    title={topic.front}
                    impactEmoji={topic.impact_emoji}
                    imageUrl={topic.image_url}
                    colorVariant={colorVariant}
                    isLocked={locked}
                    isFree={isFree}
                    hasAiContent={!!topic.introduction}
                    onClick={() => handleOpenDetails(topic, idx)}
                    labels={{
                      search: language === 'hi' ? 'सर्च' : 'Search',
                      topic: language === 'hi' ? 'विषय' : 'Topic',
                      unit: language === 'hi' ? 'यूनिट' : 'Unit',
                    }}
                  />
                </motion.div>
              );
            })}

            {/* Sentinel for Lazy Loading */}
            {visibleCount < currentTopics.length && (
              <div
                ref={loadMoreRef}
                className="col-span-full flex h-20 items-center justify-center"
              >
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
              </div>
            )}
          </motion.div>
        ) : viewMode === 'list' ? (
          <div className="mx-auto mb-12 max-w-4xl space-y-4">
            {currentTopics.slice(0, visibleCount).map((topic, idx) => {
              const locked = isTopicLocked(topic, idx);
              const showFreeBadge = !locked && !isSubscribed && !user && topic.isFree;

              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    'group relative flex cursor-pointer items-start gap-8 overflow-hidden rounded-[2.5rem] border-2 p-8 transition-all hover:shadow-lg',
                    locked
                      ? 'border-slate-100 bg-slate-50/50 opacity-75 grayscale-[0.5]'
                      : 'border-slate-100 bg-white hover:border-slate-300'
                  )}
                  onClick={() => handleOpenDetails(topic, idx)}
                >
                  <div className="absolute top-0 right-0 -mt-20 -mr-20 h-48 w-48 rounded-full bg-slate-50 opacity-40 blur-3xl" />

                  <div
                    className={cn(
                      'flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-black shadow-xl transition-transform group-hover:scale-110',
                      locked
                        ? 'bg-slate-200 text-slate-400'
                        : 'bg-emerald-100 text-slate-900 shadow-emerald-100/40'
                    )}
                  ></div>
                  <div className="relative z-10 flex-1">
                    <h3 className="mb-2 text-2xl font-black tracking-tight text-slate-900 uppercase transition-colors group-hover:text-slate-700">
                      {topic.front}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-base leading-relaxed font-medium text-slate-500 italic">
                      "{topic.back}"
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      {topic.introduction && (
                        <span className="inline-flex items-center rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[10px] font-black tracking-widest text-indigo-600 uppercase">
                          <Sparkles className="mr-2 h-3.5 w-3.5 fill-indigo-600/20" /> Rich Notes
                        </span>
                      )}
                      {locked ? (
                        <span className="inline-flex items-center rounded-lg border border-amber-100 bg-amber-50 px-3 py-1.5 text-[10px] font-black tracking-widest text-amber-600 uppercase">
                          <Lock className="mr-2 h-3.5 w-3.5" /> PREMIUM LOCKED
                        </span>
                      ) : showFreeBadge ? (
                        <span className="inline-flex items-center rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-black tracking-widest text-emerald-600 uppercase">
                          <Sparkles className="mr-2 h-3.5 w-3.5" /> FREE
                        </span>
                      ) : null}
                      <span className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors group-hover:border-slate-200 group-hover:bg-slate-100">
                        Click for Deep Dive
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    className="absolute top-1/2 right-8 -translate-y-1/2 text-slate-300 transition-all group-hover:translate-x-2 group-hover:text-slate-600"
                    size={24}
                  />
                </motion.div>
              );
            })}

            {/* Sentinel for Lazy Loading */}
            {visibleCount < currentTopics.length && (
              <div ref={loadMoreRef} className="flex h-20 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
              </div>
            )}
          </div>
        ) : (
          /* REVISION MODE: Single Swipeable Card */
          <div className="mx-auto mb-12 max-w-2xl">
            {currentTopics.length > 0 ? (
              <div className="space-y-10">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                    CARD {revisionIndex + 1} OF {currentTopics.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={revisionIndex === 0}
                      onClick={() => setRevisionIndex(Math.max(0, revisionIndex - 1))}
                      className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-400 shadow-sm transition-all hover:text-slate-700 disabled:opacity-30"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <button
                      disabled={revisionIndex === currentTopics.length - 1}
                      onClick={() =>
                        setRevisionIndex(Math.min(currentTopics.length - 1, revisionIndex + 1))
                      }
                      className="rounded-2xl bg-slate-900 p-3 text-white shadow-lg transition-all hover:bg-slate-800 disabled:opacity-30"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <motion.div
                  key={revisionIndex}
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  className="relative"
                >
                  <FlipCard
                    id={currentTopics[revisionIndex].id}
                    className="h-[500px] w-full"
                    isLocked={isTopicLocked(currentTopics[revisionIndex], revisionIndex)}
                    isFlipped={activeFlippedId === currentTopics[revisionIndex].id}
                    onFlip={(id) => {
                      if (activeFlippedId === id) {
                        setActiveFlippedId(null);
                      } else {
                        setActiveFlippedId(id);
                      }
                    }}
                    onPracticeTest={() => handleQuizClick('unit')}
                    onReadMore={() => {
                      handleOpenDetails(currentTopics[revisionIndex], revisionIndex);
                    }}
                    // Content
                    title={currentTopics[revisionIndex].front}
                    // subtitle={currentTopics[revisionIndex].id.toString().split('_').pop()?.replace('t', '') || currentTopics[revisionIndex].id.toString()}
                    impactEmoji={currentTopics[revisionIndex].impact_emoji}
                    // Back Side
                    backMainContent={currentTopics[revisionIndex].back}
                    facts={currentTopics[revisionIndex].important_facts}
                    mnemonic={currentTopics[revisionIndex].mnemonic}
                    labels={{
                      tapToFlip: language === 'hi' ? 'पलटने के लिए टैप करें' : 'Tap to Flip',
                      topicAnalysis: language === 'hi' ? 'विषय विश्लेषण' : 'TOPIC ANALYSIS',
                      mnemonicLabel: language === 'hi' ? 'स्मरण सूत्र' : 'MNEMONIC',
                      practiceTest: language === 'hi' ? 'यूनिट टेस्ट दें' : 'Start Unit Test',
                      closeAnalysis: language === 'hi' ? 'बंद करें' : 'Close Analysis',
                    }}
                  />
                </motion.div>
              </div>
            ) : (
              <div className="py-20 text-center font-medium text-slate-400 italic">
                No topics found for the current search/filter.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Deep Dive Sidebar - Replaced by AI Sheet */}
      {/* 
      <SideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={selectedTopic?.front}
      >
         ... (Existing SideDrawer Content) ...
      </SideDrawer> 
      */}

      <SyllabusTopicSheet
        open={isTopicSheetOpen}
        onOpenChange={setIsTopicSheetOpen}
        topic={selectedTopic}
        unitTitle={language === 'hi' ? unitTitle : unitTitleEn}
        unitId={unitId}
        language={language}
      />

      <SyllabusLockModal open={isUnlockModalOpen} onOpenChange={setIsUnlockModalOpen} />
    </div>
  );
}
