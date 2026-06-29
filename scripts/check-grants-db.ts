import { db } from '../src/db/index';
import { sql } from 'drizzle-orm';

async function check() {
  try {
    const res = await db.all(sql`PRAGMA table_info(mppsc_users);`);
    console.log(JSON.stringify(res.find(col => col.name === 'access_grants'), null, 2));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
