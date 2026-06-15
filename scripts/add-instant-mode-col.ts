import { db } from '../src/db';
import { sql } from 'drizzle-orm';
import { logger } from '../src/lib/logger';

async function main() {
  console.log('Adding is_instant_mode column to production database...');
  try {
    await db.run(sql`ALTER TABLE tests ADD COLUMN is_instant_mode integer DEFAULT false;`);
    console.log('✅ Successfully added is_instant_mode column to tests table.');
  } catch (err: any) {
    if (err.message && err.message.includes('duplicate column name')) {
      console.log('✅ Column already exists. No action needed.');
    } else {
      console.error('❌ Error adding column:', err);
    }
  }
}

main().catch(console.error);
