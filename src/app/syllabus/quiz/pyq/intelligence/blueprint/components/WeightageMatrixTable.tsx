'use client';

import React, { useState } from 'react';
import { UNIT_WEIGHTAGE_MATRIX, UNIT_BARS } from '@/data/prelims-intelligence-data';
import { BarChart3, Layers } from 'lucide-react';

interface WeightageMatrixTableProps {
  isHindi: boolean;
}

export function WeightageMatrixTable({ isHindi }: WeightageMatrixTableProps) {
  const [markingScheme, setMarkingScheme] = useState<'2026' | 'legacy'>('2026');
  const [viewMode, setViewMode] = useState<'combined' | 'questions' | 'marks'>('combined');
  const [mobileLayout, setMobileLayout] = useState<'cards' | 'table'>('cards');

  const multiplier = markingScheme === '2026' ? 3 : 2;
  const totalQuestionsSum = 700;

  return (
    <div className="space-y-6 font-mono">
      {/* Section Header (px0.ai style) */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 border-b border-[#0b0d14]/15 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[#b45309] font-bold text-xs">[02]</span>
            <span className="text-zinc-500 uppercase tracking-wider text-xs">
              {isHindi ? '7-वर्षीय वेटेज एवं अंक मैट्रिक्स' : '7-YEAR WEIGHTAGE MATRIX'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0b0d14] mt-1">
            {isHindi ? (
              <>
                2020–2026 संपूर्ण <span className="text-[#b45309]">वेटेज मैट्रिक्स।</span>
              </>
            ) : (
              <>
                2020–2026 Complete <span className="text-[#b45309]">Weightage Matrix.</span>
              </>
            )}
          </h2>
          <p className="text-xs text-zinc-600 mt-1">
            {isHindi
              ? markingScheme === '2026'
                ? 'नवीनतम 2026 स्कीम: 1 प्रश्न = +3 अंक · -1 नकारात्मक अंकन · कुल पेपर = 100 प्रश्न / 300 अंक'
                : 'ऐतिहासिक 2020–2025 स्कीम: 1 प्रश्न = +2 अंक · कोई नकारात्मक अंकन नहीं · कुल पेपर = 100 प्रश्न / 200 अंक'
              : markingScheme === '2026'
                ? 'Current 2026 Pattern: 1 Question = +3 Marks · -1 Negative Marking · Total = 100 Qs / 300 Marks'
                : 'Historical 2020–2025 Pattern: 1 Question = +2 Marks · No Negative Marking · Total = 100 Qs / 200 Marks'}
          </p>
        </div>

        {/* Scheme & View Switchers */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
          {/* Marking Scheme Switcher (2026 vs Legacy) */}
          <div className="flex border border-[#0b0d14]/15 bg-white p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setMarkingScheme('2026')}
              className={`px-3 py-1 text-xs font-mono transition-all ${
                markingScheme === '2026'
                  ? 'bg-[#d97706] text-white font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              {isHindi ? '⚡ 2026 (+3 / -1 Neg)' : '⚡ 2026 (+3 / -1 Neg)'}
            </button>
            <button
              type="button"
              onClick={() => setMarkingScheme('legacy')}
              className={`px-3 py-1 text-xs font-mono transition-all ${
                markingScheme === 'legacy'
                  ? 'bg-[#d97706] text-white font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              {isHindi ? '2020–2025 (+2M)' : '2020–2025 (+2M)'}
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex border border-[#0b0d14]/15 bg-white p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('combined')}
              className={`px-3 py-1 text-xs font-mono transition-all ${
                viewMode === 'combined'
                  ? 'bg-[#0b0d14] text-white font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              {isHindi ? 'संयुक्त' : 'Combined'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('questions')}
              className={`px-3 py-1 text-xs font-mono transition-all ${
                viewMode === 'questions'
                  ? 'bg-[#0b0d14] text-white font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              {isHindi ? 'प्रश्न' : 'Questions'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('marks')}
              className={`px-3 py-1 text-xs font-mono transition-all ${
                viewMode === 'marks'
                  ? 'bg-[#0b0d14] text-white font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              {isHindi ? 'अंक' : 'Marks'}
            </button>
          </div>

          {/* Mobile Layout Switcher */}
          <div className="sm:hidden flex border border-[#0b0d14]/15 bg-white p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setMobileLayout('cards')}
              className={`p-1.5 ${mobileLayout === 'cards' ? 'bg-amber-100 text-[#b45309] font-bold' : 'text-zinc-500'}`}
              title="Cards"
            >
              <Layers className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileLayout('table')}
              className={`p-1.5 ${mobileLayout === 'table' ? 'bg-amber-100 text-[#b45309] font-bold' : 'text-zinc-500'}`}
              title="Table"
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. Mobile Cards Layout */}
      <div className={`sm:hidden space-y-3 ${mobileLayout === 'cards' ? 'block' : 'hidden'}`}>
        {UNIT_WEIGHTAGE_MATRIX.map((row) => (
          <div
            key={row.unitId}
            className="border border-[#0b0d14]/15 bg-white p-4 space-y-3 shadow-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-block bg-amber-500/15 border border-amber-600/30 px-2 py-0.5 text-[11px] font-mono font-bold text-[#b45309]">
                  Unit {row.unitId}
                </span>
                <h3 className="text-sm font-bold text-[#0b0d14] mt-1.5 leading-snug">
                  {isHindi ? row.title.hi : row.title.en}
                </h3>
              </div>
              <span className="text-[10.5px] font-mono border border-[#0b0d14]/15 bg-[#f4f5f8] px-2 py-0.5 text-zinc-600 shrink-0">
                {isHindi ? row.trend.hi : row.trend.en}
              </span>
            </div>

            {/* Yearly mini grid */}
            <div className="grid grid-cols-7 gap-1 text-center py-2 px-1 bg-[#f4f5f8] border border-[#0b0d14]/10 font-mono">
              {(['2020', '2021', '2022', '2023', '2024', '2025', '2026'] as const).map((yr) => {
                const data = row.years[yr as unknown as keyof typeof row.years];
                const is2026 = yr === '2026';
                const marksVal = data.q * multiplier;
                return (
                  <div key={yr} className={`flex flex-col py-0.5 ${is2026 ? 'bg-amber-500/20' : ''}`}>
                    <span className={`text-[9px] ${is2026 ? 'text-[#b45309] font-bold' : 'text-zinc-500'}`}>
                      {yr.slice(2)}
                    </span>
                    <span className={`text-xs font-bold ${is2026 ? 'text-[#b45309]' : 'text-zinc-800'}`}>
                      {viewMode === 'marks' ? `${marksVal}M` : data.q}
                    </span>
                    {viewMode === 'combined' && (
                      <span className={`text-[8px] ${is2026 ? 'text-amber-800' : 'text-zinc-500'}`}>
                        {marksVal}M
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Averages and Totals */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#0b0d14]/10 text-zinc-600 font-mono">
              <span>
                {isHindi ? 'कुल: ' : 'Total: '}
                <strong className="text-[#0b0d14] font-bold">
                  {row.totalQuestions} Qs ({row.totalQuestions * multiplier}M)
                </strong>
              </span>
              <span>
                {isHindi ? 'वार्षिक औसत: ' : 'Avg/Yr: '}
                <strong className="text-[#b45309] font-bold">
                  {row.avgQuestions} Qs ({(row.avgQuestions * multiplier).toFixed(1)}M)
                </strong>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Responsive Table Layout (Desktop/Tablet + Mobile if table toggled) */}
      <div className={`${mobileLayout === 'table' ? 'block' : 'hidden sm:block'}`}>
        <div className="border border-[#0b0d14]/15 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm font-mono">
              <thead>
                <tr className="border-b border-[#0b0d14]/15 bg-[#f4f5f8] text-[10.5px] uppercase tracking-wider text-zinc-600">
                  <th className="py-3 px-3 sm:px-4 font-bold text-[#0b0d14] sticky left-0 bg-[#f4f5f8] z-10">
                    Unit
                  </th>
                  <th className="py-3 px-3 sm:px-4 font-bold text-[#0b0d14] min-w-[180px]">
                    {isHindi ? 'विषय' : 'Subject'}
                  </th>
                  <th className="py-3 px-2 text-center">2020</th>
                  <th className="py-3 px-2 text-center">2021</th>
                  <th className="py-3 px-2 text-center">2022</th>
                  <th className="py-3 px-2 text-center">2023</th>
                  <th className="py-3 px-2 text-center">2024</th>
                  <th className="py-3 px-2 text-center">2025</th>
                  <th className="py-3 px-2 text-center bg-amber-500/15 text-[#92400e] font-black border-x border-amber-500/25">
                    2026
                  </th>
                  <th className="py-3 px-3 text-center font-bold text-[#0b0d14]">
                    {isHindi ? 'कुल' : 'Total'}
                  </th>
                  <th className="py-3 px-3 text-center font-bold text-[#b45309]">
                    {isHindi ? 'औसत/वर्ष' : 'Avg/Yr'}
                  </th>
                  <th className="py-3 px-3 sm:px-4 min-w-[160px]">
                    {isHindi ? '7-वर्षीय ट्रेंड' : '7-Yr Trend'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0b0d14]/10">
                {UNIT_WEIGHTAGE_MATRIX.map((row) => (
                  <tr key={row.unitId} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-2.5 px-3 sm:px-4 font-bold text-[#b45309] sticky left-0 bg-white z-10 whitespace-nowrap">
                      U{row.unitId}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-semibold text-[#0b0d14]">
                      {isHindi ? row.title.hi : row.title.en}
                    </td>
                    {(['2020', '2021', '2022', '2023', '2024', '2025'] as const).map((yr) => {
                      const data = row.years[yr as unknown as keyof typeof row.years];
                      const cellMarks = data.q * multiplier;
                      return (
                        <td key={yr} className="py-2.5 px-2 text-center whitespace-nowrap text-zinc-700">
                          {viewMode === 'combined' ? (
                            <span>
                              <span className="font-bold text-[#0b0d14]">{data.q}</span>
                              <span className="text-[10px] text-zinc-500 block sm:inline sm:ml-1">
                                ({cellMarks}M)
                              </span>
                            </span>
                          ) : viewMode === 'questions' ? (
                            <span className="font-bold text-[#0b0d14]">{data.q}</span>
                          ) : (
                            <span className="font-bold text-[#0b0d14]">{cellMarks}M</span>
                          )}
                        </td>
                      );
                    })}
                    {/* 2026 Highlighted Column */}
                    <td className="py-2.5 px-2 text-center bg-amber-500/[0.08] border-x border-amber-500/25 whitespace-nowrap">
                      {viewMode === 'combined' ? (
                        <span>
                          <span className="font-black text-[#92400e]">{row.years[2026].q}</span>
                          <span className="text-[10px] text-amber-900 block sm:inline sm:ml-1 font-semibold">
                            ({row.years[2026].q * multiplier}M)
                          </span>
                        </span>
                      ) : viewMode === 'questions' ? (
                        <span className="font-black text-[#92400e]">{row.years[2026].q}</span>
                      ) : (
                        <span className="font-black text-[#92400e]">{row.years[2026].q * multiplier}M</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap font-bold text-[#0b0d14] bg-zinc-50/50">
                      {row.totalQuestions} Qs
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap font-bold text-[#b45309] bg-amber-50/40">
                      {row.avgQuestions} Qs{' '}
                      <span className="text-[11px] font-normal text-zinc-500">
                        ({(row.avgQuestions * multiplier).toFixed(1)}M)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap text-xs text-zinc-600">
                      <span className="inline-block bg-[#f4f5f8] border border-[#0b0d14]/15 px-2 py-0.5 text-[11px]">
                        {isHindi ? row.trend.hi : row.trend.en}
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="border-t-2 border-[#0b0d14]/20 bg-[#f4f5f8] text-[#0b0d14] font-black text-xs sm:text-sm">
                  <td className="py-3 px-3 sm:px-4 sticky left-0 bg-[#f4f5f8] z-10 text-[#b45309]">
                    TOTAL
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-zinc-700">All 10 Units Combined</td>
                  <td className="py-3 px-2 text-center text-zinc-600">100</td>
                  <td className="py-3 px-2 text-center text-zinc-600">100</td>
                  <td className="py-3 px-2 text-center text-zinc-600">100</td>
                  <td className="py-3 px-2 text-center text-zinc-600">100</td>
                  <td className="py-3 px-2 text-center text-zinc-600">100</td>
                  <td className="py-3 px-2 text-center text-zinc-600">100</td>
                  <td className="py-3 px-2 text-center text-[#92400e] bg-amber-500/15 border-x border-amber-500/25">
                    100
                  </td>
                  <td className="py-3 px-3 text-center text-[#0b0d14]">{totalQuestionsSum}</td>
                  <td className="py-3 px-3 text-center text-[#b45309]">100 Qs ({100 * multiplier}M)</td>
                  <td className="py-3 px-3 sm:px-4 text-[#b45309]">
                    {isHindi ? `100 प्रश्न = ${100 * multiplier} अंक` : `100 Qs = ${100 * multiplier} Marks`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Visual Annual Marks Progress Bars (px0.ai style) */}
      <div className="border border-[#0b0d14]/15 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#0b0d14]/10 pb-3">
          <span className="text-xs text-zinc-600 uppercase tracking-wider font-bold">
            <span className="text-[#b45309] font-bold">{'//'}</span>{' '}
            {isHindi
              ? `वार्षिक अंक हिस्सेदारी (${100 * multiplier} में से)`
              : `ANNUAL MARKS SHARE (OUT OF ${100 * multiplier} MARKS)`}
          </span>
          <span className="text-xs text-zinc-500 hidden sm:inline">
            {isHindi
              ? markingScheme === '2026'
                ? '2026 स्कीम (+3 अंक/प्रश्न)'
                : '2020–2025 ऐतिहासिक औसत'
              : markingScheme === '2026'
                ? '2026 Scheme (3M/Question)'
                : '7-year historic average'}
          </span>
        </div>

        <div className="space-y-3.5">
          {UNIT_BARS.map((bar) => {
            const scaledMarks = (bar.marks / 2) * multiplier;
            const maxMarks = 17.0 * multiplier;
            const isCore = scaledMarks >= 20 * (multiplier / 2);
            return (
              <div key={bar.unit} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isCore ? 'text-[#0b0d14]' : 'text-zinc-700'}`}>
                      {isHindi ? bar.unitHi : bar.unit}
                    </span>
                    {bar.note && (
                      <span className="text-[10px] font-bold text-[#b45309] bg-amber-500/15 border border-amber-600/30 px-1.5 py-0.2">
                        {bar.note}
                      </span>
                    )}
                  </div>
                  <span className="font-bold">
                    <span className={isCore ? 'text-[#b45309]' : 'text-zinc-800'}>
                      {scaledMarks.toFixed(1)} M
                    </span>{' '}
                    <span className="text-zinc-500 font-normal">({bar.pct}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-zinc-100 border border-[#0b0d14]/10 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${
                      isCore ? 'bg-[#d97706]' : 'bg-zinc-400'
                    }`}
                    style={{ width: `${(scaledMarks / maxMarks) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
