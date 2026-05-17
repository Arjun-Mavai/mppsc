'use server';

import { db } from '@/db';
import { syllabusTopics } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';

export async function uploadSyllabusData(jsonData: string, secretKey: string) {
  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    return { success: false, message: 'Invalid Admin Key' };
  }

  try {
    const data = JSON.parse(jsonData);

    if (!data.unitId || !Array.isArray(data.topics)) {
      return { success: false, message: 'Invalid JSON Format. Missing unitId or topics array.' };
    }

    const topicsToInsert = data.topics.map((t: any) => ({
      id: t.id || `${data.unitId}_${t.order}`,
      unitId: data.unitId,
      title: t.title,
      titleEn: t.titleEn || t.title,
      content: t.content,
      contentEn: t.contentEn || t.content,
      order: t.order,
      isFree: t.isFree ?? false,
      imgUrl: t.imgUrl || null,
    }));

    // Delete existing topics for this unit to avoid order conflicts/duplicates on re-upload
    await db.delete(syllabusTopics).where(eq(syllabusTopics.unitId, data.unitId));

    // Insert new
    if (topicsToInsert.length > 0) {
      await db.insert(syllabusTopics).values(topicsToInsert);
    }

    revalidatePath(`/syllabus/${data.unitId}`);
    return {
      success: true,
      message: `Successfully uploaded ${topicsToInsert.length} topics for ${data.unitId}`,
    };
  } catch (error: any) {
    logger.error('Upload Error:', error);
    return { success: false, message: 'Server Error: ' + error.message };
  }
}
