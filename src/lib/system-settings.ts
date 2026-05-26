import { db } from '@/db';
import { systemSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

const TELEMETRY_KEY = 'telemetry_enabled';

/**
 * 🔒 Check if telemetry/event logging is enabled dynamically.
 * Defaults to true if the setting is missing or the database is unavailable (fail-open).
 */
export async function getTelemetryEnabled(): Promise<boolean> {
  try {
    const row = await db
      .select({ value: systemSettings.value })
      .from(systemSettings)
      .where(eq(systemSettings.key, TELEMETRY_KEY))
      .limit(1);

    if (row.length === 0) {
      return true; // Default is enabled
    }

    return row[0].value === 'true';
  } catch (error) {
    // Fail-open: default to true on DB connectivity errors
    console.error('[Telemetry Settings] Failed to load setting from DB (failing open):', error);
    return true;
  }
}

/**
 * 🔒 Set the telemetry/event logging state in the SQLite/Turso database.
 */
export async function setTelemetryEnabled(enabled: boolean): Promise<void> {
  try {
    const valueStr = enabled ? 'true' : 'false';

    // Upsert — check if exists, then insert or update
    const existing = await db
      .select({ key: systemSettings.key })
      .from(systemSettings)
      .where(eq(systemSettings.key, TELEMETRY_KEY))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(systemSettings).values({
        key: TELEMETRY_KEY,
        value: valueStr,
        description: 'Toggles Telegram event logging bot dynamic tracking',
        updatedAt: new Date(),
      });
    } else {
      await db
        .update(systemSettings)
        .set({
          value: valueStr,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.key, TELEMETRY_KEY));
    }
  } catch (error) {
    console.error('[Telemetry Settings] Failed to update setting in DB:', error);
    throw new Error('Failed to update telemetry settings');
  }
}
