'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Search, Plus, Lock, Sparkles } from 'lucide-react';
import NextImage from 'next/image';

interface SyllabusTopicCardProps {
  id: string | number;
  title: string;
  subtitle?: string;
  impactEmoji?: string;
  imageUrl?: string;
  colorVariant: 'blue' | 'pink' | 'emerald' | 'amber';
  variant?: 'topic' | 'unit';
  isLocked?: boolean;
  isFree?: boolean;
  isLoading?: boolean;
  hideBadge?: boolean;
  hidePlus?: boolean;
  onClick: () => void;
  labels: {
    search: string;
    topic: string;
    unit: string;
  };
}

export const variants = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'text-blue-400',
    border: 'border-blue-100',
    shadow: 'shadow-blue-200/40',
  },
  pink: {
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    icon: 'text-pink-400',
    border: 'border-pink-100',
    shadow: 'shadow-pink-200/40',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    icon: 'text-emerald-400',
    border: 'border-emerald-100',
    shadow: 'shadow-emerald-200/40',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    icon: 'text-amber-400',
    border: 'border-amber-100',
    shadow: 'shadow-amber-200/40',
  },
};

export const SyllabusTopicCard: React.FC<SyllabusTopicCardProps> = ({
  id,
  title,
  subtitle,
  impactEmoji,
  imageUrl,
  colorVariant,
  variant = 'topic',
  isLocked,
  isFree,
  isLoading,
  hideBadge = false,
  hidePlus = false,
  onClick,
  labels,
}) => {
  const style = variants[colorVariant];

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      className={cn(
        'group relative flex h-[320px] w-full cursor-pointer flex-col justify-between overflow-hidden rounded-[2.5rem] border p-6 transition-all duration-300',
        style.bg,
        style.border,
        'shadow-sm hover:shadow-2xl',
        style.shadow,
        isLoading && 'pointer-events-none opacity-90 grayscale-[0.5]',
        isLocked && 'grayscale-[0.5]'
      )}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/20 backdrop-blur-[2px] animate-in fade-in duration-300">
           <div className={cn("h-10 w-10 animate-spin rounded-full border-4 border-t-transparent", style.border.replace('border-', 'border-t-'))} style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }}></div>
           <span className={cn("mt-3 text-[10px] font-black uppercase tracking-widest", style.text)}>Loading...</span>
        </div>
      )}
      {/* Top Bar: Search Pill + Plus Icon */}
      <div className="relative z-10 flex items-center justify-between">
        {!hideBadge ? (
          <div className="flex items-center gap-2 rounded-full border border-white bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-sm">
            <Search className={cn('h-3.5 w-3.5', style.icon)} />
            <span className="text-[10px] font-black tracking-wider text-slate-800 uppercase">
              {variant === 'unit'
                ? `${labels.unit} ${id.toString().replace('unit_', '')}`
                : labels.search}
            </span>
          </div>
        ) : (
          <div />
        )}

        {!hidePlus && (
          <div
            className={cn('rounded-full p-2 transition-colors group-hover:bg-white/50', style.text)}
          >
            <Plus className="h-5 w-5 transition-transform duration-500 group-hover:rotate-90" />
          </div>
        )}
      </div>

      {/* Centered Visual (Emoji or Image) */}
      <div className="relative -mt-4 flex flex-1 items-center justify-center">
        <div className="relative flex h-32 w-32 items-center justify-center">
          {/* Floating Decorative Rings */}
          <div className={cn('absolute inset-0 rounded-full opacity-20 blur-2xl', style.bg)} />

          {imageUrl ? (
            <div className="relative h-full w-full overflow-hidden rounded-3xl shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <NextImage
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div className="animate-float relative text-7xl drop-shadow-2xl transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12">
              {impactEmoji || '✨'}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Content: Title & Badges */}
      <div className="relative z-10 space-y-3">
        <h3 className="line-clamp-2 text-xl leading-[1.2] font-black text-slate-900 transition-colors group-hover:text-slate-800">
          {title}
        </h3>

        <div className="flex items-center gap-2">
          {isLocked ? (
            <div className="inline-flex items-center rounded-lg border border-white bg-white/60 px-2.5 py-1 text-[9px] font-black tracking-widest text-amber-600 uppercase shadow-sm">
              <Lock className="mr-1.5 h-3 w-3" /> Premium
            </div>
          ) : isFree ? (
            <div className="inline-flex items-center rounded-lg border border-white bg-white px-2.5 py-1 text-[9px] font-black tracking-widest text-emerald-600 uppercase shadow-sm">
              <Sparkles className="mr-1.5 h-3 w-3" /> Free
            </div>
          ) : subtitle ? (
            <div className="inline-flex items-center text-[9px] font-black tracking-widest text-slate-400 uppercase">
              <div className="mr-2 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              {subtitle}
            </div>
          ) : (
            <div className="inline-flex items-center text-[9px] font-black tracking-widest text-slate-400 uppercase">
              Ready for deep dive
            </div>
          )}
        </div>
      </div>

      {/* Background Glows (Subtle) */}
      <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
    </motion.div>
  );
};
