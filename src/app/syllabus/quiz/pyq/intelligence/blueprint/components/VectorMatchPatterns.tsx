'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { VECTOR_PATTERNS } from '@/data/prelims-intelligence-data';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface VectorMatchPatternsProps {
  isHindi: boolean;
}

export function VectorMatchPatterns({ isHindi }: VectorMatchPatternsProps) {
  const [expandedPattern, setExpandedPattern] = useState<string | null>(VECTOR_PATTERNS[0].id);

  const togglePattern = (id: string) => {
    setExpandedPattern((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header (px0.ai style) */}
      <div className="border-b border-[#0b0d14]/15 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[#b45309] font-bold text-xs">[03]</span>
          <span className="text-zinc-500 uppercase tracking-wider text-xs">
            {isHindi ? 'सर्वाधिक दोहराए जाने वाले प्रश्न अनुसंधान' : 'HIGH-FREQUENCY REPEATED QUESTION PATTERNS'}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0b0d14] mt-1">
          {isHindi ? (
            <>
              शीर्ष 8 सबसे अधिक दोहराए गए <span className="text-[#b45309]">पैटर्न।</span>
            </>
          ) : (
            <>
              Top 8 Most Repeated <span className="text-[#b45309]">Question Patterns.</span>
            </>
          )}
        </h2>
        <p className="text-xs text-zinc-600 mt-1">
          {isHindi
            ? '7 वर्षों (2020–2026) के प्रश्नपत्रों के विश्लेषण द्वारा सिद्ध — परीक्षा में हूबहू और समान थीम पर बार-बार पूछे गए वास्तविक प्रश्न'
            : 'Empirically proven from 7 years (2020–2026) of papers — exact and near-identical questions repeated across exam cycles.'}
        </p>
      </div>

      {/* Grid of Patterns */}
      <div className="space-y-3">
        {VECTOR_PATTERNS.map((pattern) => {
          const isExpanded = expandedPattern === pattern.id;

          return (
            <div
              key={pattern.id}
              className={`border transition-all duration-150 bg-white shadow-xs ${
                isExpanded
                  ? 'border-[#b45309] shadow-sm'
                  : 'border-[#0b0d14]/15 hover:border-[#0b0d14]/35'
              }`}
            >
              <div
                onClick={() => togglePattern(pattern.id)}
                className="cursor-pointer p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center bg-amber-500/15 border border-amber-600/30 font-bold text-[#b45309] text-xs sm:text-sm">
                    #{pattern.rank}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-[#0b0d14]">
                        {isHindi ? pattern.title.hi : pattern.title.en}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed font-sans">
                      {isHindi ? pattern.summary.hi : pattern.summary.en}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-[#0b0d14]/10">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[11px] text-zinc-700 bg-[#f4f5f8] border border-[#0b0d14]/15 px-2 py-0.5">
                      {isHindi ? pattern.frequency.hi : pattern.frequency.en}
                    </span>
                    <span className="text-[10px] font-bold text-[#b45309] bg-amber-500/15 border border-amber-600/30 px-2 py-0.5">
                      {pattern.vectorDistance}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-none text-zinc-500 hover:text-black hover:bg-zinc-100"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Expanded Question Proofs: px0.ai terminal comparison */}
              {isExpanded && (
                <div className="p-4 sm:p-5 bg-[#f4f5f8] border-t border-[#0b0d14]/15 space-y-4">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-zinc-600 font-bold">
                      <span className="text-[#b45309]">{'//'}</span>{' '}
                      {isHindi ? 'वास्तविक परीक्षा प्रश्न प्रमाण (2020–2026)' : 'REAL EXAM QUESTION PROOFS (2020–2026)'}
                    </span>
                    <span className="text-[10.5px] font-bold text-[#b45309] bg-amber-500/15 border border-amber-600/30 px-2 py-0.5">
                      {isHindi ? pattern.similarityBadge.hi : pattern.similarityBadge.en}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {pattern.questions.map((q, idx) => (
                      <div
                        key={idx}
                        className="border border-[#0b0d14]/15 bg-white p-3.5 space-y-2.5 flex flex-col justify-between shadow-2xs"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between font-mono text-xs">
                            <span className="bg-[#0b0d14] text-white font-bold px-2 py-0.5 text-[10px]">
                              {q.year} {q.qNum}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              Prelims Paper 1
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-zinc-900 leading-relaxed font-sans">
                            {isHindi ? q.text.hi : q.text.en}
                          </p>
                        </div>

                        {q.answer && (
                          <div className="flex items-start gap-2 pt-2 border-t border-[#0b0d14]/10 text-xs font-mono text-amber-950 bg-amber-500/10 border border-amber-600/30 p-2">
                            <span className="text-[#b45309] font-bold">✓</span>
                            <span>
                              {isHindi ? 'उत्तर: ' : 'Answer: '}
                              {isHindi ? q.answer.hi : q.answer.en}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
