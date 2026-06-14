import { defineConfig } from 'drizzle-kit';
import path from 'path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

const localDbPath = `file:${path.resolve(
  process.cwd(),
  'mppsc_local_dev.db'
)}`;
/** Same rule as `src/db/index.ts` (NEXT: NODE_ENV defaults to development when unset; tsx/cli often omits it). */
const nodeEnv = process.env.NODE_ENV || 'development';
const useLocalSqlite =
  nodeEnv === 'development' && (process.env.USE_PROD_DB || '').trim() !== 'true';

if (useLocalSqlite) {
  console.log('🛠️ drizzle-kit: LOCAL SQLite', localDbPath);
} else {
  console.log('🌐 drizzle-kit: Turso / remote');
}
// Staging: point `TURSO_DATABASE_URL` (and token) at a Turso **branch** URL; production uses the primary DB URL.
console.log('📍 Target:', useLocalSqlite ? localDbPath : process.env.TURSO_DATABASE_URL);

if (!useLocalSqlite && !process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL is required when not using local SQLite');
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: useLocalSqlite ? 'sqlite' : 'turso',
  dbCredentials: {
    url: useLocalSqlite ? localDbPath : process.env.TURSO_DATABASE_URL!,
    authToken: useLocalSqlite ? undefined : process.env.TURSO_AUTH_TOKEN,
  },
});
