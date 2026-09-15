'use client';

import { useSettingsStore } from '@/store/useSettingsStore';
import { UnitDistributionStats, RepeatedQuestion, TopicStat, SubjectDistributionStats, OverallWeightageSubjectData } from '@/actions/pyq-analytics';
import {
  PYQHeader,
  OverallWeightage,
  PaperAnalysis,
  // MostRepeatedTopics, // Temporarily hidden
} from './components';
import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSecurePYQIntelligence, PYQIntelligencePayload } from '@/hooks/useSecurePYQIntelligence';

interface PYQIntelligenceClientProps {
  subjectStats: SubjectDistributionStats[];
  stats: UnitDistributionStats[];
  repeatedQuestions: RepeatedQuestion[];
  topicStats: Record<string, TopicStat[]>;
  simpleSubjectStats: Record<string, number>; // Same as PYQ page
  subjectQuestionsData: OverallWeightageSubjectData[];
}

export default function PYQIntelligenceClient({
  stats,
  repeatedQuestions,
  simpleSubjectStats,
  subjectQuestionsData,
}: PYQIntelligenceClientProps) {
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';

  // 🛡️ 3-TIER SECURE CLIENT ENGINE (मल्टी-लेयर सुपरफास्ट कैश)
  const initialPayload = useMemo<PYQIntelligencePayload>(() => ({
    stats,
    repeatedQuestions,
    simpleSubjectStats,
    subjectQuestionsData,
  }), [stats, repeatedQuestions, simpleSubjectStats, subjectQuestionsData]);

  const cachedPayload = useSecurePYQIntelligence(initialPayload);

  const activeStats = cachedPayload.stats || stats;
  const activeRepeated = cachedPayload.repeatedQuestions || repeatedQuestions;
  const activeSimpleStats = cachedPayload.simpleSubjectStats || simpleSubjectStats;
  const activeSubjectQuestions = cachedPayload.subjectQuestionsData || subjectQuestionsData;

  // Compute combined stats for MostRepeatedTopics - Temporarily disabled
  /*
  const combinedStats = stats.reduce((acc, curr) => {
    if (!acc[curr.unitId]) {
      acc[curr.unitId] = {
        unitTitle: curr.unitTitle,
      };
    }
    return acc;
  }, {} as Record<string, { unitTitle: string }>);
  */

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900 selection:bg-indigo-500/30">
      {/* Light Multi-Gradient Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-indigo-50/60 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-emerald-50/60 blur-[120px]" />
        <div className="absolute top-[20%] right-[-5%] h-[50%] w-[50%] rounded-full bg-rose-50/60 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-5%] h-[50%] w-[50%] rounded-full bg-amber-50/40 blur-[120px]" />
      </div>

      {/* Header */}
      <PYQHeader
        title={isHindi ? 'प्रीमियम इंटेलिजेंस' : 'Premium Intelligence'}
        subtitle={isHindi ? 'PYQ के हर रहस्य का विश्लेषण' : 'Extracting Every Secret of PYQs'}
      />

      {/* Main Content */}
      <div className="relative mx-auto max-w-7xl space-y-8 px-1.5 py-8 sm:px-6 lg:px-8">
        {/* PYQ Analysis Menu - Restored on all screen sizes per User Request */}
        {/* <PYQMenu isHindi={isHindi} currentPage="intelligence" theme="light" /> */}

        {/* 🏆 High-Impact Blueprint & Hot Topics Showcase Banner: px0.ai Light Mode Design */}
        <div className="relative overflow-hidden border border-[#0b0d14]/15 bg-white p-6 sm:p-8 text-[#0b0d14] shadow-xs font-mono">
          {/* Geometric Grid Background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(rgba(11, 13, 20, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(11, 13, 20, 0.06) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          {/* Subtle Amber Glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-500/[0.08] blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs text-zinc-600 tracking-wider uppercase">
                  <span className="text-[#b45309] font-bold">{'//'}</span>{' '}
                  {isHindi ? '7-वर्षीय परीक्षा ब्लूप्रिंट · 2020–2026' : '7-YEAR EMPIRICAL BLUEPRINT · 2020–2026'}
                </p>
                <span className="text-zinc-300 text-xs hidden sm:inline">|</span>
                <span className="text-[11px] text-[#b45309] bg-amber-500/15 border border-amber-600/30 px-2 py-0.5 font-bold">
                  {isHindi ? '65% का नियम (~195 अंक · 2026)' : 'Rule of 65% (~195 Marks · 2026)'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#0b0d14] leading-tight">
                {isHindi ? (
                  <>
                    जब लक्ष्य केवल{' '}
                    <span className="text-[#b45309]">
                      सफलता
                    </span>{' '}
                    हो।
                  </>
                ) : (
                  <>
                    When all you want is{' '}
                    <span className="text-[#b45309]">
                      clearance.
                    </span>
                  </>
                )}
              </h2>

              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-xl font-sans">
                {isHindi
                  ? '700 प्रश्नों का गहन विश्लेषण। नए 2026 पैटर्न (+3 अंक / -1 निगेटिव) में सिर्फ 4 कोर यूनिट्स से लगभग ~195 अंक (300 में से) बनते हैं। कटऑफ सूत्र (231–246M), 7-वर्षीय वेटेज मैट्रिक्स और यूनिट 1–10 चीट शीट्स देखें।'
                  : 'Empirical analysis of 700 questions. In the 2026 pattern (+3 / -1 Neg), 4 core units generate ~195 marks (out of 300 total). Includes 2026 Cutoff formula (231–246M), 7-year weightage matrix & unit cheat sheets.'}
              </p>

              <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                {[
                  { labelEn: '2026 Cutoff Target: 231–246M (+3/-1)', labelHi: '2026 कटऑफ लक्ष्य: 231–246M (+3/-1)' },
                  { labelEn: 'Repeated PYQ Patterns', labelHi: 'बार-बार पूछे गए प्रश्न' },
                  { labelEn: 'Units 1–10 Cheat Sheets', labelHi: 'यूनिट 1–10 चीट शीट्स' },
                  { labelEn: '5-Step Clearance Plan', labelHi: '5-चरणीय अध्ययन क्रम' },
                ].map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center bg-[#f4f5f8] px-2.5 py-1 text-zinc-700 border border-[#0b0d14]/15"
                  >
                    <span className="text-[#b45309] font-bold mr-1.5">✓</span>
                    {isHindi ? item.labelHi : item.labelEn}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 self-start lg:self-center">
              <Link href="/syllabus/quiz/pyq/intelligence/blueprint" prefetch={true}>
                <Button className="w-full sm:w-auto h-11 px-6 rounded-none bg-[#d97706] hover:bg-[#b45309] text-white font-mono font-bold text-xs sm:text-sm border border-[#b45309] shadow-xs flex items-center justify-center gap-2">
                  <span>{isHindi ? 'ब्लूप्रिंट एवं हॉट टॉपिक्स खोलें' : 'Open Blueprint & Hot Topics'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <div className="text-center font-mono text-[11px] text-zinc-500">
                {isHindi ? '// हिंदी एवं English दोनों में' : '// Hindi & English Available'}
              </div>
            </div>
          </div>
        </div>

        {/* Overall Weightage (subject-wise across canonical Prelims papers) */}
        <OverallWeightage
          simpleSubjectStats={activeSimpleStats}
          subjectQuestionsData={activeSubjectQuestions}
          isHindi={isHindi}
          theme="light"
        />

        {/* Most Repeated Topics - Temporarily Hidden */}
        {/* <MostRepeatedTopics
          topicStats={topicStats}
          combinedStats={combinedStats}
          isHindi={isHindi}
        /> */}

        {/* Paper-wise Analysis (Year by Year) */}
        <PaperAnalysis
          stats={activeStats}
          repeatedQuestions={activeRepeated}
          isHindi={isHindi}
          theme="light"
        />
      </div>
    </div>
  );
}
