import React from 'react';
import { notFound } from 'next/navigation';
// import { syllabusData } from '@/data/syllabusData'; // Removed to prevent full bundle load
import { db } from '@/db';
import { syllabusTopics } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import UnitContent, { TopicData } from './UnitContent';
import { ACCESS_CONFIG } from '@/features/syllabus/utils/locks';
import { logger } from '@/lib/logger';

type Props = {
  params: Promise<{ unitId: string }>;
};

export default async function UnitPage({ params }: Props) {
  const { unitId } = await params;

  // 1. Fetch from Database first (Cached)
  let dbTopics: (typeof syllabusTopics.$inferSelect)[] = [];
  try {
    const { getSyllabusTopics } = await import('@/features/syllabus/actions/get-syllabus');
    dbTopics = await getSyllabusTopics(unitId);
  } catch (error) {
    logger.error('Failed to fetch syllabus topics from DB:', error);
    // Fallback to empty, will use static data
  }

  // 2. Fallback to Static Data if DB is empty
  let finalTopics: TopicData[] = [];
  let finalTopicsEn: TopicData[] = [];
  let unitTitle = '';
  let unitTitleEn = '';

  if (dbTopics.length > 0) {
    // Use DB Data
    try {
      const { getSyllabusUnit } = await import('@/features/syllabus/utils/loader');
      const staticUnit = await getSyllabusUnit(unitId);

      if (staticUnit) {
        unitTitle = staticUnit.title || 'Unit';
        unitTitleEn = staticUnit.title_en || staticUnit.title || 'Unit';
      } else {
        unitTitle = 'Unit ' + unitId;
        unitTitleEn = 'Unit ' + unitId;
      }
    } catch (e) {
      unitTitle = 'Unit ' + unitId;
      unitTitleEn = 'Unit ' + unitId;
    }

    // Helper to strip years like (MPPSC 2021), [UPPCS 2022], (RAS/RTS 2018) or standalone years
    const stripYear = (str: string) => {
      if (!str) return str;
      return str
        .replace(/\[\s*(?:[A-Za-z\/\s0-9&_-]+)?\s*\d{4}\s*\]/gi, '') // Strips [UPPCS 2022], [UPPSC 2022], [MPPSC 2020], [2022]
        .replace(/\(\s*(?:[A-Za-z\/\s0-9&_-]+)?\s*\d{4}\s*\)/gi, '') // Strips (UPPSC 2014), (RAS/RTS 2018), (2014)
        .replace(/(?:UPPCS|MPPSC|UPSC|UPPSC|CGPSC|BPSC|RAS|RTS|IAS|Exam)\s*\d{4}/gi, '') // Strips standalone UPPCS 2022 (Exam name mandatory to avoid stripping answer years)
        .replace(/\[\s*[A-Za-z\/\s_-]+\s*\]/gi, '') // Strips [MPPSC], [UPPCS], etc. without years
        .replace(/^\d+\.\s*/, '') // Strips leading list numbers like "1. "
        .replace(/\s+/g, ' ')
        .trim();
    };

    // Process DB Topics
    finalTopics = dbTopics.map((t, idx) => {
      const c = t.content as any; // Official Syllabus (Old)
      const ai = t.aiContent as any; // Rich AI Content (New)

      return {
        id: t.id,
        unitId: t.unitId,
        front: t.title,
        back: c?.back || ai?.content || '', // Fallback to AI summary if back missing
        official_details: c?.details,
        mnemonic: ai?.mnemonic || c?.mnemonic,
        impact_emoji: ai?.impact_emoji || c?.impact_emoji,
        important_facts: ai?.points || c?.important_facts, // "Points" from AI -> "important_facts" in UI
        pyq: (ai?.pyq || []).map((p: any) => ({ ...p, question: stripYear(p.question) })),
        isFree:
          (t.isFree ?? false) || (unitId === 'unit_1' && idx < ACCESS_CONFIG.FREE_TOPICS_UNIT1),
        // ── DB access flags → client ko pass karo ──────────
        isLiteAccess: t.isLiteAccess ?? null,
        isProAccess: t.isProAccess ?? null,
        
        // ── Elite Expert Fields ──────────
        topic_intro: ai?.topic_intro || ai?.introduction, // Fallback to intro
        topic_significance: ai?.topic_significance,
        priority_level: ai?.priority_level,
        trend_shift_alert: ai?.trend_shift_alert,
        examiner_focus: ai?.examiner_focus,
        common_pitfall: ai?.common_pitfall,
        must_know_micro_topics: ai?.must_know_micro_topics,
        retention_trick: ai?.retention_trick,
        litmus_test: ai?.litmus_test,
        mains_integration: ai?.mains_integration,
        pyq_pre_examples: (ai?.pyq_pre_examples || []).map((q: string) => stripYear(q)),
        pyq_mains_examples: (ai?.pyq_mains_examples || ai?.potential_mains_questions || []).map((q: string) => stripYear(q)),
        ideal_study_format: ai?.ideal_study_format,

        // ── New AI Enrichment Fields ──────────
        quote: ai?.quote,
        introduction: ai?.introduction,
        key_concepts: ai?.key_concepts,
        ai_details: ai?.details,
        facts_for_prelims: ai?.facts_for_prelims || ai?.points,
        potential_mains_questions: (ai?.potential_mains_questions || []).map((q: string) => stripYear(q)),
      };
    });

    // Process English (if exists in DB, otherwise check contentEn)
    finalTopicsEn = dbTopics.map((t, idx) => {
      const c = (t.contentEn as any) || (t.content as any);
      const ai = (t.aiContentEn as any) || (t.aiContent as any);

      return {
        id: t.id,
        unitId: t.unitId,
        front: t.titleEn || t.title,
        back: c?.back || ai?.content || '',
        official_details: c?.details,
        mnemonic: ai?.mnemonic || c?.mnemonic,
        impact_emoji: ai?.impact_emoji || c?.impact_emoji,
        important_facts: ai?.points || ai?.facts_for_prelims || c?.important_facts,
        pyq: (ai?.pyq || []).map((p: any) => ({ ...p, question: stripYear(p.question) })),
        isFree:
          (t.isFree ?? false) || (unitId === 'unit_1' && idx < ACCESS_CONFIG.FREE_TOPICS_UNIT1),
        isLiteAccess: t.isLiteAccess ?? null,
        isProAccess: t.isProAccess ?? null,
        
        // ── Elite Expert Fields ──────────
        topic_intro: ai?.topic_intro || ai?.introduction,
        topic_significance: ai?.topic_significance,
        priority_level: ai?.priority_level,
        trend_shift_alert: ai?.trend_shift_alert,
        examiner_focus: ai?.examiner_focus,
        common_pitfall: ai?.common_pitfall,
        must_know_micro_topics: ai?.must_know_micro_topics,
        retention_trick: ai?.retention_trick,
        litmus_test: ai?.litmus_test,
        mains_integration: ai?.mains_integration,
        pyq_pre_examples: (ai?.pyq_pre_examples || []).map((q: string) => stripYear(q)),
        pyq_mains_examples: (ai?.pyq_mains_examples || ai?.potential_mains_questions || []).map((q: string) => stripYear(q)),
        ideal_study_format: ai?.ideal_study_format,

        // ── New AI Enrichment Fields ──────────
        quote: ai?.quote,
        introduction: ai?.introduction,
        key_concepts: ai?.key_concepts,
        ai_details: ai?.details,
        facts_for_prelims: ai?.facts_for_prelims || ai?.points,
        potential_mains_questions: (ai?.potential_mains_questions || []).map((q: string) => stripYear(q)),
      };
    });
  } else {
    // Fallback: Use Static Data via Dynamic Loader (Code Splitting)
    const { getSyllabusUnit } = await import('@/features/syllabus/utils/loader');
    const unit = await getSyllabusUnit(unitId);

    if (!unit) {
      notFound();
    }

    unitTitle = unit.title || '';
    unitTitleEn = unit.title_en || unit.title || '';

    const isUnit1 = unitId === 'unit_1';

    finalTopics = (unit.topics || []).map((t, idx) => ({
      ...t,
      unitId,
      isFree: isUnit1 ? idx < ACCESS_CONFIG.FREE_TOPICS_UNIT1 : false,
      official_details: (t as any).details,
    }));

    finalTopicsEn = (unit.topics_en || unit.topics || []).map((t, idx) => ({
      ...t,
      unitId,
      isFree: isUnit1 ? idx < ACCESS_CONFIG.FREE_TOPICS_UNIT1 : false,
      official_details: (t as any).details || (t as any).contentEn?.details,
    }));
  }

  return (
    <UnitContent
      unitId={unitId}
      unitTitle={unitTitle}
      unitTitleEn={unitTitleEn}
      topics={finalTopics}
      topicsEn={finalTopicsEn}
    />
  );
}
