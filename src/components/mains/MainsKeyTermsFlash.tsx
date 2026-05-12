'use client';

import { cn } from '@/lib/utils';
import { mergeFlashItemsFromSources, type KeyTermFlashItem } from '@/lib/mains-key-terms-flash';

export function MainsKeyTermsFlash({
  structured,
  fallbackText,
  isHindi,
  className,
}: {
  structured?: unknown;
  fallbackText?: string | null;
  isHindi: boolean;
  className?: string;
}) {
  const items: KeyTermFlashItem[] = mergeFlashItemsFromSources(structured, fallbackText ?? '');

  if (items.length === 0) {
    return (
      <p className={cn('text-sm text-violet-800/85 dark:text-violet-200/85', className)}>
        {isHindi ? '(अभी कोई की-टर्म नहीं)' : '(No key terms yet)'}
      </p>
    );
  }

  const font = isHindi ? 'font-[family-name:var(--font-pyq-dev)]' : 'font-[family-name:var(--font-pyq-serif)]';

  return (
    <ul
      className={cn(
        'grid list-none gap-3 p-0 sm:grid-cols-2',
        font,
        className
      )}
    >
      {items.map((it, idx) => (
        <li
          key={`${idx}-${it.term}-${it.hint.slice(0, 12)}`}
          className={cn(
            'rounded-2xl border-2 px-4 py-3.5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5',
            [
              'border-pink-200/90 bg-gradient-to-br from-white via-pink-50/60 to-white dark:border-pink-800/60 dark:from-pink-950/50 dark:via-slate-900',
              'border-emerald-200/90 bg-gradient-to-br from-white via-emerald-50/60 to-white dark:border-emerald-800/60 dark:from-emerald-950/50 dark:via-slate-900',
              'border-amber-200/90 bg-gradient-to-br from-white via-amber-50/60 to-white dark:border-amber-800/60 dark:from-amber-950/50 dark:via-slate-900',
              'border-sky-200/90 bg-gradient-to-br from-white via-sky-50/60 to-white dark:border-sky-800/60 dark:from-sky-950/50 dark:via-slate-900',
            ][idx % 4]
          )}
        >
          <div className="flex flex-wrap items-start gap-2">
            {it.emoji ? (
              <span className="select-none text-xl leading-none" aria-hidden>
                {it.emoji}
              </span>
            ) : null}
            {it.term ? (
              <p className="text-[15px] font-black leading-snug text-slate-900 dark:text-slate-100 sm:text-[16px]">
                {it.term}
              </p>
            ) : null}
          </div>
          <div
            className={cn(
              'text-[15px] leading-relaxed text-slate-800 dark:text-slate-200 sm:text-[16px] whitespace-pre-line',
              it.term ? 'mt-2 border-t border-slate-200/50 pt-2 dark:border-slate-800/50' : 'font-semibold'
            )}
          >
            {it.hint.replace(/\s*\|\s*/g, '\n• ').replace(/\.\s+(?=[A-Z\u0900-\u097F])/g, '.\n• ')}
          </div>
        </li>
      ))}
    </ul>
  );
}
