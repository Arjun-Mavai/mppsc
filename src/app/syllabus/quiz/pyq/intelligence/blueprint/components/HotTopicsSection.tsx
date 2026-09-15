'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  UNITS_INTELLIGENCE,
  UnitIntelligence,
  MicroHotTopic,
} from '@/data/prelims-intelligence-data';
import {
  Search,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Flame,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

interface HotTopicsSectionProps {
  isHindi: boolean;
}

const CORE_UNIT_IDS = [1, 3, 5, 10];
const HIGH_ROI_UNIT_IDS = [7, 8, 9];

export function HotTopicsSection({ isHindi }: HotTopicsSectionProps) {
  // Navigation & Category states
  const [activeCategoryTab, setActiveCategoryTab] = useState<'core' | 'high_roi' | 'all'>('core');
  const [selectedUnit, setSelectedUnit] = useState<number | null>(1); // Default to Unit 1 (Core high-yield)
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCheatSheets, setExpandedCheatSheets] = useState<Record<string, boolean>>({
    'ht-1-1': true,
    'ht-1-2': true,
    'ht-2-1': true,
    'ht-3-1': true,
    'ht-5-1': true,
    'ht-10-1': true,
    'ht-10-2': true,
  });
  const [copiedTopicId, setCopiedTopicId] = useState<string | null>(null);

  const toggleCheatSheet = (id: string) => {
    setExpandedCheatSheets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyCheatSheet = (topic: MicroHotTopic) => {
    let text = `${isHindi ? topic.title.hi : topic.title.en}\n`;
    topic.cheatSheet.forEach((cat) => {
      text += `\n[${isHindi ? cat.category.hi : cat.category.en}]\n`;
      cat.items.forEach((item) => {
        text += `• ${isHindi ? item.hi : item.en}\n`;
      });
    });

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedTopicId(topic.id);
        toast.success(isHindi ? 'चीट शीट क्लिपबोर्ड पर कॉपी हो गई!' : 'Cheat Sheet copied to clipboard!');
        setTimeout(() => setCopiedTopicId(null), 2000);
      }).catch(() => {
        toast.error(isHindi ? 'कॉपी करने में विफल' : 'Failed to copy');
      });
    }
  };

  // Filter units and topics
  const filteredUnits = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return UNITS_INTELLIGENCE.map((unit) => {
      // If a specific unit is selected, filter to that unit
      if (selectedUnit !== null && unit.unitId !== selectedUnit) {
        return null;
      }

      // If no specific unit is selected, filter by category tab
      if (selectedUnit === null) {
        if (activeCategoryTab === 'core' && !CORE_UNIT_IDS.includes(unit.unitId)) {
          return null;
        }
        if (activeCategoryTab === 'high_roi' && !HIGH_ROI_UNIT_IDS.includes(unit.unitId)) {
          return null;
        }
      }

      // Filter topics inside this unit
      const matchingTopics = unit.hotTopics.filter((topic) => {
        if (selectedRating !== null && topic.starRating !== selectedRating) {
          return false;
        }

        if (!q) return true;

        const titleMatch =
          topic.title.en.toLowerCase().includes(q) || topic.title.hi.toLowerCase().includes(q);
        const mindsetMatch =
          topic.examinerMindset.en.toLowerCase().includes(q) ||
          topic.examinerMindset.hi.toLowerCase().includes(q);
        const questionMatch = topic.realQuestions.some(
          (rq) =>
            rq.question.en.toLowerCase().includes(q) ||
            rq.question.hi.toLowerCase().includes(q) ||
            (rq.answer &&
              (rq.answer.en.toLowerCase().includes(q) || rq.answer.hi.toLowerCase().includes(q)))
        );
        const cheatMatch = topic.cheatSheet.some((cs) =>
          cs.items.some(
            (item) =>
              item.en.toLowerCase().includes(q) || item.hi.toLowerCase().includes(q)
          )
        );

        return titleMatch || mindsetMatch || questionMatch || cheatMatch;
      });

      if (matchingTopics.length === 0 && q) {
        return null;
      }

      return {
        ...unit,
        hotTopics: matchingTopics,
      };
    }).filter(Boolean) as UnitIntelligence[];
  }, [selectedUnit, activeCategoryTab, selectedRating, searchQuery]);

  // Active unit stats for summary bar
  const activeUnitInfo = selectedUnit !== null
    ? UNITS_INTELLIGENCE.find((u) => u.unitId === selectedUnit)
    : null;

  return (
    <div className="space-y-8 font-mono">
      {/* ========================================================================= */}
      {/* ACT 3: THE MICROSCOPIC ARSENAL (हथियार और चीट शीट्स)                     */}
      {/* ========================================================================= */}
      <div className="border-b border-[#0b0d14]/15 pb-4">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/15 border border-amber-600/30 text-[#b45309] px-2.5 py-0.5 text-xs font-bold">
            STAGE 03
          </span>
          <span className="text-zinc-500 uppercase tracking-wider text-xs font-bold">
            {isHindi ? 'सूक्ष्म हॉट टॉपिक्स एवं चीट शीट्स (यूनिट 1 से 10)' : 'MICROSCOPIC ARSENAL & CHEAT SHEETS'}
          </span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0b0d14] mt-1.5">
          {isHindi ? (
            <>
              यूनिट-वार हॉट टॉपिक्स एवं <span className="text-[#b45309]">चीट शीट्स।</span>
            </>
          ) : (
            <>
              Microscopic Hot Topics & <span className="text-[#b45309]">Cheat Sheets.</span>
            </>
          )}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-sans">
          {isHindi
            ? 'अब जब आप जानते हैं कि किन 4 यूनिट्स में सबसे ज्यादा अंक हैं, तो देखिए कि परीक्षक उनके अंदर से वास्तव में क्या-क्या पूछता है। परीक्षक की सोच, वास्तविक प्रश्न और परीक्षा से पहले याद करने योग्य चीट शीट्स।'
            : 'Now that you know which units hold 65% of the marks, inspect exactly what the examiner asks inside them. Examiner mindsets, real exam question proofs, and instant copyable terminal cheat sheets.'}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* INTUITIVE UNIT CONTROL DECK (बड़ा और स्पष्ट फ़िल्टर सेक्शन)                 */}
      {/* ========================================================================= */}
      <div className="border border-[#0b0d14]/15 bg-white shadow-xs p-5 sm:p-7 space-y-6">
        {/* Row 1: Search Bar & Reset */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-600">
            <span className="font-bold flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-[#b45309]" />
              {isHindi ? '// त्वरित कीवर्ड सर्च:' : '// INSTANT SEARCH ACROSS ALL UNITS:'}
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#b45309] hover:underline font-bold text-xs"
              >
                {isHindi ? 'सर्च हटाएं' : 'Clear Search'}
              </button>
            )}
          </div>
          <div className="relative">
            <Input
              type="text"
              placeholder={
                isHindi
                  ? '$ टॉपिक, प्रश्न या कीवर्ड खोजें (जैसे: Census, Narmada, Governor, भील, ISRO, Article 324, Tantiya Bhil)...'
                  : '$ Search keywords, questions or cheats (e.g. Census, Narmada, Governor, Bhil, ISRO, Article 324, Tantiya Bhil)...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 h-11 bg-[#f4f5f8] border-[#0b0d14]/20 text-[#0b0d14] placeholder:text-zinc-500 font-mono text-xs sm:text-sm rounded-none focus-visible:ring-1 focus-visible:ring-[#b45309] focus-visible:border-[#b45309]"
            />
          </div>
        </div>

        {/* Row 2: Category Switcher (Core 4 vs High ROI vs All Units) */}
        <div className="space-y-2.5 pt-4 border-t border-[#0b0d14]/10">
          <div className="flex items-center justify-between text-xs text-zinc-600">
            <span className="font-bold flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-[#b45309]" />
              {isHindi ? '// यूनिट चयन (प्राथमिकता अनुसार):' : '// SELECT UNIT BY PRIORITY TIER:'}
            </span>
            <span className="text-[11px] text-zinc-500 hidden sm:inline">
              {isHindi ? 'क्लिक करके यूनिट बदलें' : 'Click any unit below to view its topics'}
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            <button
              type="button"
              onClick={() => {
                setActiveCategoryTab('core');
                setSelectedUnit(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-mono font-bold transition-all border ${
                activeCategoryTab === 'core' && selectedUnit === null
                  ? 'bg-[#d97706] text-white border-[#b45309]'
                  : 'bg-amber-500/10 border-amber-600/30 text-[#b45309] hover:bg-amber-500/20'
              }`}
            >
              ⭐ {isHindi ? '४ कोर यूनिट्स (65% उपज · ~195 अंक 2026)' : 'Core 4 Units (65% Yield · ~195 Marks 2026)'}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveCategoryTab('high_roi');
                setSelectedUnit(7);
              }}
              className={`px-3 py-1.5 text-xs font-mono font-bold transition-all border ${
                activeCategoryTab === 'high_roi' && selectedUnit === null
                  ? 'bg-[#d97706] text-white border-[#b45309]'
                  : 'bg-[#f4f5f8] border-[#0b0d14]/15 text-zinc-700 hover:text-black'
              }`}
            >
              {isHindi ? 'उच्च-उपज अगले (Units 7, 8, 9)' : 'High-ROI Next (Units 7, 8, 9)'}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveCategoryTab('all');
                setSelectedUnit(null);
              }}
              className={`px-3 py-1.5 text-xs font-mono font-bold transition-all border ${
                selectedUnit === null && activeCategoryTab === 'all'
                  ? 'bg-[#d97706] text-white border-[#b45309]'
                  : 'bg-[#f4f5f8] border-[#0b0d14]/15 text-zinc-700 hover:text-black'
              }`}
            >
              {isHindi ? 'सभी 10 यूनिट्स एक साथ' : 'Show All 10 Units'}
            </button>
          </div>

          {/* Unit Chips Deck (Larger, Tactile, with Weightage Badges) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
            {UNITS_INTELLIGENCE.map((unit) => {
              const isSelected = selectedUnit === unit.unitId;
              const isCore = CORE_UNIT_IDS.includes(unit.unitId);

              return (
                <button
                  key={unit.unitId}
                  type="button"
                  onClick={() => setSelectedUnit(unit.unitId)}
                  className={`p-3 text-left transition-all border flex flex-col justify-between space-y-1.5 ${
                    isSelected
                      ? 'bg-[#d97706] text-white border-[#b45309] shadow-sm'
                      : isCore
                      ? 'bg-amber-500/[0.04] border-amber-600/30 text-[#0b0d14] hover:bg-amber-500/10'
                      : 'bg-[#f4f5f8] border-[#0b0d14]/15 text-zinc-700 hover:border-[#b45309] hover:text-black'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold flex items-center gap-1">
                      <span>{unit.icon}</span>
                      <span>U{unit.unitId}</span>
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : isCore
                          ? 'bg-amber-500/20 text-[#b45309]'
                          : 'bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      ~{Math.round(unit.stats.avgQuestions * 3)}M ({unit.stats.avgQuestions}Q)
                    </span>
                  </div>
                  <p
                    className={`text-xs font-bold truncate leading-tight ${
                      isSelected ? 'text-white' : 'text-[#0b0d14]'
                    }`}
                  >
                    {isHindi ? unit.title.hi : unit.title.en}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Consistency Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#0b0d14]/10 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-bold">
              {isHindi ? 'पूर्वानुमान स्तर:' : 'Prediction Confidence:'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedRating(null)}
                className={`px-2.5 py-1 text-xs border ${
                  selectedRating === null
                    ? 'bg-[#d97706] text-white font-bold border-[#b45309]'
                    : 'bg-[#f4f5f8] border-[#0b0d14]/15 text-zinc-700 hover:text-black'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedRating(3)}
                className={`px-2.5 py-1 text-xs flex items-center gap-1 border ${
                  selectedRating === 3
                    ? 'bg-[#d97706] text-white font-bold border-[#b45309]'
                    : 'bg-amber-500/10 border-amber-600/30 text-[#b45309] hover:bg-amber-500/20'
                }`}
              >
                <span>⭐⭐⭐</span>
                <span className="font-bold">
                  {isHindi ? 'उच्चतम संभावना (7/7 वर्ष रिकॉर्ड)' : 'Highest Probability (7/7 Yrs)'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRating(2)}
                className={`px-2.5 py-1 text-xs flex items-center gap-1 border ${
                  selectedRating === 2
                    ? 'bg-[#d97706] text-white font-bold border-[#b45309]'
                    : 'bg-[#f4f5f8] border-[#0b0d14]/15 text-zinc-700 hover:text-black'
                }`}
              >
                <span>⭐⭐</span>
                <span>{isHindi ? '71%–85% संभावित' : '71%–85% High Probability'}</span>
              </button>
            </div>
          </div>

          {selectedUnit !== null && (
            <button
              type="button"
              onClick={() => setSelectedUnit(null)}
              className="text-xs text-[#b45309] hover:underline font-bold"
            >
              {isHindi ? 'सभी यूनिट्स दिखाएं' : 'View All Units Together'}
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTIVE UNIT LIVE BANNER (यूज़र को तुरंत समझ आने वाला सारांश)               */}
      {/* ========================================================================= */}
      {activeUnitInfo && (
        <div className="border-l-4 border-l-[#d97706] border border-[#0b0d14]/15 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="text-3xl">{activeUnitInfo.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/15 border border-amber-600/30 text-[#b45309] font-bold text-xs px-2 py-0.5">
                  {activeUnitInfo.unitCode}
                </span>
                <span className="text-xs font-bold text-zinc-500">
                  {isHindi ? 'वार्षिक औसत:' : 'Annual Yield:'}{' '}
                  <strong className="text-[#b45309]">
                    ~{Math.round(activeUnitInfo.stats.avgQuestions * 3)} Marks (2026) · {activeUnitInfo.stats.avgQuestions} Qs
                  </strong>
                  <span className="text-zinc-400 font-normal ml-1 hidden sm:inline">
                    ({activeUnitInfo.stats.avgMarks}M pre-2026)
                  </span>
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#0b0d14] mt-1">
                {isHindi ? activeUnitInfo.title.hi : activeUnitInfo.title.en}
              </h3>
            </div>
          </div>

          <div className="text-xs text-zinc-600 font-mono bg-[#f4f5f8] border border-[#0b0d14]/10 p-2.5 sm:max-w-xs">
            <span className="text-[#b45309] font-bold mr-1">{'//'} TREND:</span>
            {isHindi ? activeUnitInfo.stats.trendDescription.hi : activeUnitInfo.stats.trendDescription.en}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* THE MICROSCOPIC TOPIC CARDS (बड़े, स्पष्ट और रिच कार्ड्स)                  */}
      {/* ========================================================================= */}
      <div className="space-y-10">
        {filteredUnits.length === 0 ? (
          <div className="p-10 text-center border border-[#0b0d14]/15 bg-white text-zinc-600 font-mono shadow-xs space-y-3">
            <p className="text-sm font-bold text-[#0b0d14]">
              {isHindi ? '// कोई मैचिंग टॉपिक नहीं मिला।' : '// No matching hot topics found for this search/filter.'}
            </p>
            <p className="text-xs text-zinc-500">
              {isHindi ? 'फ़िल्टर साफ़ करके सभी 10 यूनिट्स के टॉपिक्स देखें।' : 'Reset your search or rating filter to view all topics.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedUnit(1);
                setSelectedRating(null);
                setActiveCategoryTab('core');
              }}
              className="mt-2 text-xs font-mono border border-[#0b0d14]/20 bg-white text-zinc-800 hover:bg-zinc-100 rounded-none font-bold"
            >
              {isHindi ? 'फ़िल्टर रीसेट करें (वापस Unit 1 पर जाएं)' : 'Reset Filters (Return to Unit 1)'}
            </Button>
          </div>
        ) : (
          filteredUnits.map((unit) => (
            <div key={unit.unitId} className="space-y-6">
              {/* Unit Title Bar if in All Units mode */}
              {selectedUnit === null && (
                <div className="border-b-2 border-[#0b0d14]/20 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{unit.icon}</span>
                    <h3 className="text-lg font-black text-[#0b0d14]">
                      {unit.unitCode}: {isHindi ? unit.title.hi : unit.title.en}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#b45309]">
                    ~{Math.round(unit.stats.avgQuestions * 3)}M (2026) · {unit.stats.avgQuestions} Qs/yr
                  </span>
                </div>
              )}

              {/* Topics inside this Unit */}
              <div className="space-y-6">
                {unit.hotTopics.map((topic) => {
                  const isCheatExpanded = !!expandedCheatSheets[topic.id];
                  const isCopied = copiedTopicId === topic.id;
                  const isHighPrediction = topic.starRating === 3;

                  return (
                    <div
                      key={topic.id}
                      className={`border bg-white shadow-xs overflow-hidden transition-all ${
                        isHighPrediction
                          ? 'border-[#0b0d14]/20 border-t-3 border-t-[#d97706]'
                          : 'border-[#0b0d14]/15'
                      }`}
                    >
                      {/* Topic Title & Rating Header */}
                      <div className="p-5 sm:p-7 border-b border-[#0b0d14]/10 bg-white space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="bg-[#0b0d14] text-white px-2 py-0.5 text-xs font-bold">
                              {topic.topicNumber}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 font-bold border ${
                                isHighPrediction
                                  ? 'bg-amber-500/15 border-amber-600/30 text-[#b45309]'
                                  : 'bg-[#f4f5f8] border-[#0b0d14]/15 text-zinc-700'
                              }`}
                            >
                              {'⭐'.repeat(topic.starRating)} {topic.consistencyScore}
                            </span>
                          </div>

                          <span className="text-xs text-zinc-700 bg-[#f4f5f8] border border-[#0b0d14]/15 px-2.5 py-0.5 font-bold">
                            {isHindi ? topic.frequencyLabel.hi : topic.frequencyLabel.en}
                          </span>
                        </div>

                        <h4 className="text-lg sm:text-2xl font-black text-[#0b0d14] tracking-tight">
                          {isHindi ? topic.title.hi : topic.title.en}
                        </h4>

                        {/* Examiner Mindset Card: High-Impact Briefing Note */}
                        <div className="border-l-4 border-l-[#d97706] border border-[#0b0d14]/10 bg-amber-500/[0.06] p-4 text-xs sm:text-sm mt-3">
                          <div className="font-mono text-[#b45309] font-black text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Flame className="h-3.5 w-3.5" />
                            <span>{isHindi ? '// परीक्षक की सोच (EXAMINER MINDSET):' : '// EXAMINER MINDSET & QUESTION HOOK:'}</span>
                          </div>
                          <p className="text-zinc-800 leading-relaxed font-sans">
                            {isHindi ? topic.examinerMindset.hi : topic.examinerMindset.en}
                          </p>
                        </div>
                      </div>

                      {/* Content Body: Questions & Terminal Cheat Sheet */}
                      <div className="p-5 sm:p-7 space-y-6 bg-[#f4f5f8]/40">
                        {/* 1. Real Exam Question Proofs */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs font-mono text-zinc-600">
                            <span className="font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                              {isHindi ? 'वास्तविक परीक्षा प्रश्न प्रमाण (2020–2026):' : 'REAL EXAM QUESTION PROOFS (2020–2026):'}
                            </span>
                            <span className="text-[11px] text-zinc-500">
                              {topic.realQuestions.length} {isHindi ? 'प्रश्न सिद्ध' : 'verified Qs'}
                            </span>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            {topic.realQuestions.map((rq, idx) => (
                              <div
                                key={idx}
                                className="border border-[#0b0d14]/15 bg-white p-4 space-y-3 shadow-2xs flex flex-col justify-between"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between font-mono text-xs">
                                    <span className="bg-[#0b0d14] text-white font-bold px-2 py-0.5 text-[11px]">
                                      {rq.year} {rq.qNum}
                                    </span>
                                    <span className="text-[11px] text-zinc-500 font-sans">
                                      MPPSC Prelims Paper 1
                                    </span>
                                  </div>
                                  <p className="text-xs sm:text-sm font-medium text-zinc-900 leading-relaxed font-sans">
                                    {isHindi ? rq.question.hi : rq.question.en}
                                  </p>
                                </div>

                                {rq.answer && (
                                  <div className="text-xs font-mono text-emerald-900 bg-emerald-50 border border-emerald-300/60 p-2.5 flex items-start gap-1.5 mt-2">
                                    <span className="text-emerald-700 font-bold shrink-0">✓</span>
                                    <span className="leading-snug">
                                      <strong>{isHindi ? 'प्रामाणिक उत्तर: ' : 'Verified Key: '}</strong>
                                      {isHindi ? rq.answer.hi : rq.answer.en}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 2. Must-Memorize Terminal Cheat Sheet: px0.ai IDE Mock Style */}
                        <div className="border border-[#0b0d14]/15 bg-white shadow-2xs overflow-hidden">
                          {/* IDE Top Bar */}
                          <div
                            onClick={() => toggleCheatSheet(topic.id)}
                            className="cursor-pointer flex items-center justify-between p-3.5 border-b border-[#0b0d14]/10 bg-[#f4f5f8] hover:bg-zinc-200/60 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {/* 3 Terminal Dots */}
                              <span className="flex items-center gap-1.5" aria-hidden="true">
                                <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
                                <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
                                <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
                              </span>
                              <span className="font-mono text-xs sm:text-sm font-bold text-[#0b0d14]">
                                {'//'} {topic.topicNumber.toLowerCase().replace(/\s+/g, '-')}-cheat-sheet.md
                              </span>
                            </div>

                            <div className="flex items-center gap-2 font-mono">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyCheatSheet(topic);
                                }}
                                className="h-8 px-3 text-xs border border-[#0b0d14]/15 bg-white text-zinc-800 hover:border-[#b45309] hover:text-[#b45309] rounded-none font-bold shadow-2xs"
                                title="Copy Cheat Sheet"
                              >
                                {isCopied ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5 text-[#b45309]" />
                                )}
                                <span className="ml-1.5 text-xs">
                                  {isCopied ? (isHindi ? 'कॉपी हो गया' : 'Copied!') : (isHindi ? 'चीट शीट कॉपी करें' : 'Copy Cheats')}
                                </span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-500 hover:text-black rounded-none"
                              >
                                {isCheatExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Cheat Sheet Expanded Content */}
                          {isCheatExpanded && (
                            <div className="p-5 sm:p-6 space-y-4 font-mono text-xs sm:text-sm bg-white">
                              {topic.cheatSheet.map((cat, cIdx) => (
                                <div
                                  key={cIdx}
                                  className={cIdx > 0 ? 'pt-4 border-t border-[#0b0d14]/10 space-y-2' : 'space-y-2'}
                                >
                                  <h5 className="font-mono text-xs uppercase tracking-wider text-[#b45309] font-black">
                                    {'//'} {isHindi ? cat.category.hi : cat.category.en}
                                  </h5>
                                  <ul className="space-y-2 pl-1 font-sans text-zinc-800">
                                    {cat.items.map((item, iIdx) => (
                                      <li key={iIdx} className="flex items-start gap-2.5">
                                        <span className="text-[#b45309] font-bold font-mono shrink-0 mt-0.5">•</span>
                                        <span className="leading-relaxed">
                                          {isHindi ? item.hi : item.en}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 2026-2027 Targeted Prediction Box at bottom of Unit */}
              {unit.predictions2026_2027.length > 0 && (
                <div className="border border-amber-600/30 bg-amber-500/[0.06] p-5 sm:p-6 text-xs sm:text-sm font-mono space-y-3">
                  <div className="flex items-center gap-2 font-black text-[#b45309] text-xs sm:text-sm uppercase tracking-wider">
                    <Sparkles className="h-4 w-4 text-[#b45309]" />
                    <span>
                      {isHindi ? `// ${unit.unitCode} 2026–2027 सटीक परीक्षा भविष्यवाणी` : `// ${unit.unitCode} 2026–2027 TARGETED EXAM PREDICTIONS`}
                    </span>
                  </div>
                  <ul className="space-y-2 text-zinc-800 pl-4 font-sans">
                    {unit.predictions2026_2027.map((pred, pIdx) => (
                      <li key={pIdx} className="list-disc leading-relaxed">
                        {isHindi ? pred.hi : pred.en}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
