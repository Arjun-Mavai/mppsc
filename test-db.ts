import { db } from './src/db';

async function test() {
  console.log("Fetching Mains PYQs...");
  const mains = await db.query.mainsPyqQuestions.findMany({ 
    limit: 2,
    with: { paper: true }
  });
  console.log("MAINS PYQS:\n", JSON.stringify(mains, null, 2));

  console.log("\nFetching Pre PYQ Cache...");
  const preCaches = await db.query.pyqUnitCache.findMany({ limit: 2 });
  console.log("PRE CACHES:\n", JSON.stringify(preCaches, null, 2));
  
  process.exit(0);
}

test().catch(console.error);
