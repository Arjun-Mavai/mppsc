import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MPPSC Mains | Syllabus, Notes & Previous Year Questions (PYQ)',
  description: 'Master MPPSC Mains with detailed syllabus analysis, premium bilingual notes, model answers, and Previous Year Question (PYQ) libraries.',
  keywords: [
    'MPPSC Mains',
    'MPPSC Mains Notes',
    'MPPSC Syllabus',
    'MPPSC 2026',
    'MPPSC 2027',
    'MPPSC PYQ',
    'MPPSC Mains Previous Year Question',
    'MPPSC Preparation',
    'MPPSC Notification',
    'MPPSC Model Answers'
  ],
  openGraph: {
    title: 'MPPSC Mains | Premium Notes & PYQ',
    description: 'Bilingual model answers, deep syllabus decoding, and complete MPPSC Mains preparation roadmap.',
  }
};

export default async function MainsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
