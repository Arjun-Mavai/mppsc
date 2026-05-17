/**
 * Prints mains syllabus + PYQ + content coverage for the DB in .env / .env.local.
 * Local file DB: default dev (USE_PROD_DB not true). Remote Turso: USE_PROD_DB=true.
 *
 *   npm run mains:overview
 *   USE_PROD_DB=true npm run mains:overview
 */
import { config } from 'dotenv';
import * as path from 'path';

const cwd = process.cwd();
config({ path: path.join(cwd, '.env') });
config({ path: path.join(cwd, '.env.local'), override: true });

async function main() {
  const { env } = await import('../src/lib/env');
  /** Same rule as src/db/index.ts — do not guess from raw process.env.NODE_ENV (tsx often leaves it unset). */
  const useLocalSqlite =
    env.NODE_ENV === 'development' && env.USE_PROD_DB.trim() !== 'true';
  // eslint-disable-next-line no-console
  console.log(useLocalSqlite ? '📁 DB: local file mppsc_local_dev.db\n' : '🌐 DB: Turso / remote\n');

  const { db } = await import('../src/db/index');
  const {
    mainsPapers,
    mainsUnits,
    mainsTopics,
    mainsContent,
    mainsPyqPapers,
    mainsPyqQuestions,
  } = await import('../src/db/schema');
  const { eq, asc, count } = await import('drizzle-orm');

  const papers = await db.select().from(mainsPapers).orderBy(asc(mainsPapers.displayOrder));
  if (papers.length === 0) {
    // eslint-disable-next-line no-console
    console.log('No mains_papers rows — run: npm run db:apply:mains && npm run db:seed:mains');
    process.exit(0);
  }

  let totalTopics = 0;
  let totalWithContent = 0;

  for (const paper of papers) {
    const topicsInPaper = await db
      .select({ n: count() })
      .from(mainsTopics)
      .innerJoin(mainsUnits, eq(mainsTopics.unitId, mainsUnits.id))
      .where(eq(mainsUnits.paperId, paper.id));
    const withContent = await db
      .select({ n: count() })
      .from(mainsContent)
      .innerJoin(mainsTopics, eq(mainsContent.topicId, mainsTopics.id))
      .innerJoin(mainsUnits, eq(mainsTopics.unitId, mainsUnits.id))
      .where(eq(mainsUnits.paperId, paper.id));

    const tn = Number(topicsInPaper[0]?.n ?? 0);
    const wc = Number(withContent[0]?.n ?? 0);
    totalTopics += tn;
    totalWithContent += wc;

    // eslint-disable-next-line no-console
    console.log(
      `P${paper.paperNumber} (${paper.titleEn.slice(0, 52)}${paper.titleEn.length > 52 ? '…' : ''})`
    );
    // eslint-disable-next-line no-console
    console.log(`  id: ${paper.id}`);
    // eslint-disable-next-line no-console
    console.log(`  topics: ${tn}  |  with mains_content (model answers): ${wc}`);
    // eslint-disable-next-line no-console
    console.log(`  student hub: /mains/syllabus/${paper.id}`);
  }

  let pyqPapersN = 0;
  let pyqQsN = 0;
  try {
    const pyqPapers = await db.select({ n: count() }).from(mainsPyqPapers);
    const pyqQs = await db.select({ n: count() }).from(mainsPyqQuestions);
    pyqPapersN = Number(pyqPapers[0]?.n ?? 0);
    pyqQsN = Number(pyqQs[0]?.n ?? 0);
  } catch {
    // eslint-disable-next-line no-console
    console.log('\n--- PYQ tables missing ---');
    // eslint-disable-next-line no-console
    console.log('Run: USE_PROD_DB=true npm run db:ensure:pyq');
    // eslint-disable-next-line no-console
    console.log('(or: npm run db:migrate:remote)\n');
  }
  // eslint-disable-next-line no-console
  console.log('\n--- PYQ (import via /admin/mains-pyq) ---');
  // eslint-disable-next-line no-console
  console.log(`mains_pyq_papers: ${pyqPapersN}`);
  // eslint-disable-next-line no-console
  console.log(`mains_pyq_questions: ${pyqQsN}`);
  // eslint-disable-next-line no-console
  console.log(`\nAll papers: ${totalTopics} topics total, ${totalWithContent} have expert JSON saved.`);

  const sampleTopic = await db
    .select({
      topicId: mainsTopics.id,
      paperId: mainsUnits.paperId,
      titleEn: mainsTopics.titleEn,
    })
    .from(mainsTopics)
    .innerJoin(mainsUnits, eq(mainsTopics.unitId, mainsUnits.id))
    .innerJoin(mainsContent, eq(mainsContent.topicId, mainsTopics.id))
    .limit(1);

  if (sampleTopic[0]) {
    const t = sampleTopic[0];
    // eslint-disable-next-line no-console
    console.log('\nExample topic with content (open in browser):');
    // eslint-disable-next-line no-console
    console.log(`  /mains/syllabus/${t.paperId}/${t.topicId}`);
    // eslint-disable-next-line no-console
    console.log(`  ${t.titleEn}`);
  } else {
    // eslint-disable-next-line no-console
    console.log('\nNo mains_content yet — use /admin/mains: Copy full prompt → save JSON.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
