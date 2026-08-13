'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Moon, Sparkles, SunMedium, Target, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MainsSyllabusStructure } from '@/components/mains/MainsSyllabusStructure';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type MainsSyllabusHubPaper = {
  id: string;
  paperNumber: number;
  titleEn: string | null;
  titleHi: string | null;
  totalTopics: number;
  publishedTopics: number;
  progress: number;
};

type ReadingTheme = 'deep' | 'paper';

/** 🎨 6 Distinct Papers Configuration matching /syllabus colors & distinct icons */
const PAPERS_CONFIG = [
  {
    paperNumber: 1,
    tag: 'PAPER 1',
    titleHi: 'प्रथम प्रश्न पत्र',
    titleEn: 'General Studies - I',
    subtitleHi: 'इतिहास + भूगोल',
    emoji: '📜',
    hue: 'pink',
    cardBgLight: 'bg-pink-50/90 hover:bg-pink-100/70 border-2 border-pink-200/90 hover:border-pink-300 shadow-sm shadow-pink-200/40',
    cardBgDark: 'bg-slate-900/90 border-2 border-pink-500/35 hover:border-pink-400/60 shadow-black/40',
    glow: 'bg-pink-400/30',
    tagClass: 'bg-pink-100/90 text-pink-900 border-pink-300/80',
    arrowClass: 'border-pink-300 bg-pink-100/90 text-pink-800 group-hover:bg-pink-600 group-hover:text-white',
    defaultTotalTopics: 25,
    defaultPublished: 24,
    defaultProgress: 98,
  },
  {
    paperNumber: 2,
    tag: 'PAPER 2',
    titleHi: 'द्वितीय प्रश्न पत्र',
    titleEn: 'General Studies - II',
    subtitleHi: 'राजनीति + समाजशास्त्र',
    emoji: '🏛️',
    hue: 'emerald',
    cardBgLight: 'bg-emerald-50/90 hover:bg-emerald-100/70 border-2 border-emerald-200/90 hover:border-emerald-300 shadow-sm shadow-emerald-200/40',
    cardBgDark: 'bg-slate-900/90 border-2 border-emerald-500/35 hover:border-emerald-400/60 shadow-black/40',
    glow: 'bg-emerald-400/30',
    tagClass: 'bg-emerald-100/90 text-emerald-900 border-emerald-300/80',
    arrowClass: 'border-emerald-300 bg-emerald-100/90 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white',
    defaultTotalTopics: 25,
    defaultPublished: 25,
    defaultProgress: 100,
  },
  {
    paperNumber: 3,
    tag: 'PAPER 3',
    titleHi: 'तृतीय प्रश्न पत्र',
    titleEn: 'General Studies - III',
    subtitleHi: 'अर्थशास्त्र + विज्ञान-तकनीकी',
    emoji: '🚀',
    hue: 'amber',
    cardBgLight: 'bg-amber-50/90 hover:bg-amber-100/70 border-2 border-amber-200/90 hover:border-amber-300 shadow-sm shadow-amber-200/40',
    cardBgDark: 'bg-slate-900/90 border-2 border-amber-500/35 hover:border-amber-400/60 shadow-black/40',
    glow: 'bg-amber-400/30',
    tagClass: 'bg-amber-100/90 text-amber-950 border-amber-300/80',
    arrowClass: 'border-amber-300 bg-amber-100/90 text-amber-900 group-hover:bg-amber-600 group-hover:text-white',
    defaultTotalTopics: 25,
    defaultPublished: 25,
    defaultProgress: 100,
  },
  {
    paperNumber: 4,
    tag: 'PAPER 4',
    titleHi: 'चतुर्थ प्रश्न पत्र',
    titleEn: 'General Studies - IV',
    subtitleHi: 'दर्शन / मनोविज्ञान / प्रबंधन',
    emoji: '🧠',
    hue: 'sky',
    cardBgLight: 'bg-sky-50/90 hover:bg-sky-100/70 border-2 border-sky-200/90 hover:border-sky-300 shadow-sm shadow-sky-200/40',
    cardBgDark: 'bg-slate-900/90 border-2 border-sky-500/35 hover:border-sky-400/60 shadow-black/40',
    glow: 'bg-sky-400/30',
    tagClass: 'bg-sky-100/90 text-sky-900 border-sky-300/80',
    arrowClass: 'border-sky-300 bg-sky-100/90 text-sky-800 group-hover:bg-sky-600 group-hover:text-white',
    defaultTotalTopics: 25,
    defaultPublished: 24,
    defaultProgress: 98,
  },
  {
    paperNumber: 5,
    tag: 'PAPER 5',
    titleHi: 'पंचम प्रश्न पत्र',
    titleEn: 'हिंदी भाषा',
    subtitleHi: 'सामान्य हिन्दी व व्याकरण',
    emoji: '✍️',
    hue: 'purple',
    cardBgLight: 'bg-violet-50/90 hover:bg-violet-100/70 border-2 border-violet-200/90 hover:border-violet-300 shadow-sm shadow-violet-200/40',
    cardBgDark: 'bg-slate-900/90 border-2 border-violet-500/35 hover:border-violet-400/60 shadow-black/40',
    glow: 'bg-violet-400/30',
    tagClass: 'bg-violet-100/90 text-violet-900 border-violet-300/80',
    arrowClass: 'border-violet-300 bg-violet-100/90 text-violet-800 group-hover:bg-violet-600 group-hover:text-white',
    defaultTotalTopics: 20,
    defaultPublished: 19,
    defaultProgress: 95,
  },
  {
    paperNumber: 6,
    tag: 'PAPER 6',
    titleHi: 'षष्ठम प्रश्न पत्र',
    titleEn: 'निबंध (Essay)',
    subtitleHi: 'निबंध व प्रारूप लेखन',
    emoji: '📝',
    hue: 'teal',
    cardBgLight: 'bg-teal-50/90 hover:bg-teal-100/70 border-2 border-teal-200/90 hover:border-teal-300 shadow-sm shadow-teal-200/40',
    cardBgDark: 'bg-slate-900/90 border-2 border-teal-500/35 hover:border-teal-400/60 shadow-black/40',
    glow: 'bg-teal-400/30',
    tagClass: 'bg-teal-100/90 text-teal-900 border-teal-300/80',
    arrowClass: 'border-teal-300 bg-teal-100/90 text-teal-800 group-hover:bg-teal-600 group-hover:text-white',
    defaultTotalTopics: 10,
    defaultPublished: 10,
    defaultProgress: 100,
  },
] as const;

