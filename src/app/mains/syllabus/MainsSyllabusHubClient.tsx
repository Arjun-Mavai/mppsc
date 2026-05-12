'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookMarked, BookOpen, Filter, Moon, Sparkles, SunMedium } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { MAIN_SYLLABUS_CARD_HUES, mainsSyllabusTileSkin } from '@/components/mains/mainsSyllabusTileSkin';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

const PAPER_MOJIS = ['📘', '📗', '📙', '📕'] as const;

type ReadingTheme = 'deep' | 'paper';

export function MainsSyllabusHubClient({
  papers,
  missing,
}: {
  papers: MainsSyllabusHubPaper[];
  missing: string | null;
}) {
  const { language } = useSettingsStore();
  const hi = language === 'hi';
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('deep');
  const themeDeep = readingTheme === 'deep';
  const [filterOpen, setFilterOpen] = useState(false);
  /** `__ALL__` = सभी; default hydrate to पहला पेपर via effect */
  const [paperScope, setPaperScope] = useState<string | '__ALL__'>('');

  useEffect(() => {
    if (papers.length === 0) return;
    setPaperScope((prev) => {
      if (prev === '__ALL__') return '__ALL__';
      if (prev && papers.some((x) => x.id === prev)) return prev;
      return papers[0]!.id;
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
    'relative min-h-screen w-screen max-w-[100vw] overflow-x-hidden px-2 pb-24 pt-5 sm:px-2.5 sm:pb-28 sm:pt-6',
    themeDeep ? 'text-slate-100' : 'bg-[#fafbfc] text-slate-900'
  );
  const blobClass = 'pointer-events-none absolute rounded-full blur-[100px] opacity-40';

  return (
    <div className={shell} style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
      {!themeDeep ? (
        <>
          <div className={`${blobClass} top-[-70px] right-[-100px] h-[400px] w-[400px] bg-pink-100`} />
          <div className={`${blobClass} top-[28%] left-[-90px] h-[360px] w-[360px] bg-emerald-100`} />
          <div className={`${blobClass} bottom-[8%] right-[8%] h-[300px] w-[300px] bg-amber-100`} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/90 to-transparent" />
        </>
      ) : null}

      <div className="relative mx-auto max-w-3xl px-1 sm:px-1.5">
        <Button
          variant="ghost"
          className={cn(
            'mb-6',
            themeDeep ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          )}
          asChild
        >
          <Link href="/mains">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {hi ? 'मेंस हब' : 'Mains hub'}
          </Link>
        </Button>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={cn(
                'mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-sm',
                themeDeep
                  ? 'border border-emerald-500/30 bg-emerald-950/40'
                  : 'border border-emerald-200 bg-emerald-50'
              )}
              aria-hidden
            >
              📚
            </div>
            <div className="min-w-0">
              <h1
                className={cn(
                  'text-[1.65rem] font-black tracking-tight md:text-[2rem]',
                  !themeDeep &&
                    'bg-gradient-to-r from-slate-900 via-emerald-800 to-slate-900 bg-clip-text text-transparent'
                )}
              >
                {hi ? 'MPPSC मेंस सिलेबस 🎯' : 'MPPSC Mains syllabus 🎯'}
              </h1>
              <p
                className={cn(
                  'mt-2 text-[15px] leading-relaxed md:text-base',
                  themeDeep ? 'text-slate-400' : 'text-slate-600'
                )}
              >
                {hi
                  ? 'पेपर चुनें — यूनिट ट्री व टॉपिक एक्सपर्ट कंटेंट (जहाँ जोड़ा गया हो)। भाषा स्विच से EN/HI देखें। फिल्टर बटन से पढ़ने का थीम और पेपर स्कोप। ✨'
                  : 'Pick a paper for units & topics — expert notes where published. Site language toggles HI/EN. Use the circular filter for reading theme & paper scope. ✨'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            className={cn(
              'mx-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 shadow-md transition-transform hover:-translate-y-0.5 active:scale-95 sm:mx-0',
              themeDeep
                ? filterOpen
                  ? 'border-emerald-400 bg-emerald-950/70 text-emerald-200'
                  : 'border-slate-600 bg-slate-900 text-slate-200 hover:border-emerald-500/50'
                : filterOpen
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300'
            )}
            aria-expanded={filterOpen}
            aria-label={hi ? 'फिल्टर व थीम' : 'Filters & reading theme'}
          >
            <Filter className="h-6 w-6" aria-hidden />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {filterOpen ? (
            <motion.div
              key="filters"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="mb-8 overflow-hidden"
            >
              <div
                className={cn(
                  'rounded-[2rem] border-2 p-5 sm:p-6',
                  themeDeep
                    ? 'border-slate-600 bg-slate-900/80 text-slate-100'
                    : 'border-slate-200 bg-white text-slate-900 shadow-md'
                )}
              >
                <p
                  className={cn(
                    'text-[10px] font-black uppercase tracking-[0.2em]',
                    themeDeep ? 'text-emerald-400' : 'text-emerald-700'
                  )}
                >
                  {hi ? 'दिखावट · पेपर' : 'View · Paper'}
                </p>
                <p
                  className={cn(
                    'mt-1 text-sm font-semibold leading-snug sm:text-[15px]',
                    themeDeep ? 'text-slate-400' : 'text-slate-600'
                  )}
                >
                  {hi
                    ? 'पढ़ने का हल्का/गहरा मोड यहीं से — बटन टेक्स्ट जितनी चौड़ाई, बेकार स्ट्रेच नहीं। नीचे डिफॉल्ट में पहला पेपर चुन रहता है; सभी देखने हों तो ड्रॉपडाउन से «सभी पेपर»।'
                    : 'Reading theme lives here — compact buttons, content-sized width (no stretched bar). Papers default to the first in your list; pick “All papers” to restore the full list.'}
                </p>

                <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-start">
                  <div className="flex flex-col gap-2 sm:min-w-0">
                    <span
                      className={cn(
                        'text-[10px] font-black uppercase tracking-widest',
                        themeDeep ? 'text-slate-500' : 'text-slate-500'
                      )}
                    >
                      {hi ? 'पठन थीम' : 'Reading theme'}
                    </span>
                    <div
                      role="group"
                      className={cn(
                        'inline-flex w-fit gap-1 rounded-xl border p-1',
                        themeDeep ? 'border-slate-600 bg-slate-950' : 'border-slate-200 bg-slate-50'
                      )}
                    >
                      <Button
                        type="button"
                        size="sm"
                        variant={!themeDeep ? 'default' : 'ghost'}
                        className={cn(
                          'h-9 rounded-lg px-3 font-black',
                          !themeDeep && 'bg-amber-500 text-slate-900 shadow-sm hover:bg-amber-400'
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
                          'h-9 rounded-lg px-3 font-black',
                          themeDeep && 'bg-slate-800 text-white hover:bg-slate-700'
                        )}
                        onClick={() => setReadingTheme('deep')}
                      >
                        <Moon className="mr-1.5 h-4 w-4 shrink-0" />
                        <span>{hi ? 'गहरा' : 'Dark'}</span>
                      </Button>
                    </div>
                  </div>

                  {papers.length > 0 ? (
                    <div className="min-w-0 flex-1 sm:max-w-md">
                      <label
                        className={cn(
                          'mb-2 block text-[10px] font-black uppercase tracking-[0.14em]',
                          themeDeep ? 'text-slate-500' : 'text-slate-500'
                        )}
                      >
                        {hi ? 'पेपर फ़ील्टर' : 'Paper filter'}
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
                          <span
                            className={cn(
                              'inline-block h-1.5 w-1.5 rounded-full ring-4',
                              themeDeep
                                ? 'bg-emerald-400 ring-emerald-500/25'
                                : 'bg-emerald-500 ring-emerald-200/70'
                            )}
                          />
                        </div>
                        <Select
                          value={paperSelectValue}
                          onValueChange={(v) => setPaperScope(v === '__ALL__' ? '__ALL__' : v)}
                        >
                          <SelectTrigger
                            className={cn(
                              'h-12 w-full rounded-2xl pl-10 text-sm font-bold shadow-sm ring-offset-0 focus:ring-0 sm:text-base md:min-w-[280px]',
                              themeDeep
                                ? 'border-slate-600 bg-slate-950/90 text-slate-100 [&_svg]:text-slate-400'
                                : 'border-slate-200 bg-white text-slate-800 [&_svg]:text-slate-500'
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
                                ? 'border border-slate-600 bg-slate-950 text-slate-100'
                                : 'border border-slate-200 bg-white text-slate-700'
                            )}
                          >
                            <SelectItem
                              value="__ALL__"
                              className={cn(
                                'cursor-pointer py-3 font-bold',
                                themeDeep ? 'focus:bg-slate-800' : 'focus:bg-emerald-50'
                              )}
                            >
                              {hi ? 'सभी पेपर' : 'All papers'}
                            </SelectItem>
                            {papers.map((p) => (
                              <SelectItem
                                key={p.id}
                                value={p.id}
                                textValue={`Paper ${p.paperNumber}`}
                                className={cn(
                                  'cursor-pointer py-3 font-bold',
                                  themeDeep ? 'focus:bg-slate-800' : 'focus:bg-emerald-50'
                                )}
                              >
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
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="mb-8">
          <Button
            type="button"
            className={cn(
              'h-auto w-full rounded-2xl border-2 py-4 font-black shadow-md transition-transform hover:-translate-y-0.5 sm:w-auto sm:min-w-[220px]',
              themeDeep
                ? 'border-violet-500/35 bg-gradient-to-br from-violet-950/80 to-slate-900 text-violet-50 hover:border-violet-400/50'
                : 'border-violet-200 bg-gradient-to-br from-violet-50 to-white text-violet-950 hover:border-violet-300'
            )}
            asChild
          >
            <Link href="/mains/syllabus/pyq-library" className="inline-flex items-center gap-3 px-6">
              <BookMarked className={cn('h-6 w-6 shrink-0', themeDeep ? 'text-violet-300' : 'text-violet-600')} />
              <span className="text-left text-sm leading-tight">
                <span className="block text-[10px] font-black uppercase tracking-widest opacity-80">
                  {hi ? 'पिछले वर्ष' : 'Previous years'}
                </span>
                <span className="text-base">{hi ? '📑 PYQ लाइब्रेरी · मॉडल उत्तर' : '📑 PYQ library · model answers'}</span>
              </span>
            </Link>
          </Button>
        </div>

        {missing ? (
          <div
            className={cn(
              'rounded-[2rem] border-2 p-6 sm:p-8',
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
        ) : papers.length === 0 ? (
          <div
            className={cn(
              'rounded-[2rem] border-2 p-8',
              themeDeep ? 'border-slate-700 bg-slate-900/60 text-slate-300' : 'border-slate-200 bg-white text-slate-600 shadow-sm'
            )}
          >
            <p className="font-bold">{hi ? 'अभी कोई पेपर नहीं 📝' : 'No papers yet 📝'}</p>
            <p className="mt-2 text-sm">
              <code className={themeDeep ? 'text-emerald-400' : 'text-emerald-700'}>npm run db:seed:mains</code>
              {hi ? ' — वैlid .env में DB के साथ।' : ' — with a valid `.env` database.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-3 pb-10">
            {visiblePapers.map((p, i) => {
              const orig = Math.max(0, papers.findIndex((x) => x.id === p.id));
              const hue = MAIN_SYLLABUS_CARD_HUES[orig % 4];
              const tileSkin = mainsSyllabusTileSkin(hue, themeDeep);
              const moji = PAPER_MOJIS[orig % 4];

              return (
                <li key={p.id}>
                  <Link
                    href={`/mains/syllabus/${p.id}`}
                    className={cn(
                      'flex items-center justify-between gap-4 overflow-hidden rounded-[2.25rem] px-5 py-4 transition-all duration-300 sm:rounded-[2.5rem] sm:py-5',
                      tileSkin.frame,
                      tileSkin.rowHover
                    )}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={cn(
                          'mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl shadow-inner',
                          themeDeep ? 'bg-black/30' : 'bg-white/80'
                        )}
                        aria-hidden
                      >
                        {moji}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            'truncate font-black',
                            hi ? 'font-[family-name:var(--font-pyq-dev)]' : 'font-[family-name:var(--font-pyq-serif)]',
                            themeDeep ? 'text-slate-50' : 'text-slate-900'
                          )}
                        >
                          {hi
                            ? `पेपर ${p.paperNumber}${p.titleHi ? `: ${p.titleHi}` : p.titleEn ? `: ${p.titleEn}` : ''}`
                            : `Paper ${p.paperNumber}${p.titleEn ? `: ${p.titleEn}` : ''}`}
                        </p>
                        {!hi && p.titleHi ? (
                          <p
                            className={cn(
                              'mt-0.5 truncate text-sm font-[family-name:var(--font-pyq-dev)] opacity-85',
                              themeDeep ? 'text-slate-400' : 'text-slate-600'
                            )}
                          >
                            {p.titleHi}
                          </p>
                        ) : hi && p.titleEn ? (
                          <p
                            className={cn(
                              'mt-0.5 truncate text-sm font-[family-name:var(--font-pyq-serif)] opacity-85',
                              themeDeep ? 'text-slate-400' : 'text-slate-600'
                            )}
                          >
                            {p.titleEn}
                          </p>
                        ) : null}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide',
                              themeDeep
                                ? 'border-white/15 bg-black/25 text-emerald-200'
                                : 'border-emerald-200/90 bg-emerald-50 text-emerald-900'
                            )}
                          >
                            <Sparkles className="h-3 w-3" />
                            {p.progress}% {hi ? 'तैयार' : 'ready'}
                          </span>
                          <span
                            className={cn(
                              'text-[11px] font-bold',
                              themeDeep ? 'text-slate-500' : 'text-slate-500'
                            )}
                          >
                            {p.publishedTopics}/{p.totalTopics} {hi ? 'टॉपिक · खोलने के लिए टैप' : 'topics · tap to open'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <BookOpen
                      className={cn(
                        'h-9 w-9 shrink-0 opacity-85',
                        themeDeep ? 'text-emerald-400' : 'text-emerald-600'
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
