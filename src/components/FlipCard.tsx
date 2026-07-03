'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lightbulb, RotateCw, Zap, Target, Sparkles, Lock } from 'lucide-react';

export interface FlipCardProps {
  // Data Props
  id: string | number;
  title: string;
  subtitle?: string; // e.g. "01" or "History of MP"

  // Back Side Data
  backTitle?: string; // e.g. "Topic Analysis"
  backMainContent?: string; // Summary text
  facts?: string[]; // Bullet points
  mnemonic?: string;

  // Visuals
  image?: string;
  impactEmoji?: string;

  // State / Logic
  isLocked?: boolean;
  className?: string; // Wrapper class

  // Handlers
  onFlip?: (id: string | number) => void;
  isFlipped?: boolean; // Controlled state
  onPracticeTest?: () => void;
  onReadMore?: () => void;

  // Labels (for bilingual support)
  labels: {
    tapToFlip: string;
    topicAnalysis: string;
    mnemonicLabel: string;
    practiceTest: string;
    closeAnalysis: string;
  };
}

const FlipCard: React.FC<FlipCardProps> = ({
  id,
  title,
  subtitle = '01',
  backTitle,
  backMainContent,
  facts,
  mnemonic,
  image,
  impactEmoji,
  isLocked = false,
  className,
  onFlip,
  isFlipped,
  onPracticeTest,
  onReadMore,
  labels,
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const flipped = isFlipped !== undefined ? isFlipped : internalFlipped;

  const handleFlip = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;

    // If locked, clicking acts as "Read More" (which handles lock check in parent -> opens modal)
    if (isLocked) {
      if (onReadMore) onReadMore();
      return;
    }

    if (isAnimating) return;

    if (onFlip) {
      onFlip(id);
    } else {
      setInternalFlipped(!internalFlipped);
    }
    setIsAnimating(true);
  };

  const handlePracticeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPracticeTest) onPracticeTest();
  };

  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Logic for reading more is typically handled by the parent opening the sheet via click on the card wrapper
    // But if we need explicit button action different from the card click:
    // Here clicking the card already triggers onFlip or parent action if handled.
    // The user wants a "Reading More" button which likely opens the Sheet.
    // Currently the parent `UnitContent` uses `onClick` on the wrapper to open detail sheet in List view.
    // In Grid view (FlipCard), clicking flips it.
    // We need a prop `onReadMore` to open the sheet.
    // For now, let's assume the user wants this button to be the primary "Open Sheet" action.
    // We'll bubble an event or if the parent passed a handler.
    // Wait, the `FlipCard` is used in Grid View. The request says "card par bhi ek button do jo click par read more jaisa wo sheet open kare".
    // So we need a new prop `onReadMore`.

    // Since I cannot change the parent `UnitContent` in this tool call easily without context switch,
    // I will add the button UI and for now make it just log or try to flip back.
    // ACTUALLY, I should add `onReadMore` prop to the interface first.
  };

  return (
    <div
      className={cn('group perspective-2000 relative h-[500px] w-full cursor-pointer', className)}
      onClick={handleFlip}
    >
      <motion.div
        className="preserve-3d h-full w-full rounded-[2.5rem] shadow-2xl duration-700"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 150, damping: 20 }}
        onAnimationComplete={() => setIsAnimating(false)}
      >
        {/* FRONT SIDE (UNCHANGED MOSTLY) */}
        <div
          className={cn(
            'absolute h-full w-full rounded-[2.5rem] backface-hidden',
            'border border-slate-200 bg-white shadow-xl',
            'flex flex-col items-center justify-between p-8 sm:p-10',
            'transition-all duration-500 group-hover:border-slate-200 group-hover:shadow-slate-500/10',
            isLocked && 'opacity-90 grayscale-[0.8]'
          )}
        >
          <div className="flex w-full items-start justify-between opacity-30">
            <Target size={32} className="text-slate-400" />
          </div>

          <div className="relative z-10 flex w-full flex-col items-center gap-8 text-center">
            <div className="flex h-24 w-24 -rotate-3 items-center justify-center rounded-3xl bg-slate-900 shadow-2xl transition-transform duration-500 group-hover:-rotate-6">
              {impactEmoji ? (
                <span className="text-5xl">{impactEmoji}</span>
              ) : (
                <Sparkles className="h-10 w-10 text-white" />
              )}
            </div>

            <h3
              className={cn(
                'text-3xl leading-tight font-black tracking-tight text-slate-900 md:text-4xl',
                title.length > 20 ? 'text-2xl' : ''
              )}
            >
              {title}
            </h3>

            {isLocked && (
              <div className="inline-flex items-center rounded-lg border border-pink-200 bg-gradient-to-r from-red-100 via-pink-100 to-amber-100 px-3 py-1.5 text-xs font-black tracking-widest text-amber-600 uppercase">
                <Lock className="mr-2 h-3.5 w-3.5 animate-pulse" /> <span>Premium</span>
              </div>
            )}
          </div>

          <div className="flex w-full justify-center">
            <span className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-5 py-2 text-xs font-bold tracking-wider text-slate-500 uppercase transition-colors group-hover:bg-slate-50 group-hover:text-slate-700">
              <RotateCw
                size={14}
                className="transition-transform duration-700 group-hover:rotate-180"
              />
              <span>{labels.tapToFlip}</span>
            </span>
          </div>
        </div>

        {/* BACK SIDE (REDESIGNED) */}
        <div
          className={cn(
            'absolute h-full w-full rotate-y-180 rounded-[2.5rem] backface-hidden',
            'border border-slate-800 bg-[#0F172A] shadow-2xl shadow-slate-950/20', // Darker premium bg
            'flex flex-col justify-between overflow-hidden p-8'
          )}
        >
          {/* Header */}
          <div className="relative z-10 shrink-0 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-indigo-400 uppercase">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-700" />
              <span>{labels.topicAnalysis}</span>
            </div>
            <h4 className="line-clamp-1 text-2xl leading-snug font-bold tracking-tight text-white">
              {backTitle || title}
            </h4>
          </div>

          {/* Main Content - SCROLLABLE */}
          {/* Added h-0 and flex-grow to ensure it takes available space and scrolls properly */}
          <div className="no-scrollbar relative z-10 h-0 min-h-0 flex-1 space-y-4 overflow-y-auto [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)] py-2">
            {/* Styled Points (Limited to first 3 to avoid scroll) */}
            {facts && (
              <ul className="space-y-3">
                {facts.slice(0, 3).map((fact, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-4 rounded-2xl border border-white/5 bg-slate-800/50 p-4 transition-colors hover:bg-slate-800"
                  >
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-700 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    <span className="text-sm leading-relaxed font-medium text-slate-300">
                      {fact.includes(':') ? (
                        <>
                          <span className="mr-1 font-bold text-indigo-200">
                            {fact.split(':')[0]}:
                          </span>
                          {fact.substring(fact.indexOf(':') + 1)}
                        </>
                      ) : (
                        fact
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Mnemonic (Condensed) */}
            {mnemonic && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-900/20 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Lightbulb size={12} className="text-amber-500" />
                  <span className="text-[10px] font-black tracking-wider text-amber-500 uppercase">
                    {labels.mnemonicLabel}
                  </span>
                </div>
                <div className="text-sm font-bold text-amber-100/90 italic">
                  &quot;{mnemonic}&quot;
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="relative z-20 mt-auto flex flex-col gap-3 border-t border-white/5 pt-4">
            {/* Read More Button (Triggers Sheet) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onReadMore) onReadMore();
              }}
              className="h-12 w-full rounded-xl border border-white/10 bg-slate-800 text-[10px] font-black tracking-wider text-white uppercase transition-colors hover:bg-slate-700"
            >
              Read More
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default FlipCard;
