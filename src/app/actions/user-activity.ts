import { db } from '@/db';
import { mppscUserActivities } from '@/db/schema';
import { nanoid } from 'nanoid';

export type ActivityAction = 'PLAN_CHANGE' | 'DELETE' | 'GRANT' | 'UPDATE' | 'LOGIN' | 'LOGOUT';

interface LogActivityParams {
  userId?: string | null;
  userEmail: string;
  userName?: string | null;
  adminId?: string;
  action: ActivityAction;
  details?: Record<string, any>;
}

/**
 * Logs a critical user activity to the mppsc_user_activities table.
 * Used for audit trails of plan changes, deletions, etc.
 */
export async function logUserActivity({
  userId,
  userEmail,
  userName,
  adminId,
  action,
  details,
}: LogActivityParams) {
  try {
    await db.insert(mppscUserActivities).values({
      id: nanoid(),
      userId: userId || null,
      userEmail,
      userName: userName || null,
      adminId: adminId || 'system',
      action,
      details: details ? JSON.stringify(details) : null,
    });
  } catch (error) {
    console.error('Failed to log user activity:', error);
    // Don't throw, logging failure shouldn't block the main action
  }
}
