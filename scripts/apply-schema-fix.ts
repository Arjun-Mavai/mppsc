import { db } from '../src/db/index';
import { sql } from 'drizzle-orm';

async function run() {
  console.log('Running ALTER TABLE command on remote database...');
  try {
    // We try the standard SQLite way to alter a default? SQLite doesn't support it directly.
    // Let's see if this LibSQL extension syntax works
    await db.run(sql`ALTER TABLE mppsc_users ALTER COLUMN access_grants TO access_grants text DEFAULT '[]'`);
    console.log('Success!');
  } catch (err) {
    console.error('Failed to run ALTER TABLE:', err);
  }
  process.exit(0);
}

run();
