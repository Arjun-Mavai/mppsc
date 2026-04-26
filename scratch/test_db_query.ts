import { db } from '@/db';
import { questions, tests } from '@/db/schema';
import { eq, isNull, and, sql } from 'drizzle-orm';

async function test() {
  const q = await db
    .select({
      type: tests.type,
      testId: tests.id,
      title: tests.title,
      pending: sql<number>`SUM(CASE WHEN ${questions.extendedData} IS NULL THEN 1 ELSE 0 END)`,
      total: sql<number>`COUNT(${questions.id})`
    })
    .from(questions)
    .innerJoin(tests, eq(questions.testId, tests.id))
    .groupBy(tests.type, tests.id, tests.title);

  console.log(q);
}
test();
