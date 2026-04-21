import { db } from '../src/db';
import { tests } from '../src/db/schema';
import { eq, and } from 'drizzle-orm';

async function checkFreeQuizzes() {
  const allMiscMppsc = await db
    .select({
      id: tests.id,
      title: tests.title,
      isFreeAccess: tests.isFreeAccess,
      isHidden: tests.isHidden,
      examType: tests.examType,
      type: tests.type
    })
    .from(tests)
    .where(
      and(
        eq(tests.type, 'MISC'),
        eq(tests.examType, 'mppsc')
      )
    );

  console.log('Total MISC MPPSC tests:', allMiscMppsc.length);
  
  const hiddenCount = allMiscMppsc.filter(t => t.isHidden).length;
  const noFreeAccessCount = allMiscMppsc.filter(t => !t.isFreeAccess).length;
  const visibleCount = allMiscMppsc.filter(t => t.isFreeAccess && !t.isHidden).length;

  console.log('Hidden:', hiddenCount);
  console.log('No Free Access:', noFreeAccessCount);
  console.log('Visible (matches all current filters):', visibleCount);
  
  if (allMiscMppsc.length > 0) {
    console.log('\nSample of non-visible tests:');
    allMiscMppsc.filter(t => !t.isFreeAccess || t.isHidden).slice(0, 5).forEach(t => {
      console.log(`- ID: ${t.id}, Title: ${t.title}, isFreeAccess: ${t.isFreeAccess}, isHidden: ${t.isHidden}`);
    });
  }
}

checkFreeQuizzes().catch(console.error);
