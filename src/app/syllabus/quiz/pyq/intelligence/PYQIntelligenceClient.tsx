'use client';

import { useSettingsStore } from '@/store/useSettingsStore';
import { UnitDistributionStats, RepeatedQuestion, TopicStat, SubjectDistributionStats, OverallWeightageSubjectData } from '@/actions/pyq-analytics';
import {
  PYQHeader,
  PYQMenu,
  OverallWeightage,
  PaperAnalysis,
  // MostRepeatedTopics, // Temporarily hidden
} from './components';

interface PYQIntelligenceClientProps {
  subjectStats: SubjectDistributionStats[];
  stats: UnitDistributionStats[];
  repeatedQuestions: RepeatedQuestion[];
  topicStats: Record<string, TopicStat[]>;
  simpleSubjectStats: Record<string, number>; // Same as PYQ page
  subjectQuestionsData: OverallWeightageSubjectData[];
}

export default function PYQIntelligenceClient({
  subjectStats,
  stats,
  repeatedQuestions,
  topicStats,
  simpleSubjectStats,
  subjectQuestionsData,
}: PYQIntelligenceClientProps) {
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';

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
        <PYQMenu isHindi={isHindi} currentPage="intelligence" theme="light" />

        {/* Overall Weightage (subject-wise across canonical Prelims papers) */}
        <OverallWeightage
          simpleSubjectStats={simpleSubjectStats}
          subjectQuestionsData={subjectQuestionsData}
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
          stats={stats}
          repeatedQuestions={repeatedQuestions}
          isHindi={isHindi}
          theme="light"
        />
      </div>
    </div>
  );
}
