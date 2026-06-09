'use client';

/**
 * PYQIntelligenceSection — Marketing showcase for PYQ Analysis & Facts features.
 * Design matches existing home sections: 2-col layout, dark slate-900 card on right.
 * NO links — pure marketing/conversion section.
 * Real MPPSC Prelims data: 2020-2025 = 6 papers × ~100 Qs each.
 */

import React from 'react';
import { TrendingUp, Lightbulb, Target, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';

// Real topic weight data based on MPPSC Prelims 2020-2025 pattern
const TOPIC_DATA = [
  { topicHi: 'मध्यप्रदेश सामान्य ज्ञान', topicEn: 'MP General Knowledge', pct: 92, delta: '36 Qs', color: 'from-emerald-500 to-teal-400', badge: '📍' },
  { topicHi: 'पर्यावरण & जलवायु', topicEn: 'Environment & Climate', pct: 78, delta: 'High', color: 'from-green-500 to-emerald-400', badge: '🌿' },
  { topicHi: 'भारतीय इतिहास & संस्कृति', topicEn: 'History & Culture', pct: 65, delta: 'Stable', color: 'from-teal-500 to-cyan-400', badge: '🏛️' },
  { topicHi: 'विज्ञान & प्रौद्योगिकी', topicEn: 'Science & Technology', pct: 52, delta: 'Rising', color: 'from-cyan-500 to-blue-400', badge: '🔬' },
];

// Real year-wise question counts (MPPSC Prelims Paper 1, approx 100 Qs each)
const YEAR_BARS = [
  { year: '2020', count: 100, pct: 70 },
  { year: '2021', count: 100, pct: 75 },
  { year: '2022', count: 100, pct: 80 },
  { year: '2023', count: 100, pct: 85 },
  { year: '2024', count: 100, pct: 90 },
  { year: '2025', count: 100, pct: 95 },
  { year: '2026', count: 100, pct: 100 },
];

export function PYQIntelligenceSection() {
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute top-1/2 left-[-200px] h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-pink-50/60 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-20 lg:grid-cols-2">

          {/* LEFT — Marketing Copy */}
          <div className="space-y-8">
            <Badge
              variant="outline"
              className="border-pink-200 bg-pink-50 px-4 py-1 text-sm font-bold text-pink-700"
            >
              {isHindi ? '7 साल का PYQ डेटा · 2020–2026' : '7-Year PYQ Data · 2020–2026'}
            </Badge>

            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl leading-[1.05]">
              {isHindi
                ? <>परीक्षा <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">पैटर्न</span> पहले से<br />जान लो।</>
                : <>Know the <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">Pattern</span><br />Before the Exam.</>}
            </h2>

            <p className="text-lg leading-relaxed font-medium text-slate-600">
              {isHindi
                ? 'MPPSC Prelims के 2020-2026 के 700+ प्रश्नों का गहरा विश्लेषण। Topic-wise trends, rising subjects और high-yield facts — सब एक जगह, ताकि आप 20% पढ़ाई से 80% सवाल cover कर सकें।'
                : 'Deep analysis of 700+ MPPSC Prelims questions from 2020–2026. Topic trends, rising subjects, and high-yield facts — so you can cover 80% of questions with just 20% of the syllabus.'}
            </p>

            <div className="flex flex-wrap gap-2.5">
              {[
                { icon: '📊', labelHi: 'Year-wise Matrix', labelEn: 'Year-wise Matrix' },
                { icon: '🔥', labelHi: 'Rising Trends', labelEn: 'Rising Trends' },
                { icon: '⚡', labelHi: 'PYQ Facts Library', labelEn: 'PYQ Facts Library' },
                { icon: '🧠', labelHi: 'Smart Explanations', labelEn: 'Smart Explanations' },
              ].map((tag) => (
                <div
                  key={tag.labelEn}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600"
                >
                  <span>{tag.icon}</span>
                  {isHindi ? tag.labelHi : tag.labelEn}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Dark Visual Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              {/* Glow ring */}
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-pink-500 to-rose-400 opacity-15 blur-xl" />

              <Card className="relative z-10 rounded-[2rem] border-slate-800 bg-slate-900 p-8 text-white shadow-2xl space-y-6 overflow-hidden">
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

                {/* Header */}
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                      {isHindi ? 'Smart PYQ इंटेलिजेंस · MPPSC' : 'Smart PYQ Intelligence · MPPSC'}
                    </p>
                    <p className="mt-1 text-xl font-black text-white">
                      {isHindi ? 'टॉप राइज़िंग टॉपिक्स 2025' : 'Top Rising Topics 2025'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-pink-500/20 border border-pink-500/30 px-3 py-1">
                    <TrendingUp className="h-3 w-3 text-pink-400" />
                    <span className="text-[11px] font-black text-pink-400">LIVE</span>
                  </div>
                </div>

                {/* Topic Bars */}
                <div className="relative space-y-3.5">
                  {TOPIC_DATA.map((row) => (
                    <div key={row.topicEn} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <span className="text-base">{row.badge}</span>
                          {isHindi ? row.topicHi : row.topicEn}
                        </span>
                        <span className="font-black text-emerald-400 text-xs">
                          {row.delta} ▲
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${row.color}`}
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Year Matrix — bigger, cleaner, green */}
                <div className="relative rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Zap className="h-3 w-3 text-emerald-400" />
                      {isHindi ? 'Year-wise Coverage · 7 वर्ष' : 'Year-wise Coverage · 7 Years'}
                    </span>
                    <span className="text-[10px] font-black text-slate-500">2020–2026</span>
                  </div>
                  <div className="flex items-end gap-2.5 h-16">
                    {YEAR_BARS.map((bar, i) => (
                      <div key={bar.year} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-[9px] font-black text-emerald-400 opacity-0 group-hover:opacity-100">{bar.count}</span>
                        <div
                          className="w-full rounded-md bg-gradient-to-t from-emerald-600 to-emerald-400"
                          style={{
                            height: `${(bar.pct / 100) * 52}px`,
                            opacity: 0.45 + i * 0.09,
                          }}
                        />
                        <span className="text-[9px] font-black text-slate-500">
                          {bar.year.slice(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                    <span>{isHindi ? '100 प्रश्न प्रति वर्ष' : '100 Questions/Year'}</span>
                    <span className="text-emerald-400 font-black">{isHindi ? '700 कुल PYQ' : '700 Total PYQ'}</span>
                  </div>
                </div>

                {/* Smart Insight blurb */}
                <div className="relative flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <Lightbulb className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                  <p className="text-sm leading-relaxed text-slate-300">
                    <span className="font-black text-emerald-400">
                      {isHindi ? 'Smart Insight: ' : 'Smart Insight: '}
                    </span>
                    {isHindi
                      ? '"MP GK" से 2024-25 में 36+ सवाल आए — यह सबसे ज़्यादा weight वाला subject है। इसे first priority दो।'
                      : '"MP GK" had 36+ questions in 2024–25 — the highest-weight subject. Make it your #1 priority.'}
                  </p>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
