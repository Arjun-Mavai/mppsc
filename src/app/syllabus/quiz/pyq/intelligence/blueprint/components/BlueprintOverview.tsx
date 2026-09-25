'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { EXECUTIVE_SUMMARY } from '@/data/prelims-intelligence-data';
import { BarChart3, Flame, ArrowRight } from 'lucide-react';

interface BlueprintOverviewProps {
  isHindi: boolean;
  onNavigate: (section: string) => void;
}

export function BlueprintOverview({ isHindi, onNavigate }: BlueprintOverviewProps) {
  return (
    <div className="space-y-10 font-mono">
      {/* ========================================================================= */}
      {/* ACT 1: THE STRATEGIC REVELATION (कटऑफ का गणित)                            */}
      {/* ========================================================================= */}
      <div className="border border-[#0b0d14]/15 bg-white shadow-xs overflow-hidden">
        {/* Top .hero-meta Bar with 1px dividers */}
        <div className="border-b border-[#0b0d14]/15 bg-[#f4f5f8] text-[11px] uppercase tracking-wider text-zinc-600 flex flex-wrap">
          <span className="border-r border-[#0b0d14]/15 px-3.5 py-2 font-bold text-[#0b0d14]">
            <b className="text-[#b45309]">[MPPSC]</b> BLUEPRINT v2026.1
          </span>
          <span className="border-r border-[#0b0d14]/15 px-3.5 py-2 hidden sm:inline-block">
            {isHindi ? '7-वर्षीय अनुभवजन्य विश्लेषण' : '7-YEAR EMPIRICAL CENSUS'}
          </span>
          <span className="border-r border-[#0b0d14]/15 px-3.5 py-2">
            {isHindi ? '2026 पैटर्न: +3 अंक / -1 नेगेटिव' : '2026 PATTERN: +3 / -1 NEG'}
          </span>
          <span className="px-3.5 py-2 text-[#b45309] font-bold">
            {isHindi ? '65% नियम (~195 अंक 2026 / ~130 अंक पूर्व)' : 'RULE OF 65% (~195M IN 2026)'}
          </span>
        </div>

        {/* 2026 Marking Scheme Synchronized Live Notice */}
        <div className="border-b border-amber-600/30 bg-amber-500/[0.08] px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="bg-[#d97706] text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
              {isHindi ? 'नवीनतम 2026 स्कीम' : '2026 MARKING SCHEME'}
            </span>
            <span className="text-[#0b0d14] font-medium font-sans">
              {isHindi
                ? 'प्रत्येक सही प्रश्न = +3 अंक · गलत उत्तर = -1 अंक (1/3 नकारात्मक अंकन) · कुल 300 अंक'
                : '1 Correct = +3 Marks · 1 Wrong = -1 Mark (1/3rd Negative Marking) · Total = 300 Marks'}
            </span>
          </div>
          <span className="text-zinc-500 text-[11px] self-start sm:self-auto font-sans">
            {isHindi ? '(2020–2025 में 2 अंक थे, कोई नेगेटिव मार्किंग नहीं थी)' : '(2020–2025 legacy: 2M/Q, No negative)'}
          </span>
        </div>

        {/* Hero Section: Split Copy (Left) + Stats Grid (Right) */}
        <div className="grid lg:grid-cols-[1.3fr_1fr]">
          {/* Left Hero Copy */}
          <div className="border-b lg:border-b-0 lg:border-r border-[#0b0d14]/15 p-6 sm:p-10 flex flex-col justify-between gap-8">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/15 border border-amber-600/30 text-[#b45309] px-2.5 py-0.5 text-xs font-bold">
                  STAGE 01
                </span>
                <p className="text-xs text-zinc-500 tracking-wider uppercase font-bold">
                  <span className="text-[#b45309]">{'//'}</span>{' '}
                  {isHindi ? 'रणनीतिक वास्तविकता · 2020–2026' : 'THE STRATEGIC REALITY · 2020–2026'}
                </p>
              </div>

              {/* px0.ai Signature Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-[#0b0d14] leading-[0.96]">
                {isHindi ? (
                  <>
                    जब लक्ष्य केवल<br />
                    <span className="text-[#b45309]">सफलता</span> हो।
                    <span className="inline-block w-[0.45em] h-[0.75em] bg-[#d97706] ml-2 align-baseline animate-pulse" />
                  </>
                ) : (
                  <>
                    When all you<br />
                    want is <span className="text-[#b45309]">clearance.</span>
                    <span className="inline-block w-[0.45em] h-[0.75em] bg-[#d97706] ml-2 align-baseline animate-pulse" />
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-base text-zinc-700 leading-relaxed font-sans max-w-xl">
                {isHindi
                  ? '90% अभ्यर्थी सभी 10 यूनिट्स पर समान समय बर्बाद करके असफल होते हैं। 7 वर्षों के 700 प्रश्नों का डेटा यह दिखाता है कि 4 यूनिट्स से लगभग 65% पेपर आता है (2026 के नए 3-अंक पैटर्न में ~195 अंक, पूर्व में ~130 अंक)। 2026 में 1/3 नेगेटिव मार्किंग (-1 अंक) लागू होने से कोर 4 यूनिट्स में उच्च सटीकता रखना ही कटऑफ (231–246 अंक / 300 अंक) सुरक्षित करने का सबसे मजबूत डेटा-आधारित पूर्वानुमान है।'
                  : '90% of aspirants fail because they treat all 10 units equally. 7 years of empirical question data reveals that just 4 units generate 65% of the paper (~195 marks in the 2026 3-mark pattern, ~130 marks pre-2026). With 2026 introducing 1/3rd negative marking (-1 mark per wrong question), mastering the Core 4 Units with 88%+ accuracy is the strongest data-backed prediction to safely target the 231–246 mark cutoff.'}
              </p>
            </div>

            {/* Quick-Jump Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  onClick={() => onNavigate('matrix')}
                  className="bg-[#d97706] hover:bg-[#b45309] text-white font-mono font-bold text-xs rounded-none h-10 px-5 border border-[#b45309] shadow-xs flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>{isHindi ? '1. 7-वर्षीय डेटा देखें' : '1. View 7-Yr Data'}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onNavigate('hot-topics')}
                  className="border border-[#0b0d14]/20 bg-white hover:bg-zinc-100 text-[#0b0d14] font-mono font-bold text-xs rounded-none h-10 px-4 flex items-center gap-2"
                >
                  <Flame className="h-4 w-4 text-[#b45309]" />
                  <span>{isHindi ? '2. हॉट टॉपिक्स & चीट्स' : '2. Hot Topics & Cheats'}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onNavigate('study-plan')}
                  className="border border-[#0b0d14]/20 bg-white hover:bg-zinc-100 text-zinc-700 font-mono text-xs rounded-none h-10 px-4"
                >
                  <span>{isHindi ? '3. 5-चरणीय चक्र' : '3. Battle Plan'}</span>
                </Button>
              </div>

              <p className="text-[11px] text-zinc-500 font-mono">
                {isHindi ? '// नीचे स्क्रॉल करके डेटा की प्रत्येक परत का विश्लेषण करें' : '// Scroll down to inspect layer-by-layer evidence & cheat sheets'}
              </p>
            </div>
          </div>

          {/* Right Stats Grid (px0.ai dl.hero-stats: 2x2 with 1px border dividers) */}
          <dl className="grid grid-cols-2 bg-[#0b0d14]/15 gap-[1px]">
            {/* Stat 1: Cutoff Benchmark */}
            <div className="bg-white p-5 sm:p-7 flex flex-col justify-between hover:bg-zinc-50 transition-colors">
              <dt className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono font-bold">
                {isHindi ? 'कटऑफ लक्ष्य (2026)' : 'SAFE CUTOFF TARGET'}
              </dt>
              <dd className="my-3">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[#0b0d14]">
                  231–246
                </span>
                <span className="text-sm text-zinc-500 ml-1.5 font-bold">Marks</span>
              </dd>
              <dd className="text-xs text-zinc-600 font-mono">
                {isHindi ? '77–82 सही प्रश्न / 300 (पूर्व: 154–164M)' : '77–82 net Qs / 300 (Pre-2026: 154–164M)'}
              </dd>
            </div>

            {/* Stat 2: Rule of 65% (Highlighted in Amber) */}
            <div className="bg-amber-500/[0.06] p-5 sm:p-7 flex flex-col justify-between hover:bg-amber-500/[0.1] transition-colors border-l-3 border-l-[#d97706]">
              <dt className="text-[11px] uppercase tracking-wider text-[#b45309] font-black font-mono">
                {isHindi ? '४ कोर यूनिट्स उपज (2026)' : 'CORE 4 UNITS YIELD'}
              </dt>
              <dd className="my-3">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[#b45309]">
                  ~195
                </span>
                <span className="text-sm text-amber-800 ml-1.5 font-bold">Marks</span>
              </dd>
              <dd className="text-xs text-amber-950/90 font-mono font-bold">
                {isHindi ? 'पेपर का 65% · 65 प्रश्न (पूर्व: ~130 अंक)' : '65% of paper · 65 Qs (Pre-2026: ~130M)'}
              </dd>
            </div>

            {/* Stat 3: Total Canonical Qs */}
            <div className="bg-white p-5 sm:p-7 flex flex-col justify-between hover:bg-zinc-50 transition-colors">
              <dt className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono font-bold">
                {isHindi ? 'अनुभवजन्य प्रश्न' : 'CANONICAL DATASET'}
              </dt>
              <dd className="my-3">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[#0b0d14]">
                  700
                </span>
                <span className="text-sm text-zinc-500 ml-1.5 font-bold">Qs</span>
              </dd>
              <dd className="text-xs text-zinc-600 font-mono">
                {isHindi ? '7 वर्षों के वास्तविक पेपर्स · 2020–2026' : '7 years real exam papers · 2020–2026'}
              </dd>
            </div>

            {/* Stat 4: High-Frequency Repeated Questions */}
            <div className="bg-white p-5 sm:p-7 flex flex-col justify-between hover:bg-zinc-50 transition-colors">
              <dt className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono font-bold">
                {isHindi ? 'दोहराए गए प्रश्न' : 'REPEATED QUESTIONS'}
              </dt>
              <dd className="my-3">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[#0b0d14]">
                  8 Themes
                </span>
              </dd>
              <dd className="text-xs text-zinc-600 font-mono">
                {isHindi ? 'परीक्षाओं में बार-बार पूछे गए प्रश्न' : 'high-frequency repeated question themes'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Visual The Cutoff Equation Card (Dual 2026 vs Pre-2026 Comparison) */}
        <div className="border-t border-[#0b0d14]/15 bg-[#fcfcfd] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[#b45309] font-bold text-xs">{'//'}</span>
              <span className="text-xs uppercase tracking-wider text-zinc-800 font-bold">
                {isHindi ? 'कटऑफ का सटीक समीकरण (The Cutoff Equation)' : 'THE CUTOFF EQUATION'}
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#b45309] bg-amber-500/15 border border-amber-600/30 px-2.5 py-0.5 self-start sm:self-auto">
              {isHindi ? '2026 पैटर्न: 3 अंक/प्रश्न · 1/3 नेगेटिव' : '2026 Pattern: 3M/Q · 1/3rd Neg'}
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-[#0b0d14]/15 bg-white p-4 shadow-2xs">
              <span className="text-[11px] text-zinc-500 font-mono font-bold uppercase block">
                {isHindi ? '1. कुल सुरक्षित कटऑफ' : '1. Target Cutoff'}
              </span>
              <p className="text-2xl font-black text-[#0b0d14] mt-1">231–246 Marks</p>
              <p className="text-xs text-zinc-600 font-sans mt-1">
                {isHindi
                  ? '77–82 सही प्रश्न / 300 (पूर्व 2020–2025 में: 154–164M / 200)'
                  : '77–82 Net Correct Qs / 300 (Pre-2026: 154–164M / 200)'}
              </p>
            </div>

            <div className="border border-amber-600/30 bg-amber-500/10 p-4 shadow-2xs">
              <span className="text-[11px] text-[#b45309] font-mono font-bold uppercase block">
                {isHindi ? '2. कोर 4 यूनिट्स से मिलेगा' : '2. Core 4 Units Yield'}
              </span>
              <p className="text-2xl font-black text-[#b45309] mt-1">~195 Marks</p>
              <p className="text-xs text-amber-950 font-sans font-medium mt-1">
                {isHindi
                  ? 'Units 1, 3, 5, 10 अकेले 65 प्रश्न (~195 अंक) देते हैं!'
                  : 'Units 1, 3, 5, 10 yield 65 Qs (~195 Marks) alone!'}
              </p>
            </div>

            <div className="border border-emerald-600/30 bg-emerald-500/[0.08] p-4 shadow-2xs">
              <span className="text-[11px] text-emerald-800 font-mono font-bold uppercase block">
                {isHindi ? '3. शेष 6 यूनिट्स से आवश्यक' : '3. Remaining 6 Units Needed'}
              </span>
              <p className="text-2xl font-black text-emerald-800 mt-1">ONLY 36–51 Marks</p>
              <p className="text-xs text-emerald-900 font-sans font-medium mt-1">
                {isHindi
                  ? 'शेष 35 प्रश्नों में से मात्र 12–17 प्रश्न सही चाहिए!'
                  : 'Just 12–17 Qs needed out of 35 remaining questions!'}
              </p>
            </div>
          </div>

          {/* 1/3rd Negative Marking Warning Callout */}
          <div className="border border-amber-600/40 bg-amber-500/10 p-4 text-xs font-mono space-y-1">
            <span className="text-[#b45309] font-bold block">
              ⚠️ {isHindi ? 'रणनीतिक चेतावनी: 1/3 नकारात्मक अंकन (-1 अंक प्रति गलत उत्तर):' : 'STRATEGIC DIRECTIVE: 1/3RD NEGATIVE MARKING (-1 PER WRONG ANSWER):'}
            </span>
            <p className="text-zinc-800 font-sans leading-relaxed">
              {isHindi
                ? '2026 से प्रत्येक गलत उत्तर पर 1 अंक कटेगा। पुराने पेपर्स (2020–2025) की तरह 100 में से 100 प्रश्नों पर बिना सोचे-समझे तुक्का नहीं लगाया जा सकता। 10 गलत तुक्के आपके 10 अंक काट देंगे और कटऑफ से बाहर कर देंगे। इसीलिए कोर 4 यूनिट्स और उच्च संभावना वाले प्रेडिक्टेड टॉपिक्स में 85%+ सटीकता हासिल करना ही सफलता का सबसे मजबूत आधार है।'
                : 'From 2026, wrong answers carry a -1 mark penalty. You can no longer blind-guess 100 out of 100 questions like in 2020–2025. 10 incorrect guesses wipe out 10 marks and sink you below the cutoff. High-accuracy mastery in the Core 4 Units is therefore the most strategic data-backed prediction to clear the cutoff.'}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THE 4 NON-NEGOTIABLE CORE UNITS (विस्तृत और स्पष्ट कार्ड्स)                */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#0b0d14]/15 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#b45309] font-bold text-xs">[CORE ARSENAL]</span>
              <span className="text-xs uppercase tracking-wider text-zinc-600 font-bold">
                {isHindi ? '४ प्रमुख आधारस्तंभ यूनिट्स' : 'THE 4 HIGH-YIELD PILLAR UNITS'}
              </span>
            </div>
            <p className="text-xs text-zinc-600 font-sans mt-0.5">
              {isHindi
                ? 'इन 4 यूनिट्स में 85%+ सटीकता कटऑफ निकालने की संभावना को अत्यधिक बढ़ा देती है (उच्च संभावना पूर्वानुमान)। किसी भी अन्य यूनिट को छूने से पहले इन्हें प्राथमिकता दें।'
                : 'Achieving 85%+ accuracy in these 4 core units maximizes your clearance probability. Prioritize these before moving to other units.'}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#b45309] bg-amber-500/15 border border-amber-600/30 px-3 py-1 self-start sm:self-auto">
            {isHindi ? 'संयुक्त: 60–68 प्रश्न · ~195 अंक (2026)' : 'Combined: 60–68 Qs · ~195 Marks (2026)'}
          </span>
        </div>

        {/* 4 Cards Grid with Generous Size and Action Button */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 bg-[#0b0d14]/15 gap-[1px] border border-[#0b0d14]/15 shadow-xs">
          {EXECUTIVE_SUMMARY.coreUnits.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:bg-amber-500/[0.04] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#0b0d14]/10 pb-2.5">
                  <span className="text-xs font-black text-[#b45309] font-mono">
                    {isHindi ? item.tagHi : item.tag}
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-[#f4f5f8] border border-[#0b0d14]/15 px-2 py-0.5 text-zinc-700">
                    {item.share}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-[#0b0d14] leading-snug">
                    {isHindi ? item.unitHi : item.unit}
                  </h4>
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <span className="text-lg font-black font-mono text-[#b45309]">
                      {item.range}
                    </span>
                    <div className="flex flex-col text-right">
                      <span className="text-xs font-bold text-[#b45309]">
                        {isHindi ? item.marks2026Hi : item.marks2026}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-normal">
                        ({isHindi ? item.marksHi : item.marks})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#0b0d14]/10 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 font-mono">
                  {isHindi ? 'अनिवार्य आधार' : 'Non-Negotiable'}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('hot-topics')}
                  className="text-xs font-bold text-[#b45309] hover:underline flex items-center gap-1 font-mono"
                >
                  <span>{isHindi ? 'चीट शीट' : 'Cheats'}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connective Narrative Bridge to Stage 2 */}
      <div className="border border-[#0b0d14]/15 bg-[#f4f5f8] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 shrink-0 bg-white border border-[#0b0d14]/15 flex items-center justify-center font-bold text-xs text-[#b45309]">
            ↓
          </span>
          <div>
            <p className="text-xs font-bold text-[#0b0d14] uppercase">
              {isHindi ? 'अगला चरण: सबूत और 7-वर्षीय जनगणना' : 'NEXT STAGE: THE EMPIRICAL EVIDENCE & REPETITION PROOFS'}
            </p>
            <p className="text-xs text-zinc-600 font-sans">
              {isHindi
                ? 'प्रमाण आधारित तैयारी: नीचे 2020–2026 की 7-वर्षीय तालिका और बार-बार दोहराए गए प्रश्नों के वास्तविक प्रमाण देखें।'
                : 'Inspect the verified 2020–2026 unit matrix and real repeated question pattern proofs below.'}
            </p>
          </div>
        </div>
        <Button
          onClick={() => onNavigate('matrix')}
          variant="outline"
          className="border border-[#0b0d14]/20 bg-white hover:bg-zinc-100 text-xs font-bold text-zinc-900 rounded-none shrink-0"
        >
          {isHindi ? 'डेटा तालिका देखें' : 'Examine Data Table'}
        </Button>
      </div>
    </div>
  );
}
