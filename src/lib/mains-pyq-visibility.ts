import { sql } from 'drizzle-orm';
import { mainsPyqPapers } from '@/db/schema';

/**
 * Student PYQ desk / prompt pools: coalesce hides NULL/old rows without `is_hidden` as visible.
 * Safer than `OR is null` across LibSQL/sqlite adapters.
 */
export function whereMainsPyqPaperListed() {
  return sql`(coalesce(${mainsPyqPapers.isHidden}, 0) = 0)`;
}

/** Prefer `whereMainsPyqPaperListed()`; fallback when SQL helper misbehaves. */
export function isMainsPyqPaperListedRow(paper: { isHidden?: boolean | null }): boolean {
  return !(paper.isHidden ?? false);
}
