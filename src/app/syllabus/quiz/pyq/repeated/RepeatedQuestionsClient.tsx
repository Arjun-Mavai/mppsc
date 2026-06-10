'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Filter,
  BookOpenText,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettingsStore } from '@/store/useSettingsStore';
import { RepeatedQuestion } from '@/actions/pyq-analytics';

interface RepeatedQuestionsClientProps {
  questions: RepeatedQuestion[];
  isAdmin?: boolean;
}

export default function RepeatedQuestionsClient({
  questions,
  isAdmin,
}: RepeatedQuestionsClientProps) {
  const router = useRouter();
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [minRepeats, setMinRepeats] = useState('2');

  // Extract unique subjects for filter
  const allSubjects = Array.from(
    new Set(questions.flatMap((q) => q.topics.map((t) => t.name)))
  ).sort();

  // Filter logic
  const filteredQuestions = questions.filter((q) => {
    // Search
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      q.text.toLowerCase().includes(searchLower) ||
      (q.textEn?.toLowerCase().includes(searchLower) ?? false);

    // Subject/Topic
    const matchesSubject =
      selectedSubject === 'all' || q.topics.some((t) => t.name === selectedSubject);

    // Min Repeats
    const matchesRepeats = q.count >= parseInt(minRepeats);

    return matchesSearch && matchesSubject && matchesRepeats;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="-ml-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex flex-col">
                <h1 className="flex items-center gap-2 text-lg font-black text-slate-800 sm:text-xl">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-base shadow-sm ring-2 ring-white">
                    🔥
                  </span>
                  {isHindi ? 'सबसे ज्यादा दोहराए गए प्रश्न' : 'Most Repeated Questions'}
                </h1>
                <p className="text-xs font-medium text-slate-500">
                  {questions.length} Patterns Found (2020-2026) • AI-Powered ⚡
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="hidden rounded-lg border-amber-100 bg-amber-50 px-3 py-1 font-bold text-amber-700 sm:flex"
              >
                Showing {filteredQuestions.length} of {questions.length}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-none bg-indigo-950 text-white shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-4 md:max-w-2xl">
                <div className="inline-flex items-center rounded-full bg-indigo-900/50 px-3 py-1 text-xs font-bold tracking-wider text-indigo-300 uppercase ring-1 ring-indigo-800">
                  <span className="mr-2 h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400"></span>
                  How it works
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {isHindi ? 'स्मार्ट एल्गोरिदम विश्लेषण' : 'Smart Algorithm Analysis'}
                </h2>
                <p className="text-sm leading-relaxed text-indigo-200/80 sm:text-base">
                  {isHindi
                    ? 'यह एआई-पावर्ड सिस्टम 2020-2026 के हजारों प्रश्नों को स्कैन करता है। यह FTS5 (Full Text Search) तकनीक और BM25 रैंकिंग का उपयोग करके न केवल समान शब्द, बल्कि मिलते-जुलते पैटर्न और अर्थ भी पहचानता है।'
                    : 'This AI-powered system scans thousands of questions from 2020-2026. Using FTS5 (Full Text Search) technology and BM25 ranking, it identifies not just exact matches but also similar patterns and semantic meanings.'}
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-indigo-300">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-900 font-bold">
                      1
                    </span>
                    Scope: 2020-2026 (Paper 1)
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-indigo-300">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-900 font-bold">
                      2
                    </span>
                    Tech: SQLite FTS5 + BM25
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-indigo-300">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-900 font-bold">
                      3
                    </span>
                    Logic: Semantic Matching
                  </div>
                </div>
              </div>

              
              <div className="hidden shrink-0 md:block">
                <div className="relative h-32 w-32">
                  <div className="animate-spin-slow absolute inset-0 rounded-full border-2 border-dashed border-indigo-700"></div>
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 opacity-50 blur-xl"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{questions.length}</span>
                    <span className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase">
                      Patterns
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative col-span-2">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder={isHindi ? 'प्रश्न खोजें...' : 'Search questions...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-xl border-slate-200 bg-white pl-10 shadow-sm focus:border-amber-400 focus:ring-amber-400/20"
            />
          </div>

          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white font-medium text-slate-700 shadow-sm hover:bg-slate-50">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all">All Subjects</SelectItem>
              {allSubjects.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={minRepeats} onValueChange={setMinRepeats}>
            <SelectTrigger className="h-12 w-full rounded-xl border-slate-200 bg-white font-medium text-slate-700 shadow-sm hover:bg-slate-50">
               <SelectValue placeholder="Min Repeats" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2+ Times</SelectItem>
              <SelectItem value="3">3+ Times</SelectItem>
              <SelectItem value="4">4+ Times</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

        <div className="space-y-6">
          {/* Header with View All Button */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                {isHindi ? 'दोहराए गए प्रश्न' : 'Most Repeated Questions'}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {isHindi 
                  ? `${filteredQuestions.length} प्रश्न पैटर्न मिले` 
                  : `Found ${filteredQuestions.length} question patterns`}
              </p>
            </div>
            
            <Link
              href="/syllabus/quiz/pyq/repeated/all"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-xl"
            >
              <Eye className="h-4 w-4" />
              {isHindi ? 'सभी देखें' : 'View All'}
              <span className="text-xs opacity-90">
                {isHindi ? 'व्याख्या के साथ' : 'with explanations'}
              </span>
            </Link>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.map((q) => (
              <QuestionCard key={q.questionId} question={q} isHindi={isHindi} />
            ))}

            {filteredQuestions.length === 0 && (
              <div className="py-20 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-slate-900">No questions found</h3>
                <p className="text-slate-500">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ question, isHindi }: { question: RepeatedQuestion; isHindi: boolean }) {
  // Deduplicate occurrences by year for display
  const uniqueYears = new Set<number>();
  const displayOccurrences = question.occurrences
    .filter((occ) => {
      if (uniqueYears.has(occ.year)) return false;
      uniqueYears.add(occ.year);
      return true;
    })
    .sort((a, b) => b.year - a.year);

  return (
    <Link
      href={`/syllabus/quiz/pyq/repeated/${question.questionId}`}
      className="relative z-10 block"
    >
      <Card className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-amber-200 hover:shadow-md">
        <CardContent className="p-0">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:gap-6 sm:p-6">
            {/* Count Badge */}
            <div className="flex shrink-0 sm:block">
              <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm sm:h-20 sm:w-20">
                <span className="text-2xl leading-none font-black tracking-tighter text-amber-600 sm:text-3xl">
                  {question.count}x
                </span>
                <span className="mt-1 text-[9px] font-bold tracking-wider text-amber-700/60 uppercase sm:text-[10px]">
                  Times
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-4">
              {/* Unit Badge */}
              {question.unit && (
                <div className="flex w-full">
                  <Badge
                    variant="secondary"
                    className="max-w-full rounded-md border-slate-200 bg-slate-100 px-2 py-1 text-left text-[10px] leading-tight font-bold tracking-wider break-words whitespace-normal text-slate-600 uppercase"
                  >
                    {question.unit.title}
                  </Badge>
                </div>
              )}

              {/* Question Text */}
              <div className="space-y-1.5">
                <h3 className="text-base leading-snug font-bold text-slate-900 transition-colors group-hover:text-amber-800 sm:text-lg">
                  {question.text}
                </h3>
                {question.textEn && (
                  <p className="text-sm leading-relaxed font-medium text-slate-500">
                    {question.textEn}
                  </p>
                )}
              </div>

              <div className="flex flex-col justify-between gap-4 border-t border-slate-50 pt-2 sm:flex-row sm:items-center">
                {/* Proof Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  {displayOccurrences.map((occ) => (
                    <Badge
                      key={occ.year}
                      variant="outline"
                      className="border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs font-bold text-slate-700 transition-colors hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                    >
                      {occ.year}{' '}
                      <span className="ml-1.5 font-medium text-slate-400">Q.{occ.qNo}</span>
                    </Badge>
                  ))}
                </div>

                {/* Topics */}
                <div className="flex flex-wrap gap-2">
                  {question.topics.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-blue-600 uppercase"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
