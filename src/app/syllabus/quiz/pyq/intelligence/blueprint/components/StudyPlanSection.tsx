'use client';

import React from 'react';
import { STUDY_STEPS, PRIORITY_MATRIX } from '@/data/prelims-intelligence-data';
import { CheckCircle, Trophy, Target } from 'lucide-react';

interface StudyPlanSectionProps {
  isHindi: boolean;
}

export function StudyPlanSection({ isHindi }: StudyPlanSectionProps) {
  return (
    <div className="space-y-10 font-mono">
      {/* ========================================================================= */}
      {/* ACT 4: THE ACTION PLAYBOOK (अंतिम कार्य योजना)                            */}
      {/* ========================================================================= */}
      <div className="border-b border-[#0b0d14]/15 pb-4">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/15 border border-amber-600/30 text-[#b45309] px-2.5 py-0.5 text-xs font-bold">
            STAGE 04
          </span>
          <span className="text-zinc-500 uppercase tracking-wider text-xs font-bold">
            {isHindi ? 'अंतिम कार्य योजना एवं अध्ययन पदानुक्रम' : 'THE EXECUTION PLAYBOOK · 5 STEPS'}
          </span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0b0d14] mt-1.5">
          {isHindi ? (
            <>
              प्रीलिम्स क्रैक करने का <span className="text-[#b45309]">5-चरणीय चक्र।</span>
            </>
          ) : (
            <>
              The 5-Step &ldquo;Crack Prelims&rdquo; <span className="text-[#b45309]">Sequence.</span>
            </>
          )}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-sans">
          {isHindi
            ? 'इस पूरे डेटा और चीट शीट्स को अंकों में कैसे बदलें? यह 5-चरणीय वैज्ञानिक क्रम 2026 के नए 300-अंक पैटर्न (+3 / -1) में कटऑफ (231–246 अंक) को पहले 3 चरणों में ही सुरक्षित कर देता है।'
            : 'How do you turn this 7-year intelligence into marks starting today? This 5-step sequence locks the 2026 cutoff (231–246 marks / 300) within the first 3 steps.'}
        </p>
      </div>

      {/* Cumulative Score Progression Meter */}
      <div className="border border-[#0b0d14]/15 bg-white p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#0b0d14]/10 pb-3">
          <span className="text-xs font-bold text-[#0b0d14] uppercase tracking-wider flex items-center gap-1.5">
            <Target className="h-4 w-4 text-[#b45309]" />
            {isHindi ? 'संचयी स्कोर प्रगति मीटर (2026 3-मार्कर पैटर्न):' : 'CUMULATIVE SCORE ACCUMULATOR (2026 PATTERN):'}
          </span>
          <span className="text-xs font-mono font-bold text-[#b45309]">
            {isHindi ? '2026 कटऑफ लक्ष्य: 231–246 अंक (300 में से)' : '2026 Cutoff Target: 231–246 Marks (out of 300)'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center font-mono">
          <div className="border border-[#0b0d14]/15 bg-[#f4f5f8] p-3">
            <span className="text-[10px] text-zinc-500 font-bold block">STEP 1 (U10 + U1)</span>
            <span className="text-xl font-black text-[#0b0d14] mt-1 block">87 Marks</span>
            <span className="text-[10px] text-zinc-500 mt-0.5 block">{isHindi ? 'आधार (पूर्व: 58M)' : 'Foundation (Pre: 58M)'}</span>
          </div>

          <div className="border border-[#0b0d14]/15 bg-[#f4f5f8] p-3">
            <span className="text-[10px] text-zinc-500 font-bold block">STEP 2 (+ U3, U5)</span>
            <span className="text-xl font-black text-[#0b0d14] mt-1 block">159 Marks</span>
            <span className="text-[10px] text-amber-800 font-bold mt-0.5 block">{isHindi ? '53% लक्ष्य (पूर्व: 106M)' : '53% Target (Pre: 106M)'}</span>
          </div>

          <div className="border border-amber-600/30 bg-amber-500/10 p-3">
            <span className="text-[10px] text-[#b45309] font-bold block">STEP 3 (+ U9, U7)</span>
            <span className="text-xl font-black text-[#b45309] mt-1 block">216 Marks</span>
            <span className="text-[10px] text-[#b45309] font-bold mt-0.5 block">{isHindi ? 'कटऑफ के मुहाने पर' : 'Striking Distance'}</span>
          </div>

          <div className="border border-emerald-600/30 bg-emerald-500/10 p-3">
            <span className="text-[10px] text-emerald-800 font-bold block">STEP 4 (+ U8, U6)</span>
            <span className="text-xl font-black text-emerald-800 mt-1 block">261 Marks</span>
            <span className="text-[10px] text-emerald-800 font-bold mt-0.5 block">{isHindi ? 'सुरक्षित कटऑफ पार' : 'Cutoff Cleared!'}</span>
          </div>

          <div className="border border-emerald-600/40 bg-emerald-600 text-white p-3 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-emerald-100 font-bold block">STEP 5 (PYQ REVISE)</span>
            <span className="text-xl font-black text-white mt-1 block">235–255+</span>
            <span className="text-[10px] text-emerald-100 font-bold mt-0.5 block">{isHindi ? 'टॉप 1% रैंक' : 'Top 1% Rank'}</span>
          </div>
        </div>
      </div>

      {/* 5-Step Study Sequence Detailed Cards */}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STUDY_STEPS.map((step) => (
            <div
              key={step.stepNumber}
              className="border border-[#0b0d14]/15 bg-white shadow-xs hover:border-[#b45309]/50 transition-all flex flex-col justify-between p-5 sm:p-6 space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono">
                  <span className="flex h-7 w-7 items-center justify-center bg-amber-500/15 border border-amber-600/30 text-[#b45309] text-xs font-bold">
                    #{step.stepNumber}
                  </span>
                  <span className="text-xs font-bold text-zinc-700 bg-[#f4f5f8] border border-[#0b0d14]/15 px-2.5 py-0.5">
                    {step.units}
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#0b0d14] leading-snug">
                    {isHindi ? step.title.hi : step.title.en}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#b45309] font-bold mt-1.5">
                    <span>🎯 {step.targetQuestions}</span>
                    <span className="text-zinc-400">·</span>
                    <span>{step.targetMarks}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-sans">
                  {isHindi ? step.description.hi : step.description.en}
                </p>

                <div className="space-y-2 pt-3 border-t border-[#0b0d14]/10">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 block font-bold">
                    {isHindi ? '// मुख्य फोकस टॉपिक्स:' : '// KEY FOCUS TOPICS:'}
                  </span>
                  <ul className="space-y-1.5 text-xs text-zinc-800 font-sans">
                    {step.keyTopics.map((kt, kIdx) => (
                      <li key={kIdx} className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-[#b45309] shrink-0 mt-0.5" />
                        <span className="leading-snug">{isHindi ? kt.hi : kt.en}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}

          {/* Goal Total Card: Highlight Clearance Result */}
          <div className="border border-amber-600/30 bg-amber-500/[0.08] p-5 sm:p-6 flex flex-col justify-between shadow-xs space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#b45309] font-black">
                <Trophy className="h-4 w-4 text-[#b45309]" />
                <span>{isHindi ? 'लक्षित परिणाम (2026)' : 'PREDICTED TARGET (2026)'}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-[#0b0d14]">
                {isHindi ? 'अंतिम लक्षित स्कोर: 235–255+ अंक' : 'Target Score: 235–255+ Marks'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-sans">
                {isHindi
                  ? 'इस 5-चरणीय क्रम का पालन करने पर आप नकारात्मक अंकन के जोखिम को न्यूनतम करके 2026 के कटऑफ (231–246 अंक) को पार करने की संभावना को अत्यधिक बढ़ा सकते हैं।'
                  : 'Following this 5-step blueprint systematically targets the 2026 cutoff (231–246 marks) while minimizing negative marking leakage.'}
              </p>
            </div>

            <div className="pt-4 border-t border-amber-600/20 flex items-center justify-between text-xs font-mono text-zinc-600">
              <span>Prelims Paper 1</span>
              <span className="text-[#b45309] font-bold bg-white border border-amber-600/30 px-3 py-1">
                100 Qs / 300 Marks (+3, -1 Neg)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 3-Level Priority Success Matrix */}
      <div className="space-y-5 pt-6 border-t border-[#0b0d14]/15">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[#b45309] font-bold text-xs">[PRIORITY HIERARCHY]</span>
            <span className="text-zinc-500 uppercase tracking-wider text-xs font-bold">
              {isHindi ? 'दैनिक अध्ययन समय आवंटन' : 'DAILY STUDY TIME ALLOCATION'}
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black tracking-tight text-[#0b0d14] mt-1">
            {isHindi ? (
              <>
                3-स्तरीय सफलता <span className="text-[#b45309]">प्राथमिकता मैट्रिक्स।</span>
              </>
            ) : (
              <>
                3-Level Priority <span className="text-[#b45309]">Success Matrix.</span>
              </>
            )}
          </h2>
          <p className="text-xs text-zinc-600 mt-1 font-sans">
            {isHindi
              ? 'समय सीमित होने पर पहले कौन-से टॉपिक्स कवर करने हैं, इसका स्पष्ट विभाजन'
              : 'A strict priority hierarchy to maximize marks per hour of study.'}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {PRIORITY_MATRIX.map((level) => {
            const isLevel1 = level.level === 1;
            return (
              <div
                key={level.level}
                className={`border bg-white shadow-xs p-5 sm:p-6 space-y-4 transition-all ${
                  isLevel1
                    ? 'border-[#b45309] border-t-4 border-t-[#d97706]'
                    : 'border-[#0b0d14]/15'
                }`}
              >
                <div className="flex items-center justify-between font-mono">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 ${
                      isLevel1
                        ? 'bg-[#d97706] text-white'
                        : 'bg-[#f4f5f8] border border-[#0b0d14]/15 text-zinc-700'
                    }`}
                  >
                    Level {level.level}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#b45309]">
                    {level.marksRange}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0b0d14] leading-snug">
                    {isHindi ? level.title.hi : level.title.en}
                  </h3>
                  <span className="font-mono text-[11px] text-zinc-500 mt-0.5 block font-bold">
                    {isHindi ? level.badge.hi : level.badge.en}
                  </span>
                </div>

                <ul className="space-y-2 pt-3 border-t border-[#0b0d14]/10 text-xs text-zinc-800 font-sans">
                  {level.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#b45309] font-bold font-mono shrink-0 mt-0.5">•</span>
                      <span className="leading-snug">{isHindi ? item.hi : item.en}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
