import 'dotenv/config';
import { db } from '../db';
import { tests, questions } from '../db/schema';
import { eq, asc, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

interface PaperConfig {
  year: number;
  fullTestId: string;
  hindiTitlePrefix: string;
  englishTitlePrefix: string;
  tags: string[];
}

const PAPERS: PaperConfig[] = [
  {
    year: 2026,
    fullTestId: 'n9Zy8u3ytAf1ZPB9W_Rbk',
    hindiTitlePrefix: 'MPPSC राज्य सेवा प्रारंभिक परीक्षा 2026',
    englishTitlePrefix: 'MPPSC State Service Prelims 2026',
    tags: ['MISC', '2026', 'PYQ'],
  },
  {
    year: 2025,
    fullTestId: 'D0gf6bklgl3RT-sTnue2n',
    hindiTitlePrefix: 'MPPSC राज्य सेवा प्रारंभिक परीक्षा 2025',
    englishTitlePrefix: 'MPPSC State Service Prelims 2025',
    tags: ['MISC', '2025', 'PYQ'],
  },
  {
    year: 2024,
    fullTestId: '3XmZ0l700BJV3j2FLd0XZ',
    hindiTitlePrefix: 'MPPSC राज्य सेवा प्रारंभिक परीक्षा 2024',
    englishTitlePrefix: 'MPPSC State Service Prelims 2024',
    tags: ['MISC', '2024', 'PYQ'],
  },
  {
    year: 2023,
    fullTestId: 'mQ1a9hZoTdfSRfkz40K5C',
    hindiTitlePrefix: 'MPPSC राज्य सेवा प्रारंभिक परीक्षा 2023',
    englishTitlePrefix: 'MPPSC State Service Prelims 2023',
    tags: ['MISC', '2023', 'PYQ'],
  },
];

async function archiveLegacyParts() {
  console.log('--- Step 1: Archiving & Hiding Legacy Parts ---');

  // Archive 2025 legacy parts
  const legacy2025Ids = [
    'owzOzb5J-OfGDUbFNs0n-', // Old 2025 Part 1
    'V0lPNnyqCpgQUqaxA9ZZJ', // Old 2025 Part 2
    'FVA6aomSEdcs9hOKH4Ulz', // Old 2025 Part 3
    '_bMt18BfXiuzYJfAr_hM7', // Old 2025 Part 4
    'dPjxq4JIOG1tOL_YsyAiv', // Old 2025 Part 5
    'SbZP3cerXo6UHBWYinaD7', // Old 2025 Part 6
    'c4rI0m0FoPZMW32N6vN3w', // Old 2025 Part 7
    'Phb5GpZkUqYbaQM-2nPjG', // Old 2025 Part 8
    'vN_6C84IUbpMY0Qr0RFSa', // Old 2025 Part 9
    '7DMLHJzMdCOQw7WAd_kPT', // Old 2025 Part 10
    '2DXBWqHiYJFoR0eKfWzav', // Old 2025 Part 11
    'osWVJ0XRXTYEJNL-0wx7k', // Old 2025 Part 12
  ];

  for (const id of legacy2025Ids) {
    const existing = await db.select().from(tests).where(eq(tests.id, id));
    if (existing.length > 0) {
      const currentTitle = existing[0].title;
      const updatedTitle = currentTitle.startsWith('[OLD]') ? currentTitle : `[OLD] ${currentTitle}`;
      await db
        .update(tests)
        .set({
          title: updatedTitle,
          isHidden: true,
          updatedAt: new Date(),
        })
        .where(eq(tests.id, id));
      console.log(`Archived 2025 legacy test ${id}: ${updatedTitle}`);
    }
  }

  // Archive 2024 legacy parts
  const legacy2024Ids = [
    'nSTpDYvafbFqGKxvWUDD0', // Old 2024 Part 1
    '_VUGAz_sJs3siSL0uGSN2', // Old 2024 Part 2
  ];

  for (const id of legacy2024Ids) {
    const existing = await db.select().from(tests).where(eq(tests.id, id));
    if (existing.length > 0) {
      const currentTitle = existing[0].title;
      const updatedTitle = currentTitle.startsWith('[OLD]') ? currentTitle : `[OLD] ${currentTitle}`;
      await db
        .update(tests)
        .set({
          title: updatedTitle,
          isHidden: true,
          updatedAt: new Date(),
        })
        .where(eq(tests.id, id));
      console.log(`Archived 2024 legacy test ${id}: ${updatedTitle}`);
    }
  }
}

async function createDailySetsForPaper(paper: PaperConfig, baseTimestamp: number, yearOffsetMinutes: number) {
  console.log(`\n=== Processing Year ${paper.year} ===`);

  // 1. Fetch full test questions
  const fullQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.testId, paper.fullTestId))
    .orderBy(asc(questions.order));

  console.log(`Fetched ${fullQuestions.length} questions from full paper (${paper.fullTestId})`);

  if (fullQuestions.length < 100) {
    throw new Error(`Expected at least 100 questions for year ${paper.year}, got ${fullQuestions.length}`);
  }

  // 2. Loop through 10 parts
  for (let part = 1; part <= 10; part++) {
    const hindiTitle = `${paper.hindiTitlePrefix} Part-${part}`;
    const englishTitle = `${paper.englishTitlePrefix} Part-${part}`;

    // Check if clean test already exists
    const existing = await db
      .select({ id: tests.id, title: tests.title })
      .from(tests)
      .where(and(eq(tests.title, hindiTitle), eq(tests.type, 'MISC')));

    if (existing.length > 0) {
      console.log(`⚠️  Part-${part} already exists (${existing[0].id}): ${existing[0].title}. Skipping.`);
      continue;
    }

    const testId = nanoid();
    const slug = `mppsc-pyq-${paper.year}-part-${part}-${nanoid(4).toLowerCase()}`;

    // Calculate sequential createdAt timestamp so that:
    // In admin panel (orderBy desc createdAt):
    // Year 2026 comes first, then 2025, 2024, 2023.
    // Within each year, Part-1 is top, then Part-2, ..., Part-10.
    const partOffsetSeconds = (10 - part) * 10; // Part 1 has largest offset (most recent)
    const testCreatedAt = new Date(baseTimestamp + (yearOffsetMinutes * 60 + partOffsetSeconds) * 1000);

    const startIdx = (part - 1) * 10;
    const endIdx = part * 10;
    const partSlice = fullQuestions.slice(startIdx, endIdx);

    // Insert Test
    await db.insert(tests).values({
      id: testId,
      title: hindiTitle,
      titleEn: englishTitle,
      description: `${paper.hindiTitlePrefix} - दैनिक अभ्यास सेट (Part-${part})`,
      slug: slug,
      durationMinutes: 120,
      totalQuestions: 10,
      totalMarks: 20, // 10 questions * 2 marks
      type: 'MISC',
      unitId: 'unit_1',
      topicId: null,
      tags: paper.tags,
      isPro: false,
      isInstantMode: false,
      isFreeAccess: true, // Free test series
      isLiteAccess: false,
      isProAccess: true,
      displayOrder: part,
      isHidden: true, // HIDDEN by default for admin control
      maxRetries: null, // Unlimited retries
      createdAt: testCreatedAt,
      updatedAt: testCreatedAt,
      examType: 'mppsc',
    });

    // Insert Questions
    const questionsToInsert = partSlice.map((q, idx) => ({
      id: nanoid(),
      testId: testId,
      questionText: q.questionText,
      questionTextEn: q.questionTextEn,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      explanationEn: q.explanationEn,
      marks: q.marks || 2,
      negativeMarks: q.negativeMarks ?? 0,
      idealTime: q.idealTime ?? 60,
      order: idx + 1, // 1 to 10
      subject: q.subject,
      type: q.type || 'standard',
      matchPairs: q.matchPairs,
      extendedData: q.extendedData,
      examType: 'mppsc' as const,
    }));

    await db.insert(questions).values(questionsToInsert);

    console.log(
      `✅ Created ${paper.year} Part-${part} [${testId}] (Q${startIdx + 1} to Q${endIdx}) -> ${questionsToInsert.length} questions`
    );
  }
}

async function main() {
  console.log('🚀 Starting Prelims Daily PYQ Sets Generation (2026, 2025, 2024, 2023)...');

  // Step 1: Archive old legacy parts
  await archiveLegacyParts();

  // Step 2: Generate 10-question parts for all 4 years
  const baseTime = Date.now();
  // Offsets in minutes so 2026 > 2025 > 2024 > 2023 in desc order
  const yearOffsets: Record<number, number> = {
    2023: 0,
    2024: 10,
    2025: 20,
    2026: 30,
  };

  for (const paper of PAPERS) {
    await createDailySetsForPaper(paper, baseTime, yearOffsets[paper.year] || 0);
  }

  console.log('\n🎉 ALL Prelims Daily PYQ Sets generated successfully!');
}

main().catch((err) => {
  console.error('❌ Error during generation:', err);
  process.exit(1);
});
