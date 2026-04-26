import React, { useState } from 'react';
import {
  GraduationCap,
  Target,
  BookOpen,
  Check,
  Layers,
  Zap,
  AlignLeft,
  Globe,
  Brain,
  Link2,
  Sparkles,
  Trophy,
  Stethoscope,
  AlertTriangle,
  RefreshCw,
  Play,
} from 'lucide-react';
import { parseExtendedData } from '@/lib/explanation-parser';
import { coerceExplanationToString } from '@/lib/explanation-text';
import { PremiumExplanation } from '@/features/tests/components/PremiumExplanation';
import { QuickFeedback } from '@/features/tests/components/QuickFeedback';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StructuredExplanationProps {
  extendedData?: unknown;
  plainExplanation?: string;
  explanationEn?: string | null;
  explanationHi?: string | null;
  language?: 'hi' | 'en';
  /** When true, adapts classic explanation colors for dark surfaces */
  darkMode?: boolean;
  /** Merged into the root expert card (e.g. `!mt-0` when embedded in admin preview) */
  className?: string;
  /**
   * When both expert (extendedData) and classic (markdown) exist, start on the **Classic** tab.
   * Use in live quiz / instant mode so bulk-updated `explanation` columns show first; admin/results
   * can keep the default (expert first) by omitting this.
   */
  defaultToClassic?: boolean;
  questionId?: string;
  questionText?: string;
  guestMobile?: string;
  testId?: string;
  source?: string; // 'expert_analysis', 'open_paper_view', etc.
}

/** Strips empty + UI placeholder copy so we don't hide the Expert panel when only extendedData is real */
function isSubstantiveExplanationString(s: string | undefined | null): boolean {
  if (s == null) return false;
  const t = s.trim();
  if (!t) return false;
  const l = t.toLowerCase();
  if (l === 'no explanation available.' || l === 'no explanation available') return false;
  return true;
}

/** Parses expert wisdom text to add line breaks at periods, Hindi full stops, and pipes */
function parseExpertText(text: string, _language: 'hi' | 'en') {
  if (!text) return null;
  // Split by English period, Hindi full stop, or pipe followed by space or end of string
  const sentences = text.split(/([।.|] )/);
  return sentences.map((s, i) => {
    // If it's a separator, don't wrap it in a block
    if (s === '। ' || s === '. ' || s === '| ') return null;
    
    // Add the separator back to the sentence if it was split
    let content = s;
    if (i + 1 < sentences.length) {
      const next = sentences[i+1];
      if (next === '। ' || next === '. ' || next === '| ') {
        content += next.trim();
      }
    }

    return (
      <span key={i} className="mb-2 block last:mb-0">
        {content}
      </span>
    );
  }).filter(Boolean);
}

