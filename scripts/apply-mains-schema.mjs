/**
 * Applies mains Drizzle SQL files to local `mppsc_local_dev.db`.
 * Run: node scripts/apply-mains-schema.mjs
 */
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

config({ path: '.env' });
config({ path: '.env.local', override: true });

const useProdDb = (process.env.USE_PROD_DB || '').trim() === 'true';
if (useProdDb) {
  console.error('Refusing: this script targets file DB only. For Turso use: npm run db:migrate');
  process.exit(1);
}

const dbPath = path.join(process.cwd(), 'mppsc_local_dev.db');
// Keep in-sync with Drizzle migrations used by `npm run db:migrate`
// This script is only for the local file DB when drizzle-kit migrate is blocked.
const files = [
  '0018_mppsc_mains_section.sql',
  '0019_mains_pyq_papers.sql',
  '0020_mains_vault_theory.sql',
  '0021_mppsc_user_access_grants.sql',
  '0022_mains_content_rich_payload.sql',
  '0023_mains_pyq_expert_insights.sql',
  '0024_mains_pyq_variant_style_hi.sql',
];

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
for (const f of files) {
  const sqlPath = path.join(process.cwd(), 'drizzle', f);
  if (!fs.existsSync(sqlPath)) continue;
  let sql = fs.readFileSync(sqlPath, 'utf8');
  sql = sql.replace(/;--> statement-breakpoint/g, ';');
  try {
    db.exec(sql);
    console.log('Applied', f);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Make script safe to re-run on already-upgraded DBs.
    if (/duplicate column name|already exists|duplicate/i.test(msg)) {
      console.log('Skipped (already applied)', f);
      continue;
    }
    throw e;
  }
}
db.close();
console.log('OK:', dbPath);
console.log('Next: npm run db:seed:mains');
