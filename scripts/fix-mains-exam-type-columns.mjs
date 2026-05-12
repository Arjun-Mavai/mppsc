/**
 * Some Turso DBs had mains_* tables created before exam_type existed (CREATE IF NOT EXISTS skipped alter).
 * Safe to run multiple times — ignores "duplicate column" errors.
 *
 *   USE_PROD_DB=true node scripts/fix-mains-exam-type-columns.mjs
 */
import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
config({ path: path.join(root, '.env') });
config({ path: path.join(root, '.env.local'), override: true });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) {
  console.error('Need TURSO_DATABASE_URL + TURSO_AUTH_TOKEN in .env');
  process.exit(1);
}

const client = createClient({ url, authToken });

async function addCol(sql, label) {
  try {
    await client.execute(sql);
    console.log('OK:', label);
  } catch (e) {
    const msg = String(e?.message ?? e);
    if (/duplicate column/i.test(msg) || /already exists/i.test(msg)) {
      console.log('Skip (already present):', label);
    } else {
      throw e;
    }
  }
}

async function main() {
  const tables = [
    ['mains_papers', "`exam_type` text DEFAULT 'mppsc_mains' NOT NULL"],
    ['mains_units', "`exam_type` text DEFAULT 'mppsc_mains' NOT NULL"],
    ['mains_topics', "`exam_type` text DEFAULT 'mppsc_mains' NOT NULL"],
    ['mains_content', "`exam_type` text DEFAULT 'mppsc_mains' NOT NULL"],
  ];
  for (const [t, colDef] of tables) {
    await addCol(`ALTER TABLE ${t} ADD COLUMN ${colDef}`, `${t}.exam_type`);
  }
  console.log('\nDone. Run: USE_PROD_DB=true npm run db:seed:mains:remote');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
