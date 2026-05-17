import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import path from 'path';
import * as schema from './schema';
import { env } from '@/lib/env';

// Singleton pattern to prevent connection exhaustion in serverless/dev
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof createClient> | undefined;
};

const isDev = env.NODE_ENV === 'development' && env.USE_PROD_DB.trim() !== 'true';
const localDbPath = path.resolve(process.cwd(), 'mppsc_local_dev.db');
const connectionUrl = isDev
  ? `file:${localDbPath}`
  : env.TURSO_DATABASE_URL;

const connectionAuthToken = isDev
  ? undefined
  : env.TURSO_AUTH_TOKEN;

export const client =
  globalForDb.client ??
  createClient({
    url: connectionUrl,
    authToken: connectionAuthToken,
    // syncUrl: process.env.TURSO_SYNC_URL, // Optional: Enable if using embedded replica
  });

if (!globalForDb.client && env.NODE_ENV === 'development') {
  const targetLabel = isDev ? 'LOCAL_SQLITE' : 'TURSO_REMOTE';
  console.log(`🗄️ DB connected [${targetLabel}]: ${connectionUrl}`);
}

if (env.NODE_ENV !== 'production') {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });
