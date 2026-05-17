import { db } from '../src/db';
import { mainsContent, mainsTopics } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function auditMainsData() {
  console.log('--- 🛡️ MPPSC MAINS CONTENT AUDIT ---');
  
  const allContent = await db.select().from(mainsContent);
  console.log(`Total topics with content: ${allContent.length}`);
  
  let issues = 0;
  let healthy = 0;
  let truncatedLikely = 0;

  for (const item of allContent) {
    const ma = item.modelAnswers as any;
    const rich = item.richPayload as any;
    
    // Check for empty model answers
    const has2m = ma?.['2m']?.length > 0;
    const has7m = ma?.['7m']?.length > 0;
    const has10m = ma?.['10m']?.length > 0;
    const has11m = ma?.['11m']?.length > 0;
    
    const hasAnyModels = has2m || has7m || has10m || has11m;
    
    if (rich && !hasAnyModels) {
      console.log(`❌ ISSUE: Topic ID ${item.topicId} has rich_payload but EMPTY model_answers.`);
      truncatedLikely++;
      issues++;
    } else if (!hasAnyModels) {
      console.log(`⚠️ WARNING: Topic ID ${item.topicId} has NO model answers (likely draft/manual).`);
      issues++;
    } else {
      healthy++;
    }
  }

  console.log('\n--- 📊 SUMMARY ---');
  console.log(`✅ Healthy records: ${healthy}`);
  console.log(`❌ Truncated/Empty Models: ${truncatedLikely}`);
  console.log(`⚠️ Total items needing attention: ${issues}`);
  
  process.exit(0);
}

auditMainsData().catch(err => {
  console.error(err);
  process.exit(1);
});