export function StructuredExplanation({
  extendedData,
  plainExplanation,
  explanationEn,
  explanationHi,
  language = 'hi',
  darkMode = false,
  className,
  defaultToClassic = false,
  questionId,
  questionText,
  guestMobile,
  testId,
  source,
}: StructuredExplanationProps) {
  const explanation = parseExtendedData(extendedData);

  const coercedPlain = coerceExplanationToString(plainExplanation, language);
  const coercedEn = coerceExplanationToString(explanationEn, 'en');
  const coercedHi = coerceExplanationToString(explanationHi, 'hi');

  // If no properly structured expert data is present, just show the classic view
  const hasExpertData =
    explanation && (explanation.stream === 'mppsc_expert' || explanation.stream === 'csat_logic');

  const hasSubstantiveClassic =
    isSubstantiveExplanationString(coercedPlain) ||
    isSubstantiveExplanationString(coercedEn) ||
    isSubstantiveExplanationString(coercedHi);
  const hasBoth = !!hasExpertData && hasSubstantiveClassic;
// When both exist: default expert-first unless `defaultToClassic` (e.g. quiz instant mode).
const [showExpert, setShowExpert] = useState(() => (defaultToClassic && hasBoth ? false : true));
const [contentLang, setContentLang] = useState<'hi' | 'en'>(language);

// Sync contentLang with language prop if it changes
React.useEffect(() => {
  setContentLang(language);
}, [language]);

const renderClassic = () => {

    const showPlain = isSubstantiveExplanationString(coercedPlain) ? coercedPlain : '';
    const showEn = isSubstantiveExplanationString(coercedEn) ? coercedEn : '';
    const showHi = isSubstantiveExplanationString(coercedHi) ? coercedHi : '';
    if (!showPlain && !showEn && !showHi) return null;
    return (
      <div
        className={cn(
          'animate-in fade-in mt-4 border-t pt-4 duration-300',
          darkMode ? 'border-white/10' : 'border-slate-200'
        )}
      >
        <PremiumExplanation
          explanation={showPlain}
          explanationEn={showEn}
          explanationHi={showHi}
          language={contentLang}
          compact={true}
          darkMode={darkMode}
        />
      </div>
    );
  };

  if (!hasExpertData) {
    return renderClassic() ?? <p className="text-sm text-slate-500">No explanation available.</p>;
  }

  if (hasBoth && !showExpert) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setShowExpert(true)}
            className="h-7 border-amber-300/60 bg-amber-50/90 px-2 text-[10px] font-bold tracking-widest text-amber-950/90 uppercase hover:bg-amber-100/90"
          >
            <Zap className="mr-1 h-3 w-3 fill-amber-600 text-amber-700" /> Switch to Expert Analysis
          </Button>
        </div>
        {renderClassic()}
      </div>
    );
  }

  // --- MPPSC GS EXPERT RENDERER (full “Civil Services Expert Analysis” layout) ---
  if (explanation.stream === 'mppsc_expert' && (!hasBoth || showExpert)) {
    const getField = (base: string) => {
      const hi = explanation[`${base}_hi`] || explanation[base];
      const en = explanation[`${base}_en`] || explanation[base];
      const raw = contentLang === 'hi' ? hi : en;
      return coerceExplanationToString(raw, contentLang);
    };

    const topicPill = getField('topic_micro_mapping');
    const conceptual = getField('conceptual_depth');
    const inter = getField('interdisciplinary_link');
    const elim = getField('elimination_strategy');
    const veteran = getField('historical_trend');
    const mnemonic = getField('memory_mnemonic');
    const sourceLine = getField('ncert_reference') || getField('source');
    const mainsText = getField('mains_application');
    const mantra = getField('toppers_mantra');

    const facts =
      contentLang === 'hi'
        ? explanation.high_yield_facts_hi || explanation.high_yield_facts || []
        : explanation.high_yield_facts_en || explanation.high_yield_facts || [];

    const langToggle = (
      <div className="flex w-fit rounded-full bg-slate-200/90 p-1 shadow-inner ring-1 ring-slate-300/50">
        <button
          type="button"
          onClick={() => setContentLang('hi')}
          className={cn(
            'rounded-full px-3 py-1.5 text-[10px] font-black transition-all',
            contentLang === 'hi' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          हिंदी
        </button>
        <button
          type="button"
          onClick={() => setContentLang('en')}
          className={cn(
            'rounded-full px-3 py-1.5 text-[10px] font-black transition-all',
            contentLang === 'en' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          ENG
        </button>
      </div>
    );

    const expertBody = (
      <div className="space-y-5">
        {hasBoth ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex w-fit max-w-full rounded-full bg-slate-200/90 p-1 shadow-inner ring-1 ring-slate-300/50">
              <button
                type="button"
                onClick={() => setShowExpert(true)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black tracking-widest uppercase transition-all',
                  showExpert
                    ? 'bg-slate-800 text-amber-50 shadow-md'
                    : 'text-slate-600 hover:bg-white/60'
                )}
              >
                <Zap className={cn('h-3.5 w-3.5', showExpert && 'fill-amber-400/90 text-amber-300')} />
                Expert
              </button>
              <button
                type="button"
                onClick={() => setShowExpert(false)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black tracking-widest uppercase transition-all',
                  !showExpert
                    ? 'bg-slate-800 text-amber-50 shadow-md'
                    : 'text-slate-600 hover:bg-white/60'
                )}
              >
                <AlignLeft className="h-3.5 w-3.5" />
                Classic
              </button>
            </div>
            {langToggle}
          </div>
        ) : (
          <div className="flex justify-end">{langToggle}</div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-800 shadow-sm ring-1 ring-amber-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-black uppercase leading-snug tracking-[0.18em] text-slate-900 sm:text-xs">
                {contentLang === 'hi'
                  ? 'भारतीय सिविल सेवा विशेषज्ञ विश्लेषण'
                  : 'Civil Services Expert Analysis'}
              </h4>
            </div>
          </div>
          {topicPill ? (
            <span className="inline-flex max-w-[min(100%,20rem)] items-center rounded-full bg-slate-800/95 px-3 py-1.5 text-center text-[10px] font-bold leading-tight text-amber-100 shadow-md ring-1 ring-slate-700/50">
              {topicPill}
            </span>
          ) : null}
        </div>

        {conceptual ? (
          <section className="space-y-2">
            <h5 className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
              <BookOpen className="h-4 w-4 text-amber-700" />
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              {contentLang === 'hi' ? 'संकल्पनात्मक केंद्र' : 'Conceptual Core'}
            </h5>
            <div className="text-sm leading-relaxed text-slate-800">
              {parseExpertText(conceptual, contentLang)}
            </div>
          </section>
        ) : null}

        {inter ? (
          <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50/95 p-4 shadow-sm">
            <Stethoscope
              className="pointer-events-none absolute -right-2 -bottom-4 h-28 w-28 text-slate-200/60"
              strokeWidth={1}
            />
            <h5 className="relative mb-2 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">
              <Link2 className="h-4 w-4 text-slate-600" />
              <RefreshCw className="h-3.5 w-3.5 text-amber-600" />
              {contentLang === 'hi' ? 'अंतःविषय कड़ी' : 'Inter-disciplinary Link'}
            </h5>
            <div className="relative text-sm italic leading-relaxed text-slate-800">
              {parseExpertText(inter, contentLang)}
            </div>
          </section>
        ) : null}

        {(elim || veteran) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {elim ? (
              <div className="rounded-2xl border border-amber-200/90 bg-amber-50/95 p-4 shadow-sm">
                <h5 className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-900">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  {contentLang === 'hi' ? 'एलिमिनेशन रणनीति' : 'Elimination Strategy'}
                </h5>
                <p className="text-[13px] leading-relaxed text-slate-800">{elim}</p>
              </div>
            ) : null}
            {veteran ? (
              <div className="rounded-2xl border border-rose-200/90 bg-rose-50/95 p-4 shadow-sm">
                <h5 className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-rose-900">
                  <Target className="h-3.5 w-3.5 text-rose-600" />
                  <Brain className="h-3.5 w-3.5 text-rose-400" />
                  {contentLang === 'hi' ? 'अनुभवी की सूझ' : "Veteran's Wisdom"}
                </h5>
                <div className="text-[13px] leading-relaxed text-slate-800">
                  {parseExpertText(veteran, contentLang)}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {mnemonic ? (
          <section className="relative overflow-hidden rounded-2xl border border-emerald-200/90 bg-emerald-50/95 p-4 shadow-sm">
            <Brain className="pointer-events-none absolute -right-1 -bottom-3 h-24 w-24 text-emerald-200/45" strokeWidth={1} />
            <h5 className="relative mb-2 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-900">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <Brain className="h-3.5 w-3.5 text-pink-400" />
              {contentLang === 'hi' ? 'स्मरण भंडार (निमोनिक)' : 'Memory Vault (Mnemonic)'}
            </h5>
            <div className="relative rounded-xl border border-emerald-100/80 bg-white/90 p-3 text-[13px] font-semibold italic text-emerald-950 shadow-inner">
              {parseExpertText(mnemonic, contentLang)}
            </div>
          </section>
        ) : null}

        {sourceLine ? (
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center">
            <span className="inline-flex w-fit shrink-0 rounded-full bg-slate-600 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
              {contentLang === 'hi' ? 'स्रोत' : 'Source'}
            </span>
            <p className="text-sm leading-relaxed text-slate-700">{sourceLine}</p>
          </div>
        ) : null}

        {facts.length > 0 ? (
          <section className="space-y-3">
            <h5 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900">
              <Layers className="h-4 w-4 text-emerald-600" />
              {contentLang === 'hi' ? 'महत्वपूर्ण तथ्य' : 'High-Yield Facts'}
            </h5>
            <div className="grid gap-3 sm:grid-cols-2">
              {facts.map((fact: string, i: number) => (
                <div
                  key={i}
                  className="flex gap-2 rounded-xl border border-slate-200 bg-white p-3 text-[13px] leading-relaxed text-slate-800 shadow-sm"
                >
                  <Play className="mt-0.5 h-4 w-4 shrink-0 fill-emerald-600 text-emerald-600" />
                  <span>{coerceExplanationToString(fact, contentLang)}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {mainsText ? (
          <section className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm leading-relaxed text-slate-800 shadow-sm">
            <span className="font-black text-slate-900">MAINS: </span>
            <span className="italic text-slate-700">{mainsText}</span>
          </section>
        ) : null}

        {mantra ? (
          <section className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 shadow-sm">
            <Trophy className="pointer-events-none absolute -right-1 -bottom-2 h-24 w-24 text-amber-200/45" strokeWidth={1} />
            <h5 className="relative mb-2 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-950/95">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <Trophy className="h-3.5 w-3.5 text-amber-700" />
              {contentLang === 'hi' ? 'टॉपर का मंत्र' : "Topper's Mantra"}
            </h5>
            <p className="relative text-sm font-semibold leading-relaxed text-slate-900">{mantra}</p>
          </section>
        ) : null}
      </div>
    );

    return (
      <div className={cn('animate-in fade-in mt-4 duration-500', className)}>
        <div
          className={cn(
            'relative rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100/90 p-3 shadow-md sm:p-4',
            darkMode && 'border-slate-300/80 from-slate-50 to-white shadow-lg ring-1 ring-white/20'
          )}
        >
          {expertBody}
          {questionId && questionText && (
            <QuickFeedback
              questionId={questionId}
              questionText={questionText}
              guestMobile={guestMobile}
              testId={testId}
              source={source}
            />
          )}
        </div>
      </div>
    );
  }

  // --- CSAT RENDERER ---
  if (explanation.stream === 'csat_logic' && (!hasBoth || showExpert)) {
    return (
      <>
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 p-1 shadow-xl shadow-purple-200/50">
          <div className="rounded-[14px] bg-white p-5">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <strong className="flex items-center gap-2 text-xs font-black tracking-widest text-slate-900 uppercase">
                <Globe className="h-4 w-4 text-violet-600" />
                {contentLang === 'hi' ? 'CSAT लॉजिक मैप' : 'CSAT Logic Map'}
              </strong>
              <div className="flex h-7 gap-1 rounded-md bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setShowExpert(false)}
                  className="px-2 text-[9px] font-bold text-slate-400 hover:text-slate-600"
                >
                  CLASSIC
                </button>
                <button
                  type="button"
                  onClick={() => setContentLang(contentLang === 'hi' ? 'en' : 'hi')}
                  className="rounded bg-white px-2 text-[9px] font-black text-violet-600 shadow-sm"
                >
                  {contentLang === 'hi' ? 'हिंदी' : 'ENG'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {explanation.steps && (
                <div className="space-y-2">
                  {explanation.steps.map((step: unknown, i: number) => (
                    <div
                      key={i}
                      className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white uppercase tabular-nums">
                        {i + 1}
                      </span>
                      <span className="font-medium">
                        {coerceExplanationToString(step, contentLang)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {explanation.shortcut && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-[12px] font-medium text-emerald-900">
                    <span className="mr-2 mb-1 block text-[9px] font-black tracking-widest text-emerald-600 uppercase">
                      ⚡ Shortcut
                    </span>
                    {coerceExplanationToString(explanation.shortcut, contentLang)}
                  </div>
                )}
                {explanation.trap && (
                  <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-[12px] font-medium text-rose-900">
                    <span className="mr-2 mb-1 block text-[9px] font-black tracking-widest text-rose-600 uppercase">
                      🚫 Trap Alert
                    </span>
                    {coerceExplanationToString(explanation.trap, contentLang)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {hasBoth && renderClassic()}
      </>
    );
  }

  return renderClassic();
}
