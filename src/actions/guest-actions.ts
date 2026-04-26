'use server';

import { db } from '@/db';
import { guests } from '@/db/schema';
import { logger } from '@/lib/logger';
import { eq, and } from 'drizzle-orm';
import { sendTelegramNotification } from '@/lib/telegram';
import { getTelegramStatsSummary } from '@/lib/telegram-stats-loader';
import { GUEST_LEAD_SOURCE } from '@/lib/lead-source';
import { escapeHTML } from '@/lib/telegram';

/**
 * 🎯 GUEST DATA MANAGEMENT - UPSERT LOGIC
 *
 * Standard Practice:
 * - Mobile number = Primary identifier (unique for each person)
 * - Same mobile → Update existing guest with new info
 * - New mobile or no mobile → Create new entry
 *
 * Why mobile over name/email:
 * - Names can be same (e.g., "Rahul Sharma" is very common)
 * - Email is optional and often fake
 * - Mobile is mandatory and unique per person in India
 */

export interface GuestData {
  name: string;
  email?: string;
  mobile?: string;
  /** Set when captured from a specific funnel, e.g. public PYQ 2026 page. */
  leadSource?: string;
}

const OPEN_PYQ_2026_PATH = '/open/2026-mppsc-prelims';

function getOpenPyq2026PageUrl() {
  const base =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BASE_URL) ||
    'https://mppsc.zenscroll.app';
  return `${base.replace(/\/$/, '')}${OPEN_PYQ_2026_PATH}`;
}

function buildTelegramHeader(
  isReturning: boolean,
  leadSource: string | undefined
): { title: string; tag: string; extra: string } {
  if (leadSource === GUEST_LEAD_SOURCE.OPEN_PYQ_2026) {
    if (isReturning) {
      return {
        title: '👋 <b>Returning — Open PYQ 2026</b>',
        tag: '#OpenPYQ2026 #Returning',
        extra: `🔗 <a href="${getOpenPyq2026PageUrl()}">/open/2026-mppsc-prelims</a>\n`,
      };
    }
    return {
      title: '📄 <b>New lead — Open PYQ 2026 page</b>',
      tag: '#OpenPYQ2026 #NewLead',
      extra: `🔗 <a href="${getOpenPyq2026PageUrl()}">/open/2026-mppsc-prelims</a>\n`,
    };
  }
  if (isReturning) {
    return {
      title: '👋 <b>Returning Guest</b>',
      tag: '#ReturningLead',
      extra: '',
    };
  }
  return {
    title: '🎯 <b>New Guest Lead</b>',
    tag: '#NewLeadGenerated',
    extra: '',
  };
}

async function safeStatsSummary(): Promise<string> {
  try {
    const s = await getTelegramStatsSummary();
    return s || '';
  } catch (e) {
    logger.error('getTelegramStatsSummary failed; continuing without summary', e, {
      category: 'telegram',
    });
    return '';
  }
}

async function sendTelegramOrLog(body: string): Promise<void> {
  try {
    await sendTelegramNotification(body);
  } catch (e) {
    logger.error('sendTelegramNotification failed', e, { category: 'telegram' });
  }
}

function composeGuestTelegramBody(
  isReturning: boolean,
  isNewWithBoldName: boolean,
  leadSource: string | undefined,
  name: string,
  email: string | undefined,
  normalizedMobile: string,
  statsSummary: string
): string {
  const { title, tag, extra } = buildTelegramHeader(isReturning, leadSource);
  const safeName = escapeHTML(name.trim());
  const safeEmail = email ? escapeHTML(email.trim()) : 'N/A';
  const nameLine = isNewWithBoldName
    ? `👤 <b>${safeName}</b>\n`
    : `👤 ${safeName}\n`;
  return (
    `${title}\n` +
    (extra || '') +
    nameLine +
    `📱 <code>${normalizedMobile}</code>\n` +
    `📧 ${safeEmail}\n\n` +
    (statsSummary ? statsSummary + '\n\n' : '') +
    tag
  );
}

async function sendGuestLeadTelegram(params: {
  isReturning: boolean;
  isNewWithBoldName: boolean;
  leadSource: string | undefined;
  name: string;
  email: string | undefined;
  normalizedMobile: string;
}): Promise<void> {
  const stats = await safeStatsSummary();
  const body = composeGuestTelegramBody(
    params.isReturning,
    params.isNewWithBoldName,
    params.leadSource,
    params.name,
    params.email,
    params.normalizedMobile,
    stats
  );
  await sendTelegramOrLog(body);
}

/** DB not migrated: `lead_source` column missing (SQLite / Drizzle). */
function isMissingLeadSourceColumnError(err: unknown): boolean {
  const s = String(err instanceof Error ? err.message : err);
  return /no such column|unknown column|does not exist/i.test(s) && /lead_source/i.test(s);
}

