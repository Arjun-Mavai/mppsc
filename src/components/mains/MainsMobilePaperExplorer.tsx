'use client';

import { useState, useCallback } from 'react';
import { getMainsTopicForPage } from '@/actions/mains-actions';
import { MainsTopicContentClient } from '@/components/mains/MainsTopicContentClient';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronDown, ExternalLink, Layers, Lock, GraduationCap } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import type { MobileUnit } from '@/components/mains/MainsSyllabusPaperMobileGate';
import { mainsUnitShortBadge, mainsUnitSubtitle } from '@/lib/mains-syllabus-unit-label';
import { SyllabusLockMainsModal } from '@/features/mains/components/SyllabusLockMainsModal';
import { MAIN_SYLLABUS_CARD_HUES, mainsSyllabusTileSkin } from '@/components/mains/mainsSyllabusTileSkin';

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
  const [vaultModalOpen, setVaultModalOpen] = useState(false);
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
  const freeUnitId = units[0]?.id ?? null;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#fafbfc] text-slate-900 overflow-hidden">
      {/* Decorative premium colored blobs in background */}
      <div className="pointer-events-none absolute rounded-full blur-[100px] opacity-40 top-[-80px] right-[-120px] h-[420px] w-[420px] bg-pink-100" />
      <div className="pointer-events-none absolute rounded-full blur-[100px] opacity-40 top-[30%] left-[-100px] h-[380px] w-[380px] bg-emerald-100" />
      <div className="pointer-events-none absolute rounded-full blur-[100px] opacity-40 bottom-[10%] right-[10%] h-[320px] w-[320px] bg-amber-100" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50/80 to-transparent" />

      {/* Header Container */}
      <div className="relative z-10 shrink-0 border-b border-slate-200/80 bg-white/85 px-4 py-4 backdrop-blur-md shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
              Paper {paperNumber}
            </p>
            <h1 className="mt-1 truncate text-lg font-black text-slate-900">{titleEn}</h1>
            <p className="mt-1 text-xs text-slate-500">
              {hi ? 'यूनिट खोलें → टॉपिक पर टैप करें → नीचे विवरण खुलता है' : 'Open a unit → tap a topic → details expand inline'}
            </p>
          </div>
          <GraduationCap className="h-8 w-8 shrink-0 text-emerald-600/90" />
        </div>
      </div>

      {/* Main content list */}
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-28 pt-3">
        <Accordion type="multiple" defaultValue={defaultOpenUnits} className="space-y-3">
          {units.map((unit, unitIdx) => {
            const hue = MAIN_SYLLABUS_CARD_HUES[unitIdx % 4];
            const tileSkin = mainsSyllabusTileSkin(hue, false); // false = light mode styles
            const unitLocked = !vaultUnlocked && !!freeUnitId && unit.id !== freeUnitId;

            return (
              <AccordionItem
                key={unit.id}
                value={`unit-${unit.id}`}
                className={cn(
                  'overflow-hidden rounded-2xl border transition-all duration-300 shadow-sm',
                  tileSkin.frame
                )}
              >
                {unitLocked ? (
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-3 rounded-xl bg-white/80 border border-slate-200/80 backdrop-blur-sm px-3 py-3 shadow-inner">
                      <span
                        className={cn(
                          'flex h-9 min-w-[2.5rem] shrink-0 items-center justify-center rounded-xl px-1 text-[10px] font-black leading-tight',
                          tileSkin.markBadge
                        )}
                        title={mainsUnitSubtitle(paperNumber, unit.part, unit.unitNumber, hi ? 'hi' : 'en')}
                      >
                        {mainsUnitShortBadge(unit.part, unit.unitNumber)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-bold text-slate-800">{hi ? unit.titleHi : unit.titleEn}</p>
                        <p className="mt-1 text-[11px] text-slate-500">{hi ? 'यह यूनिट लॉक है' : 'This unit is locked'}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 border-none shadow-md font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95"
                        onClick={() => setVaultModalOpen(true)}
                      >
                        <Lock className="h-3.5 w-3.5" />
                        {hi ? 'Unlock' : 'Unlock'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <AccordionTrigger className="px-4 py-3 text-left hover:no-underline [&[data-state=open]]:bg-white/40">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'flex h-9 min-w-[2.5rem] shrink-0 items-center justify-center rounded-xl px-1 text-[10px] font-black leading-tight',
                            tileSkin.markBadge
                          )}
                          title={mainsUnitSubtitle(paperNumber, unit.part, unit.unitNumber, hi ? 'hi' : 'en')}
                        >
                          {mainsUnitShortBadge(unit.part, unit.unitNumber)}
                        </span>
                        <div className="min-w-0 text-left">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            {mainsUnitSubtitle(paperNumber, unit.part, unit.unitNumber, hi ? 'hi' : 'en')}
                          </p>
                          <p className="line-clamp-2 text-sm font-bold text-slate-900">{hi ? unit.titleHi : unit.titleEn}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="border-t border-slate-200/50 bg-white/40 px-2 pb-3 pt-1">
                      <div className="space-y-1.5">
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
                                  'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-left transition-all border shadow-sm',
                                  open
                                    ? 'bg-emerald-50/75 border-emerald-200/80 text-emerald-950'
                                    : 'bg-white/80 hover:bg-white border-slate-200/50 hover:border-slate-300'
                                )}
                              >
                                <span className={cn(
                                  'min-w-0 flex-1 text-sm font-bold leading-snug',
                                  open ? 'text-emerald-950' : 'text-slate-800'
                                )}>
                                  {hi ? topic.titleHi : topic.titleEn}
                                </span>
                                <ChevronDown
                                  className={cn(
                                    'h-4 w-4 shrink-0 transition-transform',
                                    open ? 'rotate-180 text-emerald-600' : 'text-slate-400'
                                  )}
                                />
                              </button>

                              {open && (
                                <div className="mt-2 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50 shadow-inner">
                                  {loading ? (
                                    <div className="flex items-center gap-2 px-4 py-8 text-sm text-slate-500">
                                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                                      {hi ? 'लोड हो रहा है…' : 'Loading…'}
                                    </div>
                                  ) : packed ? (
                                    <div className="max-h-[min(70vh,520px)] overflow-y-auto">
                                      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                          {hi ? 'पूरा पेज' : 'Full page'}
                                        </span>
                                        <Button
                                          size="sm"
                                          className="h-8 gap-1 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-sm transition-all rounded-lg active:scale-95"
                                          asChild
                                        >
                                          <Link href={`/mains/syllabus/${paperId}/${topic.id}`}>
                                            <ExternalLink className="h-3.5 w-3.5 text-white" />
                                            {hi ? 'खोलें' : 'Open'}
                                          </Link>
                                        </Button>
                                      </div>
                                      <MainsTopicContentClient
                                        topic={packed.topic}
                                        content={packed.content}
                                        vaultLocked={!vaultUnlocked && freeUnitId !== unit.id && !!packed.content}
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
                  </>
                )}
              </AccordionItem>
            );
          })}
        </Accordion>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500 font-semibold">
          <Layers className="h-4 w-4 text-slate-400" />
          {units.reduce((n, u) => n + u.topics.length, 0)} {hi ? 'टॉपिक' : 'topics'}
        </div>
      </div>
      <SyllabusLockMainsModal open={vaultModalOpen} onOpenChange={setVaultModalOpen} />
    </div>
  );
}
