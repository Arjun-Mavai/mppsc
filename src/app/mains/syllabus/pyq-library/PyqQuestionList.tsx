'use client';

import { memo, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Lock, Layers, Trophy, LayoutGrid, Bookmark, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { PyqAnswerProse } from '@/components/mains/PyqAnswerProse';
import { Button } from '@/components/ui/button';

import {
  MAIN_SYLLABUS_CARD_HUES,
  mainsSyllabusTileSkin,
  mainsSyllabusVariantBadge,
} from '@/components/mains/mainsSyllabusTileSkin';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PyqExpertInsightsRenderer } from '@/components/mains/PyqExpertInsightsRenderer';
import { QuickFeedback } from '@/features/tests/components/QuickFeedback';
import {
  isMainsPyqDemoPaper,
  pickMainsPyqFreeDemoQuestionIds,
} from '@/lib/mains-vault-demo';

const NEW_CA_TEXT_STYLE = {
  color: '#0fffff',
  WebkitTextStroke: '0.5px #082f49',
  textShadow: '0px 1px 0px #0369a1, 0px 2px 0px #075985, 0px 3px 0px #082f49, 0px 4px 6px rgba(0,0,0,0.8)'
};

export type QRow = {
  id: string;
  part: string;
  unitNumber: number;
  unitTitleHi?: string | null;
  unitTitleEn?: string | null;
  marks: number;
  questionNumber: string;
  questionHi: string;
  questionEn: string | null;
  expertInsightsHi: string | null;
  expertInsightsEn: string | null;
  currentAffairsData?: any | null;
  isLocked?: boolean;
  variants: {
    slot: number;
    styleLabel: string | null;
    styleLabelHi: string | null;
    answerHi: string;
    answerEn: string | null;
  }[];
};

type ReadingTheme = 'deep' | 'paper';

type PaperItem = {
  id: string;
  examYear: number;
  paperNumber: number;
};

interface PyqQuestionListProps {
  questions: QRow[];
  paperNumber: number;
  examYear: number;
  paperQuestionCount?: number;
  partFilter: string;
  onPartFilterChange: (part: string) => void;
  readingTheme: ReadingTheme;
  vaultUnlocked: boolean;
  allowDemoAccess: boolean;
  onVaultModalOpen: () => void;
  showGlobalFilters: boolean;
  papers?: PaperItem[];
  paperId?: string;
  onPaperChange?: (id: string) => void;
}

export const BOOKMARK_STORAGE_KEY = 'mppsc_mains_saved_bookmarks';

function getSavedBookmarkIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKMARK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const PyqQuestionList = memo(function PyqQuestionList({
  questions,
  paperNumber = 0,
  examYear = 0,
  paperQuestionCount = 0,
  partFilter,
  onPartFilterChange,
  readingTheme,
  vaultUnlocked,
  allowDemoAccess = false,
  onVaultModalOpen,
  showGlobalFilters,
  papers = [],
  paperId = '',
  onPaperChange,
}: PyqQuestionListProps) {
  const { language } = useSettingsStore();
  const hi = language === 'hi';
  const effectiveHi = paperNumber === 5 || paperNumber === 6 || hi;
  const themeDeep = readingTheme === 'deep';

  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});
  const [insightsOpenIds, setInsightsOpenIds] = useState<Record<string, boolean>>({});
  const [marksFilter, setMarksFilter] = useState<number | 'ALL'>('ALL');
  const [unitFilter, setUnitFilter] = useState<string | 'ALL'>('ALL');
  const [showSubjectFilter, setShowSubjectFilter] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showYearSlider, setShowYearSlider] = useState(true);

  // 📅 Year Slider Scroll Ref & Handler
  const yearSliderRef = useRef<HTMLDivElement>(null);
  const handleScrollYearSlider = useCallback((direction: 'left' | 'right') => {
    if (yearSliderRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      yearSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  // 🔖 Bookmark State & Saved Filter
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);

  useEffect(() => {
    setBookmarkedIds(getSavedBookmarkIds());
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('saved') === 'true' || params.get('bookmark') === 'true') {
        setSavedOnly(true);
      }
    }
  }, []);

  const handleToggleSavedOnly = useCallback((val: boolean) => {
    setSavedOnly(val);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (val) {
        params.set('saved', 'true');
      } else {
        params.delete('saved');
        params.delete('bookmark');
      }
      const queryString = params.toString();
      const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    }
  }, []);

  const handleToggleBookmark = useCallback((qId: string) => {
    if (!vaultUnlocked) {
      toast(
        hi ? 'यह एक प्रीमियम फ़ीचर है। सब्सक्राइब करें 💎' : 'Premium feature. Subscribe to unlock 💎',
        { style: { background: '#ecfdf5', color: '#064e3b', border: '1px solid #34d399' } }
      );
      return;
    }

    const alreadySaved = bookmarkedIds.includes(qId);
    const isSavedNow = !alreadySaved;
    const next = alreadySaved ? bookmarkedIds.filter((id) => id !== qId) : [...bookmarkedIds, qId];

    setBookmarkedIds(next);
    try {
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(next));
    } catch {}

    toast.dismiss();
    toast(
      isSavedNow
        ? (hi ? "प्रश्न बुकमार्क हो गया! 🔖" : "Bookmark saved! 🔖")
        : (hi ? "बुकमार्क हटा दिया गया 🗑️" : "Bookmark removed 🗑️"),
      {
        duration: 2000,
        style: {
          background: isSavedNow ? '#f0fdf4' : '#fef2f2',
          color: isSavedNow ? '#166534' : '#991b1b',
          border: `1px solid ${isSavedNow ? '#86efac' : '#fca5a5'}`,
        },
      }
    );
  }, [vaultUnlocked, hi, bookmarkedIds]);

  // ⚡ Stable callbacks prevent cascading re-renders
  const handleQOpen = useCallback((qId: string, val: boolean) => {
    setOpenIds(prev => prev[qId] === val ? prev : { ...prev, [qId]: val });
  }, []);

  const handleInsightOpen = useCallback((qId: string, val: boolean) => {
    setInsightsOpenIds(prev => prev[qId] === val ? prev : { ...prev, [qId]: val });
  }, []);

  const parts = useMemo(() => {
    const s = new Set(questions.map((q) => String(q.part).toUpperCase()));
    return ['ALL', ...Array.from(s).sort()];
  }, [questions]);

  const availableMarks = useMemo(() => {
    const s = new Set(questions.map((q) => q.marks));
    return Array.from(s).sort((a, b) => a - b);
  }, [questions]);

  const allPaperItems = useMemo(() => {
    if (!papers || papers.length === 0) return [];
    return [...papers].sort((a, b) => {
      if (b.examYear !== a.examYear) return b.examYear - a.examYear;
      return a.paperNumber - b.paperNumber;
    });
  }, [papers]);

  const availableUnits = useMemo(() => {
    const map = new Map<string, { id: string; part: string; num: number; titleHi: string; titleEn: string }>();
    questions.forEach(q => {
      if (partFilter !== 'ALL' && String(q.part).toUpperCase() !== partFilter) return;

      const id = `${String(q.part).toUpperCase()}-${q.unitNumber}`;
      if (!map.has(id)) {
        map.set(id, {
          id,
          part: String(q.part).toUpperCase(),
          num: q.unitNumber,
          titleHi: q.unitTitleHi || (q.part !== 'NONE' ? `खंड ${q.part} - इकाई ${q.unitNumber}` : `इकाई ${q.unitNumber}`),
          titleEn: q.unitTitleEn || (q.part !== 'NONE' ? `Part ${q.part} - Unit ${q.unitNumber}` : `Unit ${q.unitNumber}`)
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      if (a.part !== b.part) return a.part.localeCompare(b.part);
      return a.num - b.num;
    });
  }, [questions, partFilter]);

  const filtered = useMemo(() => {
    let list = questions;
    if (savedOnly) {
      const savedSet = new Set(bookmarkedIds);
      list = list.filter((q) => savedSet.has(q.id));
    }
    if (partFilter !== 'ALL') {
      list = list.filter((q) => String(q.part).toUpperCase() === partFilter);
    }
    if (marksFilter !== 'ALL') {
      list = list.filter((q) => q.marks === marksFilter);
    }
    if (unitFilter !== 'ALL') {
      const isValid = availableUnits.some(u => u.id === unitFilter);
      if (isValid) {
        list = list.filter((q) => `${String(q.part).toUpperCase()}-${q.unitNumber}` === unitFilter);
      }
    }
    return list;
  }, [questions, savedOnly, bookmarkedIds, partFilter, marksFilter, unitFilter, availableUnits]);

  const isDemoPaper = isMainsPyqDemoPaper(examYear, paperNumber);

  const guestFreeIds = useMemo(() => {
    if (vaultUnlocked || !allowDemoAccess || !isDemoPaper) return new Set<string>();
    return pickMainsPyqFreeDemoQuestionIds(questions);
  }, [vaultUnlocked, allowDemoAccess, isDemoPaper, questions]);

  const visibleQuestions = useMemo(() => {
    if (vaultUnlocked) return filtered;
    if (!allowDemoAccess || !isDemoPaper) return [];
    return filtered.filter((q) => guestFreeIds.has(q.id));
  }, [vaultUnlocked, filtered, guestFreeIds, allowDemoAccess, isDemoPaper]);

  const lockedCount = useMemo(() => {
    if (vaultUnlocked) return 0;
    if (!isDemoPaper) return paperQuestionCount;
    return filtered.filter((q) => !guestFreeIds.has(q.id)).length;
  }, [vaultUnlocked, isDemoPaper, filtered, guestFreeIds, paperQuestionCount]);

  const showVaultBanner = !vaultUnlocked && lockedCount > 0;

  const totalQsCount = questions.length;
  const m2QsCount = useMemo(() => questions.filter((q) => q.marks === 2 || q.marks === 3).length, [questions]);
  const m7QsCount = useMemo(() => questions.filter((q) => q.marks === 7 || q.marks === 5 || q.marks === 6).length, [questions]);
  const m10QsCount = useMemo(() => questions.filter((q) => q.marks === 10 || q.marks === 11 || q.marks === 15 || q.marks === 20).length, [questions]);

  const availableYears = useMemo(() => {
    if (papers && papers.length > 0) {
      const years = Array.from(new Set(papers.map((p) => p.examYear))).sort((a, b) => b - a);
      if (years.length > 0) return years;
    }
    return [2025, 2024, 2023, 2022, 2021, 2020];
  }, [papers]);

  return (
    <>
      <AnimatePresence>
        {showGlobalFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6 space-y-4"
          >
            {/* 1. TOP FILTERS ROW: PARTS, SAVED, TOOLS & MARKS */}
            <div className="space-y-2.5">
              {/* ROW 1: PARTS & SAVED FILTER */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
                {/* Parts Buttons */}
                {parts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      if (savedOnly) handleToggleSavedOnly(false);
                      onPartFilterChange(p);
                    }}
                    className={cn(
                      'h-7 sm:h-8 rounded-full px-2.5 sm:px-3.5 text-[10px] sm:text-xs font-black uppercase tracking-wide transition-all active:scale-95 shadow-xs shrink-0 flex items-center justify-center border',
                      !savedOnly && partFilter === p
                        ? themeDeep
                          ? 'bg-[#e91e63] text-white border-pink-500 shadow-sm'
                          : 'bg-[#e91e63] text-white shadow-md shadow-pink-500/20 border-pink-600'
                        : themeDeep
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                          : 'border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <span>{p === 'ALL' ? (hi ? 'सभी खंड' : 'ALL PARTS') : hi ? `खंड ${p}` : `PART ${p}`}</span>
                  </button>
                ))}

                {/* 🔖 SAVED BOOKMARKS FILTER BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    if (!vaultUnlocked) {
                      toast(
                        hi ? 'यह एक प्रीमियम फ़ीचर है। सब्सक्राइब करें 💎' : 'Premium feature. Subscribe to unlock 💎',
                        { style: { background: '#ecfdf5', color: '#064e3b', border: '1px solid #34d399' } }
                      );
                      return;
                    }
                    handleToggleSavedOnly(!savedOnly);
                  }}
                  className={cn(
                    'h-7 sm:h-8 rounded-full px-2.5 sm:px-3.5 text-[10px] sm:text-xs font-black uppercase tracking-wide transition-all active:scale-95 shadow-xs flex items-center justify-center gap-1 sm:gap-1.5 relative shrink-0 border',
                    savedOnly
                      ? 'bg-[#e91e63] text-white shadow-md shadow-pink-500/20 border-pink-600'
                      : themeDeep
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                        : 'border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <Bookmark className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0", savedOnly && "fill-white")} />
                  <span>{hi ? `सेव्ड (${bookmarkedIds.length})` : `SAVED (${bookmarkedIds.length})`}</span>
                  {!vaultUnlocked && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full p-[1.5px] sm:p-[2px] shadow-sm ring-1 ring-white dark:ring-slate-900">
                      <Lock className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-white drop-shadow-xs" />
                    </div>
                  )}
                </button>
              </div>

              {/* ROW 2: MARKS & QUICK TOOLS */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
                {/* Marks Filters */}
                <button
                  type="button"
                  onClick={() => setMarksFilter('ALL')}
                  className={cn(
                    'h-7 sm:h-8 rounded-full px-2.5 sm:px-3.5 text-[10px] sm:text-xs font-black uppercase tracking-wide transition-all active:scale-95 shadow-xs shrink-0 flex items-center justify-center border',
                    marksFilter === 'ALL'
                      ? themeDeep
                        ? 'bg-amber-600 text-white border-amber-500'
                        : 'bg-[#ff5722] text-white shadow-md shadow-orange-500/20 border-orange-600'
                      : themeDeep
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                        : 'border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <span>{hi ? 'सभी अंक' : 'ALL MARKS'}</span>
                </button>

                {availableMarks.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMarksFilter(m)}
                    className={cn(
                      'h-7 sm:h-8 rounded-full px-2 sm:px-3 text-[10px] sm:text-xs font-black transition-all active:scale-95 shadow-xs shrink-0 flex items-center justify-center border',
                      marksFilter === m
                        ? themeDeep
                          ? 'bg-sky-600 text-white border-sky-500'
                          : 'bg-sky-600 text-white shadow-md border-sky-700'
                        : themeDeep
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                          : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                    )}
                  >
                    <span>{m}m</span>
                  </button>
                ))}

                <div className="h-3.5 sm:h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 sm:mx-1 shrink-0" />

                {/* Subject & Unit Quick Tool Triggers (Placed at Right End) */}
                <button
                  type="button"
                  onClick={() => vaultUnlocked ? setShowSubjectFilter(!showSubjectFilter) : toast(hi ? "यह एक प्रीमियम फ़ीचर है। सब्सक्राइब करें 💎" : "Premium feature. Subscribe to unlock 💎", {
                    style: { background: '#ecfdf5', color: '#064e3b', border: '1px solid #34d399' }
                  })}
                  className={cn(
                    "flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full transition-all active:scale-95 relative shrink-0 border",
                    themeDeep 
                      ? "bg-slate-800 border-slate-700 hover:bg-slate-700" 
                      : "bg-white border-slate-200 shadow-xs hover:bg-slate-50"
                  )}
                  title={hi ? "विषय अनुसार फ़िल्टर" : "Filter by Topic"}
                >
                  <div className="flex items-center justify-center h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border-[1.5px] sm:border-[2px] border-[#FF9933] bg-white relative">
                    <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-[#138808]"></div>
                  </div>
                  {!vaultUnlocked && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full p-[1.5px] sm:p-[2px] shadow-sm ring-1 ring-white dark:ring-slate-900">
                      <Lock className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-white drop-shadow-xs" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => vaultUnlocked ? setShowUnitDropdown(!showUnitDropdown) : toast(hi ? "यह एक प्रीमियम फ़ीचर है। सब्सक्राइब करें 💎" : "Premium feature. Subscribe to unlock 💎", {
                    style: { background: '#ecfdf5', color: '#064e3b', border: '1px solid #34d399' }
                  })}
                  className={cn(
                    "flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full transition-all active:scale-95 relative shrink-0 border",
                    themeDeep 
                      ? "bg-slate-800 border-slate-700 hover:bg-slate-700" 
                      : "bg-white border-slate-200 shadow-xs hover:bg-slate-50"
                  )}
                  title={hi ? "इकाई अनुसार फ़िल्टर" : "Filter by Unit"}
                >
                  <LayoutGrid className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", themeDeep ? "text-indigo-400" : "text-indigo-500")} />
                  {!vaultUnlocked && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full p-[1.5px] sm:p-[2px] shadow-sm ring-1 ring-white dark:ring-slate-900">
                      <Lock className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-white drop-shadow-xs" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowYearSlider(!showYearSlider)}
                  className={cn(
                    "flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full transition-all active:scale-95 relative shrink-0 border",
                    showYearSlider
                      ? "bg-pink-50 border-pink-300 text-pink-600 dark:bg-pink-950/40 dark:border-pink-700 dark:text-pink-300 shadow-xs"
                      : themeDeep 
                        ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" 
                        : "bg-white border-slate-200 shadow-xs hover:bg-slate-50"
                  )}
                  title={hi ? (showYearSlider ? "वर्ष फ़िल्टर छुपाएं" : "वर्ष फ़िल्टर दिखाएं") : (showYearSlider ? "Hide Year Filter" : "Show Year Filter")}
                >
                  <Calendar className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", showYearSlider ? "text-pink-600 dark:text-pink-400" : "text-pink-500")} />
                </button>
              </div>
            </div>

            {/* Dropdown Filters (Topic & Unit) */}
            <AnimatePresence>
              {(showUnitDropdown || showSubjectFilter) && (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {showUnitDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="w-full sm:w-56"
                    >
                      <Select value={unitFilter} onValueChange={(val) => setUnitFilter(val)}>
                        <SelectTrigger
                          className={cn(
                            'h-10 w-full rounded-2xl px-4 text-[13px] font-bold shadow-xs ring-offset-0 transition-all focus:ring-0',
                            themeDeep
                              ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-indigo-500/50 hover:bg-slate-800 [&_svg]:text-slate-400'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-500/40 hover:bg-slate-50'
                          )}
                        >
                          <SelectValue placeholder={hi ? 'सभी इकाइयाँ' : 'All Units'} />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          sideOffset={5}
                          viewportClassName="max-h-[280px] overflow-y-auto py-1.5 no-scrollbar"
                          className={cn(
                            'z-[200] w-[min(100%,var(--radix-select-trigger-width))] min-w-[200px] rounded-2xl shadow-xl',
                            themeDeep
                              ? 'border border-slate-700 bg-slate-900 text-slate-100'
                              : 'border border-slate-200 bg-white text-slate-800'
                          )}
                        >
                          <SelectItem value="ALL" className="cursor-pointer py-2 px-3 text-[13px] font-bold">
                            {hi ? 'सभी इकाइयाँ' : 'All Units'}
                          </SelectItem>
                          {availableUnits.map((u) => (
                            <SelectItem key={u.id} value={u.id} className="cursor-pointer py-2 px-3 text-[13px] font-semibold">
                              {u.part !== 'NONE' ? (hi ? `खंड ${u.part} : इकाई ${u.num}` : `Part ${u.part} : Unit ${u.num}`) : (hi ? `इकाई ${u.num}` : `Unit ${u.num}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}

                  {showSubjectFilter && (
                    <motion.div 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="w-full sm:w-64"
                    >
                      <Select value={unitFilter} onValueChange={(val) => setUnitFilter(val)}>
                        <SelectTrigger
                          className={cn(
                            'h-10 w-full rounded-2xl px-4 text-[13px] font-bold shadow-xs ring-offset-0 transition-all focus:ring-0',
                            themeDeep
                              ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-indigo-500/50 hover:bg-slate-800 [&_svg]:text-slate-400'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-500/40 hover:bg-slate-50'
                          )}
                        >
                          <SelectValue placeholder={hi ? 'सभी टॉपिक्स' : 'All Topics'} />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          sideOffset={5}
                          viewportClassName="max-h-[280px] overflow-y-auto py-1.5 no-scrollbar"
                          className={cn(
                            'z-[200] w-[min(100%,var(--radix-select-trigger-width))] min-w-[240px] rounded-2xl shadow-xl',
                            themeDeep
                              ? 'border border-slate-700 bg-slate-900 text-slate-100'
                              : 'border border-slate-200 bg-white text-slate-800'
                          )}
                        >
                          <SelectItem value="ALL" className="cursor-pointer py-2 px-3 text-[13px] font-bold">
                            {hi ? 'सभी टॉपिक्स' : 'All Topics'}
                          </SelectItem>
                          {availableUnits.map((u) => (
                            <SelectItem key={u.id} value={u.id} className="cursor-pointer py-2 px-3 text-[13px] font-semibold">
                              {hi ? u.titleHi : u.titleEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </div>
              )}
            </AnimatePresence>
            {/* 2. 📅 PYQ YEAR CARD (HIGH-DENSITY COMPACT SLIDER) */}
            <AnimatePresence>
              {showYearSlider && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className={cn(
                    "rounded-2xl border p-2 sm:p-2.5 transition-all duration-300 shadow-xs backdrop-blur-md",
                    themeDeep 
                      ? "border-slate-800 bg-slate-900/90 text-slate-100" 
                      : "border-slate-200/90 bg-white/95 shadow-slate-200/50 text-slate-900"
                  )}>
                    {/* SLIDER ROW WITH NAVIGATION ARROWS */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {/* 📅 Compact Year Icon Badge (Click to collapse) */}
                      <button
                        type="button"
                        onClick={() => setShowYearSlider(false)}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-black tracking-wider uppercase shrink-0 border select-none transition-all active:scale-95 cursor-pointer",
                          themeDeep
                            ? "bg-slate-800/90 text-slate-400 border-slate-700/80 hover:bg-slate-700 hover:text-white"
                            : "bg-slate-100/90 text-slate-500 border-slate-200/80 hover:bg-slate-200 hover:text-slate-800"
                        )}
                        title={hi ? "वर्ष फ़िल्टर छुपाएं" : "Hide Year Slider"}
                      >
                        <Calendar className="h-3 w-3 text-pink-500 shrink-0" />
                        <span className="hidden xs:inline text-[9.5px]">PYQ</span>
                      </button>

                {/* ◀️ Left Scroll Button (Desktop Only) */}
                <button
                  type="button"
                  onClick={() => handleScrollYearSlider('left')}
                  className={cn(
                    "hidden sm:flex h-6.5 w-6.5 rounded-lg items-center justify-center shrink-0 transition-all active:scale-90 border shadow-xs",
                    themeDeep
                      ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                  title={hi ? "पीछे स्क्रॉल करें" : "Scroll left"}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                {/* 📜 Scrollable Container */}
                <div
                  ref={yearSliderRef}
                  className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5"
                >
                  {(allPaperItems.length > 0
                    ? allPaperItems
                    : availableYears.map((yr) => {
                        const targetPaper =
                          papers.find((p) => p.examYear === yr && p.paperNumber === paperNumber) ||
                          papers.find((p) => p.examYear === yr);
                        return {
                          id: targetPaper?.id || `yr-${yr}`,
                          examYear: yr,
                          paperNumber: paperNumber || 1,
                        };
                      })
                  ).map((p) => {
                    const isSelected =
                      p.id === paperId ||
                      (p.examYear === examYear && p.paperNumber === paperNumber);

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (onPaperChange && p.id && !p.id.startsWith('yr-')) {
                            onPaperChange(p.id);
                          }
                        }}
                        className={cn(
                          "rounded-xl px-2.5 py-1 text-[11px] font-extrabold transition-all duration-200 active:scale-95 shrink-0 border flex items-center gap-1",
                          isSelected
                            ? "border-pink-300 bg-pink-50 text-pink-600 shadow-xs ring-1 ring-pink-400/40"
                            : themeDeep
                              ? "border-slate-800 bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                              : "border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        <span>{String(p.examYear).slice(-2)}</span>
                        <span
                          className={cn(
                            "text-[8.5px] px-1 py-0.5 rounded-md font-black uppercase tracking-tight opacity-90",
                            isSelected
                              ? "bg-pink-200/80 text-pink-700"
                              : themeDeep
                                ? "bg-slate-700 text-slate-400"
                                : "bg-slate-100 text-slate-500"
                          )}
                        >
                          P{p.paperNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* ▶️ Right Scroll Button (Desktop Only) */}
                <button
                  type="button"
                  onClick={() => handleScrollYearSlider('right')}
                  className={cn(
                    "hidden sm:flex h-6.5 w-6.5 rounded-lg items-center justify-center shrink-0 transition-all active:scale-90 border shadow-xs",
                    themeDeep
                      ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                  title={hi ? "आगे स्क्रॉल करें" : "Scroll right"}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* 
              STATS BAR ROW (Temporarily hidden/commented out as requested)
              <div className={cn(
                "pt-3 border-t grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs mt-3",
                themeDeep ? "border-slate-800" : "border-slate-100"
              )}>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-pink-50 dark:bg-pink-950/50 flex items-center justify-center text-pink-600 shrink-0 border border-pink-100 dark:border-pink-900/50">
                    <span className="text-xs">📊</span>
                  </div>
                  <div>
                    <span className="font-black text-sm block leading-tight">{totalQsCount}</span>
                    <span className="text-[10px] font-bold opacity-60 block">{hi ? 'कुल प्रश्न' : 'Total Questions'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100 dark:border-emerald-900/50">
                    <span className="text-xs">🟩</span>
                  </div>
                  <div>
                    <span className="font-black text-sm block leading-tight">{m2QsCount}</span>
                    <span className="text-[10px] font-bold opacity-60 block">{hi ? '2 Marks (Short Answers)' : '2 Marks (Short Answers)'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-100 dark:border-amber-900/50">
                    <span className="text-xs">📄</span>
                  </div>
                  <div>
                    <span className="font-black text-sm block leading-tight">{m7QsCount}</span>
                    <span className="text-[10px] font-bold opacity-60 block">{hi ? '7 Marks (Medium Answers)' : '7 Marks (Medium Answers)'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 shrink-0 border border-sky-100 dark:border-sky-900/50">
                    <span className="text-xs">📘</span>
                  </div>
                  <div>
                    <span className="font-black text-sm block leading-tight">{m10QsCount}</span>
                    <span className="text-[10px] font-bold opacity-60 block">{hi ? '10 Marks (Long Answers)' : '10 Marks (Long Answers)'}</span>
                  </div>
                </div>
              </div>
              */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <ul className={cn('space-y-3', showVaultBanner ? 'pb-3' : 'pb-6')}>
        {visibleQuestions.map((q, qi) => (
          <PyqQuestionRow
            key={q.id}
            q={q}
            qi={qi}
            effectiveHi={effectiveHi}
            themeDeep={themeDeep}
            open={!!openIds[q.id]}
            setOpen={(val) => handleQOpen(q.id, val)}
            readingTheme={readingTheme}
            insightsOpen={!!insightsOpenIds[q.id]}
            setInsightsOpen={(val) => handleInsightOpen(q.id, val)}
            examYear={examYear}
            paperNumber={paperNumber}
            vaultUnlocked={vaultUnlocked}
            isBookmarked={bookmarkedIds.includes(q.id)}
            onToggleBookmark={handleToggleBookmark}
          />
        ))}
      </ul>

      {showVaultBanner ? (
        <PyqVaultUnlockBanner
          hi={hi}
          themeDeep={themeDeep}
          lockedCount={lockedCount}
          onVaultModalOpen={onVaultModalOpen}
        />
      ) : null}
    </>
  );
});

PyqQuestionList.displayName = 'PyqQuestionList';

function PyqVaultUnlockBanner({
  hi,
  themeDeep,
  lockedCount,
  onVaultModalOpen,
}: {
  hi: boolean;
  themeDeep: boolean;
  lockedCount: number;
  onVaultModalOpen: () => void;
}) {
  return (
    <div
      className={cn(
        'mb-8 overflow-hidden rounded-[2rem] border p-6 text-center sm:p-7',
        themeDeep
          ? 'border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-slate-900'
          : 'border-amber-300 bg-gradient-to-b from-amber-50 to-white'
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'mx-auto mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em]',
          themeDeep ? 'border-amber-400/40 text-amber-300' : 'border-amber-300 text-amber-700'
        )}
      >
        <Lock className="h-3.5 w-3.5" aria-hidden />
        {hi ? 'मेंस लाइब्रेरी' : 'Mains Library'}
      </motion.div>
      <p className={cn('mx-auto max-w-xl text-sm leading-relaxed', themeDeep ? 'text-slate-300' : 'text-slate-700')}>
        {hi
          ? 'मेंस प्लान के साथ सिलेबस के गहन कॉन्सेप्ट्स, प्रमाणिक द्विभाषी (Bilingual) मॉडल उत्तर और रणनीतिक एक्सपर्ट टिप्स अनलॉक करें।'
          : 'Deep syllabus concepts, authentic bilingual model answers, and strategic insights unlock with the Mains plan.'}
      </p>
      <Button
        type="button"
        onClick={onVaultModalOpen}
        className="mt-5 h-11 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-500 px-7 font-black text-white shadow-lg shadow-amber-500/25 hover:opacity-95"
      >
        {hi ? 'लाइब्रेरी अनलॉक करें · मूल्य' : 'Unlock Library · pricing'}
      </Button>
      <p className={cn('mt-3 text-xs', themeDeep ? 'text-slate-400' : 'text-slate-500')}>
        {lockedCount} {hi ? 'प्रश्न अभी लॉक हैं' : 'questions locked'}
      </p>
    </div>
  );
}

/**
 * 🎯 Individual Question Row with Premium UX
 */
const PyqQuestionRow = memo(function PyqQuestionRow({
  q,
  qi,
  effectiveHi,
  themeDeep,
  open,
  setOpen,
  readingTheme,
  insightsOpen,
  setInsightsOpen,
  examYear,
  paperNumber,
  vaultUnlocked,
  isBookmarked,
  onToggleBookmark,
}: {
  q: QRow;
  qi: number;
  effectiveHi: boolean;
  themeDeep: boolean;
  open: boolean;
  setOpen: (val: boolean) => void;
  readingTheme: ReadingTheme;
  insightsOpen: boolean;
  setInsightsOpen: (val: boolean) => void;
  examYear: number;
  paperNumber: number;
  vaultUnlocked: boolean;
  isBookmarked: boolean;
  onToggleBookmark: (qId: string) => void;
}) {
  const hue = MAIN_SYLLABUS_CARD_HUES[qi % 4];
  const tileSkin = mainsSyllabusTileSkin(hue, themeDeep);

  function stemFor(q: QRow) {
    return effectiveHi ? q.questionHi : (q.questionEn ?? q.questionHi);
  }

  function insightsFor(q: QRow) {
    if (effectiveHi) return (q.expertInsightsHi ?? '').trim();
    return (q.expertInsightsEn ?? q.expertInsightsHi ?? '').trim();
  }

  function answerFor(v: QRow['variants'][0]) {
    return effectiveHi ? v.answerHi : (v.answerEn ?? v.answerHi);
  }

  function styleLabelFor(v: QRow['variants'][0]) {
    if (effectiveHi) {
      const s = (v.styleLabelHi ?? '').trim();
      if (s) return s;
      return (v.styleLabel ?? '').trim() || null;
    }
    const s = (v.styleLabel ?? '').trim();
    if (s) return s;
    return (v.styleLabelHi ?? '').trim() || null;
  }

  const insightsText = insightsFor(q);
  const hasInsights = q.isLocked || insightsText.length > 0 || (q.currentAffairsData && Object.keys(q.currentAffairsData).length > 0);

  return (
    <li
      className={cn(
        'overflow-hidden rounded-[2.25rem] sm:rounded-[2.5rem] border border-transparent',
        tileSkin.frame,
        open && 'shadow-xl shadow-slate-200/50 dark:shadow-black/50 border-emerald-500/20'
      )}
      style={{ overflowAnchor: 'none' }}
    >
      <div
        role="button"
        onClick={() => {
          const scrollY = window.scrollY;
          setOpen(!open);
          requestAnimationFrame(() => {
            window.scrollTo(window.scrollX, scrollY);
          });
        }}
        className={cn(
          'flex w-full items-start gap-2 px-3 py-3 text-left sm:gap-2.5 sm:px-4 sm:py-4 active:scale-100 cursor-pointer',
          open && 'bg-slate-50/50 dark:bg-slate-900/50'
        )}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {/* Left Column: Marks badge + Bookmark Icon */}
        <div className="flex shrink-0 flex-col items-center gap-1.5 pt-0.5">
          <span className={cn('rounded-lg px-2 py-0.5 text-[10px] font-black', tileSkin.markBadge)}>
            {q.marks}m
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleBookmark(q.id);
            }}
            className={cn(
              "p-1 rounded-md transition-all active:scale-90 relative",
              isBookmarked
                ? "text-[#e91e63]"
                : themeDeep
                  ? "text-slate-500 hover:text-slate-300"
                  : "text-slate-400 hover:text-slate-600"
            )}
            title={effectiveHi ? "बुकमार्क करें" : "Bookmark Question"}
          >
            <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-[#e91e63]")} />
            {!vaultUnlocked && (
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-emerald-300 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700 rounded-full p-[1.5px] shadow-[0_2px_4px_rgba(16,185,129,0.4)] ring-[1px] ring-white dark:ring-slate-900">
                <Lock className="h-[8px] w-[8px] sm:h-2.5 sm:w-2.5 text-white dark:text-emerald-50 drop-shadow-xs" />
              </div>
            )}
          </button>
        </div>

        {/* Right Column: Original Subline Header & Question Stem */}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-[10px] font-black uppercase tracking-wider opacity-60',
              themeDeep ? 'text-slate-400' : 'text-slate-700'
            )}
          >
            {(() => {
              const wordLimit = (() => {
                if (q.marks === 2) return effectiveHi ? '20 शब्द' : '20 Words';
                if (q.marks === 7) return effectiveHi ? '60 शब्द' : '60 Words';
                if (q.marks === 10) return effectiveHi ? '200 शब्द' : '200 Words';
                if (q.marks === 3) return effectiveHi ? '10 शब्द' : '10 Words';
                if (q.marks === 5) return effectiveHi ? '50 शब्द' : '50 Words';
                if (q.marks === 11) return effectiveHi ? '200 शब्द' : '200 Words';
                return '';
              })();
              const limitStr = wordLimit ? ` · (${wordLimit})` : '';

              return effectiveHi
                ? `${examYear > 0 ? `PYQ ${examYear} · ` : ''}खंड ${q.part} · इकाई ${q.unitNumber} · प्रश्न ${q.questionNumber}${limitStr}`
                : `${examYear > 0 ? `PYQ ${examYear} · ` : ''}Part ${q.part} · U${q.unitNumber} · ${q.questionNumber}${limitStr}`;
            })()}
          </p>
          <p
            className={cn(
              'mt-1 text-[15px] font-bold leading-relaxed md:text-base whitespace-pre-line',
              effectiveHi ? 'font-[family-name:var(--font-pyq-dev)]' : 'font-[family-name:var(--font-pyq-serif)]',
              themeDeep ? 'text-slate-100' : 'text-slate-900'
            )}
          >
            {stemFor(q)}
          </p>
        </div>
      </div>

        {open && (
          <div>
              <div
              className={cn(
                'border-t px-2 py-4 sm:px-4',
                themeDeep ? 'border-white/10 bg-black/10' : 'border-black/[0.07] bg-slate-50/30'
              )}
            >
              {q.variants.length === 0 ? (
                <div className="py-8 text-center">
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide shadow-sm",
                    themeDeep
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                      : 'border-amber-300 bg-amber-50 text-amber-800'
                  )}>
                    🚀 {effectiveHi ? 'जल्द आ रहा है' : 'Coming Soon'}
                  </span>
                  <p
                    className={cn(
                      'mt-2 text-sm font-bold leading-relaxed',
                      themeDeep ? 'text-slate-400' : 'text-slate-600'
                    )}
                  >
                    {effectiveHi
                      ? 'एक्सपर्ट कंटेंट व मॉडल उत्तर तैयार किए जा रहे हैं।'
                      : 'Expert content & model answers are being prepared.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {q.variants
                    .sort((a, b) => a.slot - b.slot)
                    .map((v, vIdx) => {
                      const slotKey = v.slot === 2 ? 2 : 1;
                      const badgeClass = mainsSyllabusVariantBadge(hue, slotKey, themeDeep);
                      const styleSubtitle = styleLabelFor(v);

                      return (
                        <div
                          key={`${v.slot}-${vIdx}`}
                          className={cn(
                            'min-w-0',
                            vIdx > 0 &&
                              (themeDeep
                                ? 'relative mt-16 border-t border-white/20 pt-12 before:pointer-events-none before:absolute before:-top-8 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent'
                                : 'relative mt-16 border-t-2 border-black/[0.07] border-dashed pt-12 before:pointer-events-none before:absolute before:-top-8 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-slate-300/80 before:to-transparent')
                          )}
                        >
                          <div className="mb-4 flex flex-wrap items-center gap-2">
                            <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-black uppercase shadow-sm', badgeClass)}>
                              <Layers className="h-3.5 w-3.5 shrink-0" />
                              {v.slot === 1 
                                ? (effectiveHi ? 'आदर्श उत्तर (Variant 1)' : 'Model Answer (Variant 1)') 
                                : (effectiveHi ? `वैकल्पिक दृष्टिकोण (Variant ${v.slot})` : `Alternative Approach (Variant ${v.slot})`)}
                            </span>
                            {styleSubtitle ? (
                              <span
                                className={cn(
                                  'text-[11px] font-bold tracking-tight opacity-70',
                                  themeDeep ? 'text-slate-300' : 'text-slate-700',
                                  effectiveHi && 'font-[family-name:var(--font-pyq-dev)]'
                                )}
                              >
                                {styleSubtitle}
                              </span>
                            ) : null}
                          </div>

                          <div className="mb-4">
                            <PyqAnswerProse
                              text={answerFor(v)}
                              lang={v.answerEn && !effectiveHi ? 'en' : 'hi'}
                              theme={readingTheme}
                            />
                          </div>
                        </div>
                      );
                    })}

                  {hasInsights ? (
                    <div className="mt-10 mb-2 text-left">
                      <div className="flex justify-center mb-6">
                        <div className="relative inline-block">
                          <div
                            role="button"
                            onClick={() => {
                              // LOGIC: Expert Tips khulega NAHI agar:
                              // 1. Question officially locked hai (q.isLocked)
                              // YA 2. User free/guest hai aur ye 2-marker nahi hai (like 5, 7, 11)
                              const blockExpertTips = q.isLocked || (!vaultUnlocked && q.marks !== 2);

                              if (blockExpertTips) {
                                // Context-aware toast message
                                const msgHi = q.isLocked 
                                  ? "यह एक प्रीमियम फ़ीचर है। सब्सक्राइब करें 💎" 
                                  : "यह बड़े प्रश्नों के लिए एक प्रीमियम फ़ीचर है। सब्सक्राइब करें 💎";
                                  
                                const msgEn = q.isLocked
                                  ? "Premium feature. Subscribe to unlock 💎"
                                  : "Premium feature for long answers. Subscribe to unlock 💎";

                                toast(effectiveHi ? msgHi : msgEn, {
                                  style: { background: '#ecfdf5', color: '#064e3b', border: '1px solid #34d399' }
                                });
                                return;
                              }
                              
                              // Agar free user 2-marker click karta hai toh usko demo toast dikhao aur open karne do
                              if (!vaultUnlocked && !insightsOpen) {
                                toast(effectiveHi ? "प्रीमियम फ़ीचर का मुफ़्त डेमो 💎" : "Free preview of a premium feature 💎", {
                                  style: { background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0' },
                                  duration: 2000
                                });
                              }
                              
                              const scrollY = window.scrollY;
                              setInsightsOpen(!insightsOpen);
                              requestAnimationFrame(() => {
                                window.scrollTo(window.scrollX, scrollY);
                              });
                            }}
                            className={cn(
                              'inline-flex items-center gap-2 rounded-2xl border px-8 py-3 text-[13px] font-black uppercase tracking-wider shadow-xl active:scale-100 cursor-pointer',
                              insightsOpen
                                ? 'bg-slate-950 border-amber-500 text-amber-300 shadow-amber-500/30 ring-2 ring-amber-500/20'
                                : 'bg-slate-900 border-slate-800 border-amber-500/50 text-amber-400 shadow-black/60'
                            )}
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                          >
                            <Trophy className="h-4.5 w-4.5 shrink-0 text-amber-500" />
                            {effectiveHi ? 'एक्सपर्ट टिप्स' : 'Expert Tips'}
                          </div>
                          
                          {!vaultUnlocked && (
                            <div className="absolute -bottom-1.5 -right-1.5 bg-gradient-to-br from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700 rounded-full p-[3px] shadow-[0_2px_4px_rgba(16,185,129,0.5)] ring-[1.5px] ring-slate-900 z-10">
                              <Lock className="h-3 w-3 text-white dark:text-emerald-50 drop-shadow-sm" />
                            </div>
                          )}

                          {!insightsOpen && !q.isLocked && !!q.currentAffairsData && (
                            <motion.div
                              initial={{ opacity: 0, x: 15, y: 10, scale: 0.8 }}
                              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                              className="absolute left-[98%] top-[10px] w-[100px] h-[70px] pointer-events-none select-none z-30 ml-2"
                            >
                               {/* 💡 3D Pure CSS Text (No BG) */}
                              <div 
                                className="absolute left-[5px] sm:left-[15px] top-[-22px] sm:top-[-28px] whitespace-nowrap text-[12px] sm:text-[14px] font-black uppercase tracking-widest -rotate-6 z-10"
                                style={NEW_CA_TEXT_STYLE}
                              >
                                {effectiveHi ? 'यहाँ क्लिक करें ✨' : 'CLICK HERE ✨'}
                              </div>

                              {/* 🎨 Curvy Pink Onboarding Arrow sweeping UP from below with filled arrow head */}
                              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="filter drop-shadow-[0_3px_5px_rgba(236,72,153,0.5)] w-[50px] sm:w-[60px] absolute left-0 top-0">
                                <path
                                  d="M50 50C40 30 25 15 8 15"
                                  stroke="#ec4899"
                                  strokeWidth="5"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M 5,15 L 20,6 L 16,24 Z"
                                  fill="#ec4899"
                                  stroke="#ec4899"
                                  strokeWidth="2"
                                  strokeLinejoin="round"
                                />
                              </svg>

                              {/* 🚶‍♂️ Walking Man - Placed at the very bottom tail of the arrow */}
                              <div className="absolute left-[45px] sm:left-[55px] top-[30px] sm:top-[35px] text-[32px] sm:text-[36px] filter drop-shadow-md">
                                🚶‍♂️
                              </div>
                            </motion.div>
                          )}                        </div>
                      </div>
                      
                        {insightsOpen && (
                          <div className="w-full">
                                <PyqExpertInsightsRenderer
                                  insightsText={insightsText}
                                  currentAffairsData={q.currentAffairsData}
                                  themeDeep={themeDeep}
                                  hi={effectiveHi}
                                />
                          </div>
                        )}
                    </div>
                  ) : null}

                  <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-6">
                    <QuickFeedback 
                      questionId={q.id}
                      questionText={stemFor(q)}
                      source="mains_pyq"
                      className="mt-0"
                      unitInfo={`PYQ ${examYear} | Paper ${paperNumber} | Part ${q.part} | Unit ${q.unitNumber} | Q: ${q.questionNumber}`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
    </li>
  );
});

PyqQuestionRow.displayName = 'PyqQuestionRow';
