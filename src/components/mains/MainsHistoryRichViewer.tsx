'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainsMarkdownBody } from '@/components/mains/MainsMarkdownBody';
import { PyqAnswerProse, PyqMarksBandChip } from '@/components/mains/PyqAnswerProse';
import { useMainsReaderProseTheme } from '@/components/mains/useMainsReaderTheme';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { coerceMarkdownBulletsLoose } from '@/lib/mains-readable-coerce';
import { MAINS_HISTORY_RICH_VERSION, pickInterlinkingMarkdown, pickVariantStem, extractModelAnswers } from '@/lib/mains-history-rich-normalize';
import { CheckCircle, BookOpen, Filter, Network, Brain, Palette, AlertTriangle, Sparkles, FileText, ChevronDown, Zap, Compass, Trophy, LineChart } from 'lucide-react';
import { MainsKeyTermsFlash } from '@/components/mains/MainsKeyTermsFlash';

function parseBoldInline(text: string) {
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-extrabold text-amber-700 dark:text-amber-400">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function bulletizeMemoryHook(raw: string): string {
  if (!raw.trim()) return '';
  if (/^[-*+]\s+/m.test(raw)) return raw;

  const parts = raw.split(/[;|]/g).map(p => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    return parts.map(p => `- ${p}`).join('\n');
  }

  const commaParts = raw.split(/,\s+/g).map(p => p.trim()).filter(Boolean);
  if (commaParts.length > 2 || (commaParts.length > 1 && /^[A-Z0-9\u0900-\u097F]\s*[-–—]/i.test(raw))) {
    return commaParts.map(p => `- ${p}`).join('\n');
  }

  const sentenceParts = raw.split(/(?<=\w[a-z\u0900-\u097F]{2,})\.\s+/g).map(p => p.trim()).filter(Boolean);
  if (sentenceParts.length > 1) {
    return sentenceParts.map(p => `- ${p}`).join('\n');
  }

  return raw;
}

type ModelBand = '2m' | '7m' | '10m' | '11m' | 'case18';

function marksForBand(b: ModelBand): number {
  if (b === '2m') return 2;
  if (b === '7m') return 7;
  if (b === '10m') return 10;
  if (b === '11m') return 11;
  return 18;
}

const BAND_META: Record<
  ModelBand,
  { hi: string; en: string; emoji: string }
> = {
  '2m': { hi: '२ अंक', en: '2 marks', emoji: '⚡' },
  '7m': { hi: '७ अंक', en: '7 marks', emoji: '🎯' },
  '10m': { hi: '१० अंक', en: '10 marks', emoji: '📌' },
  '11m': { hi: '११ अंक', en: '11 marks', emoji: '📌' },
  case18: { hi: 'केस १८', en: 'Case 18', emoji: '⚖️' },
};

function pick(payload: Record<string, unknown>, key: string, hi: boolean): string {
  const s = hi ? '_hi' : '_en';
  const val = String(payload[`${key}${s}`] ?? '').trim();
  if (!hi && !val) {
    return String(payload[`${key}_hi`] ?? '').trim();
  }
  return val;
}

function readDynamicDims(payload: Record<string, unknown>, hi: boolean) {
  const s = hi ? '_hi' : '_en';
  let raw = payload[`dynamic_dimensions${s}`];
  if (!hi && (!Array.isArray(raw) || raw.length === 0)) {
    raw = payload[`dynamic_dimensions_hi`];
  }
  if (!Array.isArray(raw)) return [];
  return raw.filter((x) => x && typeof x === 'object') as Record<string, unknown>[];
}

function models(payload: Record<string, unknown>, lang: 'hi' | 'en') {
  return extractModelAnswers(payload, lang);
}

