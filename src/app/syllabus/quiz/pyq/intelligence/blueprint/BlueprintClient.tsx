'use client';

import React, { useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { BlueprintHeader } from './components/BlueprintHeader';
import { BlueprintOverview } from './components/BlueprintOverview';
import { WeightageMatrixTable } from './components/WeightageMatrixTable';
import { VectorMatchPatterns } from './components/VectorMatchPatterns';
import { HotTopicsSection } from './components/HotTopicsSection';
import { StudyPlanSection } from './components/StudyPlanSection';

export default function BlueprintClient() {
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';
  const [activeSection, setActiveSection] = useState<string>('overview');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-[#0b0d14] pb-28 selection:bg-amber-300 selection:text-[#0b0d14] font-mono antialiased relative overflow-x-clip">
      {/* Background Ambience: px0.ai Light Mode Geometric Grid Boxes & Warm Amber Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        {/* 32px x 32px Geometric Grid Boxes */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(11, 13, 20, 0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(11, 13, 20, 0.055) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(120% 70% at 50% 0, #000 20%, transparent 85%)',
          }}
        />
        {/* Soft Amber Glow at the top */}
        <div className="absolute -top-[12%] left-1/2 -translate-x-1/2 h-[420px] w-[700px] sm:w-[1000px] rounded-full bg-amber-500/[0.08] blur-[120px]" />
        {/* Scan lines effect subtle */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(#000 0 1px, transparent 1px 3px)',
          }}
        />
      </div>

      {/* Sticky Header with Language Switcher & Category Navigation Pills */}
      <BlueprintHeader activeSection={activeSection} onSectionChange={scrollToSection} />

      {/* Main Content Container with Rhythmic Layer-by-Layer Disclosure */}
      <main className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-16">
        {/* ACT 1: Overview & The Cutoff Equation */}
        <section id="overview" className="scroll-mt-28">
          <BlueprintOverview isHindi={isHindi} onNavigate={scrollToSection} />
        </section>

        {/* ACT 2: Empirical Proofs (Weightage Matrix + Repeated Question Proofs) */}
        <div className="space-y-12">
          <section id="matrix" className="scroll-mt-28">
            <WeightageMatrixTable isHindi={isHindi} />
          </section>

          <section id="patterns" className="scroll-mt-28">
            <VectorMatchPatterns isHindi={isHindi} />
          </section>
        </div>

        {/* Connective Bridge to ACT 3 */}
        <div className="border border-[#0b0d14]/15 bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 shrink-0 bg-amber-500/15 border border-amber-600/30 flex items-center justify-center font-bold text-sm text-[#b45309]">
              ↓
            </span>
            <div>
              <p className="text-xs font-black text-[#0b0d14] uppercase">
                {isHindi ? 'अगली परत: यूनिट 1 से 10 के सूक्ष्म हॉट टॉपिक्स एवं चीट शीट्स' : 'NEXT LAYER: MICROSCOPIC HOT TOPICS & CHEAT SHEETS (UNITS 1–10)'}
              </p>
              <p className="text-xs text-zinc-600 font-sans mt-0.5">
                {isHindi
                  ? '7-वर्षीय वेटेज और दोहराए जाने वाले प्रश्न देखने के बाद, नीचे प्रत्येक यूनिट के महत्वपूर्ण टॉपिक्स और चीट शीट्स का अध्ययन करें।'
                  : 'Now that you have verified the 7-year weightage and repeated question patterns, inspect the exact hot topics and cheat sheets for each unit below.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => scrollToSection('hot-topics')}
            className="px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-mono font-bold shrink-0 shadow-2xs transition-colors"
          >
            {isHindi ? 'हॉट टॉपिक्स खोलें' : 'Open Hot Topics'}
          </button>
        </div>

        {/* ACT 3: Units 1 to 10 Microscopic Hot Topics & Terminal Cheat Sheets */}
        <section id="hot-topics" className="scroll-mt-28">
          <HotTopicsSection isHindi={isHindi} />
        </section>

        {/* Connective Bridge to ACT 4 */}
        <div className="border border-[#0b0d14]/15 bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 shrink-0 bg-emerald-500/15 border border-emerald-600/30 flex items-center justify-center font-bold text-sm text-emerald-800">
              ✓
            </span>
            <div>
              <p className="text-xs font-black text-[#0b0d14] uppercase">
                {isHindi ? 'अंतिम चक्र: 5-चरणीय अध्ययन योजना और प्रायोरिटी मैट्रिक्स' : 'FINAL STAGE: THE 5-STEP ACTION PLAYBOOK & PRIORITY HIERARCHY'}
              </p>
              <p className="text-xs text-zinc-600 font-sans mt-0.5">
                {isHindi
                  ? 'इस पूरे डेटा और चीट शीट्स को अपने दैनिक टाइमटेबल में कैसे लागू करें? नीचे 5-चरणीय कार्य योजना देखें।'
                  : 'How to deploy this intelligence into your daily study routine. Inspect the 5-step execution algorithm below.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => scrollToSection('study-plan')}
            className="px-4 py-2 bg-[#0b0d14] hover:bg-zinc-800 text-white text-xs font-mono font-bold shrink-0 shadow-2xs transition-colors"
          >
            {isHindi ? '5-चरणीय योजना देखें' : 'View 5-Step Plan'}
          </button>
        </div>

        {/* ACT 4: The 5-Step Study Sequence & 3-Level Priority Matrix */}
        <section id="study-plan" className="scroll-mt-28">
          <StudyPlanSection isHindi={isHindi} />
        </section>
      </main>
    </div>
  );
}
