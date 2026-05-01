import React from 'react';
import { cn } from '@/lib/utils';
import { Question } from '@/types/quiz';

/**
 * DB/JSON often stores newlines as the two characters \\ + n. Real newlines may be \r or \r\n.
 * Many PYQ/matching stems use HTML <br> instead of newlines; normalize those so layout logic runs.
 * Without this, question stems show as one run-on line and list patterns fail to match.
 */
export function normalizeMultilineText(s: string): string {
  if (!s) return s;
  return s
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\\n/g, '\n');
}

/** Options may be stored as a JSON string in DB — same rules as quiz `getParsedOptions`. */
export function parseQuestionOptions(opts: unknown): unknown[] {
  if (opts == null) return [];
  if (Array.isArray(opts)) return opts;
  if (typeof opts === 'string') {
    try {
      const parsed = JSON.parse(opts);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Removes the raw "List-I ... List-II" text from the question description
 * if we already have structured matchPairs to render a beautiful table.
 */
export function cleanMatchingQuestionText(
  questionText: string,
  question: Question
): string {
  const normalized = normalizeMultilineText(questionText);
  if (
    !normalized ||
    question.type !== 'matching' ||
    !question.matchPairs ||
    question.matchPairs.length === 0
  ) {
    return normalized;
  }

  // Broad regex matching List-I, List-II, List-1, List-2, and Hindi variants
  const listRegex = /List-?\s*I{1,2}\b|सूची-?\s*I{1,2}\b|सूची-?\s*[12]/i;
  const listIndex = normalized.search(listRegex);

  if (listIndex !== -1) {
    return normalized.substring(0, listIndex).trim();
  }

  return normalized;
}

interface FormattedQuestionTextProps {
  text: string;
  className?: string;
}

export function FormattedQuestionText({ text, className }: FormattedQuestionTextProps) {
  if (!text) return null;
  const normalized = normalizeMultilineText(text);

  // 1. Check for "Match Column" / "List-I & List-II" pattern (English + Hindi)
  const hasListPattern =
    (normalized.includes('List-I') && normalized.includes('List-II')) ||
    (normalized.includes('सूची-I') && normalized.includes('सूची-II')) ||
    (normalized.includes('सूची-1') && normalized.includes('सूची-2')) ||
    (normalized.includes('सूची- I') && normalized.includes('सूची- II'));
  if (hasListPattern) {
    return <RenderTableQuestion text={normalized} className={className} />;
  }

  // 2. Check for "Assertion (A)" and "Reason (R)" or "Statement I" & "Statement II"
  if (
    (normalized.includes('Assertion (A)') && normalized.includes('Reason (R)')) ||
    (normalized.includes('Statement I:') && normalized.includes('Statement II:'))
  ) {
    return <RenderAssertionReason text={normalized} className={className} />;
  }

  // 3. Check for Numbered Lists (1. ... 2. ... 3. ...)
  // We use a heuristic: if distinct "1. ", "2. " patterns exist in the text closer to the end or middle
  // This is tricky because the main question might be numbered.
  // We'll rely on newline splits mostly.
  return <RenderStandardText text={normalized} className={className} />;
}

// ---------------------------------------------------------------------------
// SUB-RENDERERS
// ---------------------------------------------------------------------------

export interface RenderTableQuestionProps {
  text?: string;
  className?: string;
  matchPairs?: any[];
  language?: string;
  darkMode?: boolean;
}

export function RenderTableQuestion({
  text,
  className,
  matchPairs,
  language = 'hi',
  darkMode = false,
}: RenderTableQuestionProps) {
  // If we have structured matchPairs, use them directly
  if (matchPairs && Array.isArray(matchPairs) && matchPairs.length > 0) {
    const isHindi = language === 'hi';
    const h1 = isHindi ? 'सूची - I' : 'List - I';
    const h2 = isHindi ? 'सूची - II' : 'List - II';

    // 🚀 FIX: Prevent obvious answers by separating and sorting List 2
    // List 1 items stay in their original order (usually 1, 2, 3, 4)
    const list1 = matchPairs.map((p) => ({
      id: p.id,
      label: isHindi ? p.label : p.labelEn || p.label,
    }));

    // List 2 items are extracted and sorted by matchId (A, B, C, D)
    // This ensures that List 2 always appears in a standard order, 
    // rather than aligning perfectly with List 1 if it was stored that way.
    const list2 = matchPairs
      .map((p) => ({
        matchId: p.matchId,
        match: isHindi ? p.match : p.matchEn || p.match,
      }))
      .sort((a, b) => String(a.matchId).localeCompare(String(b.matchId)));

    // Dark mode styles
    const borderColor = darkMode ? 'border-slate-600' : 'border-slate-800';
    const headerBg = darkMode ? 'bg-slate-800' : 'bg-slate-50';
    const headerText = darkMode ? 'text-slate-200' : 'text-slate-900';
    const rowBg = darkMode ? 'bg-slate-900' : 'bg-white';
    const cellBg = darkMode ? 'bg-slate-800' : 'bg-slate-50';
    const cellText = darkMode ? 'text-slate-200' : 'text-slate-900';
    const cellBorder = darkMode ? 'border-slate-700' : 'border-slate-300';

    return (
      <div
        className={cn(
          'w-full overflow-hidden rounded-lg border-2 text-sm sm:text-base',
          borderColor,
          className
        )}
      >
        <div className={cn('grid w-full grid-cols-2 border-b-2', borderColor, headerBg)}>
          <div className={cn('border-r-2 px-2 py-2.5 text-center text-xs font-bold sm:px-4 sm:py-3 sm:text-sm', borderColor, headerText)}>
            {h1}
          </div>
          <div className={cn('px-2 py-2.5 text-center text-xs font-bold sm:px-4 sm:py-3 sm:text-sm', headerText)}>
            {h2}
          </div>
        </div>
        {list1.map((item1, i) => {
          const item2 = list2[i] || { matchId: '', match: '' };
          return (
            <div
              key={i}
              className={cn(
                'grid w-full grid-cols-2',
                rowBg,
                i !== list1.length - 1 && cn('border-b', borderColor)
              )}
            >
              <div className={cn('flex items-center border-r-2', borderColor)}>
                <div className={cn('min-w-[2rem] border-r px-2 py-2 text-center text-xs font-bold sm:min-w-[3rem] sm:px-3 sm:py-3 sm:text-sm', cellBorder, cellBg, cellText)}>
                  {item1.id}
                </div>
                <div className={cn('flex-1 px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm', cellText)}>
                  {item1.label}
                </div>
              </div>
              <div className="flex items-center">
                <div className={cn('min-w-[2rem] border-r px-2 py-2 text-center text-xs font-bold sm:min-w-[3rem] sm:px-3 sm:py-3 sm:text-sm', cellBorder, cellBg, cellText)}>
                  {item2.matchId}
                </div>
                <div className={cn('flex-1 px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm', cellText)}>
                  {item2.match}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback to text parsing if no matchPairs or text is provided
  if (!text) return null;
  const t = normalizeMultilineText(text);
  const lines = t
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const parseItem = (item: string) => {
    const match = item.match(/^([A-Za-z0-9]+\.?\)?\s*)/);
    if (match) {
      const identifier = match[1].trim();
      const content = item.substring(match[0].length).trim();
      return { identifier, content };
    }
    return { identifier: '', content: item };
  };

  // Detect list headers with subtitles: "List-I (Philosophy)" or "सूची-I (दर्शन)"
  const listHeaderRegex = /(?:List-?\s*I+|सूची-?\s*I+|सूची-?\s*[12])\s*(\([^)]*\))?/gi;

  const extractHeaders = () => {
    let h1 = 'List - I';
    let h2 = 'List - II';
    const isHindi = text.includes('सूची');

    for (const line of lines) {
      // Combined header line: "List-I (Philosophy)    List-II (Founder)"
      const combinedMatch = line.match(
        isHindi
          ? /(सूची-?\s*(?:I|1))\s*(\([^)]*\))?\s+(सूची-?\s*(?:II|2))\s*(\([^)]*\))?/i
          : /(List-?\s*I)\s*(\([^)]*\))?\s+(List-?\s*II)\s*(\([^)]*\))?/i
      );
      if (combinedMatch) {
        h1 = combinedMatch[1] + (combinedMatch[2] ? ' ' + combinedMatch[2] : '');
        h2 = combinedMatch[3] + (combinedMatch[4] ? ' ' + combinedMatch[4] : '');
        return { h1, h2, isHindi };
      }

      // Separate header lines
      const singleMatch1 = line.match(
        isHindi ? /^(सूची-?\s*(?:I|1))\s*(\([^)]*\))?\s*$/i : /^(List-?\s*I)\s*(\([^)]*\))?\s*$/i
      );
      if (singleMatch1) {
        h1 = singleMatch1[1] + (singleMatch1[2] ? ' ' + singleMatch1[2] : '');
      }
      const singleMatch2 = line.match(
        isHindi ? /^(सूची-?\s*(?:II|2))\s*(\([^)]*\))?\s*$/i : /^(List-?\s*II)\s*(\([^)]*\))?\s*$/i
      );
      if (singleMatch2) {
        h2 = singleMatch2[1] + (singleMatch2[2] ? ' ' + singleMatch2[2] : '');
      }
    }

    if (isHindi) {
      h1 = h1 === 'List - I' ? 'सूची - I' : h1;
      h2 = h2 === 'List - II' ? 'सूची - II' : h2;
    }
    return { h1, h2, isHindi };
  };

  const { h1, h2, isHindi } = extractHeaders();

  // Check if both List-I and List-II appear on the same header line
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    const hasL1 =
      line.includes('list-i') ||
      line.includes('सूची-i') ||
      line.includes('सूची-1') ||
      line.includes('सूची- i');
    const hasL2 =
      line.includes('list-ii') ||
      line.includes('सूची-ii') ||
      line.includes('सूची-2') ||
      line.includes('सूची- ii');
    if (hasL1 && hasL2) {
      headerIndex = i;
      break;
    }
  }

  const renderTable = (intro: string[], list1Items: string[], list2Items: string[]) => {
    const maxLength = Math.max(list1Items.length, list2Items.length);
    return (
      <div className={cn('space-y-3', className)}>
        {intro.length > 0 && (
          <div className="text-base leading-relaxed font-medium text-slate-900 sm:text-lg">
            {intro.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        )}
        <div className="w-full overflow-hidden rounded-lg border-2 border-slate-800 text-sm sm:text-base">
          <div className="grid w-full grid-cols-2 border-b-2 border-slate-800 bg-slate-50">
            <div className="border-r-2 border-slate-800 px-2 py-2.5 text-center text-xs font-bold text-slate-900 sm:px-4 sm:py-3 sm:text-sm">
              {h1}
            </div>
            <div className="px-2 py-2.5 text-center text-xs font-bold text-slate-900 sm:px-4 sm:py-3 sm:text-sm">
              {h2}
            </div>
          </div>
          {Array.from({ length: maxLength }).map((_, i) => {
            const list1 = parseItem(list1Items[i] || '');
            const list2 = parseItem(list2Items[i] || '');
            return (
              <div
                key={i}
                className={cn(
                  'grid w-full grid-cols-2 bg-white',
                  i !== maxLength - 1 && 'border-b border-slate-800'
                )}
              >
                <div className="flex items-center border-r-2 border-slate-800">
                  <div className="min-w-[2rem] border-r border-slate-300 bg-slate-50 px-2 py-2 text-center text-xs font-bold text-slate-900 sm:min-w-[3rem] sm:px-3 sm:py-3 sm:text-sm">
                    {list1.identifier}
                  </div>
                  <div className="flex-1 px-2 py-2 text-xs text-slate-900 sm:px-3 sm:py-3 sm:text-sm">
                    {list1.content}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="min-w-[2rem] border-r border-slate-300 bg-slate-50 px-2 py-2 text-center text-xs font-bold text-slate-900 sm:min-w-[3rem] sm:px-3 sm:py-3 sm:text-sm">
                    {list2.identifier}
                  </div>
                  <div className="flex-1 px-2 py-2 text-xs text-slate-900 sm:px-3 sm:py-3 sm:text-sm">
                    {list2.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // If we found a combined header (List-I ... List-II on same line)
  if (headerIndex !== -1) {
    const intro = lines.slice(0, headerIndex);
    const dataLines = lines.slice(headerIndex + 1);

    const list1Items: string[] = [];
    const list2Items: string[] = [];

    for (const line of dataLines) {
      const match = line.match(/^(\d+\.?\)?\s+[^A-Z]*?)([A-Z]+\.?\)?\s+.*)$/);
      if (match) {
        list1Items.push(match[1].trim());
        list2Items.push(match[2].trim());
      } else {
        const splitMatch = line.match(/^(.*?)\s+([A-Z]\.?\)?\s+.*)$/);
        if (splitMatch) {
          list1Items.push(splitMatch[1].trim());
          list2Items.push(splitMatch[2].trim());
        } else {
          list1Items.push(line);
          list2Items.push('');
        }
      }
    }
    return renderTable(intro, list1Items, list2Items);
  }

  // Try the old format: separate List-I and List-II sections
  let list1Index = -1;
  let list2Index = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    const isL1 =
      (line.includes('list-i') ||
        line.includes('सूची-i') ||
        line.includes('सूची-1') ||
        line.includes('सूची- i')) &&
      !line.includes('list-ii') &&
      !line.includes('सूची-ii') &&
      !line.includes('सूची-2') &&
      !line.includes('सूची- ii') &&
      line.length < 80;
    const isL2 =
      (line.includes('list-ii') ||
        line.includes('सूची-ii') ||
        line.includes('सूची-2') ||
        line.includes('सूची- ii')) &&
      line.length < 80;
    if (isL1) list1Index = i;
    else if (isL2) list2Index = i;
  }

  // Fallback: first occurrence
  if (list1Index === -1)
    list1Index = lines.findIndex(
      (l) => l.includes('List-I') || l.includes('सूची-I') || l.includes('सूची-1')
    );
  if (list2Index === -1)
    list2Index = lines.findIndex(
      (l) => l.includes('List-II') || l.includes('सूची-II') || l.includes('सूची-2')
    );

  if (list1Index !== -1 && list2Index !== -1 && list1Index < list2Index) {
    const intro = lines.slice(0, list1Index);
    const list1Items = lines.slice(list1Index + 1, list2Index);
    const list2Items = lines.slice(list2Index + 1);
    return renderTable(intro, list1Items, list2Items);
  }

  // Fallback if parsing fails
  return <RenderStandardText text={text} className={className} />;
}

function RenderAssertionReason({ text, className }: FormattedQuestionTextProps) {
  // Split into Intro, Statement 1, Statement 2
  const isAssertion = text.includes('Assertion (A)');

  const marker1 = isAssertion ? 'Assertion (A)' : 'Statement I';
  const marker2 = isAssertion ? 'Reason (R)' : 'Statement II';

  // Regex to split
  // careful with special regex chars in markers
  const parts = text.split(
    isAssertion ? /(Assertion \(A\)|Reason \(R\))/ : /(Statement I:|Statement II:)/
  );

  // parts[0] = intro (e.g. "Read the following...")
  // parts[1] = Marker 1
  // parts[2] = Content 1
  // parts[3] = Marker 2
  // parts[4] = Content 2

  // Simple check if split worked
  if (parts.length < 5) return <RenderStandardText text={text} className={className} />;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Intro */}
      {parts[0].trim() && (
        <div className="mb-4 text-lg leading-relaxed font-medium text-slate-900">
          {parts[0].trim()}
        </div>
      )}

      <div className="space-y-3">
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
          <span className="mb-1 block font-bold text-amber-800">
            {isAssertion ? 'Assertion (A)' : 'Statement I'}
          </span>
          <div className="leading-relaxed font-medium text-slate-800">
            {parts[2]?.replace(/^:/, '').trim()}
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <span className="mb-1 block font-bold text-blue-800">
            {isAssertion ? 'Reason (R)' : 'Statement II'}
          </span>
          <div className="leading-relaxed font-medium text-slate-800">
            {parts[4]?.replace(/^:/, '').trim()}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Split a stem that has (a) (b) (c) on one line (no newlines) or after \\n fix.
 */
function expandStatementLines(text: string): string[] {
  const normalized = normalizeMultilineText(text);
  const out: string[] = [];
  for (const segment of normalized.split('\n').map((l) => l.trim()).filter(Boolean)) {
    const markerCount = (segment.match(/\([a-zA-Z]\)/g) || []).length;
    if (markerCount >= 2) {
      const pieces = segment
        .split(/(?=\([a-zA-Z]\)\s)/g)
        .map((p) => p.trim())
        .filter(Boolean);
      if (pieces.length > 1) {
        out.push(...pieces);
        continue;
      }
    }
    out.push(segment);
  }
  return out;
}

function RenderStandardText({ text, className }: FormattedQuestionTextProps) {
  const lines = expandStatementLines(text);

  return (
    <div className={cn('space-y-1 text-lg leading-relaxed font-medium text-slate-900', className)}>
      {lines.map((line, i) => {
        const numbered = line.match(/^(\d+)\.\s*([\s\S]*)$/);
        if (numbered) {
          return (
            <div key={i} className="flex items-start gap-2 py-1 pl-1 sm:pl-4">
              <span className="mt-0.5 shrink-0 rounded bg-slate-100 px-1.5 text-sm font-bold text-slate-500">
                {numbered[1]}.
              </span>
              <span className="min-w-0 flex-1">{numbered[2]}</span>
            </div>
          );
        }
        const letterParen = line.match(/^\(([a-zA-Z])\)\s*([\s\S]*)$/);
        if (letterParen) {
          return (
            <div key={i} className="flex items-start gap-2 py-1 pl-1 sm:pl-4">
              <span className="mt-0.5 shrink-0 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-sm font-bold text-slate-600">
                ({letterParen[1]})
              </span>
              <span className="min-w-0 flex-1 leading-relaxed">{letterParen[2]}</span>
            </div>
          );
        }
        return (
          <div key={i} className="min-w-0 py-0.5">
            {line}
          </div>
        );
      })}
    </div>
  );
}
