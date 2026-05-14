'use client';

import { useMemo, useState, useCallback } from 'react';
import { ChevronDown, Lock, Layers, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { PyqAnswerProse } from '@/components/mains/PyqAnswerProse';
import { Button } from '@/components/ui/button';
import {
  MAIN_SYLLABUS_CARD_HUES,
  mainsSyllabusTileSkin,
  mainsSyllabusVariantBadge,
} from '@/components/mains/mainsSyllabusTileSkin';
import { PyqExpertInsightsRenderer } from '@/components/mains/PyqExpertInsightsRenderer';

export type QRow = {
  id: string;
  part: string;
  unitNumber: number;
  marks: number;
  questionNumber: string;
  questionHi: string;
  questionEn: string | null;
  expertInsightsHi: string | null;
  expertInsightsEn: string | null;
  variants: {
    slot: number;
    styleLabel: string | null;
    styleLabelHi: string | null;
    answerHi: string;
    answerEn: string | null;
  }[];
};

type ReadingTheme = 'deep' | 'paper';

interface PyqQuestionListProps {
  questions: QRow[];
  paperNumber: number;
  partFilter: string;
  onPartFilterChange: (part: string) => void;
  readingTheme: ReadingTheme;
  vaultUnlocked: boolean;
  allowDemoAccess: boolean;
  onVaultModalOpen: () => void;
}

export function PyqQuestionList({
  questions,
  paperNumber,
  partFilter,
  onPartFilterChange,
  readingTheme,
  vaultUnlocked,
  allowDemoAccess,
  onVaultModalOpen,
}: PyqQuestionListProps) {
  const { language } = useSettingsStore();
  const hi = language === 'hi';
  const effectiveHi = paperNumber === 5 || paperNumber === 6 || hi;
  const themeDeep = readingTheme === 'deep';

  const [openId, setOpenId] = useState<string | null>(null);
  const [insightsOpenId, setInsightsOpenId] = useState<string | null>(null);

  const parts = useMemo(() => {
    const s = new Set(questions.map((q) => String(q.part).toUpperCase()));
    return ['ALL', ...Array.from(s).sort()];
  }, [questions]);

  const filtered = useMemo(() => {
    if (partFilter === 'ALL') return questions;
    return questions.filter((q) => String(q.part).toUpperCase() === partFilter);
  }, [questions, partFilter]);

  const guestFreeIds = useMemo(() => {
    if (vaultUnlocked) return new Set<string>();
    if (!allowDemoAccess) return new Set<string>();
    const picked = new Set<string>();

    // 2-mark x2
    for (const q of filtered) {
      if (q.marks === 2 && !picked.has(q.id)) picked.add(q.id);
      if (Array.from(picked).filter((id) => filtered.find((x) => x.id === id)?.marks === 2).length >= 2) break;
    }

    // 5/7-mark x1
    const mid = filtered.find((q) => (q.marks === 5 || q.marks === 7) && !picked.has(q.id));
    if (mid) picked.add(mid.id);

    // 10/11-mark x1
    const high = filtered.find((q) => (q.marks === 10 || q.marks === 11) && !picked.has(q.id));
    if (high) picked.add(high.id);

    // Fallback: ensure at least 4 visible if matching marks are missing
    if (picked.size < 4) {
      for (const q of filtered) {
        if (!picked.has(q.id)) picked.add(q.id);
        if (picked.size >= 4) break;
      }
    }

    return picked;
  }, [vaultUnlocked, allowDemoAccess, filtered]);

  const displayQuestions = useMemo(() => {
    if (vaultUnlocked) return filtered;
    return filtered.filter((q) => guestFreeIds.has(q.id));
  }, [vaultUnlocked, filtered, guestFreeIds]);

  const hiddenCount = useMemo(() => {
    if (vaultUnlocked) return 0;
    return Math.max(0, filtered.length - displayQuestions.length);
  }, [vaultUnlocked, filtered.length, displayQuestions.length]);

  const isPyqRowLocked = useCallback(
    (q: QRow) => {
      if (vaultUnlocked) return false;
      return !guestFreeIds.has(q.id);
    },
    [vaultUnlocked, guestFreeIds]
  );

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

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {parts.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPartFilterChange(p)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wide transition-colors',
              partFilter === p
                ? themeDeep
                  ? 'bg-emerald-600 text-white'
                  : 'bg-pink-600 text-white shadow-md'
                : themeDeep
                  ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            {p === 'ALL' ? (hi ? 'सभी' : 'All') : hi ? `खंड ${p}` : `Part ${p}`}
          </button>
        ))}
      </div>

      <ul className="space-y-3 pb-6">
        {displayQuestions.map((q, qi) => {
          const locked = isPyqRowLocked(q);
          const open = openId === q.id && !locked;
          const insightsOpen = insightsOpenId === q.id;
          const insightsText = insightsFor(q);
          const hasInsights = insightsText.length > 0;
          const hue = MAIN_SYLLABUS_CARD_HUES[qi % 4];
          const tileSkin = mainsSyllabusTileSkin(hue, themeDeep);

          return (
            <li
              key={q.id}
              className={cn(
                'overflow-hidden rounded-[2.25rem] transition-all duration-300 sm:rounded-[2.5rem]',
                tileSkin.frame
              )}
            >
              <button
                type="button"
                onClick={() => {
                  if (locked) {
                    onVaultModalOpen();
                    return;
                  }
                  setOpenId(open ? null : q.id);
                }}
                className={cn(
                  'flex w-full items-start gap-2 px-2 py-2 text-left transition-colors sm:gap-2.5 sm:px-2.5 sm:py-2.5',
                  tileSkin.rowHover,
                  locked && 'opacity-95'
                )}
              >
                <div className="flex shrink-0 flex-col items-center gap-1">
                  <span className={cn('rounded-lg px-2 py-0.5', tileSkin.markBadge)}>
                    {locked ? (
                      <span className="inline-flex items-center gap-1">
                        <Lock className="h-3 w-3" aria-hidden />
                        {q.marks}m
                      </span>
                    ) : (
                      <>{q.marks}m</>
                    )}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      themeDeep ? 'text-slate-500' : 'text-slate-400',
                      open && 'rotate-180'
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-[11px] font-bold uppercase tracking-wider',
                      themeDeep ? 'text-slate-500' : 'text-slate-700/90'
                    )}
                  >
                    {effectiveHi
                      ? `खंड ${q.part} · इकाई ${q.unitNumber} · प्रश्न ${q.questionNumber}`
                      : `Part ${q.part} · U${q.unitNumber} · ${q.questionNumber}`}
                  </p>
                  <p
                    className={cn(
                      'mt-1 text-[15px] font-semibold leading-relaxed md:text-base',
                      effectiveHi ? 'font-[family-name:var(--font-pyq-dev)]' : 'font-[family-name:var(--font-pyq-serif)]',
                      themeDeep ? 'text-slate-100' : 'text-slate-900'
                    )}
                  >
                    {stemFor(q)}
                  </p>
                </div>
              </button>

              {open && (
                <div
                  className={cn(
                    'border-t px-1 py-2 sm:px-1.5',
                    themeDeep ? 'border-white/10 bg-black/10' : 'border-black/[0.07] bg-transparent'
                  )}
                >
                  {q.variants.length === 0 ? (
                    <div className="py-4 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide shadow-sm",
                        themeDeep
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                          : 'border-amber-300 bg-amber-50 text-amber-800'
                      )}>
                        🚀 {effectiveHi ? 'जल्द आ रहा है (Coming Soon)' : 'Coming Soon'}
                      </span>
                      <p
                        className={cn(
                          'mt-2 text-sm font-bold leading-relaxed',
                          themeDeep ? 'text-slate-400' : 'text-slate-600'
                        )}
                      >
                        {effectiveHi
                          ? 'एक्सपर्ट कंटेंट व मॉडल उत्तर तैयार किए जा रहे हैं। जल्द ही उपलब्ध होंगे।'
                          : 'Expert content & model answers are currently under preparation.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-0 px-0.5">
                      {q.variants
                        .sort((a, b) => a.slot - b.slot)
                        .map((v, vIdx) => {
                          const slotKey = v.slot === 2 ? 2 : 1;
                          const badgeClass = mainsSyllabusVariantBadge(hue, slotKey, themeDeep);
                          const styleSubtitle = styleLabelFor(v);

                          return (
                            <div
                              key={v.slot}
                              className={cn(
                                'min-w-0',
                                vIdx > 0 &&
                                  (themeDeep
                                    ? 'relative mt-7 border-t border-white/20 pt-6 before:pointer-events-none before:absolute before:-top-3 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent'
                                    : 'relative mt-7 border-t-2 border-black/[0.07] border-dashed pt-6 before:pointer-events-none before:absolute before:-top-3 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-slate-300/80 before:to-transparent')
                              )}
                            >
                              <div className="mb-3 flex flex-wrap items-center gap-1.5 px-0.5">
                                <span className={cn('inline-flex items-center gap-1', badgeClass)}>
                                  <Layers className="h-3 w-3 shrink-0 opacity-95" />
                                  {effectiveHi ? `वेरिएंट ${v.slot}` : `Variant ${v.slot}`}
                                </span>
                                {styleSubtitle ? (
                                  <span
                                    className={cn(
                                      'text-[11px] font-semibold leading-tight',
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
                        <div className="mt-6 mb-2 px-0.5 text-left">
                          <div className="flex justify-center mb-4">
                            <div className="relative inline-block">
                              <button
                                type="button"
                                onClick={() => setInsightsOpenId(insightsOpen ? null : q.id)}
                                className={cn(
                                  'inline-flex items-center gap-2 rounded-xl border px-6 py-2.5 text-[12px] font-black uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 shadow-md',
                                  insightsOpen
                                    ? 'bg-slate-950 border-amber-500 text-amber-300 shadow-amber-500/20'
                                    : 'bg-slate-900 border-slate-800 hover:border-amber-500/40 text-amber-400/95 hover:text-amber-300 shadow-black/40 hover:shadow-amber-500/10'
                                )}
                              >
                                <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
                                {effectiveHi ? 'एक्सपर्ट टिप्स' : 'Expert Tips'}
                              </button>
                              {!insightsOpen && (
                                <div className="absolute left-[105%] top-1/2 -translate-y-1/2 flex items-center pointer-events-none select-none z-30 rotate-12">
                                  {/* Curved Arrow pointing left into the button */}
                                  <div className="mr-1 filter drop-shadow-[0_2px_4px_rgba(236,72,153,0.6)]">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-90">
                                      <path d="M10 2C7 8 7 12 10 17" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" />
                                      <path d="M7 14L10 18L13 14" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </div>
                                  {/* Pointing finger emoji */}
                                  <div className="text-2xl filter drop-shadow-md">
                                    👈
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {insightsOpen && (
                            <div className="w-full">
                              <PyqExpertInsightsRenderer
                                insightsText={insightsText}
                                themeDeep={themeDeep}
                                hi={effectiveHi}
                              />
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {!vaultUnlocked && hiddenCount > 0 ? (
        <div
          className={cn(
            'mb-8 overflow-hidden rounded-[2rem] border p-6 text-center sm:p-7',
            themeDeep
              ? 'border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-slate-900'
              : 'border-amber-300 bg-gradient-to-b from-amber-50 to-white'
          )}
        >
          <div
            className={cn(
              'mx-auto mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em]',
              themeDeep ? 'border-amber-400/40 text-amber-300' : 'border-amber-300 text-amber-700'
            )}
          >
            <Lock className="h-3.5 w-3.5" aria-hidden />
            {hi ? 'मेंस लाइब्रेरी' : 'Mains Library'}
          </div>
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
            {hiddenCount} {hi ? 'प्रश्न अभी लॉक हैं' : 'questions locked'}
          </p>
        </div>
      ) : null}
    </>
  );
}
