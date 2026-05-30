import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { syllabusTopics } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

// Admin Secret for protection (reuse the one we added)
const ADMIN_SECRET_HEADER = 'x-admin-secret';

type EnrichedTopic = {
  id: string;
  content_hindi: unknown;
  content_english: unknown;
};

type ExportTopic = {
  id: string;
  unit_title: string;
  topic_title: string;
  topic_title_en: string;
  hasAiContent: boolean;
};

type ExportUnit = {
  title: string;
  topics: ExportTopic[];
  topics_en: ExportTopic[];
};

export async function GET(request: NextRequest) {
  try {
    const adminSecret = request.headers.get(ADMIN_SECRET_HEADER);
    if (!adminSecret) {
      return NextResponse.json({ error: 'Missing Admin Secret' }, { status: 401 });
    }

    const adminUser = await db.query.mppscUsers.findFirst({
      where: (users, { and, eq }) =>
        and(eq(users.role, 'admin'), eq(users.adminSecret, adminSecret)),
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Invalid Admin Secret' }, { status: 403 });
    }

    const allTopics = await db.query.syllabusTopics.findMany({
      orderBy: (topics, { asc }) => [asc(topics.unitId), asc(topics.order)],
    });

    // Group by Unit
    const grouped: Record<string, ExportUnit> = {};

    // Helper to format unit ID (unit_1 -> Unit 1) if needed,
    // but we keep keys as unit_1 for consistency

    allTopics.forEach((topic) => {
      if (!grouped[topic.unitId]) {
        grouped[topic.unitId] = {
          title: topic.unitId.replace('_', ' ').toUpperCase(),
          topics: [],
          topics_en: []
        };
      }

      // Construct the export object directly here
      grouped[topic.unitId].topics.push({
        id: topic.id,
        unit_title: topic.title, // This might be topic title in the schema?? No, schema has topic title.
        // Wait, schema `title` is TOPIC title. `unitId` is just string.
        // We don't have Unit Title in DB directly (it's in syllabusData).
        // But we can just use the Unit ID or look it up if we really want.
        // The AI just needs context.

        // Let's rely on syllabusData strictly for UNIT Titles?
        // No, mixed usage is bad.
        // Let's just output unitId if title missing, or hardcode map.

        topic_title: topic.title,
        topic_title_en: topic.titleEn || topic.title,
        hasAiContent: !!topic.aiContent,
      });
    });

    return NextResponse.json({ units: grouped });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // logger.debug("request", request)
    // 1. Security Check
    const adminSecret = request.headers.get(ADMIN_SECRET_HEADER);
    // logger.debug("adminSecret", adminSecret)
    if (!adminSecret) {
      return NextResponse.json({ error: 'Missing Admin Secret' }, { status: 401 });
    }

    // Verify secret against DB (Optional but recommended for robust security)
    // For speed in this script, we can rely on the secret matching a known value or DB lookup
    const adminUser = await db.query.mppscUsers.findFirst({
      where: (users, { and, eq }) =>
        and(eq(users.role, 'admin'), eq(users.adminSecret, adminSecret)),
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Invalid Admin Secret' }, { status: 403 });
    }

    // 2. Parse Data
    const body = await request.json();
    const { topics } = body as { topics: EnrichedTopic[] };

    if (!Array.isArray(topics)) {
      return NextResponse.json(
        { error: 'Invalid format. Expected { topics: [] }' },
        { status: 400 }
      );
    }

    let updatedCount = 0;
    const errors = [];

    // logger.debug("topics", topics)
    // 3. Bulk Update
    // We loop and update. For massive datasets (1000+), we might want batching,
    // but for syllabus (100-200 items), sequential await is fine for this admin tool.
    for (const topic of topics) {
      try {
        if (!topic.id) continue;

        await db
          .update(syllabusTopics)
          .set({
            aiContent: topic.content_hindi,
            aiContentEn: topic.content_english,
          })
          .where(eq(syllabusTopics.id, topic.id));

        updatedCount++;
      } catch (err: unknown) {
        logger.error(`Failed to update topic ${topic.id}:`, err);
        errors.push({ id: topic.id, error: err instanceof Error ? err.message : 'Failed to update topic' });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} topics.`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    logger.error('Bulk enrichment failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Bulk enrichment failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminSecret = request.headers.get(ADMIN_SECRET_HEADER);
    if (!adminSecret) {
      return NextResponse.json({ error: 'Missing Admin Secret' }, { status: 401 });
    }

    const adminUser = await db.query.mppscUsers.findFirst({
      where: (users, { and, eq }) =>
        and(eq(users.role, 'admin'), eq(users.adminSecret, adminSecret)),
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Invalid Admin Secret' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');

    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });
    }

    await db
      .update(syllabusTopics)
      .set({
        aiContent: null,
        aiContentEn: null,
      })
      .where(eq(syllabusTopics.id, topicId));

    return NextResponse.json({ success: true, message: `Cleared AI content for topic: ${topicId}` });
  } catch (error: unknown) {
    logger.error('Failed to clear topic AI content:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to clear topic AI content' }, { status: 500 });
  }
}