export async function createGuestEntry(data: GuestData) {
  const { name, email, mobile, leadSource } = data;

  try {
    if (mobile && mobile.trim().length >= 10) {
      const normalizedMobile = mobile.trim().replace(/\D/g, '').slice(-10);

      const existingGuest = await db.query.guests.findFirst({
        where: (g, { and, eq: eqOp }) => and(eqOp(g.mobile, normalizedMobile), eqOp(g.examType, 'mppsc')),
      });

      if (existingGuest) {
        let updated = false;
        try {
          await db
            .update(guests)
            .set({
              name: name.trim(),
              email: email?.trim() || existingGuest.email,
              ...(leadSource ? { leadSource } : {}),
            })
            .where(eq(guests.id, existingGuest.id));
          updated = true;
        } catch (dbErr) {
          if (leadSource && isMissingLeadSourceColumnError(dbErr)) {
            try {
              await db
                .update(guests)
                .set({
                  name: name.trim(),
                  email: email?.trim() || existingGuest.email,
                })
                .where(eq(guests.id, existingGuest.id));
              updated = true;
            } catch (dbErr2) {
              logger.error('Guest update retry (no lead_source) failed', dbErr2, { category: 'auth' });
            }
          } else {
            logger.error('Guest update failed', dbErr, { category: 'auth' });
          }
        }
        if (!updated) {
          if (leadSource === GUEST_LEAD_SOURCE.OPEN_PYQ_2026) {
            await sendGuestLeadTelegram({
              isReturning: true,
              isNewWithBoldName: false,
              leadSource,
              name,
              email,
              normalizedMobile,
            });
          }
          return { error: 'Failed to save guest details' };
        }

        await sendGuestLeadTelegram({
          isReturning: true,
          isNewWithBoldName: false,
          leadSource,
          name,
          email,
          normalizedMobile,
        });
        return { success: true, guestId: existingGuest.id, isReturning: true };
      }

      const guestId = crypto.randomUUID();
      let inserted = false;
      try {
        await db.insert(guests).values({
          id: guestId,
          name: name.trim(),
          email: email?.trim() || null,
          mobile: normalizedMobile,
          examType: 'mppsc' as const,
          leadSource: leadSource || null,
        });
        inserted = true;
      } catch (dbErr) {
        if (isMissingLeadSourceColumnError(dbErr)) {
          try {
            await db.insert(guests).values({
              id: guestId,
              name: name.trim(),
              email: email?.trim() || null,
              mobile: normalizedMobile,
              examType: 'mppsc' as const,
            });
            inserted = true;
            logger.warn('Guest insert retried without lead_source; run DB migration 0017 for lead attribution', {
              category: 'auth',
            });
          } catch (dbErr2) {
            logger.error('Guest insert without lead_source failed', dbErr2, { category: 'auth' });
          }
        } else {
          logger.error('Guest insert failed', dbErr, { category: 'auth' });
        }
      }
      if (!inserted) {
        if (leadSource === GUEST_LEAD_SOURCE.OPEN_PYQ_2026) {
          await sendGuestLeadTelegram({
            isReturning: false,
            isNewWithBoldName: true,
            leadSource,
            name,
            email,
            normalizedMobile,
          });
        }
        return { error: 'Failed to save guest details' };
      }

      await sendGuestLeadTelegram({
        isReturning: false,
        isNewWithBoldName: true,
        leadSource,
        name,
        email,
        normalizedMobile,
      });
      return { success: true, guestId, isReturning: false };
    }

    const guestId = crypto.randomUUID();
    try {
      await db.insert(guests).values({
        id: guestId,
        name: name.trim(),
        email: email?.trim() || null,
        mobile: mobile?.trim() || null,
        examType: 'mppsc' as const,
        leadSource: leadSource || null,
      });
    } catch (dbErr) {
      if (isMissingLeadSourceColumnError(dbErr)) {
        await db.insert(guests).values({
          id: guestId,
          name: name.trim(),
          email: email?.trim() || null,
          mobile: mobile?.trim() || null,
          examType: 'mppsc' as const,
        });
      } else {
        throw dbErr;
      }
    }

    return { success: true, guestId, isReturning: false };
  } catch (error) {
    logger.error('Failed to create/update guest entry', { error, category: 'auth' });
    return { error: 'Failed to save guest details' };
  }
}

/**
 * Get guest by mobile number
 */
export async function getGuestByMobile(mobile: string) {
  try {
    if (!mobile || mobile.trim().length < 10) return null;

    const normalizedMobile = mobile.trim().replace(/\D/g, '').slice(-10);

    const guest = await db.query.guests.findFirst({
      where: (g, { and, eq: eqOp }) => and(eqOp(g.mobile, normalizedMobile), eqOp(g.examType, 'mppsc')),
    });

    return guest;
  } catch (error) {
    logger.error('Failed to get guest by mobile', { error, category: 'auth' });
    return null;
  }
}

/**
 * Check if guest exists (for pre-filling form)
 */
export async function checkExistingGuest(mobile: string) {
  const guest = await getGuestByMobile(mobile);

  if (guest) {
    return {
      exists: true,
      name: guest.name,
      email: guest.email,
    };
  }

  return { exists: false };
}
