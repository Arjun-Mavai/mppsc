import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// MUST run before any `import` that loads `@/lib/env` — env is parsed at module load.
const cwd = process.cwd();
config({ path: path.join(cwd, '.env') });
config({ path: path.join(cwd, '.env.local'), override: true });

/**
 * 🌱 SEED MAINS SYLLABUS
 * Run: npx tsx src/scripts/seed-mains.ts
 * Remote: USE_PROD_DB=true npx tsx src/scripts/seed-mains.ts
 */

async function seedMains() {
  const { db } = await import('../db');
  const { env } = await import('../lib/env');
  const { mainsPapers, mainsUnits, mainsTopics } = await import('../db/schema');

  const useLocalFile = env.NODE_ENV === 'development' && env.USE_PROD_DB.trim() !== 'true';
  console.log('🚀 Starting Full Mains Syllabus Seeding...');
  console.log('📍 Target DB:', useLocalFile ? 'LOCAL (mppsc_local_dev.db)' : 'TURSO / remote');

  const dataPath = path.join(cwd, 'src/scripts/mains_syllabus_data.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  const { papers } = JSON.parse(rawData);

  console.log('🧹 Cleaning existing Mains syllabus data...');
  await db.delete(mainsTopics);
  await db.delete(mainsUnits);
  await db.delete(mainsPapers);

  for (const paperData of papers) {
    console.log(`📄 Seeding Paper ${paperData.paper_number}: ${paperData.paper_title_en}`);

    const paperId = uuidv4();

    await db.insert(mainsPapers).values({
      id: paperId,
      paperNumber: paperData.paper_number,
      titleHi: paperData.paper_title_hi,
      titleEn: paperData.paper_title_en,
      totalMarks: paperData.total_marks,
      durationMinutes: paperData.duration_minutes,
      displayOrder: paperData.paper_number,
    });

    for (const partData of paperData.parts) {
      for (const unitData of partData.units) {
        const unitId = uuidv4();

        await db.insert(mainsUnits).values({
          id: unitId,
          paperId,
          part: (partData.part || 'NONE') as 'A' | 'B' | 'NONE',
          unitNumber: unitData.unit_number,
          titleHi: unitData.unit_title_hi || '',
          titleEn: unitData.unit_title_en || '',
          displayOrder: unitData.unit_number,
        });

        const topics = [];
        for (let i = 0; i < unitData.topics_hi.length; i++) {
          topics.push({
            id: uuidv4(),
            unitId,
            titleHi: unitData.topics_hi[i],
            titleEn: unitData.topics_en[i] || '',
            displayOrder: i + 1,
            status: 'published' as const,
          });
        }

        if (topics.length > 0) {
          await db.insert(mainsTopics).values(topics);
        }
      }
    }
  }

  console.log('✅ Seeding Complete! All 6 Papers are ready in the database.');
}

seedMains()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('❌ Seeding Failed:', e);
    process.exit(1);
  });
