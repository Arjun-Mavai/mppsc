'use client';

import type { ReactNode } from 'react';

// parseBold moved inside the component to support custom classes.

function flashBulletize(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => {
      const t = line.trim();
      if (!t) return '';
      if (/^#{1,3}\s/.test(t) || /^-\s+/.test(t)) return t;
      return `- ${t}`;
    })
    .filter(Boolean)
    .join('\n');
}

import { cn } from '@/lib/utils';

export function MainsMarkdownBody({
  markdown,
  isHindi,
  /** Key-term / flash strips: treat every non-heading line as a bullet. */
  flashLineBullets = false,
  strongClassName,
  itemClassName,
  bulletClassName,
  bodyTextClassName,
}: {
  markdown: string;
  /** Slightly tuned line-height for Devanagari. */
  isHindi: boolean;
  flashLineBullets?: boolean;
  strongClassName?: string;
  itemClassName?: string;
  bulletClassName?: string;
  bodyTextClassName?: string;
}) {
  function parseBold(text: string) {
    const parts = text.split(/(\*\*.+?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={i} className={cn("font-extrabold", strongClassName || "text-emerald-800 dark:text-emerald-200")}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  const blocks: ReactNode[] = [];
  const sourceMd = flashLineBullets ? flashBulletize(markdown) : markdown;
  const lines = sourceMd.replace(/\r\n/g, '\n').split('\n');

  let i = 0;
  let ulKey = 0;

  const bodyFont = isHindi ? 'font-[family-name:var(--font-pyq-dev)] tracking-wide [word-spacing:0.06em]' : 'font-[family-name:var(--font-pyq-serif)] tracking-tight';

  const bodyText = `${bodyFont} text-[16px] sm:text-[18px] leading-[1.82] sm:leading-[1.9] ${bodyTextClassName || "text-slate-800 dark:text-slate-100"}`;

  const h3Class =
    'mt-9 first:mt-0 text-xl sm:text-2xl font-black tracking-tight text-emerald-900 dark:text-emerald-200 border-b-2 border-emerald-300/70 dark:border-emerald-600/60 pb-2.5 shadow-sm shadow-emerald-900/5';

  const h4Sub =
    'mt-7 text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-600 pb-2';

  while (i < lines.length) {
    const line = lines[i].trimEnd();

    if (line.trim() === '') {
      i += 1;
      continue;
    }

    if (line.startsWith('## ')) {
      blocks.push(
        <h3 key={`h-${i}`} className={h3Class}>
          {parseBold(line.slice(3).trim())}
        </h3>
      );
      i += 1;
      continue;
    }

    if (line.startsWith('### ')) {
      blocks.push(
        <h4 key={`hh-${i}`} className={h4Sub}>
          {parseBold(line.slice(4).trim())}
        </h4>
      );
      i += 1;
      continue;
    }

    if (/^-\s+/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^-\s+/.test(lines[i].trim())) {
        const cleaned = lines[i].trim().replace(/^-\s+/, '').trim();
        if (cleaned) {
          items.push(cleaned);
        }
        i += 1;
      }
      if (items.length > 0) {
        ulKey += 1;
        blocks.push(
          <ul key={`ul-${ulKey}`} className="my-6 space-y-3 sm:space-y-3.5">
            {items.map((item, idx) => (
              <li
                key={idx}
                className={cn(
                  "flex gap-3.5 rounded-2xl border px-4 py-3.5 shadow-sm",
                  itemClassName || "border-slate-200/90 bg-white/90 dark:border-slate-700/80 dark:bg-slate-900/70"
                )}
              >
                <span className={cn(
                  "mt-2.5 inline-block size-2.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] ring-4 ring-emerald-500/15",
                  bulletClassName
                )} />
                <span className={bodyText}>{parseBold(item)}</span>
              </li>
            ))}
          </ul>
        );
      }
      continue;
    }

    if (line.trim().startsWith('|') || line.trim().startsWith('- |')) {
      const tableLines: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('|') || lines[i].trim().startsWith('- |'))) {
        let tLine = lines[i].trim();
        if (tLine.startsWith('- |')) tLine = tLine.slice(2).trim();
        tableLines.push(tLine);
        i += 1;
      }
      ulKey += 1;
      
      const rows = tableLines.filter(r => !/^\|[\s-:]+\|/.test(r));
      if (rows.length > 0) {
        blocks.push(
          <div key={`table-${ulKey}`} className="my-6 w-full overflow-x-auto rounded-xl border border-slate-200/90 shadow-sm dark:border-slate-700/80">
            <table className="w-full text-left text-[15px] sm:text-[16px]">
              <thead className="bg-slate-50 text-slate-900 dark:bg-slate-900/50 dark:text-slate-100">
                <tr>
                  {rows[0].split('|').filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1).map((cell, idx) => (
                    <th key={idx} className="px-4 py-3 font-bold border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                      {parseBold(cell.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, rIdx) => (
                  <tr key={rIdx} className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    {row.split('|').filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1).map((cell, idx) => (
                      <td key={idx} className="px-4 py-3 text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800 last:border-r-0 align-top">
                        {parseBold(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    if (line.trim().startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().slice(1).trim());
        i += 1;
      }
      blocks.push(
        <blockquote key={`quote-${i}`} className="my-6 border-l-[4px] border-amber-500 bg-amber-50/50 py-4 pl-5 pr-4 dark:border-amber-600/80 dark:bg-amber-950/20 rounded-r-xl shadow-sm">
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx} className={cn("mb-2 last:mb-0 italic", bodyText, "text-amber-950 dark:text-amber-100")}>
              {parseBold(ql)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    blocks.push(
      <p key={`p-${i}`} className={`my-4 max-w-[52rem] rounded-lg ${bodyText}`}>
        {parseBold(line.trim())}
      </p>
    );
    i += 1;
  }

  return <div className="max-w-none sm:max-w-3xl">{blocks}</div>;
}
