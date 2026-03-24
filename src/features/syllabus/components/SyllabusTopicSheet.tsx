import { Sheet, SheetContent, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Brain,
  FileText,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  X,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { TopicData } from '@/app/syllabus/[unitId]/UnitContent';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useEffect, useState, useTransition } from 'react';
import { getRevisionCount, markTopicRevised } from '@/features/syllabus/actions/revision';
import { useSettingsStore } from '@/store/useSettingsStore';
import { logger } from '@/lib/logger';

interface SyllabusTopicSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: TopicData | null;
  unitTitle: string;
  unitId: string;
  language?: 'hi' | 'en';
}

export function SyllabusTopicSheet({
  open,
  onOpenChange,
  topic,
  unitTitle,
  unitId,
  language = 'hi',
}: SyllabusTopicSheetProps) {
  // Apun user ko store se utha raha — guest check ke liye
  const { user } = useSettingsStore();
  const [revisionCount, setRevisionCount] = useState<number | undefined>(0);
  const [isPending, startTransition] = useTransition();
  const [isRevising, setIsRevising] = useState(false);

  // Jab sheet khule aur topic ho, tabhi revision count fetch kar — guest ke liye skip
  useEffect(() => {
    if (open && topic && user) {
      getRevisionCount(topic.id.toString()).then((count) => {
        logger.debug('Fetched revision count:', { count, category: 'system' });
        setRevisionCount(count);
      });
    } else {
      setRevisionCount(0);
    }
  }, [open, topic, user]);

  const handleMarkRevised = () => {
    // Guest user? — premium feature batao, API call mat karo
    if (!user) {
      toast.info(
        language === 'hi'
          ? 'रिवीज़न ट्रैकिंग प्रीमियम फीचर है — लॉगिन करें!'
          : 'Revision tracking is a premium feature — please login!',
        { duration: 3000 }
      );
      return;
    }
    if (!topic || isRevising) return;
    setIsRevising(true);
    const targetUnitId = unitId || topic.unitId;
    logger.debug('Marking revised:', {
      topicId: topic.id,
      unitId: targetUnitId,
      category: 'system',
    });

    startTransition(async () => {
      try {
        const res = await markTopicRevised(topic.id.toString(), targetUnitId);
        if (res.success && res.count) {
          setRevisionCount(res.count);
          toast.success(language === 'hi' ? 'पुनरीक्षण दर्ज किया गया!' : 'Revision recorded!');
        } else {
          toast.error(res.error || 'Failed to save revision');
        }
      } catch {
        toast.error('Failed to save revision');
      } finally {
        setTimeout(() => setIsRevising(false), 1000);
      }
    });
  };

  // Revision Button — guest ke liye lock icon, logged user ke liye proper count
  const RevisionButton = () => (
    <div className="flex items-center gap-3">
      {/* Revision count — proper counter badge feel, sirf logged user ko dikhao */}
      {user && revisionCount !== undefined && revisionCount > 0 && (
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
          <RefreshCw className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-sm font-black text-emerald-700 tabular-nums">{revisionCount}</span>
          <span className="text-[10px] font-medium text-emerald-500">
            {revisionCount === 1
              ? language === 'hi'
                ? 'बार'
                : 'time'
              : language === 'hi'
                ? 'बार'
                : 'times'}
          </span>
        </div>
      )}
      <Button
        size="sm"
        onClick={handleMarkRevised}
        disabled={isPending || isRevising}
        className={cn(
          'h-9 items-center gap-2 rounded-full px-4 text-xs font-bold shadow-md transition-all hover:shadow-lg active:scale-95',
          !user
            ? 'border border-slate-300 bg-slate-200 text-slate-500 hover:bg-slate-300'
            : revisionCount && revisionCount > 0
              ? 'border-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'
              : 'bg-slate-900 text-white hover:bg-slate-800'
        )}
      >
        {isPending ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        ) : !user ? (
          <Lock className="h-3.5 w-3.5" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        {language === 'hi' ? 'रिवाइज्ड' : 'Mark Revised'}
      </Button>
    </div>
  );

  if (!topic) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        side="right"
        className="w-full border-l border-slate-200 p-0 shadow-2xl outline-none sm:w-[540px] sm:max-w-none"
        showCloseButton={false}
      >
        <div className="sr-only">
          <SheetTitle>{topic.front}</SheetTitle>
        </div>
        <div className="flex h-full flex-col bg-slate-50">
          {/* Header */}
          <div className="sticky top-0 z-20 flex flex-col gap-4 border-b border-slate-200 bg-white p-5 shadow-sm md:p-6">
            {/* Top Row: Unit Badge + Close */}
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="max-w-[200px] truncate border-slate-200 font-medium text-slate-500"
              >
                {unitTitle}
              </Badge>

              <div className="flex items-center gap-2">
                {/* Back Button with Arrow */}
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {language === 'hi' ? 'वापस' : 'Back'}
                  </Button>
                </SheetClose>

                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full border border-transparent bg-rose-50 text-rose-500 transition-colors hover:border-rose-200 hover:bg-rose-100 hover:text-rose-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>
            </div>

            <div>
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-2xl leading-tight font-black tracking-tight text-slate-900 sm:text-3xl">
                  {topic.front}
                </h2>
                {topic.mnemonic && (
                  <div className="shrink-0">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600 shadow-sm"
                      title="Mnemonic Available"
                    >
                      <Lightbulb className="h-5 w-5 fill-amber-600/20" />
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-2 rounded-r-lg border-l-4 border-slate-400 bg-slate-50/50 py-1 pl-4 text-sm leading-relaxed font-medium text-slate-600 sm:text-base">
                {topic.back}
              </p>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)] w-full flex-1 p-0">
            <div className="space-y-8 p-5 pb-32 md:p-6">
              {/* 1. Mnemonic Section (If available) */}
              {topic.mnemonic ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-700 uppercase">
                      <Brain className="h-4 w-4" />{' '}
                      {language === 'hi' ? 'याद रखने की ट्रिक' : 'Memory Trick'}
                    </div>

                    {/* Prominent Back Button just above Memory Trick Section */}
                    <SheetClose asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 rounded-lg border-slate-200 bg-white px-3 text-[10px] font-black tracking-widest text-slate-500 uppercase transition-all hover:bg-slate-50 hover:text-slate-900"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        {language === 'hi' ? 'पीछे जाएं' : 'Back'}
                      </Button>
                    </SheetClose>

                    <RevisionButton />
                  </div>
                  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 p-6 text-white shadow-xl shadow-slate-500/20">
                    <div className="absolute top-0 right-0 p-3 opacity-10 transition-opacity group-hover:opacity-20">
                      <Brain className="h-24 w-24" />
                    </div>
                    <h4 className="mb-1.5 text-xs font-bold tracking-widest text-slate-300 uppercase opacity-80">
                      MNEMONIC
                    </h4>
                    <div className="font-mono text-xl leading-relaxed font-black tracking-wide sm:text-2xl">
                      {topic.mnemonic}
                    </div>
                  </div>
                </div>
              ) : (
                /* Fallback Button Location if no Mnemonic */
                <div className="flex items-center justify-between">
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 rounded-lg border-slate-200 bg-white px-3 text-[10px] font-black tracking-widest text-slate-500 uppercase transition-all hover:bg-slate-50 hover:text-slate-900"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      {language === 'hi' ? 'पीछे जाएं' : 'Back'}
                    </Button>
                  </SheetClose>
                  <RevisionButton />
                </div>
              )}

              {/* 2. Key Facts (Points) */}
              {topic.important_facts && topic.important_facts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-emerald-700 uppercase">
                    <CheckCircle2 className="h-4 w-4" />{' '}
                    {language === 'hi' ? 'महत्वपूर्ण तथ्य' : 'Key Facts'}
                  </div>
                  <ul className="grid gap-3">
                    {topic.important_facts.map((fact, i) => (
                      <li
                        key={i}
                        className="group flex items-start gap-4 rounded-xl border border-slate-200/60 bg-white p-4 transition-all hover:border-emerald-200 hover:shadow-md"
                      >
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600 ring-4 ring-emerald-50/50 transition-transform group-hover:scale-110">
                          {i + 1}
                        </div>
                        <span className="text-sm leading-relaxed font-medium text-slate-700 sm:text-base">
                          {fact}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 3. PYQ Section */}
              {topic.pyq && topic.pyq.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-rose-700 uppercase">
                    <FileText className="h-4 w-4" />{' '}
                    {language === 'hi' ? 'विगत वर्षों के प्रश्न' : 'Past Year Questions (PYQs)'}
                  </div>

                  <div className="space-y-4">
                    {topic.pyq.map((item, idx) => (
                      <div
                        key={idx}
                        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-rose-200"
                      >
                        <div className="absolute top-0 right-0 rounded-bl-xl bg-slate-100 px-3 py-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase transition-colors group-hover:bg-rose-50 group-hover:text-rose-600">
                          {item.year || 'PYQ'} • {item.type || 'PRELIMS'}
                        </div>
                        <p className="mb-3 pt-2 pr-8 text-base leading-snug font-bold text-slate-800 sm:text-lg">
                          "{item.question}"
                        </p>
                        {item.strategy && (
                          <div className="flex items-start gap-3 rounded-lg border border-rose-100 bg-rose-50/50 p-3 text-sm text-slate-700">
                            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                            <div>
                              <span className="mb-0.5 block text-xs font-bold tracking-wide text-rose-700 uppercase">
                                Strategy / Hint
                              </span>
                              {item.strategy}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback if no content */}
              {!topic.important_facts?.length && !topic.pyq?.length && !topic.mnemonic && (
                <div className="space-y-3 py-12 text-center opacity-60">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">
                    <Sparkles className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="font-medium text-slate-500">
                    Content is being curated by our Team.
                  </p>
                  <p className="text-xs text-slate-400">
                    Check back soon for deep notes on {topic.front}.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
