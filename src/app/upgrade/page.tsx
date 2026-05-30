'use client';

import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/home/HeroSection';

// Below-fold sections — keep dynamic for performance but consolidate if possible
const PremiumExplanationSection = dynamic(() =>
  import('@/components/home/PremiumExplanationSection').then((m) => ({
    default: m.PremiumExplanationSection,
  }))
);
const MainsPremiumShowcaseSection = dynamic(() =>
  import('@/components/home/MainsPremiumShowcaseSection').then((m) => ({
    default: m.MainsPremiumShowcaseSection,
  }))
);
const PYQShowcaseSection = dynamic(() =>
  import('@/components/home/PYQShowcaseSection').then((m) => ({
    default: m.PYQShowcaseSection,
  }))
);
const InstantFeedbackSection = dynamic(() =>
  import('@/components/home/InstantFeedbackSection').then((m) => ({
    default: m.InstantFeedbackSection,
  }))
);
const SubjectMasterySection = dynamic(() =>
  import('@/components/home/SubjectMasterySection').then((m) => ({
    default: m.SubjectMasterySection,
  }))
);
const ContentSuiteSection = dynamic(() =>
  import('@/components/home/ContentSuiteSection').then((m) => ({
    default: m.ContentSuiteSection,
  }))
);
const AppInstallGuide = dynamic(() =>
  import('@/components/home/AppInstallGuide').then((m) => ({ default: m.AppInstallGuide }))
);

// Below-fold sections — keep dynamic for performance but consolidate if possible
const DualLanguageShowcase = dynamic(() =>
  import('@/components/home/DualLanguageShowcase').then((m) => ({
    default: m.DualLanguageShowcase,
  }))
);
const FlashCardsSection = dynamic(() =>
  import('@/components/home/FlashCardsSection').then((m) => ({ default: m.FlashCardsSection }))
);
import { PricingSection } from '@/components/home/PricingSection';
const ExamSimulationSection = dynamic(() =>
  import('@/components/home/ExamSimulationSection').then((m) => ({
    default: m.ExamSimulationSection,
  }))
);

export default function UpgradePage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-slate-100 selection:text-slate-900">
      <HeroSection />
      <PremiumExplanationSection />
      <MainsPremiumShowcaseSection />
      <PYQShowcaseSection />
      <InstantFeedbackSection />
      <SubjectMasterySection />
      <ContentSuiteSection />

      <AppInstallGuide />
      <DualLanguageShowcase />
      <FlashCardsSection />
      <ExamSimulationSection />
      <PricingSection />
    </div>
  );
}
