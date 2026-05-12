import { Suspense } from 'react';
import { Metadata } from 'next';
import { getSyllabusTopics } from '@/actions/getSyllabusTopics';
import { syllabusData as staticSyllabusData } from '@/data/syllabusData';
import { SyllabusClient } from '@/features/syllabus/components/SyllabusClient';
import { SyllabusData } from '@/types/syllabus';

export const metadata: Metadata = {
  title: 'MPPSC 2026 Complete Syllabus — All 17 Units with Mnemonics',
  description:
    'Complete MPPSC 2026 syllabus in Hindi & English. All 10 units with topic-wise mnemonics, tests, cards for syllabus, and quizzes. Start free preparation today!',
  keywords: [
    'MPPSC Syllabus 2026',
    'MPPSC Syllabus Hindi',
    'MPPSC Units',
    'MPPSC Topics',
    'MPPSC Preparation',
  ],
};

// 7-Day Cached Data Fetching
async function getSyllabusData(): Promise<SyllabusData> {
  try {
    // 1. Fetch Dynamic Topics from DB (Cached)
    const { data: dynamicTopics } = await getSyllabusTopics();

    // 2. Merge with Static Metadata (Titles, Images)
    // We clone the static data to avoid mutating the original import
    const mergedUnits = { ...staticSyllabusData.units };

    if (dynamicTopics) {
      Object.keys(mergedUnits).forEach((unitKey) => {
        const unitTopics = dynamicTopics[unitKey];
        if (unitTopics && unitTopics.length > 0) {
          // Logic to merge DB topics would go here.
        }
      });
    }

    return staticSyllabusData;
  } catch (e) {
    return staticSyllabusData;
  }
}

export default async function SyllabusPage() {
  const syllabusData = await getSyllabusData();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">Loading...</div>
      }
    >
      <SyllabusClient syllabusData={syllabusData} />
    </Suspense>
  );
}
