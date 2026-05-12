'use server';

import { db } from '@/db';
import { mainsPapers, mainsUnits, mainsTopics, mainsContent } from '@/db/schema';
import { eq, and, sql, count, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';
import { assertAdmin } from '@/lib/auth';

/**
 * 🏛️ MAINS MANAGEMENT ACTIONS
 * 
 * Bhai, ye saare actions admin dashboard ko power denge.
 * CRUD operations for Papers, Units, Topics and Deep Content.
 */

function blobFromError(error: unknown): string {
  const base = error instanceof Error ? error.message : String(error);
  const cause =
    error &&
    typeof error === 'object' &&
    'cause' in error &&
    (error as { cause?: unknown }).cause != null
      ? String((error as { cause?: unknown }).cause)
      : '';
  return `${base} ${cause}`;
}

// 1. Get Progress Overview for Admin (optimized: 2 queries instead of 9)
export async function getMainsProgressOverview() {
  try {
    const papers = await db.select().from(mainsPapers).orderBy(mainsPapers.displayOrder);
    
    // Single aggregated query: units + topics stats per paper
    const statsPerPaper = await db
      .select({
        paperId: mainsUnits.paperId,
        unitsCount: count(mainsUnits.id),
        totalTopics: count(mainsTopics.id),
        publishedTopics: sql<number>`count(CASE WHEN ${mainsTopics.status} = 'published' THEN 1 END)`,
      })
      .from(mainsUnits)
      .leftJoin(mainsTopics, eq(mainsTopics.unitId, mainsUnits.id))
      .groupBy(mainsUnits.paperId);

    // Build lookup map for O(1) access
    const statsMap = new Map(statsPerPaper.map(s => [s.paperId, s]));

    const overview = papers.map((paper) => {
      const stats = statsMap.get(paper.id) ?? { 
        unitsCount: 0, 
        totalTopics: 0, 
        publishedTopics: 0 
      };
      
      const totalTopics = Number(stats.totalTopics ?? 0);
      return {
        ...paper,
        unitsCount: Number(stats.unitsCount ?? 0),
        totalTopics,
        publishedTopics: Number(stats.publishedTopics ?? 0),
        progress: totalTopics > 0 
          ? Math.round((Number(stats.publishedTopics ?? 0) / totalTopics) * 100) 
          : 0
      };
    });

    return { success: true, data: overview };
  } catch (error) {
    console.error('Mains Overview Error:', error);
    const blob = blobFromError(error);
    if (/no such table:?\s*mains_/i.test(blob)) {
      return {
        success: false as const,
        error: 'mains_tables_missing' as const,
        hint:
          'Mains tables missing on this DB. Run: `npm run db:migrate` (local) or `USE_PROD_DB=true npm run db:migrate` (Turso URL in .env). One-shot: `npm run db:setup:mains:remote`.',
      };
    }
    return { success: false as const, error: 'Failed to fetch overview', detail: blob.slice(0, 220) };
  }
}

// 2. Add/Update Paper
export async function upsertMainsPaper(data: any) {
  try {
    const id = data.id || uuidv4();
    if (data.id) {
      await db.update(mainsPapers).set(data).where(eq(mainsPapers.id, id));
    } else {
      await db.insert(mainsPapers).values({ id, ...data });
    }
    revalidatePath('/admin/mains');
    return { success: true, id };
  } catch (error) {
    return { success: false, error: 'Failed to save paper' };
  }
}

// 3. Add/Update Unit
export async function upsertMainsUnit(data: any) {
  try {
    const id = data.id || uuidv4();
    if (data.id) {
      await db.update(mainsUnits).set(data).where(eq(mainsUnits.id, id));
    } else {
      await db.insert(mainsUnits).values({ id, ...data });
    }
    revalidatePath('/admin/mains');
    return { success: true, id };
  } catch (error) {
    return { success: false, error: 'Failed to save unit' };
  }
}

// 4. Upsert Deep Content (The AI-generated Expert Content)
export async function upsertMainsContent(topicId: string, content: any) {
  try {
    await assertAdmin();
    const existing = await db
      .select()
      .from(mainsContent)
      .where(eq(mainsContent.topicId, topicId))
      .limit(1);

    if (existing[0]) {
      await db
        .update(mainsContent)
        .set({ ...content, updatedAt: new Date() })
        .where(eq(mainsContent.topicId, topicId));
    } else {
      await db.insert(mainsContent).values({
        id: uuidv4(),
        topicId,
        ...content
      });
    }

    // Mark topic as published when content is added
    await db
      .update(mainsTopics)
      .set({ status: 'published' })
      .where(eq(mainsTopics.id, topicId));

    revalidatePath('/admin/mains');
    revalidatePath(`/mains/syllabus`);
    return { success: true };
  } catch (error) {
    console.error('Upsert Content Error:', error);
    return { success: false, error: 'Failed to save content' };
  }
}

/** Admin clears expert row; topic goes back to draft until re-saved. */
export async function adminDeleteMainsContentForTopic(topicId: string) {
  try {
    await assertAdmin();
    await db.delete(mainsContent).where(eq(mainsContent.topicId, topicId));
    await db.update(mainsTopics).set({ status: 'draft' }).where(eq(mainsTopics.id, topicId));
    revalidatePath('/admin/mains');
    revalidatePath('/mains/syllabus');
    return { success: true as const };
  } catch (error) {
    console.error('adminDeleteMainsContentForTopic', error);
    return { success: false as const, error: blobFromError(error).slice(0, 240) };
  }
}

// 5. Get Detailed Syllabus Tree for a Paper (Admin & Student)
export async function getMainsSyllabusTree(paperId: string) {
  try {
    const units = await db
      .query.mainsUnits.findMany({
        where: eq(mainsUnits.paperId, paperId),
        orderBy: [asc(mainsUnits.part), asc(mainsUnits.displayOrder), asc(mainsUnits.id)],
        with: {
          topics: {
            columns: {
              id: true,
              unitId: true,
              titleHi: true,
              titleEn: true,
              displayOrder: true,
              status: true,
              createdAt: true,
              examType: true,
            },
            orderBy: [mainsTopics.displayOrder],
            with: {
              content: {
                columns: {
                  id: true,
                  updatedAt: true,
                },
              },
            },
          },
        },
      });
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`[getMainsSyllabusTree] paperId=${paperId} units=${units.length}`);
    }
    return { success: true, data: units };
  } catch (error: unknown) {
    const blob = `${error instanceof Error ? error.message : ''} ${typeof error === 'object' && error && 'cause' in error ? String((error as { cause?: unknown }).cause) : ''}`;
    // eslint-disable-next-line no-console
    console.error('[getMainsSyllabusTree] failed', { paperId, blob });
    if (/no such table:?\s*mains_/i.test(blob)) {
      return {
        success: false,
        error: 'mains_tables_missing' as const,
        hint:
          'Run `npm run db:migrate` (local) or `USE_PROD_DB=true npm run db:migrate` (Turso). Full setup: `npm run db:setup:mains:remote`.',
        data: [],
      };
    }
    if (/no such column/i.test(blob)) {
      return {
        success: false as const,
        error: 'schema_outdated' as const,
        hint:
          'Database missing a newer column (e.g. `mains_content.rich_payload` or mains PYQ fields). Run: `npm run db:migrate` or `npm run db:setup:mains:remote`.',
        detail: blob.slice(0, 500),
      };
    }
    return { success: false as const, error: 'Failed to fetch syllabus tree', detail: blob.slice(0, 500) };
  }
}

/** Topic + unit + paper + optional expert content (for `/mains/syllabus/[paperId]/[topicId]`). */
export async function getMainsTopicForPage(topicId: string, paperId: string) {
  try {
    const row = await db.query.mainsTopics.findFirst({
      where: eq(mainsTopics.id, topicId),
      with: {
        unit: { with: { paper: true } },
        content: true,
      },
    });
    if (!row?.unit?.paper || row.unit.paper.id !== paperId) {
      return { success: false as const, error: 'not_found' };
    }
    return { success: true as const, data: row };
  } catch (error) {
    console.error('getMainsTopicForPage:', error);
    return { success: false as const, error: 'fetch_failed' };
  }
}
