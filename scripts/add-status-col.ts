import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from '@/db';
import { sql } from 'drizzle-orm';

async function run() {
  console.log('Adding status column to support_messages...');
  try {
    await db.run(sql`ALTER TABLE support_messages ADD COLUMN status text;`);
    console.log('Success!');
  } catch (err: any) {
    if (err.message?.includes('duplicate column')) {
      console.log('Column already exists.');
    } else {
      console.error(err);
    }
  }
}

run();
