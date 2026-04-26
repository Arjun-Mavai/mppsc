'use client';

import React from 'react';
import { CheckCircle2, Lightbulb, Brain, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { coerceExplanationToString } from '@/lib/explanation-text';

interface PremiumExplanationProps {
  /** Plain / default explanation — may be string or bilingual object from API */
  explanation?: unknown;
  explanationEn?: unknown;
  explanationHi?: unknown;
  language?: 'hi' | 'en';
  /** When true, Core Logic renders without a border-box — plain text, more space on small screens */
  compact?: boolean;
  /** Adapts text colors for dark backgrounds (e.g. PYQ Analysis pages) */
  darkMode?: boolean;
}

import { useSettingsStore } from '@/store/useSettingsStore';

export const PremiumExplanation: React.FC<PremiumExplanationProps> = ({
  explanation,
  explanationEn,
  explanationHi,
  language,
  compact = false,
  darkMode = false,
}) => {
  const storeLanguage = useSettingsStore((state) => state.language);
  const finalLanguage = language || storeLanguage;

  const DEFAULT_MSG =
    finalLanguage === 'hi'
      ? 'यह प्रश्न सीधे अवधारणात्मक (Conceptual) है। यदि यह गलत हुआ है, तो कृपया संबंधित विषय के मूल तथ्यों (Basics) को दोहराएं।'
      : 'This question addresses core concepts. If answered incorrectly, please review the fundamental facts of this topic.';

  const coercedEn = coerceExplanationToString(explanationEn, 'en');
  const coercedHi = coerceExplanationToString(explanationHi, 'hi');
  const coercedMain = coerceExplanationToString(explanation, finalLanguage);

  /** Never render non-strings in JSX (nested JSON from prod → [object Object]). */
  const displayExplanation = (v: unknown) => coerceExplanationToString(v, finalLanguage);

  const textToParseRaw =
    (finalLanguage === 'en' ? coercedEn || coercedMain : coercedHi || coercedMain) || DEFAULT_MSG;

  // JSON DETECTION & RENDERING
  const renderJSONExplanation = (jsonStr: string) => {
    try {
      const trimmed = jsonStr.trim();
      if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return null;
      const data = JSON.parse(trimmed);

      const analysisItems = [
        {
          key: 'core_logic',
          label: finalLanguage === 'hi' ? 'तर्क एवं विश्लेषण' : 'Core Logic',
          icon: <CheckCircle2 size={16} className="text-emerald-500" />,
          color: 'emerald' as const,
          content: displayExplanation(
            data.verdict ?? data.core_logic ?? data.logic,
          ),
        },
        {
          key: 'exam_fact',
          label: finalLanguage === 'hi' ? 'एग्जाम फैक्ट' : 'Exam Fact',
          icon: <Lightbulb size={16} className="text-amber-500" />,
          color: 'amber' as const,
          content: displayExplanation(
            data.exam_fact ?? data.fact ?? data.core_concept,
          ),
        },
        {
          key: 'memory_tip',
          label: finalLanguage === 'hi' ? 'मेमोरी टिप' : 'Memory Tip',
          icon: <Brain size={16} className="text-indigo-500" />,
          color: 'indigo' as const,
          content: displayExplanation(
            data.memory_tip ?? data.tip ?? data.memory_trick ?? data.elimination_wisdom,
          ),
        },
        {
          key: 'scam_alert',
          label: finalLanguage === 'hi' ? 'स्कैम अलर्ट' : 'Scam Alert',
          icon: <AlertTriangle size={16} className="text-rose-500" />,
          color: 'rose' as const,
          content: displayExplanation(
            data.scam_alert ?? data.scam ?? data.trap_alert ?? data.trap_alerts,
          ),
        },
      ].filter((item) => item.content.trim().length > 0);

      if (analysisItems.length === 0) return null;

      return (
        <div className="space-y-4">
          {analysisItems.map((ai) => (
            <div
              key={ai.key}
              className={cn(
                'group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300',
                ai.color === 'emerald' &&
                  'border-emerald-500/20 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.05]',
                ai.color === 'amber' &&
                  'border-amber-500/20 bg-amber-500/[0.03] hover:bg-amber-500/[0.05]',
                ai.color === 'indigo' &&
                  'border-indigo-500/20 bg-indigo-500/[0.03] hover:bg-indigo-500/[0.05]',
                ai.color === 'rose' &&
                  'border-rose-500/20 bg-rose-500/[0.03] hover:bg-rose-500/[0.05]'
              )}
            >
              <div className="mb-2 flex items-center gap-2.5">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-xl',
                    ai.color === 'emerald' && 'bg-emerald-500/10',
                    ai.color === 'amber' && 'bg-amber-500/10',
                    ai.color === 'indigo' && 'bg-indigo-500/10',
                    ai.color === 'rose' && 'bg-rose-500/10'
                  )}
                >
                  {ai.icon}
                </div>
                <h4
                  className={cn(
                    'text-[10px] font-black tracking-[0.2em] uppercase',
                    ai.color === 'emerald' && 'text-emerald-500',
                    ai.color === 'amber' && 'text-amber-500',
                    ai.color === 'indigo' && 'text-indigo-500',
                    ai.color === 'rose' && 'text-rose-500'
                  )}
                >
                  {ai.label}
                </h4>
              </div>
              <p
                className={cn(
                  'text-[14px] leading-relaxed font-semibold tracking-tight sm:text-[15.5px]',
                  darkMode ? 'text-slate-200' : 'text-slate-800'
                )}
              >
                {displayExplanation(ai.content)}
              </p>
            </div>
          ))}
        </div>
      );
    } catch (e) {
      return null;
    }
  };

  const jsonExplanation = renderJSONExplanation(textToParseRaw);
  if (jsonExplanation) return jsonExplanation;

  const textToParse = textToParseRaw;

  const extractSection = (text: string, marker: string, nextMarkers: string[]) => {
    if (!text) return null;
    const startIndex = text.indexOf(marker);
    if (startIndex === -1) return null;

    let content = text.slice(startIndex + marker.length);
    let minIndex = content.length;
    nextMarkers.forEach((nm) => {
      const idx = content.indexOf(nm);
      if (idx !== -1 && idx < minIndex) {
        minIndex = idx;
      }
    });

    return content.slice(0, minIndex).trim();
  };

  const MARKERS = {
    LOGIC: '**Correct Logic',
    FACT: '**Exam Fact',
    TIP: '**Memory Tip',
    SCAM: '**Scam Alert',
  };
  const HINDI_MARKERS = {
    LOGIC: '**सही तर्क',
    FACT: '**एग्जाम फैक्ट',
    TIP: '**मेमोरी टिप',
    SCAM: '**स्कैम अलर्ट',
  };

  // Plain-text / prompt-style (no **), including bilingual mixes (e.g. HI body + "Exam Fact:" labels)
  const PLAIN_MARKERS = {
    LOGIC: ['सही तर्क:', 'Correct Logic:', 'Core Logic:'] as const,
    FACT: ['Exam Fact:', '**💡 Exam Fact', 'Exam Fact\n'] as const,
    TIP: ['Memory Tip:', '**🧠 Memory Tip', 'Memory Tip\n'] as const,
    SCAM: ['Scam Alert:', '**🚫 Scam Alert', 'Scam Alert\n'] as const,
  };

  // Also check for emoji versions
  const EMOJI_MARKERS = {
    LOGIC: '✅',
    FACT: '💡',
    TIP: '🧠',
    SCAM: '🚫',
  };

  /** Every substring that can start a new section (used to bound slices). */
  const allSectionStartMarkers: string[] = [
    'सही तर्क:',
    'Correct Logic:',
    'Core Logic:',
    MARKERS.LOGIC,
    HINDI_MARKERS.LOGIC,
    '**तर्क',
    MARKERS.FACT,
    HINDI_MARKERS.FACT,
    ...PLAIN_MARKERS.FACT,
    MARKERS.TIP,
    HINDI_MARKERS.TIP,
    ...PLAIN_MARKERS.TIP,
    MARKERS.SCAM,
    HINDI_MARKERS.SCAM,
    ...PLAIN_MARKERS.SCAM,
    '**💡 Exam Fact',
    '**🧠 Memory Tip',
    '**🚫 Scam Alert',
    EMOJI_MARKERS.LOGIC,
    EMOJI_MARKERS.FACT,
    EMOJI_MARKERS.TIP,
    EMOJI_MARKERS.SCAM,
  ];

  // Find Core Logic (✅, **, or plain e.g. "सही तर्क:" / "Correct Logic:")
  const extractLogic = (text: string) => {
    const logicStarts = [
      ...PLAIN_MARKERS.LOGIC,
      EMOJI_MARKERS.LOGIC,
      MARKERS.LOGIC,
      '**तर्क',
      HINDI_MARKERS.LOGIC,
    ];

    for (const marker of logicStarts) {
      const idx = text.indexOf(marker);
      if (idx === -1) continue;
      const content = text.slice(idx);
      let minIndex = content.length;
      allSectionStartMarkers.forEach((nm) => {
        if (nm === marker) return;
        const nextIdx = content.indexOf(nm, 1);
        if (nextIdx !== -1 && nextIdx < minIndex) {
          minIndex = nextIdx;
        }
      });
      return content.slice(0, minIndex).trim();
    }

    // Fallback: content before the first any-section marker (incl. plain "Exam Fact:" etc.)
    let minIndex = text.length;
    allSectionStartMarkers.forEach((m) => {
      const idx = text.indexOf(m);
      if (idx !== -1 && idx < minIndex) {
        minIndex = idx;
      }
    });
    return text.slice(0, minIndex).trim();
  };

  /** Tries **, plain ("Exam Fact:"), Devanagari, and emoji line markers. */
  const extractWithMarker = (text: string, textMarkers: string[], emojiMarker: string) => {
    for (const m of textMarkers) {
      const section = extractSection(text, m, allSectionStartMarkers);
      if (section) return section;
    }
    return extractSection(text, emojiMarker, allSectionStartMarkers);
  };

  const factPrimaryMarkers = [
    ...PLAIN_MARKERS.FACT,
    MARKERS.FACT,
    HINDI_MARKERS.FACT,
  ];
  const tipPrimaryMarkers = [
    ...PLAIN_MARKERS.TIP,
    MARKERS.TIP,
    HINDI_MARKERS.TIP,
  ];
  const scamPrimaryMarkers = [
    ...PLAIN_MARKERS.SCAM,
    MARKERS.SCAM,
    HINDI_MARKERS.SCAM,
  ];

  const coreLogic = extractLogic(textToParse);
  const examFact = extractWithMarker(textToParse, factPrimaryMarkers, EMOJI_MARKERS.FACT);
  const memoryTip = extractWithMarker(textToParse, tipPrimaryMarkers, EMOJI_MARKERS.TIP);
  const scamAlert = extractWithMarker(textToParse, scamPrimaryMarkers, EMOJI_MARKERS.SCAM);

  const cleanContent = (s: string | null) => {
    if (s == null) return null;
    if (typeof s !== 'string') {
      const co = displayExplanation(s);
      return co ? co.trim() : null;
    }
    if (!s) return null;
    let cleaned = s;
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // AGGRESSIVE CLEANING - Remove ALL marker patterns at start
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // English markers to strip (case insensitive)
    const enMarkers = [
      'Correct Logic',
      'Core Logic', 
      'Exam Fact',
      'Memory Tip',
      'Scam Alert',
    ];
    
    // Hindi markers to strip
    const hiMarkers = [
      'सही तर्क',
      'तर्क',
      'तर्क एवं विश्लेषण',
      'एग्जाम फैक्ट',
      'Exam Fact',
      'मेमोरी टिप',
      'Memory Tip',
      'स्कैम अलर्ट',
      'Scam Alert',
    ];
    
    // Remove emojis at start
    cleaned = cleaned.replace(/^[✅💡🧠🚫⭐🔥📌⚡️🎯]+\s*/g, '');
    
    // Remove ** markers with text (English)
    for (const marker of enMarkers) {
      const regex = new RegExp(`^\\*{0,2}\\s*${marker}\\s*\\*{0,2}\\s*:?\\s*`, 'gi');
      cleaned = cleaned.replace(regex, '');
    }
    
    // Remove ** markers with text (Hindi)
    for (const marker of hiMarkers) {
      const regex = new RegExp(`^\\*{0,2}\\s*${marker}\\s*\\*{0,2}\\s*:?\\s*`, 'gi');
      cleaned = cleaned.replace(regex, '');
    }
    
    // Remove any remaining leading ** or *
    cleaned = cleaned.replace(/^\*+\s*/g, '');
    
    // Remove markdown headers (###, ##, #)
    cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
    cleaned = cleaned.replace(/\s*#{3,}\s*/g, ' ');
    
    // Remove tags like (High Value), (Mnemonic), etc.
    cleaned = cleaned.replace(/\s*\((High Value|Mnemonic|Elimination)\)\s*:?\s*/gi, '');
    
    // Clean leading colons, stars, spaces
    cleaned = cleaned.replace(/^[\s:*]+/g, '');
    
    // Convert bullets
    cleaned = cleaned.replace(/^\s*[-]\s+/gm, '• ');
    
    // Clean multiple newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    return cleaned.trim();
  };

  const sections = {
    logic: cleanContent(coreLogic),
    fact: cleanContent(examFact),
    tip: cleanContent(memoryTip),
    scam: cleanContent(scamAlert),
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  // Build analysisItems array - map our 4 sections to styled boxes
  const analysisItems = [
    {
      key: 'core_logic',
      label: finalLanguage === 'hi' ? 'तर्क एवं विश्लेषण' : 'Core Logic',
      icon: <CheckCircle2 size={16} className="text-emerald-500" />,
      color: 'emerald' as const,
      content: sections.logic,
    },
    {
      key: 'exam_fact',
      label: finalLanguage === 'hi' ? 'एग्जाम फैक्ट' : 'Exam Fact',
      icon: <Lightbulb size={16} className="text-amber-500" />,
      color: 'amber' as const,
      content: sections.fact,
    },
    {
      key: 'memory_tip',
      label: finalLanguage === 'hi' ? 'मेमोरी टिप' : 'Memory Tip',
      icon: <Brain size={16} className="text-indigo-500" />,
      color: 'indigo' as const,
      content: sections.tip,
    },
    {
      key: 'scam_alert',
      label: finalLanguage === 'hi' ? 'स्कैम अलर्ट' : 'Scam Alert',
      icon: <AlertTriangle size={16} className="text-rose-500" />,
      color: 'rose' as const,
      content: sections.scam,
    },
  ]
    .map((item) => ({
      ...item,
      content: displayExplanation(item.content),
    }))
    .filter((item) => item.content.trim().length > 0);

  if (analysisItems.length === 0) {
    // Emoji / **Hindi** / ad-hoc formats that don't match our section parsers — show full text (instant mode)
    const raw = (textToParse || '').trim();
    if (!raw || raw === DEFAULT_MSG.trim()) return null;
    return (
      <div
        className={cn(
          'text-sm leading-relaxed font-medium tracking-tight sm:text-[15px]',
          'whitespace-pre-line',
          darkMode ? 'text-slate-200' : 'text-slate-800',
        )}
      >
        {raw}
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {analysisItems.map((ai) => (
        <motion.div key={ai.key} variants={item}>
          <div
            className={cn(
              'group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300',
              ai.color === 'emerald' &&
                'border-emerald-500/20 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.05]',
              ai.color === 'amber' &&
                'border-amber-500/20 bg-amber-500/[0.03] hover:bg-amber-500/[0.05]',
              ai.color === 'indigo' &&
                'border-indigo-500/20 bg-indigo-500/[0.03] hover:bg-indigo-500/[0.05]',
              ai.color === 'rose' &&
                'border-rose-500/20 bg-rose-500/[0.03] hover:bg-rose-500/[0.05]'
            )}
          >
            <div className="mb-2 flex items-center gap-2.5">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl',
                  ai.color === 'emerald' && 'bg-emerald-500/10',
                  ai.color === 'amber' && 'bg-amber-500/10',
                  ai.color === 'indigo' && 'bg-indigo-500/10',
                  ai.color === 'rose' && 'bg-rose-500/10'
                )}
              >
                {ai.icon}
              </div>
              <h4
                className={cn(
                  'text-[10px] font-black tracking-[0.2em] uppercase',
                  ai.color === 'emerald' && 'text-emerald-500',
                  ai.color === 'amber' && 'text-amber-500',
                  ai.color === 'indigo' && 'text-indigo-500',
                  ai.color === 'rose' && 'text-rose-500'
                )}
              >
                {ai.label}
              </h4>
            </div>
            <p
              className={cn(
                'text-[14px] leading-relaxed font-semibold tracking-tight sm:text-[15.5px]',
                darkMode ? 'text-slate-200' : 'text-slate-800'
              )}
            >
              {displayExplanation(ai.content)}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
