'use client';

import { useMemo, useState, useCallback } from 'react';
import { ChevronDown, Lock, Layers, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { PyqAnswerProse } from '@/components/mains/PyqAnswerProse';
import { Badge } from '@/components/ui/badge';
import {
  MAINS_PYQ_DEMO_PAPER_NUMBER,
  MAINS_PYQ_DEMO_YEAR,
  orderMainsPyqRowsForVaultDemo,
  pickMainsPyqFreeDemoQuestionIds,
} from '@/lib/mains-vault-demo';
import {
  MAIN_SYLLABUS_CARD_HUES,
  mainsSyllabusTileSkin,
  mainsSyllabusVariantBadge,
} from '@/components/mains/mainsSyllabusTileSkin';

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
  partFilter: string;
  onPartFilterChange: (part: string) => void;
  readingTheme: ReadingTheme;
  vaultUnlocked: boolean;
  isDemoPaper: boolean;
  onVaultModalOpen: () => void;
}

export function PyqQuestionList({
  questions,
  partFilter,
  onPartFilterChange,
  readingTheme,
  vaultUnlocked,
  isDemoPaper,
  onVaultModalOpen,
}: PyqQuestionListProps) {
  const { language } = useSettingsStore();
  const hi = language === 'hi';
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

  const freeDemoIds = useMemo(() => {
    if (vaultUnlocked || !isDemoPaper) return new Set<string>();
    return pickMainsPyqFreeDemoQuestionIds(filtered.map((q) => ({ id: q.id, marks: q.marks })));
  }, [vaultUnlocked, isDemoPaper, filtered]);

  const displayQuestions = useMemo(
    () => orderMainsPyqRowsForVaultDemo(filtered, freeDemoIds, vaultUnlocked),
    [filtered, freeDemoIds, vaultUnlocked]
  );

  const isPyqRowLocked = useCallback(
    (q: QRow) => {
      if (vaultUnlocked) return false;
      if (!isDemoPaper) return true;
      return !freeDemoIds.has(q.id);
    },
    [vaultUnlocked, isDemoPaper, freeDemoIds]
  );

  function stemFor(q: QRow) {
    return hi ? q.questionHi : (q.questionEn ?? q.questionHi);
  }

  function insightsFor(q: QRow) {
    if (hi) return (q.expertInsightsHi ?? '').trim();
    return (q.expertInsightsEn ?? q.expertInsightsHi ?? '').trim();
  }

  function answerFor(v: QRow['variants'][0]) {
    return hi ? v.answerHi : (v.answerEn ?? v.answerHi);
  }

  function styleLabelFor(v: QRow['variants'][0]) {
    if (hi) {
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
                    {hi
                      ? `खंड ${q.part} · इकाई ${q.unitNumber} · प्रश्न ${q.questionNumber}`
                      : `Part ${q.part} · U${q.unitNumber} · ${q.questionNumber}`}
                  </p>
                  <p
                    className={cn(
                      'mt-1 text-[15px] font-semibold leading-relaxed md:text-base',
                      hi ? 'font-[family-name:var(--font-pyq-dev)]' : 'font-[family-name:var(--font-pyq-serif)]',
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
                    <p
                      className={cn(
                        'text-[15px] leading-relaxed',
                        themeDeep ? 'text-slate-400' : 'text-amber-900'
                      )}
                    >
                      {hi
                        ? 'इस प्रश्न के लिए अभी मॉडल उत्तर डेटाबेस में नहीं हैं।'
                        : 'No prepared variants for this stem yet.'}
                    </p>
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
                                  {hi ? `वेरिएंट ${v.slot}` : `Variant ${v.slot}`}
                                </span>
                                {styleSubtitle ? (
                                  <span
                                    className={cn(
                                      'text-[11px] font-semibold leading-tight',
                                      themeDeep ? 'text-slate-300' : 'text-slate-700',
                                      hi && 'font-[family-name:var(--font-pyq-dev)]'
                                    )}
                                  >
                                    {styleSubtitle}
                                  </span>
                                ) : null}
                              </div>

                              <div className="mb-4">
                                <PyqAnswerProse
                                  text={answerFor(v)}
                                  lang={v.answerEn && !hi ? 'en' : 'hi'}
                                  theme={readingTheme}
                                />
                              </div>

                              {hasInsights ? (
                                <div className="mb-4">
                                  <button
                                    type="button"
                                    onClick={() => setInsightsOpenId(insightsOpen ? null : q.id)}
                                    className={cn(
                                      'flex w-full items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-bold transition-colors',
                                      insightsOpen
                                        ? themeDeep
                                          ? 'border-emerald-500/40 bg-emerald-900/20 text-emerald-100'
                                          : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                        : themeDeep
                                          ? 'border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-800'
                                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                                    )}
                                  >
                                    <Trophy className="h-4 w-4 shrink-0" />
                                    {hi ? 'एक्सपर्ट टिप्स' : 'Expert Tips'}
                                  </button>
                                  {insightsOpen && (
                                    <div
                                      className={cn(
                                        'mt-2 rounded-lg border-l-4 px-3 py-2 text-[14px] leading-relaxed',
                                        themeDeep
                                          ? 'border-l-emerald-500 bg-slate-900/50 text-slate-300'
                                          : 'border-l-emerald-500 bg-emerald-50 text-slate-700'
                                      )}
                                    >
                                      {insightsText}
                                    </div>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
