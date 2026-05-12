'use client';

import { useState } from 'react';
import { MainsContentViewer } from '@/components/mains/MainsContentViewer';
import { MainsHistoryRichViewer } from '@/components/mains/MainsHistoryRichViewer';
import { MAINS_HISTORY_RICH_VERSION } from '@/lib/mains-history-rich-normalize';
import { useSettingsStore } from '@/store/useSettingsStore';
import { FileQuestion, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SyllabusLockMainsModal } from '@/features/mains/components/SyllabusLockMainsModal';

type Topic = { id: string; titleHi: string; titleEn: string; unitId: string };

type ContentShape = {
  conceptHi: string;
  conceptEn: string;
  expertStrategyHi: string;
  expertStrategyEn: string;
  modelAnswers: Record<string, { text: string }[]>;
  keyTermsHi?: string | null;
  keyTermsEn?: string | null;
  richPayload?: Record<string, unknown> | null;
};

export function MainsTopicContentClient({
  topic,
  content,
  vaultLocked = false,
}: {
  topic: Topic;
  content: ContentShape | null;
  /** When true, show a short preview + same vault modal as PYQ / gate (no `mppsc_mains`). */
  vaultLocked?: boolean;
}) {
  const { language } = useSettingsStore();
  const lang: 'hi' | 'en' = language === 'hi' ? 'hi' : 'en';
  const [vaultModalOpen, setVaultModalOpen] = useState(false);

  if (!content) {
    const hi = lang === 'hi';
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
        <FileQuestion className="h-14 w-14 text-slate-500" />
        <div className="max-w-md space-y-2">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {hi ? topic.titleHi : topic.titleEn}
          </h2>
          <p className="text-sm text-slate-500">
            {hi
              ? 'इस टॉपिक का एक्सपर्ट कंटेंट (कॉन्सेप्ट, मॉडल उत्तर, रणनीति) जल्द जोड़ा जाएगा। अभी सिलेबस पॉइंट ही सूची में उपलब्ध है।'
              : 'Expert commentary (concept, model answers, strategy) for this topic is not in the database yet. The syllabus point is listed; content is added via admin.'}
          </p>
        </div>
      </div>
    );
  }

  const rich = content.richPayload;
  const useRich =
    rich &&
    typeof rich === 'object' &&
    (String((rich as { schema_version?: string }).schema_version) === MAINS_HISTORY_RICH_VERSION ||
      typeof (rich as { cognitive_intro_hi?: string }).cognitive_intro_hi === 'string');

  const inner =
    useRich && rich ? (
      <MainsHistoryRichViewer topicTitleHi={topic.titleHi} topicTitleEn={topic.titleEn} payload={rich} uiLang={lang} />
    ) : (
      <MainsContentViewer
        topic={topic}
        content={content}
        language={lang}
        onMarkDone={() => {}}
        isDone={false}
      />
    );

  if (!vaultLocked) {
    return inner;
  }

  const hi = lang === 'hi';

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-slate-950">
      <div className="relative max-h-[min(52vh,560px)] shrink-0 overflow-hidden">
        <div className="pointer-events-none select-none opacity-95">{inner}</div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 top-1/3 bg-gradient-to-b from-transparent via-slate-950/85 to-slate-950 dark:from-transparent dark:via-slate-950/90 dark:to-slate-950"
          aria-hidden
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4 border-t border-slate-200 bg-slate-950 px-5 py-10 text-center dark:border-slate-800">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
          <Lock className="h-3 w-3" aria-hidden />
          {hi ? 'मेंस लाइब्रेरी' : 'Mains Library'}
        </div>
        <p className="max-w-md text-sm leading-relaxed text-slate-400">
          {hi
            ? 'प्रत्येक टॉपिक की गहरी समझ, प्रामाणिक द्विभाषी मॉडल उत्तर और रणनीतिक विश्लेषण मेंस प्लान से अनलॉक होते हैं।'
            : 'Deep syllabus concepts, authentic bilingual model answers, and strategic insights unlock with the Mains plan.'}
        </p>
        <Button
          type="button"
          onClick={() => setVaultModalOpen(true)}
          className={cn(
            'h-12 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-500 px-8 font-black text-white shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] active:scale-[0.98]'
          )}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {hi ? 'लाइब्रेरी अनलॉक / कीमत' : 'Unlock Library · pricing'}
        </Button>
        <SyllabusLockMainsModal open={vaultModalOpen} onOpenChange={setVaultModalOpen} />
      </div>
    </div>
  );
}
