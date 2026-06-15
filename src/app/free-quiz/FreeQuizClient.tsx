'use client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🆓 FREE QUIZ CLIENT — Test listing + subject/unit filter
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// QuizListItem reuse — same look as PYQ page
// Filter modal — subject + unit wise filter (compact)
// Hindi/English bilingual — useSettingsStore se language
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Sparkles, Filter, X, BookOpen, Clock, ChevronRight, Zap } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { QuizListItem } from '@/components/QuizListItem';
import { ConnectSocials } from '@/components/ConnectSocials';
import { QUIZ_CONSTANTS } from '@/config/quiz';
import { MPPSC_UNITS } from './constants';
import { notifyInstantModeGuideClick } from './actions';

function PointingArrow({ className, direction = 'up' }: { className?: string, direction?: 'up' | 'down' }) {
  if (direction === 'down') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -15, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
        className={cn("pointer-events-none absolute z-30 flex select-none flex-col items-center", className)}
      >
        <div className="-mr-4 -mb-3 text-2xl drop-shadow-md filter">
          🚶‍♂️
        </div>
        <svg 
          width="35" 
          height="40" 
          viewBox="0 0 35 40" 
          fill="none" 
          className="filter drop-shadow-[0_2.5px_4px_rgba(236,72,153,0.6)]"
        >
          <path d="M 25 5 Q 10 25 5 35" stroke="#ec4899" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 14 34 L 5 35 L 5 26" stroke="#ec4899" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
      className={cn("pointer-events-none absolute z-30 flex select-none flex-col items-center", className)}
    >
      <svg 
        width="35" 
        height="40" 
        viewBox="0 0 35 40" 
        fill="none" 
        className="filter drop-shadow-[0_2.5px_4px_rgba(236,72,153,0.6)]"
      >
        <path d="M 5 35 Q 10 15 25 5" stroke="#ec4899" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M 17 8 L 25 5 L 26 14" stroke="#ec4899" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div className="-ml-4 -mt-3 -scale-x-100 text-2xl drop-shadow-md filter">
        🚶‍♂️
      </div>
    </motion.div>
  );
}

// Subjects list — filter me use hoga
const SUBJECTS = [
  { value: 'History', label: 'History', labelHi: 'इतिहास' },
  { value: 'MP Culture', label: 'MP Culture', labelHi: 'म.प्र. संस्कृति' },
  { value: 'Geography', label: 'Geography', labelHi: 'भूगोल' },
  { value: 'MP Geography', label: 'MP Geography', labelHi: 'म.प्र. भूगोल' },
  { value: 'Polity', label: 'Polity', labelHi: 'राजव्यवस्था' },
  { value: 'Economy', label: 'Economy', labelHi: 'अर्थव्यवस्था' },
  { value: 'Science', label: 'Science', labelHi: 'विज्ञान' },
  { value: 'Current Affairs', label: 'Current Affairs', labelHi: 'समसामयिकी' },
  { value: 'ICT', label: 'ICT', labelHi: 'सूचना प्रौद्योगिकी' },
  { value: 'MP Tribes', label: 'MP Tribes', labelHi: 'म.प्र. जनजातियाँ' },
];

interface FreeQuiz {
  id: string;
  title: string;
  titleEn: string | null;
  slug: string;
  description: string | null;
  totalQuestions: number | null;
  unitId: string | null;
  tags: unknown;
  createdAt: Date | string | null;
  isInstantMode?: boolean | null;
}

