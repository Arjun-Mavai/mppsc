/**
 * Copy all MPPSC mains *content* tables from local SQLite → Turso (remote).
 *
 * Skips per-user rows: mains_progress, mains_feedback, mppsc_mains_users (separate login system).
 *
 * Prereqs on remote:
 *   1. Schema already applied: `USE_PROD_DB=true npm run db:migrate`
 *   2. Optional: `USE_PROD_DB=true node scripts/fix-mains-exam-type-columns.mjs`
 *
 * Usage (loads .env then .env.local):
 *   MAINS_SYNC_CONFIRM=yes npx tsx scripts/sync-mains-local-to-remote.ts
 *
 * Optional:
 *   MAINS_SYNC_SOURCE_DB=/absolute/path/to/custom.db   (default: ./mppsc_local_dev.db)
 */
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { createClient } from '@libsql/client';

config({ path: path.join(process.cwd(), '.env') });
config({ path: path.join(process.cwd(), '.env.local'), override: true });

const DELETE_FIRST = [
  'mains_pyq_prepared_variants',
  'mains_topic_pyq_links',
  'mains_topic_expected_variants',
  'mains_topic_expected_questions',
  'mains_pyq_questions',
  'mains_pyq_papers',
  'mains_topic_theory_structured',
  'mains_content',
  'mains_topics',
  'mains_units',
  'mains_papers',
] as const;

const INSERT_ORDER = [...DELETE_FIRST].reverse();

function getColumns(db: Database.Database, table: string): string[] {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return rows.map((r) => r.name);
}

function rowToArgs(cols: string[], row: Record<string, unknown>): unknown[] {
  return cols.map((c) => {
    const v = row[c];
    if (v === undefined) return null;
    return v;
  });
}

async function main() {
  if (process.env.MAINS_SYNC_CONFIRM !== 'yes') {
    console.error(`
Refusing to run: this DELETES mains tables on the remote DB then copies from local.

Set:  MAINS_SYNC_CONFIRM=yes

Example:
  MAINS_SYNC_CONFIRM=yes npx tsx scripts/sync-mains-local-to-remote.ts
`);
    process.exit(1);
  }

  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  if (!tursoUrl?.trim() || !tursoToken?.trim()) {
    console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN (.env.local).');
    process.exit(1);
  }

  const sourcePath =
    process.env.MAINS_SYNC_SOURCE_DB?.trim() || path.join(process.cwd(), 'mppsc_local_dev.db');
  if (!fs.existsSync(sourcePath)) {
    console.error(`Source DB not found: ${sourcePath}`);
    process.exit(1);
  }

  console.log('Source (local):', sourcePath);
  console.log('Target (Turso):', tursoUrl.replace(/(.*\/\/).*/, '$1…'));

  const src = new Database(sourcePath);
  src.pragma('foreign_keys = OFF');

  const tgt = createClient({ url: tursoUrl, authToken: tursoToken });

  for (const table of DELETE_FIRST) {
    try {
      await tgt.execute(`DELETE FROM ${table}`);
      console.log('Cleared remote:', table);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/no such table/i.test(msg)) {
        console.error(
          `\nRemote missing table "${table}". Run migrations first:\n  USE_PROD_DB=true npm run db:migrate\n`
        );
        src.close();
        process.exit(1);
      }
      throw e;
    }
  }

  let total = 0;
  for (const table of INSERT_ORDER) {
    const cols = getColumns(src, table);
    if (cols.length === 0) {
      console.warn('Skip (no columns / missing in source):', table);
      continue;
    }
    const rows = src.prepare(`SELECT * FROM ${table}`).all() as Record<string, unknown>[];
    if (rows.length === 0) {
      console.log('— empty local:', table);
      continue;
    }
    const colList = cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(', ');
    const ph = cols.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${colList}) VALUES (${ph})`;

    for (const row of rows) {
      await tgt.execute({ sql, args: rowToArgs(cols, row) });
    }
    console.log(`✓ copied ${rows.length} →`, table);
    total += rows.length;
  }

  src.close();
  console.log('\nDone. Total rows inserted:', total);
  console.log('Tip: open /mains/syllabus and /mains/syllabus/pyq-library on the deployed app to verify.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
