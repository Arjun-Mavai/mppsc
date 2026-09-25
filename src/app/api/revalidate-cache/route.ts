import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag as originalRevalidateTag } from 'next/cache';
const revalidateTag = originalRevalidateTag as unknown as (tag: string, profile?: string) => void;
import { assertAdmin } from '@/lib/auth';
import { CACHE } from '@/lib/cache';
import { logger } from '@/lib/logger';

import { invalidateServerIntelligenceCache } from '@/lib/server-intelligence-cache';

/**
 * On-Demand Revalidation API
 * Allows admin to trigger cache invalidation after uploading new data
 * Accessible from admin actions or webhook handlers
 */

export async function POST(req: NextRequest) {
  try {
    // Verify admin access
    await assertAdmin();

    const { type, paperNumber, topicId, unitId, questionId } = await req.json();

    logger.info('Cache revalidation triggered', {
      category: 'api',
      type,
      paperNumber,
      topicId,
      unitId,
      questionId,
    });

    // Revalidate based on type
    switch (type) {
      case 'pyq_all':
        // Invalidate entire PYQ library
        invalidateServerIntelligenceCache();
        revalidateTag(CACHE.PYQ.TAGS.ALL, 'max');
        revalidateTag(CACHE.PYQ.TAGS.ANALYSIS, 'max');
        revalidateTag(CACHE.PYQ.TAGS.TRENDS, 'max');
        revalidateTag(CACHE.PYQ.TAGS.INTELLIGENCE, 'max');
        return NextResponse.json({ success: true, message: 'PYQ library cache cleared' });

      case 'pyq_paper':
        // Invalidate specific paper + related analysis
        if (paperNumber === undefined) {
          return NextResponse.json({ error: 'paperNumber required for pyq_paper' }, { status: 400 });
        }
        revalidateTag(CACHE.PYQ.TAGS.PAPER(paperNumber), 'max');
        revalidateTag(CACHE.PYQ.TAGS.ANALYSIS, 'max');
        revalidateTag(CACHE.PYQ.TAGS.TRENDS, 'max');
        return NextResponse.json({ success: true, message: `PYQ paper ${paperNumber} cache cleared` });

      case 'pyq_question':
        // Invalidate specific question
        if (!questionId) {
          return NextResponse.json({ error: 'questionId required for pyq_question' }, { status: 400 });
        }
        revalidateTag(CACHE.PYQ.TAGS.QUESTION(questionId), 'max');
        if (paperNumber !== undefined) {
          revalidateTag(CACHE.PYQ.TAGS.PAPER(paperNumber), 'max');
        }
        return NextResponse.json({ success: true, message: `PYQ question ${questionId} cache cleared` });

      case 'mains_all':
        // Invalidate entire mains library
        revalidateTag(CACHE.MAINS.TAGS.ALL, 'max');
        revalidateTag(CACHE.MAINS.TAGS.CONCEPTS, 'max');
        return NextResponse.json({ success: true, message: 'Mains content cache cleared' });

      case 'mains_topic':
        // Invalidate specific topic
        if (!topicId) {
          return NextResponse.json({ error: 'topicId required for mains_topic' }, { status: 400 });
        }
        revalidateTag(CACHE.MAINS.TAGS.TOPIC(topicId), 'max');
        if (unitId) {
          revalidateTag(CACHE.MAINS.TAGS.UNIT(unitId), 'max');
        }
        if (paperNumber !== undefined) {
          revalidateTag(CACHE.MAINS.TAGS.PAPER(paperNumber), 'max');
        }
        return NextResponse.json({ success: true, message: `Mains topic ${topicId} cache cleared` });

      case 'mains_unit':
        // Invalidate unit
        if (!unitId) {
          return NextResponse.json({ error: 'unitId required for mains_unit' }, { status: 400 });
        }
        revalidateTag(CACHE.MAINS.TAGS.UNIT(unitId), 'max');
        if (paperNumber !== undefined) {
          revalidateTag(CACHE.MAINS.TAGS.PAPER(paperNumber), 'max');
        }
        return NextResponse.json({ success: true, message: `Mains unit ${unitId} cache cleared` });

      case 'mains_paper':
        // Invalidate paper
        if (paperNumber === undefined) {
          return NextResponse.json({ error: 'paperNumber required for mains_paper' }, { status: 400 });
        }
        revalidateTag(CACHE.MAINS.TAGS.PAPER(paperNumber), 'max');
        return NextResponse.json({ success: true, message: `Mains paper ${paperNumber} cache cleared` });

      default:
        return NextResponse.json({ error: `Unknown revalidation type: ${type}` }, { status: 400 });
    }
  } catch (error) {
    logger.error('Cache revalidation failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Revalidation failed' },
      { status: 500 }
    );
  }
}