export function MainsHistoryRichViewer({
  topicTitleHi,
  topicTitleEn,
  payload,
  uiLang,
}: {
  topicTitleHi: string;
  topicTitleEn: string;
  payload: Record<string, unknown>;
  uiLang: 'hi' | 'en';
}) {
  const hi = uiLang === 'hi';
  const proseTheme = useMainsReaderProseTheme();
  const [modelLang, setModelLang] = useState<'hi' | 'en'>(uiLang === 'hi' ? 'hi' : 'en');
  const [topicMetaOpen, setTopicMetaOpen] = useState(false);

  const title = hi ? topicTitleHi : topicTitleEn;

  useEffect(() => {
    setModelLang(uiLang === 'hi' ? 'hi' : 'en');
  }, [uiLang]);

  const pyqMd = useMemo(() => {
    const raw = pick(payload, 'pyq_trend_analysis', hi).trim();
    if (!raw) return '';
    const coerced = coerceMarkdownBulletsLoose(raw);
    if (!/^#{1,3}\s/m.test(coerced)) {
      return `## ${hi ? 'ट्रेंड · मांग · कोण' : 'Trend · demand · angle'}\n${coerced}`;
    }
    return coerced;
  }, [payload, hi]);

  const syllabusMd = useMemo(() => {
    const graspRaw = pick(payload, 'syllabus_grasp', hi);
    const grasp = graspRaw ? graspRaw.replace(/([^\n])\s+(?=(?:\(\d+\)|\d+\.)\s)/g, '$1\n\n') : '';
    const cognitive = pick(payload, 'cognitive_intro', hi);
    if (!grasp && !cognitive) return '';
    if (grasp && cognitive) {
      return `${coerceMarkdownBulletsLoose(grasp)}\n\n### ${hi ? 'संक्षिप्त खुलासा' : 'Quick lens'}\n${coerceMarkdownBulletsLoose(cognitive)}`;
    }
    if (grasp) return `${coerceMarkdownBulletsLoose(grasp)}`;
    return `${coerceMarkdownBulletsLoose(cognitive)}`;
  }, [payload, hi]);

  const dimensionBlocks = useMemo(() => readDynamicDims(payload, hi), [payload, hi]);
  const ma = useMemo(() => models(payload, modelLang), [payload, modelLang]);

  const ver = String(payload.schema_version ?? '');

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-amber-950/20">
      <header className="shrink-0 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex items-center gap-2 px-3 py-2 sm:px-4">
          <span className="hidden shrink-0 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 sm:inline">
            {hi ? 'सिलेबस' : 'Topic'}
          </span>
          <h1 className="min-w-0 flex-1 truncate text-[13px] font-bold leading-tight text-slate-900 dark:text-slate-100 sm:text-sm">
            {title}
          </h1>
          <button
            type="button"
            onClick={() => setTopicMetaOpen((x) => !x)}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 shadow-sm transition-colors',
              topicMetaOpen
                ? 'border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-950/70 dark:text-violet-200'
                : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500'
            )}
            aria-expanded={topicMetaOpen}
            aria-label={hi ? 'शीर्षक व विवरण' : 'Title & overview'}
          >
            <Filter className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <AnimatePresence initial={false}>
          {topicMetaOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t border-slate-100 dark:border-slate-800"
            >
              <div className="space-y-2 px-3 py-3 sm:px-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-amber-600 font-black text-white">📜 Mains · Expert</Badge>
                  {ver === MAINS_HISTORY_RICH_VERSION ? (
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {ver}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-balance text-lg font-black leading-snug text-slate-900 dark:text-white sm:text-xl">
                  {title}
                </p>
                {/* <p className="max-w-2xl text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {hi
                    ? 'शुरू से सिलेबस समझ, फिर ट्रेंड, फिर नीचे मॉडल उत्तर।  मॉडल लाइट पृष्ठभूमि पर पढ़ने के लिए। प्रश्न जब JSON में stem हो।'
                    : 'Flow: syllabus grasp, then trends, then model answers below. Models stay on a light sheet for readability. Question stems when JSON includes stem.'}
                </p> */}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <div className="custom-scrollbar flex-1 overflow-y-auto px-2 py-4 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-4xl space-y-10 pb-36">
          {/* Syllabus grasp first */}
          {syllabusMd ? (
            <details
              open
              className="group rounded-2xl border-2 border-amber-400/80 bg-slate-900 p-4 sm:p-6 shadow-xl ring-2 ring-amber-400/20 transition-all dark:border-amber-500/50 dark:bg-[#0b1329] hover:border-amber-400 hover:ring-amber-400/40"
            >
              <summary className="mb-5 flex cursor-pointer select-none items-center justify-between border-b border-amber-400/30 pb-4 outline-none marker:content-none">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-950/80 text-amber-400 shadow-inner ring-1 ring-amber-500/50">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-amber-300 dark:text-amber-400 sm:text-2xl">
                    {hi ? '📘 सिलेबस डिकोडिंग व रणनीति' : '📘 Syllabus Decoding & Strategy'}
                    <span className="ml-2 hidden text-sm font-semibold tracking-wide text-amber-400/80 sm:inline-block">
                      — {hi ? 'यह टॉपिक क्या-क्या कहता है' : 'what this topic is asking'}
                    </span>
                  </h2>
                </div>
                <ChevronDown className="h-6 w-6 shrink-0 text-amber-400 transition-transform group-open:rotate-180" />
              </summary>
              <motion.div layout className="text-slate-100">
                <MainsMarkdownBody
                  markdown={syllabusMd}
                  isHindi={hi}
                  strongClassName="text-amber-300 dark:text-amber-300 tracking-wider font-extrabold"
                  itemClassName="border-amber-500/30 bg-slate-950/80 dark:border-amber-500/25 dark:bg-slate-950/90 text-slate-100 shadow-inner"
                  bulletClassName="bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)] ring-amber-400/20"
                  bodyTextClassName="text-slate-100 dark:text-slate-100"
                />
              </motion.div>
            </details>
          ) : null}

          {/* PYQ / examiner demand */}
          <details className="group rounded-2xl border-2 border-pink-200 bg-pink-50/5 p-4 sm:p-6 shadow-sm dark:border-pink-500/20 dark:bg-[#1a0e1c] transition-all hover:border-pink-400/60">
            <summary className="mb-4 flex cursor-pointer select-none items-center justify-between outline-none marker:content-none pb-4 border-b border-pink-200/50 dark:border-pink-500/20 text-pink-900 dark:text-pink-200">
              <div className="flex items-center gap-2">
                <LineChart className="h-5 w-5 shrink-0 text-pink-500" />
                <h2 className="text-lg font-black sm:text-xl">{hi ? '📈 PYQ ट्रेंड व मांग डिकोडर' : '📈 PYQ Trend & Demand Decoder'}</h2>
              </div>
              <ChevronDown className="h-5 w-5 shrink-0 text-pink-400 transition-transform group-open:rotate-180" />
            </summary>
            {pyqMd ? (
              <div className="text-slate-800 dark:text-slate-100">
                <MainsMarkdownBody
                  markdown={pyqMd}
                  isHindi={hi}
                  itemClassName="border-pink-200 bg-white/70 dark:border-pink-900/40 dark:bg-pink-950/20"
                  bulletClassName="bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.4)] ring-pink-500/15"
                />
              </div>
            ) : (
              <p className="text-base text-pink-800/90 dark:text-pink-200/90">{hi ? '(खाली)' : '(empty)'}</p>
            )}
          </details>

          {/* Analogy + Source */}
          <details className="group rounded-2xl border-2 border-sky-200 bg-sky-50/5 p-4 sm:p-6 shadow-sm dark:border-sky-500/20 dark:bg-[#0c1626] transition-all hover:border-sky-400/60">
            <summary className="mb-4 flex cursor-pointer select-none items-center justify-between outline-none marker:content-none pb-4 border-b border-sky-200/50 dark:border-sky-500/20 text-sky-900 dark:text-sky-200">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 shrink-0 text-sky-500" />
                <h2 className="text-lg font-black sm:text-xl">{hi ? '🔍 व्यावहारिक उदाहरण एवं प्रामाणिक संदर्भ' : '🔍 Conceptual Analogies & Scholarly Sources'}</h2>
              </div>
              <ChevronDown className="h-6 w-6 shrink-0 text-sky-400 transition-transform group-open:rotate-180 text-sky-400" />
            </summary>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border-2 border-sky-200 bg-sky-50/70 p-4 sm:p-5 dark:border-sky-900/50 dark:bg-sky-950/30">
                <p className="mb-2 text-sm font-black uppercase tracking-widest text-sky-900 dark:text-sky-300">
                  🏪 {hi ? 'व्यावहारिक सादृश्य एवं वास्तविक उदाहरण' : 'Real-World Analogy & Practical Context'}
                </p>
                <MainsMarkdownBody
                  markdown={coerceMarkdownBulletsLoose(pick(payload, 'desi_analogy', hi))}
                  isHindi={hi}
                  itemClassName="border-sky-200 bg-white/70 dark:border-sky-900/40 dark:bg-sky-950/20"
                  bulletClassName="bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.4)] ring-sky-500/15"
                />
              </div>
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 sm:p-5 dark:border-amber-800 dark:bg-amber-950/40">
                <p className="mb-2 text-sm font-black uppercase tracking-widest text-amber-950 dark:text-amber-200">
                  📜 {hi ? 'प्रामाणिक संदर्भ एवं स्थापित स्रोत' : 'Scholarly Sources & Academic Citations'}
                </p>
                <MainsMarkdownBody
                  markdown={coerceMarkdownBulletsLoose(pick(payload, 'authentic_source_citation', hi))}
                  isHindi={hi}
                  itemClassName="border-amber-200 bg-white/70 dark:border-amber-900/40 dark:bg-amber-950/20"
                  bulletClassName="bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)] ring-amber-500/15"
                />
              </div>
            </div>
          </details>

          {/* Dynamic dimensions */}
          <details className="group rounded-2xl border-2 border-amber-200 bg-amber-50/5 p-4 sm:p-6 shadow-sm dark:border-amber-500/20 dark:bg-[#1f1710] transition-all hover:border-amber-400/60">
            <summary className="mb-4 flex cursor-pointer select-none items-center justify-between outline-none marker:content-none pb-4 border-b border-amber-200/50 dark:border-amber-500/20 text-amber-950 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <Compass className="h-6 w-6 shrink-0 text-amber-500 animate-spin-slow" />
                <h2 className="text-lg font-black sm:text-xl">{hi ? '🧭 360° डायनैमिक आयाम' : '🧭 360° Dynamic Dimensions'}</h2>
              </div>
              <ChevronDown className="h-6 w-6 shrink-0 text-amber-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="grid grid-cols-1 gap-4">
              {dimensionBlocks.length === 0 ? (
                <p className="text-sm text-slate-500">{hi ? 'कोई आयाम नहीं' : 'No dimensions'}</p>
              ) : (
                dimensionBlocks.map((d, idx) => {
                  const name = String(d.dimension_name ?? '').trim();
                  const bullets = Array.isArray(d.bullets) ? d.bullets.filter((b): b is string => typeof b === 'string') : [];
                  return (
                    <div
                      key={idx}
                      className="overflow-hidden rounded-2xl border-2 border-amber-200/60 bg-white/60 shadow-sm dark:border-amber-900/40 dark:bg-[#1a120a]"
                    >
                      <div className="border-b border-amber-200 bg-amber-100/40 px-4 py-3 text-base font-black text-amber-950 dark:border-amber-900/40 dark:bg-[#251a0e] dark:text-amber-100">
                        {name}
                      </div>
                      <ul className="space-y-2.5 p-4">
                        {bullets.map((b, i) => (
                          <li
                            key={i}
                            className="flex gap-3 text-[16px] sm:text-[17px] leading-relaxed text-slate-800 dark:text-slate-100"
                          >
                            <span className="mt-2 size-2.5 shrink-0 rounded-full bg-amber-500 ring-4 ring-amber-500/15" />
                            <span className={hi ? 'font-[family-name:var(--font-pyq-dev)]' : 'font-[family-name:var(--font-pyq-serif)]'}>
                              {parseBoldInline(b)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })
              )}
            </div>
          </details>

          {/* Interlinking + hooks */}
          <details className="group rounded-2xl border-2 border-emerald-200 bg-emerald-50/5 p-4 sm:p-6 shadow-sm dark:border-emerald-500/20 dark:bg-[#0c1c14] transition-all hover:border-emerald-400/60">
            <summary className="mb-4 flex cursor-pointer select-none items-center justify-between outline-none marker:content-none pb-4 border-b border-emerald-200/50 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-200">
              <div className="flex items-center gap-2">
                <Network className="h-5 w-5 shrink-0 text-emerald-500" />
                <h2 className="text-lg font-black sm:text-xl">{hi ? '🔗 अंतर-विषय जुड़ाव व मेमोरी हुक्स' : '🔗 Inter-Paper Linkages & Memory Hooks'}</h2>
              </div>
              <ChevronDown className="h-6 w-6 shrink-0 text-emerald-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 sm:p-5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-indigo-950 dark:text-indigo-100">
                  <Network className="h-5 w-5 shrink-0" /> {hi ? '🔗 अंतर-पेपर जुड़ाव' : '🔗 Interlinking'}
                </h3>
                <MainsMarkdownBody
                  markdown={coerceMarkdownBulletsLoose(pickInterlinkingMarkdown(payload, hi ? 'hi' : 'en'))}
                  isHindi={hi}
                  itemClassName="border-indigo-100 bg-white/70 dark:border-indigo-900/40 dark:bg-indigo-950/20"
                  bulletClassName="bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.4)] ring-indigo-500/15"
                />
              </div>
              <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50/70 p-4 sm:p-5 dark:border-fuchsia-900/50 dark:bg-fuchsia-950/25">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-fuchsia-950 dark:text-fuchsia-100">
                  <Brain className="h-5 w-5 shrink-0" /> {hi ? '🧠 मेमोरी हुक' : '🧠 Memory hook'}
                </h3>
                <MainsMarkdownBody
                  markdown={coerceMarkdownBulletsLoose(bulletizeMemoryHook(pick(payload, 'psychological_memory_hook', hi)))}
                  isHindi={hi}
                  itemClassName="border-fuchsia-100 bg-white/70 dark:border-fuchsia-900/40 dark:bg-fuchsia-950/20"
                  bulletClassName="bg-fuchsia-500 shadow-[0_0_12px_rgba(217,70,239,0.4)] ring-fuchsia-500/15"
                />
              </div>
              <div className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4 sm:p-5 dark:border-cyan-900/50 dark:bg-cyan-950/25">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-cyan-950 dark:text-cyan-100">
                  <Palette className="h-5 w-5 shrink-0" /> {hi ? '📐 डायग्राम / नक्शा' : '📐 Diagram / map cue'}
                </h3>
                <MainsMarkdownBody
                  markdown={coerceMarkdownBulletsLoose(pick(payload, 'visual_infographic_cue', hi))}
                  isHindi={hi}
                  itemClassName="border-cyan-100 bg-white/70 dark:border-cyan-900/40 dark:bg-cyan-950/20"
                  bulletClassName="bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)] ring-cyan-500/15"
                />
              </div>
              <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 sm:p-5 dark:border-red-900/50 dark:bg-red-950/30">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-red-900 dark:text-red-100">
                  <AlertTriangle className="h-5 w-5 shrink-0" /> {hi ? '⚠️ एग्जामिनर ट्रैप' : '⚠️ Examiner trap'}
                </h3>
                <MainsMarkdownBody
                  markdown={coerceMarkdownBulletsLoose(pick(payload, 'examiner_trap', hi))}
                  isHindi={hi}
                  itemClassName="border-red-100 bg-white/70 dark:border-red-900/40 dark:bg-red-950/20"
                  bulletClassName="bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)] ring-red-500/15"
                />
              </div>
            </div>
          </details>

          {/* Topper X-Factor Strategy */}
          <details className="group rounded-2xl border-2 border-amber-300 bg-amber-50/5 p-4 sm:p-6 transition-all dark:border-amber-500/20 dark:bg-[#1a140e] hover:border-amber-400/60">
            <summary className="mb-4 flex cursor-pointer select-none items-center justify-between outline-none marker:content-none pb-4 border-b border-amber-200/50 dark:border-amber-500/20 text-lg font-black text-amber-950 dark:text-amber-100 sm:text-xl">
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6 shrink-0 text-amber-500" /> {hi ? '🏆 टॉपर एक्स-फैक्टर रणनीति' : '🏆 Topper X-Factor Strategy'}
              </div>
              <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180 text-amber-400" />
            </summary>
            <MainsMarkdownBody
              markdown={coerceMarkdownBulletsLoose(pick(payload, 'topper_x_factor', hi))}
              isHindi={hi}
              itemClassName="border-amber-200 bg-white/70 dark:border-amber-900/40 dark:bg-[#251a0e]"
              bulletClassName="bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)] ring-amber-500/15"
            />
          </details>

          {/* Model answers */}
          <details
            className="group rounded-2xl border-2 border-emerald-200 bg-emerald-50/5 p-4 sm:p-6 shadow-sm dark:border-emerald-500/20 dark:bg-[#0c1c14] transition-all hover:border-emerald-400/50"
            aria-label={hi ? 'मॉडल उत्तर' : 'Model answers'}
          >
            <summary className="mb-6 flex cursor-pointer select-none items-center justify-between outline-none marker:content-none pb-4 border-b border-emerald-200/50 dark:border-emerald-500/20 px-2 sm:px-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-emerald-950 dark:text-emerald-100">
                  <FileText className="h-6 w-6 text-emerald-500" aria-hidden />
                  {hi ? '✍️ | | मॉडल उत्तर अभ्यास' : '✍️ Model Answer Suite'}
                </h2>
                <div className="flex gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-1 shadow-inner ml-4">
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModelLang('hi'); }}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-black sm:px-4 sm:text-sm transition-colors',
                      modelLang === 'hi'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    )}
                  >
                    हिंदी
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModelLang('en'); }}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-black sm:px-4 sm:text-sm transition-colors',
                      modelLang === 'en'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    )}
                  >
                    English
                  </button>
                </div>
              </div>
              <ChevronDown className="h-6 w-6 shrink-0 transition-transform group-open:rotate-180 text-emerald-400" />
            </summary>

            <div
              className="rounded-xl sm:rounded-[1.75rem] border-2 border-emerald-200/50 bg-[#f4f8fb] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] ring-1 ring-slate-100 [color-scheme:light] sm:p-6 min-w-0 overflow-hidden break-words mt-4 text-slate-900"
              style={{ colorScheme: 'light' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={modelLang}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-10 min-w-0 overflow-hidden break-words"
                >
                  {(() => {
                    const allVariants: Array<{ variant: typeof ma[ModelBand][number]; band: ModelBand }> = [];
                    (['2m', '7m', '10m', '11m', 'case18'] as ModelBand[]).forEach((band) => {
                      const variants = ma[band] || [];
                      variants.forEach((v) => {
                        allVariants.push({ variant: v, band });
                      });
                    });

                    if (allVariants.length === 0) {
                      return (
                        <p className="text-sm font-semibold text-slate-500 text-center py-6">
                          {modelLang === 'hi' ? 'कोई मॉडल उत्तर उपलब्ध नहीं है।' : 'No model answers available.'}
                        </p>
                      );
                    }

                    return (
                      <div className="grid gap-6 min-w-0 overflow-hidden">
                        {allVariants.map(({ variant: v, band }, idx) => (
                          <article
                            key={idx}
                            className={cn(
                              "rounded-xl sm:rounded-2xl border p-4 sm:p-6 text-slate-900 shadow-sm ring-1 ring-black/[0.03] min-w-0 overflow-hidden break-words",
                              [
                                'border-pink-200/80 bg-pink-50/60',
                                'border-emerald-200/80 bg-emerald-50/60',
                                'border-amber-200/80 bg-amber-50/60',
                                'border-sky-200/80 bg-sky-50/60',
                              ][idx % 4]
                            )}
                          >
                            <div className="flex flex-wrap items-center gap-2.5 mb-4">
                              <div className={cn(
                                'inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-1 text-[11px] font-black uppercase tracking-widest shadow-xs',
                                [
                                  'border-pink-300 bg-pink-50 text-pink-800',
                                  'border-emerald-300 bg-emerald-50 text-emerald-800',
                                  'border-amber-300 bg-amber-50 text-amber-800',
                                  'border-sky-300 bg-sky-50 text-sky-800',
                                ][idx % 4]
                              )}>
                                {modelLang === 'hi' ? `विकल्प ${idx + 1}` : `Variant ${idx + 1}`}
                              </div>
                              <PyqMarksBandChip marks={marksForBand(band)} lang={modelLang} theme="paper" />
                            </div>
                            {v.stem ? (
                              <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                  {modelLang === 'hi' ? '❓ प्रश्न' : '❓ Question'}
                                </p>
                                <p className={cn(
                                  'mt-2 text-[15px] font-semibold leading-relaxed text-slate-900 sm:text-[16px]',
                                  modelLang === 'hi' ? 'font-[family-name:var(--font-pyq-dev)]' : 'font-[family-name:var(--font-pyq-serif)]'
                                )}>
                                  {v.stem}
                                </p>
                              </div>
                            ) : null}
                            <PyqAnswerProse
                              text={coerceMarkdownBulletsLoose(v.text)}
                              lang={modelLang === 'hi' ? 'hi' : 'en'}
                              theme="paper"
                              sectionTint={(idx % 2) as 0 | 1}
                              marks={marksForBand(band)}
                              density="comfortable"
                              paletteRotationStart={idx % 4}
                              mainsBoxLayout={true}
                              prominentHeadings={marksForBand(band) >= 7}
                              readerAccent
                            />
                          </article>
                        ))}
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>
          </details>

          {/* Key terms */}
          <details className="group rounded-2xl border-2 border-sky-200 bg-sky-50/5 p-4 sm:p-6 transition-all dark:border-sky-500/20 dark:bg-[#0c1626] shadow-sm hover:border-sky-400/60">
            <summary className="mb-4 flex cursor-pointer select-none items-center justify-between outline-none marker:content-none pb-4 border-b border-sky-200/50 dark:border-sky-500/20 text-xl font-black text-sky-950 dark:text-sky-200">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-sky-500 animate-pulse" /> {hi ? '⚡ की-टर्म्स डिकोडर (Flash)' : '⚡ Key Terms Decoder (Flash)'}
              </div>
              <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180 text-sky-400" />
            </summary>
            <MainsKeyTermsFlash
              structured={
                hi 
                  ? payload.key_terms_cards_hi 
                  : (payload.key_terms_cards_en || payload.key_terms_cards_hi)
              }
              fallbackText={pick(payload, 'key_terms', hi)}
              isHindi={hi}
            />
          </details>
        </div>
      </div>
    </div>
  );
}
