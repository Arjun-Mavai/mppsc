'use client';

import { useState, useCallback } from 'react';
import { getMainsTopicForPage } from '@/actions/mains-actions';
import { MainsTopicContentClient } from '@/components/mains/MainsTopicContentClient';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronDown, ExternalLink, Layers, Sparkles } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import type { MobileUnit } from '@/components/mains/MainsSyllabusPaperMobileGate';
import { mainsUnitShortBadge, mainsUnitSubtitle } from '@/lib/mains-syllabus-unit-label';

type TopicRow = MobileUnit['topics'][number];

export function MainsMobilePaperExplorer({
  paperId,
  paperNumber,
  titleEn,
  units,
  vaultUnlocked,
}: {
  paperId: string;
  paperNumber: number;
  titleEn: string;
  units: MobileUnit[];
  vaultUnlocked: boolean;
}) {
  const { language } = useSettingsStore();
  const hi = language === 'hi';
  const [openTopicId, setOpenTopicId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [cache, setCache] = useState<
    Record<
      string,
      {
        topic: {
          id: string;
          titleHi: string;
          titleEn: string;
          unitId: string;
        };
        content: Parameters<typeof MainsTopicContentClient>[0]['content'];
      }
    >
  >({});

  const toggleTopic = useCallback(
    async (topic: TopicRow, unitId: string) => {
      if (openTopicId === topic.id) {
        setOpenTopicId(null);
        return;
      }
      setOpenTopicId(topic.id);
      if (cache[topic.id]) return;
      setLoadingId(topic.id);
      try {
        const res = await getMainsTopicForPage(topic.id, paperId);
        if (res.success && res.data) {
          const row = res.data;
          const c = row.content;
          setCache((prev) => ({
            ...prev,
            [topic.id]: {
              topic: {
                id: row.id,
                titleHi: row.titleHi,
                titleEn: row.titleEn,
                unitId,
              },
              content: c
                ? {
                    conceptHi: c.conceptHi,
                    conceptEn: c.conceptEn,
                    expertStrategyHi: c.expertStrategyHi ?? '',
                    expertStrategyEn: c.expertStrategyEn ?? '',
                    modelAnswers: c.modelAnswers as Record<string, { text: string }[]>,
                    keyTermsHi: c.keyTermsHi ?? null,
                    keyTermsEn: c.keyTermsEn ?? null,
                    richPayload: (c as { richPayload?: Record<string, unknown> | null }).richPayload ?? null,
                  }
                : null,
            },
          }));
        }
      } finally {
        setLoadingId(null);
      }
    },
    [paperId, openTopicId]
  );

  const defaultOpenUnits = units.length ? [`unit-${units[0].id}`] : [];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="shrink-0 border-b border-slate-800/80 bg-slate-900/40 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/90">
              Paper {paperNumber}
            </p>
            <h1 className="mt-1 truncate text-lg font-black text-white">{titleEn}</h1>
            <p className="mt-1 text-xs text-slate-500">
              {hi ? 'यूनिट खोलें → टॉपिक पर टैप करें → नीचे विवरण खुलता है' : 'Open a unit → tap a topic → details expand inline'}
            </p>
          </div>
          <Sparkles className="h-8 w-8 shrink-0 text-amber-400/80" />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-28 pt-3">
        <Accordion type="multiple" defaultValue={defaultOpenUnits} className="space-y-2">
          {units.map((unit) => (
            <AccordionItem
              key={unit.id}
              value={`unit-${unit.id}`}
              className="overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/50 shadow-lg shadow-black/20"
            >
              <AccordionTrigger className="px-4 py-3 text-left hover:no-underline [&[data-state=open]]:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 min-w-[2.5rem] shrink-0 items-center justify-center rounded-xl bg-slate-800 px-1 text-[10px] font-black leading-tight text-emerald-400"
                    title={mainsUnitSubtitle(paperNumber, unit.part, unit.unitNumber, hi ? 'hi' : 'en')}
                  >
                    {mainsUnitShortBadge(unit.part, unit.unitNumber)}
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {mainsUnitSubtitle(paperNumber, unit.part, unit.unitNumber, hi ? 'hi' : 'en')}
                    </p>
                    <p className="line-clamp-2 text-sm font-bold text-slate-100">{hi ? unit.titleHi : unit.titleEn}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t border-slate-800/60 bg-slate-950/40 px-2 pb-3 pt-1">
                <div className="space-y-1">
                  {unit.topics.map((topic) => {
                    const open = openTopicId === topic.id;
                    const packed = cache[topic.id];
                    const loading = loadingId === topic.id;
                    return (
                      <div key={topic.id} className="rounded-xl border border-transparent">
                        <button
                          type="button"
                          onClick={() => toggleTopic(topic, unit.id)}
                          className={cn(
                            'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-left transition-colors',
                            open ? 'bg-emerald-500/15 ring-1 ring-emerald-500/30' : 'bg-slate-900/60 hover:bg-slate-800/80'
                          )}
                        >
                          <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-slate-100">
                            {hi ? topic.titleHi : topic.titleEn}
                          </span>
                          <ChevronDown
                            className={cn('h-4 w-4 shrink-0 text-slate-500 transition-transform', open && 'rotate-180 text-emerald-400')}
                          />
                        </button>

                        {open && (
                          <div className="mt-2 overflow-hidden rounded-xl border border-slate-800 bg-white dark:bg-slate-950">
                            {loading ? (
                              <div className="flex items-center gap-2 px-4 py-8 text-sm text-slate-500">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                                {hi ? 'लोड हो रहा है…' : 'Loading…'}
                              </div>
                            ) : packed ? (
                              <div className="max-h-[min(70vh,520px)] overflow-y-auto">
                                <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/95">
                                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                    {hi ? 'पूरा पेज' : 'Full page'}
                                  </span>
                                  <Button variant="outline" size="sm" className="h-8 gap-1 text-xs font-bold" asChild>
                                    <Link href={`/mains/syllabus/${paperId}/${topic.id}`}>
                                      <ExternalLink className="h-3.5 w-3.5" />
                                      {hi ? 'खोलें' : 'Open'}
                                    </Link>
                                  </Button>
                                </div>
                                <MainsTopicContentClient
                                  topic={packed.topic}
                                  content={packed.content}
                                  vaultLocked={!vaultUnlocked && !!packed.content}
                                />
                              </div>
                            ) : (
                              <div className="px-4 py-6 text-center text-sm text-slate-500">
                                {hi ? 'सामग्री लोड नहीं हो सकी' : 'Could not load content'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">
          <Layers className="h-4 w-4" />
          {units.reduce((n, u) => n + u.topics.length, 0)} {hi ? 'टॉपिक' : 'topics'}
        </div>
      </div>
    </div>
  );
}