export default function FreeQuizClient({ quizzes }: { quizzes: FreeQuiz[] }) {
  const router = useRouter();
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  // Filter state — subject aur unit wise
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [loadingTestId, setLoadingTestId] = useState<string | null>(null);
  const [instantModeOnly, setInstantModeOnly] = useState(false);
  const [showInstantGuide, setShowInstantGuide] = useState(false);

  // Tags se subject nikalo — har test ke tags me subject hoga
  const getTestSubject = (quiz: FreeQuiz): string | null => {
    const tags = quiz.tags as string[] | null;
    if (!tags || !Array.isArray(tags)) return null;
    // Tags me se subject match karo
    const match = SUBJECTS.find((s) => tags.includes(s.value));
    return match?.value || tags[0] || null;
  };

  // Filter logic — subject + unit se match karo
  const filteredQuizzes = useMemo(() => {
    let result = quizzes;
    if (instantModeOnly) {
      result = result.filter((q) => q.isInstantMode === true);
    } else {
      result = result.filter((q) => !q.isInstantMode);
    }
    if (selectedSubject) {
      result = result.filter((q) => getTestSubject(q) === selectedSubject);
    }
    if (selectedUnit) {
      result = result.filter((q) => q.unitId === selectedUnit);
    }
    return result;
  }, [quizzes, selectedSubject, selectedUnit, instantModeOnly]);

  // Active filter count — badge me dikhega
  const activeFilters = (selectedSubject ? 1 : 0) + (selectedUnit ? 1 : 0);

  // Clear all filters ek click me
  const clearFilters = () => {
    setSelectedSubject(null);
    setSelectedUnit(null);
    setInstantModeOnly(false);
  };

  // Test click → play page pe le jao
  const handleQuizClick = (quiz: FreeQuiz) => {
    setLoadingTestId(quiz.id);
    router.push(`/free-quiz/play?testId=${quiz.id}`);
  };

  // Prefetch quiz data
  useEffect(() => {
    filteredQuizzes.slice(0, 10).forEach((quiz) => {
      router.prefetch(`/free-quiz/play?testId=${quiz.id}`);
    });
  }, [filteredQuizzes, router]);

  // Unit ka display name — "Unit 1" ya "यूनिट 1"
  const getUnitLabel = (unitId: string | null): string => {
    if (!unitId) return '';
    const unit = MPPSC_UNITS.find((u) => u.id === unitId);
    if (!unit) return unitId.replace('unit_', 'U');
    return hi ? unit.subjectHi : unit.subject;
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-50">
      {/* ── Header — sticky, same style as PYQ page ───────────── */}
      <div className="sticky top-14 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-2">
            {/* Title row — Compact on mobile */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h1 className="text-base font-black tracking-tight text-slate-900 sm:text-xl">
                    {hi ? 'MPPSC फ्री डेली क्विज़' : 'Free Daily Quiz'}
                  </h1>
                  <p className="text-[10px] text-slate-500 sm:text-xs">
                    {hi ? 'हर रोज़ नए प्रश्न' : 'Fresh questions daily'}
                  </p>
                </div>
              </div>
 
              {/* ── Connect with Us — Minimal Social Icons ──────────────── */}
              <ConnectSocials minimal className="shrink-0 scale-90 sm:scale-100" />
            </div>

            {/* ── Prominent Mode Switcher (Expert UI Redesign) ──────────────── */}
            <div className="my-4 flex w-full items-center rounded-2xl bg-slate-200/80 p-1.5 shadow-inner ring-1 ring-slate-900/5 sm:w-auto">
              <button
                onClick={() => setInstantModeOnly(false)}
                className={cn(
                  "relative flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black tracking-widest uppercase transition-all duration-300 sm:px-8 sm:text-[13px]",
                  !instantModeOnly
                    ? "bg-gradient-to-b from-slate-800 to-slate-950 text-white shadow-[0_4px_15px_rgba(245,158,11,0.4)] ring-1 ring-amber-500/50"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-300/50"
                )}
              >
                <BookOpen className={cn("h-4 w-4 transition-colors", !instantModeOnly ? "text-amber-400" : "opacity-60")} />
                {hi ? 'एग्जाम मोड' : 'Exam Mode'}
              </button>
              <button
                onClick={() => setInstantModeOnly(true)}
                className={cn(
                  "relative flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black tracking-widest uppercase transition-all duration-300 sm:px-8 sm:text-[13px]",
                  instantModeOnly
                    ? "bg-gradient-to-b from-amber-400 to-orange-500 text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)] ring-1 ring-orange-500/50"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-300/50"
                )}
              >
                <Zap className={cn("h-4 w-4 transition-colors", instantModeOnly ? "fill-orange-100 text-white" : "text-amber-600 opacity-80")} />
                {hi ? 'फास्ट रिवीजन' : 'Fast Revision'}
                
                {/* Micro-animation spark for attention when inactive */}
                {!instantModeOnly && (
                  <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 m-[2px] rounded-full bg-amber-500 shadow-sm"></span>
                  </span>
                )}
              </button>
            </div>

            {/* ── Filter Button + Active Filters ──────────────── */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterOpen(true)}
                className="gap-2 rounded-full border-slate-200 px-4 text-xs font-bold transition-transform active:scale-95 animate-pulse"
              >
                <Filter className="h-3.5 w-3.5" />
                {hi ? 'फ़िल्तर' : 'Filter'}
                {activeFilters > 0 && (
                  <Badge className="ml-1 h-5 w-5 rounded-full bg-indigo-600 p-0 text-[10px] text-white border-0">
                    {activeFilters}
                  </Badge>
                )}
              </Button>
              {selectedSubject && (
                <Badge
                  variant="outline"
                  className="gap-1 rounded-full border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700"
                >
                  {hi
                    ? SUBJECTS.find((s) => s.value === selectedSubject)?.labelHi
                    : selectedSubject}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedSubject(null)} />
                </Badge>
              )}
              {selectedUnit && (
                <Badge
                  variant="outline"
                  className="gap-1 rounded-full border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-700"
                >
                  Unit {selectedUnit.replace('unit_', '')}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedUnit(null)} />
                </Badge>
              )}
              {activeFilters > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-medium text-slate-400 transition-transform hover:text-red-500 active:scale-90"
                >
                  {hi ? 'सब हटाओ' : 'Clear'}
                </button>
              )}
            </div>

            {/* FAST REVISION GUIDE BUTTON (BANNER) */}
            <AnimatePresence>
              {instantModeOnly && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setShowInstantGuide(true);
                      const guestName = localStorage.getItem('mppsc_guest_name') || undefined;
                      const guestPhone = localStorage.getItem('mppsc_guest_phone') || undefined;
                      notifyInstantModeGuideClick(guestName, guestPhone);
                    }}
                    className="group relative flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-amber-500/50 via-yellow-400/50 to-amber-500/50 p-[1px] shadow-xl transition-all hover:scale-[1.02] hover:shadow-amber-500/20 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 opacity-0 transition-opacity duration-500 group-hover:animate-pulse group-hover:opacity-100" />
                    <div className="relative flex w-full items-center justify-between gap-3 rounded-[15px] bg-[#022c22] px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 animate-bounce items-center justify-center rounded-full bg-amber-500/20 shadow-inner ring-1 ring-amber-500/50">
                          <Zap size={16} className="fill-amber-400 text-amber-400" />
                        </div>
                        <span className="text-xs font-black tracking-widest text-amber-400 uppercase drop-shadow-md">
                          {hi ? 'फास्ट रिवीजन कैसे इस्तेमाल करें?' : 'How to use Fast Revision?'}
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-amber-500 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Quiz List ────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-8 sm:px-6">
        <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold">
            {filteredQuizzes.length} {hi ? 'टेस्ट उपलब्ध' : 'Tests Available'}
          </span>
        </div>

        <div className="space-y-4">
          {filteredQuizzes.length === 0 ? (
            <div className="py-20 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p className="font-medium text-slate-400">
                {hi ? 'कोई टेस्ट नहीं मिला' : 'No tests found'}
              </p>
              {activeFilters > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-sm text-indigo-500 hover:underline"
                >
                  {hi ? 'फ़िल्टर हटाओ' : 'Clear filters'}
                </button>
              )}
            </div>
          ) : (
            filteredQuizzes.map((quiz, idx) => {
              const subject = getTestSubject(quiz);
              const unitLabel = getUnitLabel(quiz.unitId);

              return (
                <div key={quiz.id} className="relative">
                  <QuizListItem
                    index={idx}
                    title={hi ? quiz.title : quiz.titleEn || quiz.title}
                    questions={quiz.totalQuestions || undefined}
                    itemLabel={hi ? 'प्रश्न' : 'Questions'}
                    marks={(quiz.totalQuestions || 0) * QUIZ_CONSTANTS.MARKS_PER_QUESTION}
                    duration={Math.ceil(
                      (quiz.totalQuestions || 0) * QUIZ_CONSTANTS.TIME_PER_QUESTION_MINUTES
                    )}
                    isLocked={false}
                    isFree={true}
                    language={language}
                    colorVariant={
                      (['emerald', 'blue', 'amber', 'pink', 'indigo'] as const)[idx % 5]
                    }
                    isLoading={loadingTestId === quiz.id}
                    onClick={() => handleQuizClick(quiz)}
                    onMouseEnter={() => router.prefetch(`/free-quiz/play?testId=${quiz.id}`)}
                  />
                  <div className="mt-1.5 flex items-center gap-2 pl-16 sm:pl-20">
                    {subject && (
                      <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        📚{' '}
                        {hi
                          ? SUBJECTS.find((s) => s.value === subject)?.labelHi || subject
                          : subject}
                      </span>
                    )}
                    {quiz.unitId && (
                      <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        🏛️ Unit {quiz.unitId.replace('unit_', '')}
                        {unitLabel ? ` · ${unitLabel}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Filter Modal — Subject + Unit select ─────────────── */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-black">
              <Filter className="h-4 w-4 text-indigo-600" />
              {hi ? 'टेस्ट फ़िल्टर करो' : 'Filter Tests'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
                {hi ? 'विषय चुनो' : 'Select Subject'}
              </p>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((sub) => (
                  <button
                    key={sub.value}
                    onClick={() =>
                      setSelectedSubject(selectedSubject === sub.value ? null : sub.value)
                    }
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-bold transition-all active:scale-95',
                      selectedSubject === sub.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    )}
                  >
                    {hi ? sub.labelHi : sub.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
                {hi ? 'यूनिट चुनो' : 'Select Unit'}
              </p>
              <div className="flex flex-wrap gap-2">
                {MPPSC_UNITS.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => setSelectedUnit(selectedUnit === unit.id ? null : unit.id)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-bold transition-all active:scale-95',
                      selectedUnit === unit.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    )}
                  >
                    U{unit.id.replace('unit_', '')}
                    <span className="ml-1 hidden text-[10px] font-normal opacity-70 sm:inline">
                      {hi ? unit.subjectHi : unit.subject}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-full text-xs font-bold active:scale-95"
                onClick={clearFilters}
              >
                {hi ? 'सब हटाओ' : 'Clear All'}
              </Button>
              <Button
                size="sm"
                className="flex-1 rounded-full bg-indigo-600 text-xs font-bold hover:bg-indigo-700 active:scale-95"
                onClick={() => setFilterOpen(false)}
              >
                {hi ? 'लागू करो' : 'Apply'}
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Instant Mode Guide Modal ───────────────────────── */}
      <Dialog open={showInstantGuide} onOpenChange={setShowInstantGuide}>
        <DialogContent showCloseButton={false} className="max-w-md gap-0 overflow-hidden border-none p-0 sm:rounded-3xl shadow-2xl">
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
            
            <DialogClose className="absolute right-4 top-4 z-20 rounded-full p-1 opacity-70 transition-opacity hover:bg-white/10 hover:opacity-100 focus:outline-none">
              <X className="h-5 w-5 text-white" />
              <span className="sr-only">Close</span>
            </DialogClose>

            <DialogHeader className="relative z-10 text-left">
              <DialogTitle className="flex items-center gap-2 text-xl font-black tracking-tight text-white">
                <Zap className="h-5 w-5 text-amber-400 fill-amber-400/20" />
                {hi ? 'फास्ट रिवीजन क्या है?' : 'What is Fast Revision?'}
              </DialogTitle>
              <div className="pt-1 text-sm font-medium text-slate-400">
                {hi ? 'टेस्ट सबमिट करने का इंतज़ार खत्म!' : 'No need to wait for submit!'}
              </div>
            </DialogHeader>
          </div>
          
          <div className="space-y-6 bg-white p-6 sm:p-8">
            <p className="text-[13px] font-semibold leading-relaxed text-slate-600">
              {hi 
                ? "इस मोड में आपको पूरा टेस्ट खत्म करके 'Submit' करने की ज़रूरत नहीं है। बस किसी भी सवाल का जवाब चुनें, और तुरंत नीचे दिए गए बटन पर क्लिक करके उसका सही उत्तर और डिटेल में व्याख्या (Explanation) पढ़ें।" 
                : "In this mode, you don't need to finish the test and submit. Just select an answer and click the button below to instantly see the correct answer and detailed explanation."}
            </p>

            {/* MOCK UI OF THE QUIZ WITH CSS ANIMATION */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes pointerFlow {
                0% { transform: translate(140px, 160px) scale(1); opacity: 0; }
                10% { transform: translate(140px, 160px) scale(1); opacity: 1; }
                20% { transform: translate(30px, 20px) scale(1); opacity: 1; }
                25% { transform: translate(30px, 20px) scale(0.85); opacity: 1; }
                30% { transform: translate(30px, 20px) scale(1); opacity: 1; }
                45% { transform: translate(100px, 110px) scale(1); opacity: 1; }
                50% { transform: translate(100px, 110px) scale(0.85); opacity: 1; }
                55% { transform: translate(100px, 110px) scale(1); opacity: 1; }
                80% { transform: translate(100px, 110px) scale(1); opacity: 1; }
                90% { transform: translate(100px, 110px) scale(1); opacity: 0; }
                100% { transform: translate(140px, 160px) scale(1); opacity: 0; }
              }
              @keyframes toggleSwitch {
                0%, 25% { transform: translateX(0); background-color: #cbd5e1; }
                30%, 100% { transform: translateX(100%); background-color: #4f46e5; }
              }
              @keyframes optionWrong {
                0%, 50% { background-color: #f8fafc; border-color: #e2e8f0; }
                55%, 100% { background-color: #fff1f2; border-color: #fecdd3; }
              }
              @keyframes optionWrongDot {
                0%, 50% { background-color: #f1f5f9; border-color: #cbd5e1; }
                55%, 100% { background-color: #ffe4e6; border-color: #fda4af; }
              }
              @keyframes optionRight {
                0%, 50% { background-color: #f8fafc; border-color: #e2e8f0; }
                55%, 100% { background-color: #ecfdf5; border-color: #10b981; }
              }
              @keyframes optionRightDot {
                0%, 50% { background-color: #f1f5f9; border-color: #cbd5e1; }
                55%, 100% { background-color: #10b981; border-color: #10b981; }
              }
              @keyframes explanationReveal {
                0%, 50% { opacity: 0; transform: translateY(10px); }
                55%, 90% { opacity: 1; transform: translateY(0); }
                95%, 100% { opacity: 0; transform: translateY(10px); }
              }
            `}} />
            <div className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
              
              {/* TOP HEADER / TOGGLE */}
              <div className="flex items-center justify-start border-b border-slate-200 bg-white p-2 px-3">
                <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5">
                  <div className="flex h-3 w-[22px] rounded-full bg-slate-300 p-[2px] transition-colors" style={{ animation: 'toggleSwitch 6s infinite' }}>
                    <div className="h-2 w-2 rounded-full bg-white shadow-sm" />
                  </div>
                  <span className="text-[6px] font-bold text-slate-500">⚡ REVISION</span>
                </div>
              </div>

              {/* QUIZ CONTENT */}
              <div className="bg-white p-4">
                <div className="mb-3 h-2 w-3/4 rounded-full bg-slate-200" />
                <div className="mb-4 h-2 w-1/2 rounded-full bg-slate-200" />
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 transition-colors" style={{ animation: 'optionWrong 6s infinite' }}>
                    <div className="h-3 w-3 rounded-full border border-slate-300 bg-slate-100 transition-colors" style={{ animation: 'optionWrongDot 6s infinite' }} />
                    <div className="h-1.5 w-1/2 rounded-full bg-slate-300" />
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 transition-colors" style={{ animation: 'optionRight 6s infinite' }}>
                    <div className="flex h-3 w-3 items-center justify-center rounded-full border border-slate-300 bg-slate-100 transition-colors" style={{ animation: 'optionRightDot 6s infinite' }}>
                      <div className="h-1 w-1 rounded-full bg-white" />
                    </div>
                    <div className="h-1.5 w-2/3 rounded-full bg-slate-300" />
                  </div>
                </div>
              </div>

              {/* BEST EXPLANATION REVEAL */}
              <div className="relative border-t border-slate-200 bg-slate-100 p-3 pt-5 text-center transition-opacity" style={{ opacity: 0, animation: 'explanationReveal 6s infinite' }}>
                <div className="mx-auto flex w-fit flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 shadow-sm">
                    <Zap size={12} className="fill-emerald-500 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                      {hi ? 'बेस्ट एक्सप्लेनेशन' : 'Best Explanation'}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-200" />
                  <div className="h-2 w-3/4 rounded-full bg-slate-200" />
                </div>
              </div>

              {/* THE ANIMATED POINTER */}
              <div className="pointer-events-none absolute left-0 top-0 z-50 text-3xl drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]" style={{ animation: 'pointerFlow 6s infinite' }}>
                👆🏽
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-amber-50/80 p-4 border border-amber-100">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs font-bold leading-relaxed text-amber-900/80">
                {hi 
                  ? "यह मोड आपके रिवीज़न को 10x फ़ास्ट बनाता है। आप अपनी गलतियों को तुरंत पकड़ सकते हैं और सीखते हुए आगे बढ़ सकते।" 
                  : "This mode makes your revision 10x faster. You can catch your mistakes instantly and learn as you go."}
              </p>
            </div>

            <button
              onClick={() => setShowInstantGuide(false)}
              className="w-full rounded-full bg-gradient-to-r from-slate-900 to-slate-800 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl transition-transform active:scale-95 hover:shadow-2xl"
            >
              {hi ? 'मुझे समझ आ गया' : 'Got it, let\'s go'}
            </button>

            {/* Subtle Premium Note */}
            <div className="flex flex-col items-center gap-1.5 pt-3">
              <span className="text-[11px] font-medium text-slate-400">
                {hi ? 'फास्ट रिवीजन एक premium फीचर है ✨' : 'Fast Revision is a Premium Feature ✨'}
              </span>
              <a 
                href="/pricing" 
                className="group flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50/50 px-3 py-1.5 text-[10px] font-bold text-indigo-500 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
              >
                <span>{hi ? 'सभी टेस्ट सीरीज में उपलब्ध — अभी देखें' : 'Available in all test series — View Now'}</span>
                <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
