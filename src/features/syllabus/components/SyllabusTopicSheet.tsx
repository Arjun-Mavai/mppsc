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
  Target,
  Layers,
  Link2,
  Flame,
  ArrowLeft,
  TrendingUp,
  Star,
  AlertTriangle,
  AlertCircle,
  CheckSquare,
  LayoutDashboard,
  RefreshCw,
  Lock,
  X,
  Quote,
  Zap,
  BookOpen,
  ArrowRight,
  Trophy,
  History,
  ClipboardList,
  ExternalLink,
  ArrowUpCircle,
  Eye,
} from 'lucide-react';
import { TopicData } from '@/app/syllabus/[unitId]/UnitContent';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useEffect, useState, useTransition } from 'react';
import { getRevisionCount, markTopicRevised } from '@/features/syllabus/actions/revision';
import { useSettingsStore } from '@/store/useSettingsStore';
import { logger } from '@/lib/logger';
import { motion, AnimatePresence } from 'framer-motion';
import { MainsMarkdownBody } from '@/components/mains/MainsMarkdownBody';
import Link from 'next/link';
import { hasMainsAccess } from '@/lib/access-grants';
import { QuickFeedback } from '@/features/tests/components/QuickFeedback';

const pyqSkins = [
  {
    bg: 'bg-rose-50/30 border-rose-100/70 text-rose-950 hover:bg-rose-50/50 hover:border-rose-300',
    starBg: 'bg-rose-100 text-rose-600',
    answerBadge: 'bg-rose-100/80 border-rose-200 text-rose-700',
    answerBg: 'bg-rose-50/60 border-rose-100 text-rose-900'
  },
  {
    bg: 'bg-emerald-50/30 border-emerald-100/70 text-emerald-950 hover:bg-emerald-50/50 hover:border-emerald-300',
    starBg: 'bg-emerald-100 text-emerald-600',
    answerBadge: 'bg-emerald-100/80 border-emerald-200 text-emerald-700',
    answerBg: 'bg-emerald-50/60 border-emerald-100 text-emerald-900'
  },
  {
    bg: 'bg-indigo-50/30 border-indigo-100/70 text-indigo-950 hover:bg-indigo-50/50 hover:border-indigo-300',
    starBg: 'bg-indigo-100 text-indigo-600',
    answerBadge: 'bg-indigo-100/80 border-indigo-200 text-indigo-700',
    answerBg: 'bg-indigo-50/60 border-indigo-100 text-indigo-900'
  },
  {
    bg: 'bg-amber-50/30 border-amber-100/70 text-amber-950 hover:bg-amber-50/50 hover:border-amber-300',
    starBg: 'bg-amber-100 text-amber-600',
    answerBadge: 'bg-amber-100/80 border-amber-200 text-amber-700',
    answerBg: 'bg-amber-50/60 border-amber-100 text-amber-900'
  },
  {
    bg: 'bg-sky-50/30 border-sky-100/70 text-sky-950 hover:bg-sky-50/50 hover:border-sky-300',
    starBg: 'bg-sky-100 text-sky-600',
    answerBadge: 'bg-sky-100/80 border-sky-200 text-sky-700',
    answerBg: 'bg-sky-50/60 border-sky-100 text-sky-900'
  }
];

