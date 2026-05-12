'use client';

import React from 'react';
import { parseExtendedData } from '@/lib/explanation-parser';
import { coerceExplanationToString } from '@/lib/explanation-text';
import { cn } from '@/lib/utils';
import {
  Layers,
  BookOpen,
  Link2,
  Zap,
  TrendingUp,
  Brain,
  Bookmark,
  PenTool,
  Trophy,
} from 'lucide-react';

interface PyqExpertInsightsRendererProps {
  insightsText: string | null;
  themeDeep: boolean;
  hi: boolean;
}

export function PyqExpertInsightsRenderer({
  insightsText,
  themeDeep,
  hi,
}: PyqExpertInsightsRendererProps) {
  if (!insightsText) return null;

  // Attempt to parse the complex JSON object
  const explanation = parseExtendedData(insightsText);

  // Helper to aggressively strip markdown formatting characters, colons, stars, hashes
  const cleanText = (s: unknown): string => {
    if (!s) return '';
    const rawString = coerceExplanationToString(s, hi ? 'hi' : 'en');
    let cleaned = rawString;

    // Strip bold/italic asterisks (e.g. **bold**)
    cleaned = cleaned.replace(/\*{1,3}/g, '');
    
    // Strip markdown headers (e.g. ### Header or # Header)
    cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
    cleaned = cleaned.replace(/#/g, '');
    
    // Strip underscores (e.g. _italic_)
    cleaned = cleaned.replace(/_/g, '');
    
    // Strip leading colons, bullets, hyphens, and spaces
    cleaned = cleaned.replace(/^[\s:*•\-]+/g, '');
    
    return cleaned.trim();
  };

  const isExpertJSON =
    explanation &&
    (explanation.stream === 'mppsc_expert' ||
      explanation.conceptual_depth ||
      explanation.toppers_mantra ||
      explanation.topic_micro_mapping);

  // Fallback: If it's not valid expert JSON, render it as clean text below a beautiful amber heading pill
  if (!isExpertJSON) {
    const rawCleaned = cleanText(insightsText);
    return (
      <div className="space-y-3.5 mt-3 pl-1 text-left">
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-xl border-2 px-4 py-1.5 text-[13px] font-black uppercase tracking-widest shadow-md',
            themeDeep
              ? 'border-amber-500/40 bg-amber-950/40 text-amber-300'
              : 'border-amber-200 bg-amber-50 text-amber-800'
          )}
        >
          <Trophy className="h-4 w-4 text-amber-500" />
          <span>{hi ? 'एक्सपर्ट टिप्स' : 'Expert Tips'}</span>
        </div>
        <p className="text-[15.5px] leading-[1.7] text-slate-800 dark:text-slate-100 font-semibold whitespace-pre-line pl-1">
          {rawCleaned}
        </p>
      </div>
    );
  }

  // Helper to extract bilingual fields safely
  const getField = (base: string) => {
    const fieldHi = explanation[`${base}_hi`] || explanation[base];
    const fieldEn = explanation[`${base}_en`] || explanation[base];
    const raw = hi ? fieldHi : fieldEn;
    return cleanText(raw);
  };

  const topic = getField('topic_micro_mapping');
  const conceptual = getField('conceptual_depth');
  const inter = getField('interdisciplinary_link');
  const elim = getField('elimination_strategy');
  const trend = getField('historical_trend');
  const mnemonic = getField('memory_mnemonic');
  const source = getField('ncert_reference') || getField('source');
  const mains = getField('mains_application');
  const mantra = getField('toppers_mantra');

  const items = [
    {
      key: 'conceptual_depth',
      label: hi ? 'संकल्पनात्मक केंद्र' : 'Conceptual Core',
      icon: <BookOpen className="h-4 w-4 shrink-0" />,
      content: conceptual,
      theme: 'amber' as const,
    },
    {
      key: 'interdisciplinary_link',
      label: hi ? 'अंतःविषय कड़ी' : 'Interdisciplinary Link',
      icon: <Link2 className="h-4 w-4 shrink-0" />,
      content: inter,
      theme: 'sky' as const,
    },
    {
      key: 'elimination_strategy',
      label: hi ? 'एलिमिनेशन रणनीति' : 'Elimination Strategy',
      icon: <Zap className="h-4 w-4 shrink-0" />,
      content: elim,
      theme: 'pink' as const,
    },
    {
      key: 'historical_trend',
      label: hi ? 'अनुभवी की सूझ' : 'Historical Trend',
      icon: <TrendingUp className="h-4 w-4 shrink-0" />,
      content: trend,
      theme: 'rose' as const,
    },
    {
      key: 'memory_mnemonic',
      label: hi ? 'स्मरण भंडार (निमोनिक)' : 'Memory Mnemonic',
      icon: <Brain className="h-4 w-4 shrink-0" />,
      content: mnemonic,
      theme: 'indigo' as const,
    },
    {
      key: 'ncert_reference',
      label: hi ? 'एनसीईआरटी व संदर्भ' : 'NCERT & Reference',
      icon: <Bookmark className="h-4 w-4 shrink-0" />,
      content: source,
      theme: 'slate' as const,
    },
    {
      key: 'mains_application',
      label: hi ? 'मुख्य परीक्षा अनुप्रयोग' : 'Mains Application',
      icon: <PenTool className="h-4 w-4 shrink-0" />,
      content: mains,
      theme: 'purple' as const,
    },
    {
      key: 'toppers_mantra',
      label: hi ? 'टॉपर का मंत्र' : 'Topper\'s Mantra',
      icon: <Trophy className="h-4 w-4 shrink-0" />,
      content: mantra,
      theme: 'gold' as const,
    },
  ].filter((item) => item.content.length > 0);

  return (
    <div className="space-y-8 mt-6 pl-1 text-left">
      {/* 1. Topic Micro-Mapping */}
      {topic && (
        <div className="space-y-3">
          <div>
            <div
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border-2 px-4 py-1.5 text-[13px] font-black uppercase tracking-widest shadow-md',
                themeDeep
                  ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-900'
              )}
            >
              <Layers className="h-4 w-4 text-emerald-500" />
              <span>{hi ? 'टॉपिक माइक्रो-मैपिंग' : 'Topic Micro-Mapping'}</span>
            </div>
          </div>
          <p className="text-[15.5px] leading-[1.7] font-bold text-slate-900 dark:text-slate-100 pl-1">
            {topic}
          </p>
        </div>
      )}

      {/* Render each of the remaining fields */}
      {items.map((it) => {
        // Precise alternative background and border-2 colors mapping perfectly to card hues
        const badgeClasses = {
          amber: themeDeep
            ? 'border-amber-500/40 bg-amber-950/40 text-amber-300'
            : 'border-amber-300 bg-amber-50 text-amber-800',
          sky: themeDeep
            ? 'border-sky-500/40 bg-sky-950/40 text-sky-300'
            : 'border-sky-300 bg-sky-50 text-sky-800',
          pink: themeDeep
            ? 'border-pink-500/40 bg-pink-950/40 text-pink-300'
            : 'border-pink-300 bg-pink-50 text-pink-800',
          rose: themeDeep
            ? 'border-rose-500/40 bg-rose-950/40 text-rose-300'
            : 'border-rose-300 bg-rose-50 text-rose-800',
          indigo: themeDeep
            ? 'border-indigo-500/40 bg-indigo-950/40 text-indigo-300'
            : 'border-indigo-300 bg-indigo-50 text-indigo-800',
          slate: themeDeep
            ? 'border-slate-600 bg-slate-900/60 text-slate-300'
            : 'border-slate-300 bg-slate-50 text-slate-700',
          purple: themeDeep
            ? 'border-purple-500/40 bg-purple-950/40 text-purple-300'
            : 'border-purple-300 bg-purple-50 text-purple-800',
          gold: themeDeep
            ? 'border-amber-400/40 bg-amber-950/60 text-amber-200'
            : 'border-amber-400 bg-amber-50/90 text-amber-900',
        }[it.theme];

        const isMantra = it.key === 'toppers_mantra';
        const isInter = it.key === 'interdisciplinary_link';

        return (
          <div key={it.key} className="space-y-3">
            {/* Themed capsule border-2 box heading */}
            <div>
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl border-2 px-4 py-1.5 text-[13px] font-black uppercase tracking-widest shadow-md',
                  badgeClasses
                )}
              >
                {it.icon}
                <span>{it.label}</span>
              </div>
            </div>

            {/* Content text directly below the heading box */}
            <p
              className={cn(
                'text-[15.5px] leading-[1.7] pl-1',
                isMantra
                  ? 'font-bold text-slate-900 dark:text-slate-50 text-[16px]'
                  : isInter
                    ? 'font-semibold italic text-slate-700 dark:text-slate-300'
                    : 'font-semibold text-slate-800 dark:text-slate-100'
              )}
            >
              {it.content}
            </p>
          </div>
        );
      })}
    </div>
  );
}
