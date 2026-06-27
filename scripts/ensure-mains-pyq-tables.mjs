/**
 * Ensures mains PYQ + vault tables exist on Turso (CREATE IF NOT EXISTS + safe ALTERs).
 * Use when drizzle reports "migrations applied" but some tables never got created on a branch/old DB.
 *
 *   USE_PROD_DB=true node scripts/ensure-mains-pyq-tables.mjs
 */
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
config({ path: path.join(root, '.env') });
config({ path: path.join(root, '.env.local'), override: true });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) {
  console.error('Need TURSO_DATABASE_URL + TURSO_AUTH_TOKEN');
  process.exit(1);
}

function readAndSplit(sqlPath) {
  let sql = fs.readFileSync(sqlPath, 'utf8');
  sql = sql.replace(/;--> statement-breakpoint/g, ';');
  return sql;
}

const client = createClient({ url, authToken });

for (const name of ['0019_mains_pyq_papers.sql', '0020_mains_vault_theory.sql']) {
  const p = path.join(root, 'drizzle', name);
  const sql = readAndSplit(p);
  await client.executeMultiple(sql);
  console.log('OK:', name);
}

async function tryAlter(stmt) {
  try {
    await client.execute(stmt);
    console.log('OK alter:', stmt.slice(0, 70) + '…');
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/duplicate column|already exists/i.test(msg)) console.log('Skip alter (exists):', stmt.slice(0, 60));
    else throw e;
  }
}

await tryAlter(`ALTER TABLE mains_pyq_questions ADD COLUMN expert_insights_hi text`);
await tryAlter(`ALTER TABLE mains_pyq_questions ADD COLUMN expert_insights_en text`);
await tryAlter(`ALTER TABLE mains_pyq_prepared_variants ADD COLUMN style_label_hi text`);

/** Drizzle 0022 — History-rich / structured mains JSON on `mains_content`. */
await tryAlter(`ALTER TABLE mains_content ADD COLUMN rich_payload text`);

/** Drizzle 0026 — hide papers from public PYQ desk without deleting stems. */
await tryAlter(`ALTER TABLE mains_pyq_papers ADD COLUMN is_hidden integer DEFAULT 0 NOT NULL`);

/** Add current affairs data column */
await tryAlter(`ALTER TABLE mains_pyq_questions ADD COLUMN current_affairs_data text`);

console.log('Done: mains PYQ + vault tables ensured');
