import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    await db.run(sql`ALTER TABLE mains_pyq_papers ADD COLUMN is_hidden INTEGER NOT NULL DEFAULT 0;`);
    console.log("Column is_hidden added successfully.");
  } catch (err) {
    console.error("Error:", err);
  }
}
main();
