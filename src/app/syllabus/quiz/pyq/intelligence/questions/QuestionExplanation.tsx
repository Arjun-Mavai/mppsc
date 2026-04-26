'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Lightbulb, Brain, AlertTriangle } from 'lucide-react';

interface QuestionExplanationProps {
  explanation?: string;
  /** Hindi / primary (DB `explanation` or `explanation_hi`) */
  explanationHi?: string;
  explanationEn?: string;
  isHindi: boolean;
  compact?: boolean;
}

export default function QuestionExplanation({
  explanation,
  explanationHi,
  explanationEn,
  isHindi,
  compact = false,
}: QuestionExplanationProps) {
  const hi = explanationHi ?? explanation;
  const rawText = isHindi ? hi : explanationEn || hi || explanation;

  if (!rawText) return null;

  const textToParse = rawText;

  const OGI = {
    FACT: '**💡 Exam Fact',
    TIP: '**🧠 Memory Tip',
    SCAM: '**🚫 Scam Alert',
  };
  // Plain (prompt-style) + ** variants — same as PremiumExplanation
  const PLAIN = {
    LOGIC: ['सही तर्क:', 'Correct Logic:', 'Core Logic:'] as const,
    FACT: ['**Exam Fact', 'Exam Fact:', '**💡 Exam Fact'] as const,
    TIP: ['**Memory Tip', 'Memory Tip:', '**🧠 Memory Tip'] as const,
    SCAM: ['**Scam Alert', 'Scam Alert:', '**🚫 Scam Alert'] as const,
  };
  const allSplitMarkers: string[] = [
    '**तर्क',
    '**एग्जाम फैक्ट',
    '**मेमोरी टिप',
    '**स्कैम अलर्ट',
    ...PLAIN.LOGIC,
    ...PLAIN.FACT,
    ...PLAIN.TIP,
    ...PLAIN.SCAM,
    OGI.FACT,
    OGI.TIP,
    OGI.SCAM,
  ];

  const tryFirstMatch = (starts: readonly string[], ends: string[]) => {
    for (const start of starts) {
      const i = textToParse.indexOf(start);
      if (i === -1) continue;
      const after = textToParse.slice(i + start.length);
      let end = after.length;
      for (const e of ends) {
        const j = after.indexOf(e);
        if (j !== -1 && j < end) end = j;
      }
      return after.slice(0, end).trim() || null;
    }
    return null;
  };

  const examFact = tryFirstMatch(PLAIN.FACT, [
    OGI.TIP,
    OGI.SCAM,
    ...PLAIN.TIP,
    ...PLAIN.SCAM,
  ]);
  const memoryTip = tryFirstMatch(PLAIN.TIP, [OGI.FACT, OGI.SCAM, ...PLAIN.FACT, ...PLAIN.SCAM]);
  const scamAlert = tryFirstMatch(PLAIN.SCAM, [OGI.FACT, OGI.TIP, ...PLAIN.FACT, ...PLAIN.TIP]);

  // Core logic: text before any section marker, or after explicit logic prefix
  let coreLogic = textToParse;
  for (const start of ['सही तर्क:', 'Correct Logic:', 'Core Logic:', '**Correct Logic', '**सही तर्क']) {
    const i = textToParse.indexOf(start);
    if (i === -1) continue;
    const after = textToParse.slice(i + start.length);
    let end = after.length;
    for (const m of allSplitMarkers) {
      if (m === start) continue;
      const j = after.indexOf(m);
      if (j !== -1 && j < end) end = j;
    }
    coreLogic = after.slice(0, end).trim();
    break;
  }
  if (coreLogic === textToParse) {
    let firstMarkerIndex = coreLogic.length;
    allSplitMarkers.forEach((m) => {
      const idx = coreLogic.indexOf(m);
      if (idx !== -1 && idx < firstMarkerIndex) firstMarkerIndex = idx;
    });
    coreLogic = coreLogic.slice(0, firstMarkerIndex).trim();
  }

  const cleanContent = (s: string | null) => {
    if (!s) return null;
    return s
      .replace(/^(\s*(\(High Value\)|\(Mnemonic\)|\(Elimination\))?\s*)?(\*\*|:)?\s*:?\s*/, '')
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/---+/g, '')
      .replace(/^\s*[-*]\s+/gm, '• ')
      .trim();
  };

  const sections = {
    logic: coreLogic,
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

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
      <h4 className="mb-3 text-xs font-bold tracking-wider text-amber-400 uppercase">
        {isHindi ? 'व्याख्या' : 'Explanation'}
      </h4>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3.5">
        {/* Core Logic */}
        {sections.logic && (
          <motion.div variants={item}>
            {compact ? (
              <div className="space-y-2 text-sm leading-relaxed text-amber-200/90">
                {sections.logic
                  ?.split('\n')
                  .filter((l) => l.trim())
                  .map((line, i) => (
                    <p key={i}>{cleanContent(line)}</p>
                  ))}
              </div>
            ) : (
              <div className="border-l-2 border-emerald-500 pl-3">
                <h5 className="mb-1 flex items-center gap-1.5 text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                  <CheckCircle2 size={12} className="shrink-0" />
                  {isHindi ? 'तर्क' : 'Core Logic'}
                </h5>
                <div className="space-y-2 text-sm leading-relaxed text-amber-200/90">
                  {sections.logic
                    ?.split('\n')
                    .filter((l) => l.trim())
                    .map((line, i) => (
                      <p key={i}>{cleanContent(line)}</p>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Exam Fact */}
        {sections.fact && (
          <motion.div variants={item} className="border-l-2 border-blue-400 pl-3">
            <h5 className="mb-1 flex items-center gap-1.5 text-[10px] font-black tracking-widest text-blue-400 uppercase">
              <Lightbulb size={12} className="shrink-0" />
              {isHindi ? 'एग्जाम फैक्ट' : 'Exam Fact'}
            </h5>
            <p className="text-sm leading-relaxed text-blue-200/90">{sections.fact}</p>
          </motion.div>
        )}

        {/* Memory Tip */}
        {sections.tip && (
          <motion.div variants={item} className="border-l-2 border-purple-400 pl-3">
            <h5 className="mb-1 flex items-center gap-1.5 text-[10px] font-black tracking-widest text-purple-400 uppercase">
              <Brain size={12} className="shrink-0" />
              {isHindi ? 'मेमोरी टिप' : 'Memory Tip'}
            </h5>
            <p className="rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-sm leading-relaxed text-purple-200/90 italic">
              {sections.tip}
            </p>
          </motion.div>
        )}

        {/* Scam Alert */}
        {sections.scam && (
          <motion.div variants={item} className="border-l-2 border-red-400 pl-3">
            <h5 className="mb-1 flex items-center gap-1.5 text-[10px] font-black tracking-widest text-red-400 uppercase">
              <AlertTriangle size={12} className="shrink-0" />
              {isHindi ? 'स्कैम अलर्ट' : 'Scam Alert'}
            </h5>
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm leading-relaxed text-red-200/90">
              {sections.scam}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
