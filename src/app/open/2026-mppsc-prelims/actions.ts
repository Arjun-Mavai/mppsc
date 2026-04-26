'use server';

import { db } from '@/db';
import { questions, tests } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { CANONICAL_TEST_IDS } from '@/lib/pyq-constants';
import { logger } from '@/lib/logger';

const PUBLIC_PYQ_2026_ID = CANONICAL_TEST_IDS[2026] as string;

const fetchOpenPyq2026 = async () => {
  const test = await db
    .select()
    .from(tests)
    .where(
      and(
        eq(tests.id, PUBLIC_PYQ_2026_ID),
        eq(tests.type, 'PYQ'),
        eq(tests.isHidden, false)
      )
    )
    .get();

  if (!test) return null;

  const qs = await db
    .select()
    .from(questions)
    .where(eq(questions.testId, PUBLIC_PYQ_2026_ID))
    .orderBy(questions.order);

  if (!qs.length) return null;

  return { test, questions: qs };
};

export const getCachedOpenPyq2026 = unstable_cache(
  fetchOpenPyq2026,
  ['open-pyq-2026-paper-v1', PUBLIC_PYQ_2026_ID],
  { revalidate: 300, tags: ['tests'] }
);

export async function getOpenPyq2026WithQuestions() {
  try {
    return await getCachedOpenPyq2026();
  } catch (e) {
    logger.error('getOpenPyq2026WithQuestions', e, { category: 'content' });
    return null;
  }
}