function parseQuestionAndAnswer(q: string) {
  // Clean leading number like "1. ", "2) " etc.
  let cleanQ = q.replace(/^\d+[\.\)\s]+\s*/, '').trim();

  // 1. Match bracket at the end containing the answer (with or without 'उत्तर/Answer' prefix, max 40 chars)
  const endBracketMatch = cleanQ.match(/[\(（]\s*(?:उत्तर|Answer)?\s*[:ः\-–—\s]*([^\)）]{1,40})[\)）]\s*$/i);
  if (endBracketMatch) {
    const matchedFull = endBracketMatch[0];
    const answerText = endBracketMatch[1]!.trim();
    const questionText = cleanQ.replace(matchedFull, '').trim();
    return { question: questionText, answer: answerText };
  }

  // 2. Generic fallback if 'उत्तर/Answer' is in brackets anywhere
  const match = cleanQ.match(/[\(（]\s*(उत्तर|Answer)\s*[:ः\-–—\s]\s*([^\)）]+)[\)）]?/i);
  if (match) {
    const questionText = cleanQ.replace(match[0], '').trim();
    const answerText = match[2].trim();
    return { question: questionText, answer: answerText };
  }

  // 3. Fallback if answer is not in brackets but after a separator:
  const sepMatch = cleanQ.match(/(उत्तर|Answer)\s*[:ः\-–—]\s*(.+)$/i);
  if (sepMatch) {
    const questionText = cleanQ.replace(sepMatch[0], '').trim();
    const answerText = sepMatch[2].trim();
    return { question: questionText, answer: answerText };
  }

  return { question: cleanQ, answer: null };
}

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
  const { user, isSubscribed } = useSettingsStore();
  const [revisionCount, setRevisionCount] = useState<number | undefined>(0);
  const [isPending, startTransition] = useTransition();
  const [isRevising, setIsRevising] = useState(false);
  const [viewMode, setViewMode] = useState<'classic' | 'expert' | 'official'>('classic');
  const [decodedViewMode, setDecodedViewMode] = useState<'ai' | 'old'>('ai');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (open && topic && user) {
      getRevisionCount(topic.id.toString()).then((count) => {
        setRevisionCount(count);
      });
    } else {
      setRevisionCount(0);
    }
  }, [open, topic, user]);

  const handleMarkRevised = () => {
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

    startTransition(async () => {
      try {
        const res = await markTopicRevised(topic.id.toString(), targetUnitId);
        if (res.success && res.count) {
          setRevisionCount(res.count);
          toast.success(language === 'hi' ? 'पुनरीक्षण दर्ज किया गया!' : 'Revision recorded!');
        }
      } catch {
        toast.error('Failed to save revision');
      } finally {
        setTimeout(() => setIsRevising(false), 1000);
      }
    });
  };

  const RevisionButton = () => (
    <div className="flex items-center gap-3">
      {user && revisionCount !== undefined && revisionCount > 0 && (
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
          <RefreshCw className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-sm font-black text-emerald-700 tabular-nums">{revisionCount}</span>
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
              ? 'border-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white'
              : 'bg-slate-900 text-white hover:bg-slate-800'
        )}
      >
        {isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : !user ? <Lock className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-4 w-4" />}
        {language === 'hi' ? 'रिवाइज्ड' : 'Mark Revised'}
      </Button>
    </div>
  );

  const SectionHeading = ({ icon: Icon, title, colorClass, emoji, accentColor, description }: { icon: any, title: string, colorClass: string, emoji?: string, accentColor?: string, description?: string }) => (
    <div className={cn("flex flex-col gap-1 mb-6 mt-2")}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg ring-1 ring-black/5",
          colorClass
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase flex items-center gap-2 leading-none">
            {emoji && <span>{emoji}</span>}
            {title}
          </h3>
          {description && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{description}</p>}
        </div>
      </div>
      {accentColor && <div className={cn("h-1 w-20 rounded-full mt-3", accentColor)} />}
    </div>
  );

  if (!topic) return null;

  const isHindi = language === 'hi';
  const hasMains = hasMainsAccess(user);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        side="right"
        className="w-full border-l border-slate-200 p-0 shadow-2xl outline-none sm:w-[580px] sm:max-w-none"
        showCloseButton={false}
      >
        <div className="sr-only">
          <SheetTitle>{topic.front}</SheetTitle>
        </div>
        <div className="flex h-full flex-col bg-[#f8fafc]">
          {/* Header - Fixed Height */}
          <div className="sticky top-0 z-40 flex shrink-0 flex-col gap-4 border-b border-slate-200 bg-white/95 backdrop-blur-md p-5 shadow-sm md:px-7 md:py-6">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="max-w-[240px] truncate border-slate-200 bg-slate-50/50 py-1 font-black text-slate-500 uppercase tracking-widest text-[9px]">
                {unitTitle}
              </Badge>
              <div className="flex items-center gap-3">
                <RevisionButton />
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition-colors">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </div>
            </div>

            <div className="mt-1">
              <h2 className={cn(
                "font-display text-2xl font-black tracking-tight text-slate-900 sm:text-3xl leading-tight",
                isHindi ? "font-[family-name:var(--font-pyq-dev)]" : ""
              )}>
                {topic.front}
              </h2>

              {/* About description - always visible under the title */}
              {topic.back && (
                <div className="mt-3 border-l-4 border-slate-300 pl-4 text-slate-500 text-sm font-medium leading-relaxed italic dark:border-slate-800 dark:text-slate-400">
                  {topic.back}
                </div>
              )}
            </div>

            <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-100 p-1.5 shadow-inner">
              <button
                onClick={() => setViewMode('classic')}
                className={cn(
                  'flex-1 rounded-xl py-2.5 text-[10px] font-black uppercase tracking-widest transition-all',
                  viewMode === 'classic'
                    ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5 scale-[1.02]'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                {isHindi ? 'क्लासिक नोट्स' : 'Classic Notes'}
              </button>
              <button
                onClick={() => setViewMode('expert')}
                className={cn(
                  'flex-1 rounded-xl py-2.5 text-[10px] font-black uppercase tracking-widest transition-all',
                  viewMode === 'expert'
                    ? 'bg-slate-900 text-white shadow-md scale-[1.02]'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                {isHindi ? 'एक्सपर्ट डिकोडिंग' : 'Expert Decoding'}
              </button>
              {/* <button
                onClick={() => setViewMode('official')}
                className={cn(
                  'flex-1 rounded-xl py-2.5 text-[10px] font-black uppercase tracking-widest transition-all',
                  viewMode === 'official'
                    ? 'bg-slate-900 text-white shadow-md scale-[1.02]'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                {isHindi ? 'आधिकारिक' : 'Official'}
              </button> */}
            </div>
          </div>

          <div className="h-full w-full flex-1 overflow-y-auto">
            <div className="space-y-10 p-3 pb-40 sm:p-4">

              {/* Special Spark Card - Quote */}
              {topic.quote && (() => {
                const cleanQuote = topic.quote.replace(/^["'“”\s]+|["'“”\s]+$/g, '').trim();

                // Intelligently extract author if present
                const dashIndex = cleanQuote.lastIndexOf('-');
                const emDashIndex = cleanQuote.lastIndexOf('—');
                const splitIndex = Math.max(dashIndex, emDashIndex);

                let quoteText = cleanQuote;
                let authorText = '';
                if (splitIndex !== -1 && splitIndex > cleanQuote.length - 60) {
                  quoteText = cleanQuote.substring(0, splitIndex).trim().replace(/["'“”\s\-\—]+$/g, '');
                  authorText = cleanQuote.substring(splitIndex + 1).trim();
                }

                return (
                  <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#020617] p-6 sm:p-7 text-white shadow-2xl border border-indigo-500/20 shadow-indigo-950/20">
                    <Quote className="absolute -left-4 -top-4 h-24 w-24 text-white/5 rotate-12 pointer-events-none" />
                    <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-amber-300 backdrop-blur-sm shadow-inner shadow-black/20">
                        <Sparkles className="h-3.5 w-3.5 fill-amber-300/20" /> {isHindi ? "चिंतन बिंदु" : "The Cognitive Spark"}
                      </div>
                      <p className={cn(
                        "text-[15px] sm:text-[16px] leading-[1.8] sm:leading-[1.9] tracking-wide text-slate-100 font-medium italic",
                        isHindi ? "font-[family-name:var(--font-pyq-dev)]" : "font-[family-name:var(--font-pyq-serif)]"
                      )}>
                        "{quoteText}"
                      </p>

                      {authorText && (
                        <div className="mt-4 flex flex-col items-center gap-2 w-full">
                          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                          <span className="text-[10px] font-black tracking-[0.2em] text-amber-400 uppercase leading-none">
                            — {authorText}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {viewMode === 'classic' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-14"
                >
                  {/* Introduction - Now in points like facts */}
                  {topic.introduction && (
                    <section className="space-y-5">
                      <SectionHeading
                        icon={BookOpen}
                        title={isHindi ? 'विषय परिचय' : 'Topic Intro'}
                        colorClass="bg-rose-600 text-white"
                        emoji="🧭"
                        accentColor="bg-rose-500"
                        description={isHindi ? "महत्वपूर्ण पृष्ठभूमि और संदर्भ" : "Essential background & context"}
                      />
                      <MainsMarkdownBody
                        markdown={(() => {
                          const introPoints = topic.introduction
                            .replace(/\r\n/g, '\n')
                            .split('\n')
                            .map(line => line.trim())
                            .map(line => line.replace(/^[-*•]\s*/, '').trim())
                            .filter(Boolean);
                          return introPoints.map(f => `- ${f}`).join('\n');
                        })()}
                        isHindi={isHindi}
                        itemClassName="border-slate-100 bg-slate-50/45 hover:bg-white hover:border-slate-300 transition-all duration-300 p-3 sm:p-3.5"
                        bulletClassName="bg-indigo-500 shadow-indigo-500/20"
                        flashLineBullets={true}
                        splitSentences={true}
                      />
                    </section>
                  )}

                  {/* Facts for Prelims */}
                  {(topic.facts_for_prelims || topic.important_facts) && (
                    <section className="space-y-5">
                      <SectionHeading icon={CheckCircle2} title={isHindi ? 'महत्वपूर्ण तथ्य (Prelims)' : 'Key Facts (Prelims)'} colorClass="bg-emerald-600 text-white" emoji="✅" accentColor="bg-emerald-500" description="High yield points for prelims" />
                      <MainsMarkdownBody
                        markdown={((topic.facts_for_prelims || topic.important_facts) ?? []).map(f => `- ${f}`).join('\n')}
                        isHindi={isHindi}
                        itemClassName="border-emerald-100 bg-emerald-50/30 hover:bg-white hover:border-emerald-300 transition-all duration-300"
                        bulletClassName="bg-emerald-500 shadow-emerald-500/20"
                        flashLineBullets={true}
                      />
                    </section>
                  )}

                  {/* Mnemonics - The "Aha!" Section */}
                  {topic.mnemonic && (
                    <section className="space-y-5">
                      <SectionHeading icon={Brain} title={isHindi ? 'मेमोरी हुक (ट्रिक)' : 'Memory Hook (Trick)'} colorClass="bg-amber-500 text-white" emoji="🧠" accentColor="bg-amber-400" description="Never forget this topic" />
                      <div className="group relative overflow-hidden rounded-[1.5rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-50/30 p-4 sm:p-5 shadow-lg shadow-amber-200/10 transition-all hover:border-amber-400">
                        <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-amber-100/50 blur-3xl" />
                        <Brain className="absolute -right-2 -top-2 h-24 w-24 text-amber-200 opacity-40 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                        <h4 className="mb-3 text-[10px] font-black tracking-[0.2em] text-amber-600 uppercase">MNEMONIC MASTERPIECE</h4>
                        <p className={cn(
                          "relative z-10 text-2xl font-black tracking-tight text-amber-950 sm:text-3xl leading-snug",
                          isHindi ? "font-[family-name:var(--font-pyq-dev)]" : ""
                        )}>
                          {topic.mnemonic}
                        </p>
                      </div>
                    </section>
                  )}

                  {/* Prelims PYQs */}
                  {topic.pyq_pre_examples && topic.pyq_pre_examples.length > 0 && (
                    <section className="space-y-5">
                      <SectionHeading
                        icon={FileText}
                        title={isHindi ? 'विगत वर्षों के प्रश्न' : 'Past Year Questions'}
                        colorClass="bg-rose-600 text-white"
                        emoji="📊"
                        accentColor="bg-rose-500"
                        description={isHindi ? "परीक्षा में पहले पूछे गए प्रश्न" : "How examiner tested this before"}
                      />
                      <div className="grid gap-4">
                        {topic.pyq_pre_examples.map((q, i) => {
                          const parsed = parseQuestionAndAnswer(q);
                          const skin = pyqSkins[i % pyqSkins.length];
                          const isRevealed = !!revealedAnswers[i];

                          return (
                            <div
                              key={i}
                              className={cn(
                                "group relative overflow-hidden rounded-[1.25rem] border p-4 sm:p-5 shadow-sm transition-all duration-300",
                                skin.bg
                              )}
                            >
                              <div className="flex items-start gap-4">
                                <div className={cn(
                                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ring-4 ring-black/[0.02]",
                                  skin.starBg
                                )}>
                                  {i + 1}
                                </div>
                                <div className="flex-1 space-y-4">
                                  <p className={cn(
                                    "text-base font-bold leading-relaxed",
                                    isHindi ? "font-[family-name:var(--font-pyq-dev)] text-slate-900" : "text-slate-800"
                                  )}>
                                    {parsed.question}
                                  </p>

                                  {parsed.answer && (
                                    <div className="flex flex-col items-start gap-3 w-full">
                                      <div className="relative">
                                        <button
                                          onClick={() => setRevealedAnswers(prev => ({ ...prev, [i]: !prev[i] }))}
                                          className={cn(
                                            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all duration-200 active:scale-95 border shadow-sm",
                                            isRevealed
                                              ? "bg-slate-900 border-slate-950 text-white hover:bg-slate-800"
                                              : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                                          )}
                                        >
                                          {isRevealed ? <X className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                          {isRevealed ? (isHindi ? "उत्तर छिपाएं" : "Hide Answer") : (isHindi ? "उत्तर जांचें (Check Answer)" : "Check Answer")}
                                        </button>

                                        {/* Onboarding Nudge: Sweeping pink arrow pointing left from the right side of the Check Answer button */}
                                        {i === 0 && !isRevealed && (
                                          <motion.div
                                            initial={{ opacity: 0, x: 20, scale: 0.8 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            transition={{ duration: 0.7, ease: "easeOut" }}
                                            className="absolute left-[100%] top-[2px] w-[120px] h-[60px] pointer-events-none select-none z-30 ml-3"
                                          >
                                            {/* 💡 Text badge "Click Here" / "यहाँ क्लिक करें" floating and static */}
                                            <div className="absolute left-[8px] top-[-22px] whitespace-nowrap rounded-full bg-gradient-to-r from-pink-500 to-rose-500 border border-pink-400 px-2.5 py-0.5 text-[8px] font-black text-white uppercase tracking-wider shadow-md shadow-pink-500/20">
                                              {isHindi ? "यहाँ क्लिक करें! ⚡" : "Click Here! ⚡"}
                                            </div>

                                            {/* 🎨 Curvy Pink Onboarding Arrow sweeping elegantly from right to left */}
                                            <svg width="80" height="50" viewBox="0 0 80 50" fill="none" className="filter drop-shadow-[0_2.5px_6px_rgba(236,72,153,0.45)]">
                                              <path
                                                d="M70 38C50 38 30 20 10 15"
                                                stroke="#ec4899"
                                                strokeWidth="4.5"
                                                strokeLinecap="round"
                                              />
                                              <path
                                                d="M24 10L10 15L18 28"
                                                stroke="#ec4899"
                                                strokeWidth="4.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              />
                                            </svg>

                                            {/* 🚶‍♂️ Walking Man - Placed at the tail (right) of the arrow, made larger */}
                                            <div className="absolute left-[72px] top-[14px] text-4xl filter drop-shadow-md">
                                              🚶‍♂️
                                            </div>
                                          </motion.div>
                                        )}
                                      </div>

                                      <AnimatePresence initial={false}>
                                        {isRevealed && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: "easeInOut" }}
                                            className="overflow-hidden w-full"
                                          >
                                            <div className="pt-2">
                                              <div className={cn(
                                                "border-l-4 pl-3.5 py-1.5 flex flex-col gap-1 w-full",
                                                i % 5 === 0 && "border-rose-500",
                                                i % 5 === 1 && "border-emerald-500",
                                                i % 5 === 2 && "border-indigo-500",
                                                i % 5 === 3 && "border-amber-500",
                                                i % 5 === 4 && "border-sky-500"
                                              )}>
                                                <span className={cn(
                                                  "text-[9px] font-black uppercase tracking-wider",
                                                  i % 5 === 0 && "text-rose-600",
                                                  i % 5 === 1 && "text-emerald-600",
                                                  i % 5 === 2 && "text-indigo-600",
                                                  i % 5 === 3 && "text-amber-600",
                                                  i % 5 === 4 && "text-sky-600"
                                                )}>
                                                  {isHindi ? "सही उत्तर" : "Correct Answer"}
                                                </span>
                                                <p className={cn(
                                                  "text-[16px] font-extrabold leading-relaxed text-slate-900",
                                                  isHindi ? "font-[family-name:var(--font-pyq-dev)]" : ""
                                                )}>
                                                  {parsed.answer}
                                                </p>
                                              </div>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </motion.div>
              )}

              {viewMode === 'expert' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-14"
                >
                  {/* Key Concepts - 360 Degree Breakdown */}
                  {topic.key_concepts && topic.key_concepts.length > 0 && (
                    <section className="space-y-4">
                      <SectionHeading icon={Layers} title={isHindi ? '360° अवधारणाएं' : '360° Dimensions'} colorClass="bg-indigo-600 text-white" emoji="🧭" accentColor="bg-indigo-400" description="Deep dive into core sub-topics" />
                      <div className="grid gap-3.5">
                        {topic.key_concepts.map((concept, i) => {
                          const variants = [
                            'border-pink-100 bg-gradient-to-br from-pink-50/45 via-white to-white hover:border-pink-300/60 shadow-sm shadow-pink-500/[0.015]',
                            'border-emerald-100 bg-gradient-to-br from-emerald-50/45 via-white to-white hover:border-emerald-300/60 shadow-sm shadow-emerald-500/[0.015]',
                            'border-amber-100 bg-gradient-to-br from-amber-50/45 via-white to-white hover:border-amber-300/60 shadow-sm shadow-amber-500/[0.015]',
                            'border-sky-100 bg-gradient-to-br from-sky-50/45 via-white to-white hover:border-sky-300/60 shadow-sm shadow-sky-500/[0.015]',
                          ];
                          const vIndex = i % 4;

                          return (
                            <div key={i} className={cn(
                              "relative overflow-hidden rounded-2xl border p-2.5 sm:p-3 shadow-sm transition-all hover:shadow-md hover:scale-[1.005] group",
                              variants[vIndex]
                            )}>
                              <div className="text-slate-800">
                                <MainsMarkdownBody
                                  markdown={concept}
                                  isHindi={isHindi}
                                  flashLineBullets={true}
                                  splitSentences={true}
                                  itemClassName="border-0 bg-transparent shadow-none p-0 py-0.5 space-y-1 overflow-visible"
                                  ulClassName="my-0.5 space-y-2 sm:space-y-2.5"
                                  bulletClassName={cn(
                                    vIndex === 0 && "bg-pink-500 shadow-pink-500/20",
                                    vIndex === 1 && "bg-emerald-500 shadow-emerald-500/20",
                                    vIndex === 2 && "bg-amber-500 shadow-amber-500/20",
                                    vIndex === 3 && "bg-sky-500 shadow-sky-500/20"
                                  )}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* Strategic Analysis & Examiner Mindset */}
                  {topic.ai_details && (
                    <section className="space-y-6">
                      <SectionHeading icon={Target} title={isHindi ? 'रणनीति और परीक्षा ट्रेंड' : 'Strategy & Exam Trend'} colorClass="bg-rose-500 text-white" emoji="🎯" accentColor="bg-rose-400" description="Decode the examiner's focus" />
                      <div className="rounded-[1.25rem] border border-rose-200 bg-white p-0 shadow-xl overflow-hidden">
                        <div className="flex flex-col">
                          <div className="bg-rose-500 p-3 px-4 flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                              <Sparkles className="h-5 w-5" />
                              <span className="text-xs font-black uppercase tracking-widest">{isHindi ? 'सिलेबस डिकोडिंग' : 'Syllabus Decoding'}</span>
                            </div>
                          </div>
                          <div className="p-4 sm:p-5">
                            <MainsMarkdownBody markdown={topic.ai_details} isHindi={isHindi} flashLineBullets={true} splitSentences={true} />
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Mains integration - High Value Zone */}
                  {topic.potential_mains_questions && topic.potential_mains_questions.length > 0 && (
                    <section className="space-y-4">
                      <SectionHeading icon={Trophy} title={isHindi ? 'मुख्य परीक्षा डिकोडर' : 'Mains Decoder'} colorClass="bg-slate-900 text-white" emoji="🏅" accentColor="bg-slate-700" />
                      <div className="grid gap-3">
                        {topic.potential_mains_questions.map((q, i) => {
                          const cleanQ = q
                            .replace(/\[\s*MPPSC\s*\]/gi, '')
                            .replace(/\[\s*Expected\s*\]/gi, '')
                            .replace(/[\(（]\s*\d+\s*(?:Marks|marks|अंक)\s*[\)）]/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();

                          return (
                            <div key={i} className="group relative overflow-hidden flex items-center gap-4 rounded-[1rem] bg-slate-900 p-4 sm:p-4 text-white shadow-xl transition-all hover:bg-slate-800">
                              <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-white/5 to-transparent" />
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-400 shadow-inner">
                                <Zap className="h-5 w-5" />
                              </div>
                              <p className={cn(
                                "text-[14px] font-bold leading-snug sm:text-base",
                                isHindi ? "font-[family-name:var(--font-pyq-dev)]" : ""
                              )}>
                                {cleanQ}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* External Link to Mains Library */}
                      <div className="mt-6 rounded-2xl bg-indigo-50 border border-indigo-100 p-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                              <Layers className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-black text-indigo-950 uppercase tracking-tight text-xs">{isHindi ? 'मेन्स पीवाईक्यू लाइब्रेरी' : 'Mains PYQ Library'}</h4>
                              <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">{isHindi ? 'संपूर्ण उत्तरों के साथ' : 'With comprehensive model answers'}</p>
                            </div>
                          </div>

                          {hasMains ? (
                            <Link href="/mains/pyq-library" passHref>
                              <Button className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest h-9 px-4 shadow-lg group">
                                {isHindi ? 'लाइब्रेरी देखें' : 'View Library'}
                                <ExternalLink className="ml-2 h-3 w-3" />
                              </Button>
                            </Link>
                          ) : (
                            <Link href="/mains" passHref>
                              <Button className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-black uppercase text-[10px] tracking-widest h-9 px-4 shadow-lg group">
                                {isHindi ? 'कॉम्बो में अपग्रेड करें' : 'Upgrade to Combo'}
                                <ArrowUpCircle className="ml-2 h-3 w-3" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </section>
                  )}

                  {/* examiner focus & pitfall */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {topic.examiner_focus && (
                      <div className="rounded-[1rem] border border-blue-200 bg-blue-50/40 p-4 shadow-sm hover:border-blue-400 transition-colors">
                        <h4 className="mb-2 flex items-center gap-2 text-[9px] font-black tracking-[0.2em] text-blue-700 uppercase">
                          <Target className="h-3 w-3" /> Examiner Focus
                        </h4>
                        <p className="text-[13px] font-bold leading-relaxed text-blue-900">{topic.examiner_focus}</p>
                      </div>
                    )}
                    {topic.common_pitfall && (
                      <div className="rounded-[1.25rem] border border-orange-200 bg-orange-50/40 p-4 shadow-sm hover:border-orange-400 transition-colors">
                        <h4 className="mb-2 flex items-center gap-2 text-[9px] font-black tracking-[0.2em] text-orange-700 uppercase">
                          <AlertCircle className="h-3 w-3" /> Common Pitfall
                        </h4>
                        <p className="text-[13px] font-bold leading-relaxed text-orange-900">{topic.common_pitfall}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* View Mode: Official Content */}
              {viewMode === 'official' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-12"
                >
                  <section className="space-y-5">
                    <SectionHeading
                      icon={ClipboardList}
                      title={isHindi ? 'मूल सिलेबस सामग्री' : 'Official Syllabus Content'}
                      colorClass="bg-slate-800 text-white"
                      emoji="📋"
                      accentColor="bg-slate-700"
                      description="Original content for reference"
                    />
                    <div className="rounded-[1.25rem] border border-slate-100 bg-white p-4 sm:p-5 shadow-sm ring-1 ring-black/[0.02]">
                      {topic.official_details ? (
                        <MainsMarkdownBody markdown={topic.official_details} isHindi={isHindi} />
                      ) : (
                        <div className="py-12 text-center text-slate-400">
                          <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p className="font-bold uppercase tracking-widest text-xs">No official details found in record</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex items-start gap-4">
                    <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-amber-900 leading-relaxed">
                      {isHindi
                        ? "यह सामग्री मूल सिलेबस के आधार पर है। नवीनतम परीक्षा पैटर्न और रणनीति के लिए 'क्लासिक' या 'एक्सपर्ट' मोड का उपयोग करें।"
                        : "This content is based on the original syllabus. Use 'Classic' or 'Expert' mode for the latest exam patterns and strategy."}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Enhanced Feedback Footer */}
              <div className="flex flex-col items-center gap-3 border-t border-slate-200/60 pt-10 text-center">
                <div className="h-1.5 w-16 rounded-full bg-slate-200" />
                <p className="text-xs font-black text-amber-600 uppercase tracking-[0.2em]">
                  {isHindi ? 'आपका फीडबैक' : 'Your Feedback'}
                </p>
                <h3 className="text-xl font-black text-slate-800 sm:text-2xl">
                  {isHindi ? 'यह कंटेंट आपके लिए कितना मददगार रहा?' : 'How helpful was this content for you?'}
                </h3>
                <p className="text-xs font-medium text-slate-500 max-w-xs leading-relaxed">
                  {isHindi ? 'आपके सुझाव हमें बेहतर बनाने में मदद करेंगे।' : 'Your feedback will help us improve our expert content.'}
                </p>
                <QuickFeedback
                  questionId={topic.id.toString()}
                  questionText={topic.front}
                  source="prelims_syllabus_topic"
                  className="mt-2"
                  unitInfo={unitTitle}
                />
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
