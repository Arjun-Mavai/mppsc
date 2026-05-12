import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function listTables() {
  console.log('Listing all tables in the database...');
  try {
    const result = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table'`);
    console.log('Tables:', result.rows.map(r => r.name));
  } catch (error) {
    console.error('Failed to list tables:', error);
  }
}

listTables();