export function MainsSyllabusHubClient({
  papers,
  missing,
  isAdmin = false,
}: {
  papers: MainsSyllabusHubPaper[];
  missing: string | null;
  isAdmin?: boolean;
}) {
  const { language } = useSettingsStore();
  const hi = language === 'hi';
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('paper');
  const themeDeep = readingTheme === 'deep';
  const [filterOpen, setFilterOpen] = useState(false);
  /** `__ALL__` = सभी; default hydrate to __ALL__ */
  const [paperScope, setPaperScope] = useState<string | '__ALL__'>('__ALL__');

  useEffect(() => {
    if (papers.length === 0) return;
    setPaperScope((prev) => {
      if (prev === '__ALL__') return '__ALL__';
      if (prev && papers.some((x) => x.id === prev)) return prev;
      return '__ALL__';
    });
  }, [papers]);

  const visiblePapers = useMemo(() => {
    if (!papers.length) return [];
    if (paperScope === '__ALL__') return papers;
    if (!paperScope) return papers;
    const one = papers.filter((p) => p.id === paperScope);
    return one.length ? one : papers;
  }, [papers, paperScope]);

  const paperSelectValue = paperScope === '__ALL__' ? '__ALL__' : paperScope || papers[0]?.id || '';

  const shell = cn(
    'relative min-h-screen w-screen max-w-[100vw] overflow-x-hidden px-3 pb-24 pt-4 sm:px-6 sm:pb-28 sm:pt-6 font-sans',
    themeDeep ? 'bg-slate-950 text-slate-100' : 'bg-[#fafbfc] text-slate-900'
  );
  const blobClass = 'pointer-events-none absolute rounded-full blur-[100px] opacity-40';

  return (
    <div className={shell} style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
      {!themeDeep ? (
        <>
          <div className={`${blobClass} top-[-70px] right-[-100px] h-[400px] w-[400px] bg-pink-100/60`} />
          <div className={`${blobClass} top-[28%] left-[-90px] h-[360px] w-[360px] bg-emerald-100/60`} />
          <div className={`${blobClass} bottom-[8%] right-[8%] h-[300px] w-[300px] bg-amber-100/60`} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/90 to-transparent" />
        </>
      ) : null}

      <div className="relative mx-auto max-w-7xl px-1 sm:px-4">
        {/* Navigation controls */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            className={cn(
              'h-9 px-3 font-bold',
              themeDeep ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            )}
            asChild
          >
            <Link href="/mains">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {hi ? 'मेंस हब' : 'Mains hub'}
            </Link>
          </Button>

          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 shadow-xs transition-transform hover:-translate-y-0.5 active:scale-95',
              themeDeep
                ? filterOpen
                  ? 'border-amber-400 bg-amber-950/60 text-amber-300 shadow-md shadow-amber-500/15'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-amber-500/50 hover:text-amber-300'
                : filterOpen
                  ? 'border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-400 hover:bg-amber-100/50'
            )}
            aria-expanded={filterOpen}
            aria-label={hi ? 'फिल्टर व थीम' : 'Filters & reading theme'}
          >
            <Target className="h-[18px] w-[18px]" aria-hidden />
          </button>
        </div>

        {/* 📱 Mobile Compact Header Banner */}
        <div className="flex md:hidden items-center justify-between w-full pb-4">
          <div className="flex flex-col">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[9px] font-black tracking-widest text-emerald-700 uppercase w-fit mb-1 shadow-2xs">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </span>
              MPPSC MAINS 2027
            </div>
            
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
              {hi ? (
                <>
                  MPPSC मेंस सिलेबस 🎯
                </>
              ) : (
                <>
                  MPPSC Mains Syllabus 🎯
                </>
              )}
            </h1>
          </div>
        </div>

        {/* 💻 Desktop Header Title */}
        <div className="hidden md:flex mb-8 items-start gap-4">
          <div
            className={cn(
              'mt-1 flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-sm border',
              themeDeep
                ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                : 'border-emerald-200 bg-emerald-50/80 text-emerald-700'
            )}
            aria-hidden
          >
            📚
          </div>
          <div className="min-w-0 flex-1">
            <h1
              className={cn(
                'text-[2rem] font-black tracking-tight lg:text-[2.5rem]',
                themeDeep ? 'text-slate-50' : 'text-slate-900'
              )}
            >
              {hi ? 'MPPSC मेंस सिलेबस 🎯' : 'MPPSC Mains syllabus 🎯'}
            </h1>
            <p className={cn("text-sm font-semibold mt-1", themeDeep ? "text-slate-400" : "text-slate-500")}>
              {hi ? 'सभी 6 प्रश्न पत्रों का विस्तृत सिलेबस व अध्ययन सामग्री' : 'Comprehensive syllabus & study materials for all 6 papers'}
            </p>
          </div>
        </div>

        {/* Filters & Theme Drawer */}
        <AnimatePresence initial={false}>
          {filterOpen ? (
            <motion.div
              key="filters"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="mb-6 overflow-hidden"
            >
              <div
                className={cn(
                  'rounded-[2rem] border-2 p-5 sm:p-6 transition-all duration-300 shadow-xl space-y-5',
                  themeDeep
                    ? 'border-slate-700 bg-slate-900/60 backdrop-blur-md shadow-black/40 text-slate-100'
                    : 'border-slate-200/80 bg-white/95 backdrop-blur-md shadow-slate-200/60 text-slate-900'
                )}
              >
                {/* 1. PAPER FILTER */}
                {papers.length > 0 ? (
                  <div>
                    <label
                      className={cn(
                        'mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider',
                        themeDeep ? 'text-emerald-400' : 'text-emerald-600'
                      )}
                    >
                      <span>🎯</span>
                      <span>{hi ? 'पेपर फ़ील्टर (Select Paper Scope)' : 'Paper Filter Scope'}</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
                        <span
                          className={cn(
                            'inline-block h-2 w-2 rounded-full animate-pulse ring-4',
                            themeDeep
                              ? 'bg-emerald-400 ring-emerald-500/25 shadow-[0_0_12px_rgba(52,211,153,0.6)]'
                              : 'bg-emerald-600 ring-emerald-200/70 shadow-[0_0_10px_rgba(5,150,105,0.4)]'
                          )}
                        />
                      </div>
                      <Select
                        value={paperSelectValue}
                        onValueChange={(v) => setPaperScope(v === '__ALL__' ? '__ALL__' : v)}
                      >
                        <SelectTrigger
                          className={cn(
                            'h-13 w-full rounded-2xl pl-10 pr-4 text-base font-black shadow-md ring-offset-0 focus:ring-0 md:min-w-[280px]',
                            themeDeep
                              ? 'border-slate-700 bg-slate-950 text-slate-100 hover:border-emerald-500/50 [&_svg]:text-slate-400'
                              : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-500/40 [&_svg]:text-slate-500'
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          sideOffset={6}
                          className={cn(
                            'z-[200] rounded-2xl shadow-2xl',
                            themeDeep
                              ? 'border border-slate-700 bg-slate-950 text-slate-100'
                              : 'border border-slate-200 bg-white text-slate-800'
                          )}
                        >
                          <SelectItem
                            value="__ALL__"
                            className={cn(
                              'cursor-pointer py-3.5 px-4 font-black text-sm rounded-xl mx-1 my-0.5',
                              themeDeep ? 'focus:bg-slate-800 focus:text-white' : 'focus:bg-emerald-50 focus:text-emerald-950'
                            )}
                          >
                            <span>🌐</span> {hi ? 'सभी 6 पेपर्स (All Papers)' : 'All 6 Papers'}
                          </SelectItem>
                          {papers.map((p) => (
                            <SelectItem
                              key={p.id}
                              value={p.id}
                              textValue={`Paper ${p.paperNumber}`}
                              className={cn(
                                'cursor-pointer py-3.5 px-4 font-bold text-sm rounded-xl mx-1 my-0.5',
                                themeDeep ? 'focus:bg-slate-800 focus:text-white' : 'focus:bg-emerald-50 focus:text-emerald-950'
                              )}
                            >
                              <span className="flex items-center gap-2">
                                <span className="text-emerald-500">▪</span>
                                {hi ? (
                                  <>
                                    पेपर {p.paperNumber}
                                    {p.titleHi ? ` · ${p.titleHi}` : p.titleEn ? ` · ${p.titleEn}` : ''}
                                  </>
                                ) : (
                                  <>
                                    Paper {p.paperNumber}
                                    {p.titleEn ? ` · ${p.titleEn}` : ''}
                                  </>
                                )}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : null}

                {/* 2. THEME SWITCHER */}
                <div
                  className={cn(
                    'flex items-center justify-between gap-3 border-t pt-4',
                    themeDeep ? 'border-slate-800' : 'border-slate-100'
                  )}
                >
                  <span
                    className={cn(
                      'text-xs font-extrabold uppercase tracking-wider',
                      themeDeep ? 'text-slate-400' : 'text-slate-500'
                    )}
                  >
                    {hi ? 'पठन थीम (Theme)' : 'Reading Theme'}
                  </span>
                  <div
                    className={cn(
                      'flex items-center gap-1.5 rounded-2xl border p-1.5',
                      themeDeep ? 'border-slate-700 bg-slate-950/80' : 'border-slate-200 bg-slate-100/80 shadow-inner'
                    )}
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant={!themeDeep ? 'default' : 'ghost'}
                      className={cn(
                        'rounded-xl font-black px-4 py-2 h-9 transition-all active:scale-95',
                        !themeDeep ? 'bg-amber-500 text-slate-950 shadow-md hover:bg-amber-400' : 'text-slate-400 hover:text-slate-200'
                      )}
                      onClick={() => setReadingTheme('paper')}
                    >
                      <SunMedium className="mr-1.5 h-4 w-4 shrink-0" />
                      <span>{hi ? 'हल्का' : 'Light'}</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={themeDeep ? 'default' : 'ghost'}
                      className={cn(
                        'rounded-xl font-black px-4 py-2 h-9 transition-all active:scale-95',
                        themeDeep ? 'bg-slate-800 text-white shadow-md border border-slate-700 hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900'
                      )}
                      onClick={() => setReadingTheme('deep')}
                    >
                      <Moon className="mr-1.5 h-4 w-4 shrink-0" />
                      <span>{hi ? 'गहरा' : 'Dark'}</span>
                    </Button>
                  </div>
                </div>

                {/* 3. DESCRIPTIVE TEXT */}
                <div
                  className={cn(
                    'rounded-2xl p-4 border transition-colors',
                    themeDeep ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-50/80 border-slate-100 text-slate-600'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <SlidersHorizontal className={cn("h-4 w-4 mt-0.5 shrink-0", themeDeep ? "text-amber-500" : "text-amber-600")} />
                    <div className="space-y-1 text-xs leading-relaxed font-semibold">
                      <p>{hi ? 'दिखावट · पेपर (View & Scope)' : 'View & Scope'}</p>
                      <p className="font-normal opacity-90">
                        {hi
                          ? 'पेपर चुनें — यूनिट ट्री व टॉपिक एक्सपर्ट कंटेंट। फिल्टर बटन से पढ़ने का थीम और पेपर स्कोप बदलें। ✨'
                          : 'Pick a paper for units & topics — expert notes where published. Use the filter for reading theme & paper scope. ✨'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <MainsSyllabusStructure hi={hi} />

        {/* 📚 MAIN PAPER CARDS BENTO GRID ("सभी प्रश्न पत्र ÷-") */}
        {missing ? (
          <div
            className={cn(
              'rounded-[2rem] border-2 p-6 sm:p-8 mb-10',
              themeDeep
                ? 'border-amber-500/35 bg-gradient-to-br from-amber-950/50 to-slate-900/90 text-amber-50'
                : 'border-amber-200 bg-gradient-to-br from-amber-50 to-white text-amber-950 shadow-sm shadow-amber-200/30'
            )}
          >
            <p className="mb-2 flex items-center gap-2 font-black">
              <span aria-hidden>⚠️</span>
              {hi ? 'अभी टेबल नहीं बने' : 'Mains tables not on this DB yet'}
            </p>
            <p className="mb-4 whitespace-pre-wrap text-sm font-medium opacity-95">{missing}</p>
            <p className={cn('text-xs', themeDeep ? 'text-slate-400' : 'text-slate-600')}>
              {hi ? 'लोकल फिक्स:' : 'Local quick fix:'}{' '}
              <code
                className={cn(
                  'rounded px-1 py-0.5 font-mono text-[11px]',
                  themeDeep ? 'bg-black/35 text-emerald-300' : 'bg-white text-emerald-800'
                )}
              >
                npm run db:apply:mains
              </code>{' '}
              →{' '}
              <code
                className={cn(
                  'rounded px-1 py-0.5 font-mono text-[11px]',
                  themeDeep ? 'bg-black/35 text-emerald-300' : 'bg-white text-emerald-800'
                )}
              >
                npm run db:seed:mains
              </code>
            </p>
          </div>
        ) : (
          <div className="mb-12 space-y-5">
            {/* Header Title for Grid */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-100/80 text-lg dark:bg-amber-950/60 shadow-2xs border border-amber-200/60 dark:border-amber-800/40">
                  📓
                </div>
                <h2 className={cn("text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2", themeDeep ? "text-white" : "text-slate-900")}>
                  {hi ? 'सभी प्रश्न पत्र' : 'All Question Papers'}
                  <span className="text-sky-500 font-mono text-base font-normal tracking-tighter">÷-</span>
                </h2>
              </div>
            </div>

            {/* 📱 2-Column Bento Grid on Mobile & 3-Column Bento Grid on Desktop */}
            <div className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
              {PAPERS_CONFIG.map((cfg, index) => {
                const matchingDb = papers.find((x) => x.paperNumber === cfg.paperNumber);

                if (paperScope && paperScope !== '__ALL__' && matchingDb?.id !== paperScope) {
                  return null;
                }

                // Calculate topics & progress
                const totalTopics = matchingDb && matchingDb.totalTopics > 0 
                  ? matchingDb.totalTopics 
                  : cfg.defaultTotalTopics;
                  
                const publishedTopics = matchingDb && matchingDb.totalTopics > 0 
                  ? matchingDb.publishedTopics 
                  : (matchingDb ? Math.round((matchingDb.progress / 100) * totalTopics) : cfg.defaultPublished);
                  
                const progress = matchingDb 
                  ? (matchingDb.totalTopics > 0 
                      ? matchingDb.progress 
                      : Math.min(100, Math.round((publishedTopics / totalTopics) * 100)))
                  : cfg.defaultProgress;

                const targetHref = matchingDb ? `/mains/syllabus/${matchingDb.id}` : `/mains/syllabus`;

                return (
                  <motion.div
                    key={`paper-card-${cfg.paperNumber}`}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22, delay: index * 0.04 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={targetHref}
                      className={cn(
                        'group relative flex h-[200px] sm:h-[225px] flex-col justify-between p-4 sm:p-5 rounded-[2rem] backdrop-blur-md overflow-hidden transition-all duration-300 hover:-translate-y-1 active:scale-98 cursor-pointer',
                        !themeDeep ? cfg.cardBgLight : cfg.cardBgDark
                      )}
                    >
                      {/* Top Row: Paper Badge + Arrow Circle */}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className={cn(
                          'px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-widest uppercase shadow-2xs backdrop-blur-sm border',
                          !themeDeep ? cfg.tagClass : 'bg-slate-950/70 border-slate-700 text-slate-300'
                        )}>
                          {cfg.tag}
                        </span>

                        <div className={cn(
                          'h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center border shadow-2xs transition-all duration-300 group-hover:scale-110 group-hover:translate-x-0.5',
                          !themeDeep ? cfg.arrowClass : 'border-slate-700 bg-slate-950/80 text-slate-300 group-hover:bg-slate-800'
                        )}>
                          <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </div>
                      </div>

                      {/* Center: Distinct Emoji per Paper with Radial Glow Backdrop (exact match to /syllabus) */}
                      <div className="relative flex-1 flex items-center justify-center -mt-2 -mb-1">
                        <div className={cn("absolute h-13 w-13 sm:h-16 sm:w-16 rounded-full blur-xl opacity-60", cfg.glow)} />
                        <span className="text-4xl sm:text-5xl drop-shadow-md transform transition-transform duration-300 group-hover:scale-110 select-none relative z-10">
                          {cfg.emoji}
                        </span>
                      </div>

                      {/* Footer Details: Titles + Progress bar + Topics count */}
                      <div className="relative z-10 space-y-1.5 mt-1">
                        <div>
                          <h3 className={cn(
                            'line-clamp-1 text-xs sm:text-base font-black tracking-tight leading-snug font-[family-name:var(--font-pyq-dev)]',
                            themeDeep ? 'text-slate-50' : 'text-slate-900'
                          )}>
                            {hi ? cfg.titleHi : `Paper ${cfg.paperNumber}`}
                          </h3>
                          <p className={cn(
                            'line-clamp-1 text-[10px] sm:text-xs font-semibold',
                            themeDeep ? 'text-slate-400' : 'text-slate-500'
                          )}>
                            {cfg.titleEn}
                          </p>
                        </div>

                        {/* Progress Bar & Stats */}
                        <div className="space-y-1 pt-0.5">
                          <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-black tracking-tight">
                            <span className={cn("font-bold", themeDeep ? "text-emerald-400" : "text-emerald-700")}>
                              {progress}% {hi ? 'तैयार' : 'ready'}
                            </span>
                            <span className={cn("font-extrabold", themeDeep ? "text-slate-400" : "text-slate-500")}>
                              {publishedTopics} / {totalTopics} {hi ? 'टॉपिक्स' : 'topics'}
                            </span>
                          </div>

                          <div className={cn(
                            'h-1.5 sm:h-2 w-full overflow-hidden rounded-full p-0.5',
                            themeDeep ? 'bg-slate-800' : 'bg-slate-200/70'
                          )}>
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all duration-500 shadow-2xs"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Banner to Mains PYQ Library */}
        <div className="mb-10">
          <Link
            href="/mains/syllabus/pyq-library"
            className={cn(
              'group relative flex flex-col overflow-hidden rounded-[2.25rem] px-5 py-6 transition-all duration-500 sm:rounded-[3rem] sm:p-10 interactive-tile shadow-lg',
              themeDeep 
                ? 'bg-gradient-to-br from-sky-950/80 via-slate-900 to-slate-950 border-2 border-sky-900/50 hover:border-sky-700 shadow-black/50' 
                : 'bg-gradient-to-br from-sky-50 via-white to-sky-50/50 border-2 border-sky-100 hover:border-sky-300 shadow-sky-100/50 hover:shadow-sky-200/50'
            )}
          >
            {/* Background embellishments */}
            <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl transition-transform duration-700 group-hover:scale-125" />
            <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl transition-transform duration-700 group-hover:scale-125" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center">
               <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3.5 py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 w-fit">
                    <Sparkles className="h-3.5 w-3.5" />
                    {hi ? 'नया स्मार्ट अनुभव ✨' : 'New Smart Experience ✨'}
                  </div>
                  
                  <h3 className={cn(
                    'text-2xl sm:text-4xl font-black tracking-tight leading-tight',
                    themeDeep ? 'text-white' : 'text-slate-900'
                  )}>
                    {hi ? 'MPPSC मेंस PYQ लाइब्रेरी' : 'MPPSC Mains PYQ Library'}
                  </h3>
                  
                  <p className={cn(
                    'text-xs sm:text-base font-semibold leading-relaxed max-w-xl',
                    themeDeep ? 'text-sky-200/90' : 'text-slate-600'
                  )}>
                    {hi 
                      ? 'पूरा सिलेबस और पिछले वर्षों के पेपर्स अब आपकी उंगलियों पर। एक "Bird Eye View" में स्मार्ट फ़िल्टर्स के साथ इमर्सिव रीडिंग का अनुभव लें।' 
                      : 'The entire syllabus and past papers at your fingertips. Practice with smart filters in a seamless bird\'s eye view.'}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider", themeDeep ? "border-slate-700 bg-slate-800 text-slate-300" : "border-slate-200 bg-white text-slate-600")}>🎯 {hi ? 'वर्ष व पेपर' : 'Year & Paper'}</span>
                    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider", themeDeep ? "border-slate-700 bg-slate-800 text-slate-300" : "border-slate-200 bg-white text-slate-600")}>📑 {hi ? 'खंड व विषय' : 'Parts & Topics'}</span>
                    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider", themeDeep ? "border-slate-700 bg-slate-800 text-slate-300" : "border-slate-200 bg-white text-slate-600")}>✍️ {hi ? 'मार्क्स फ़िल्टर' : 'Marks Filter'}</span>
                  </div>
               </div>

               <div className="flex md:justify-end">
                 <div className={cn(
                   "h-12 w-12 sm:h-20 sm:w-20 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-xl border-4",
                   themeDeep ? "bg-sky-500/20 text-sky-400 border-sky-900" : "bg-sky-100 text-sky-600 border-white"
                 )}>
                   <ArrowRight className="h-5 w-5 sm:h-8 sm:w-8" />
                 </div>
               </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
