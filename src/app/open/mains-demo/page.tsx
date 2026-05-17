import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Mains demo — redirect',
  description: 'The mains teaser now lives on the real PYQ desk and syllabus.',
};

/** Old share URL → same lock modal + free 2024 P1 questions on the production UI. */
export default function LegacyMainsDemoRedirect() {
  redirect('/mains/syllabus/pyq-library');
}
