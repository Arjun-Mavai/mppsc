import { cookies } from 'next/headers';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

interface AdminTokenPayload {
  userId: string;
}

const isAdminTokenPayload = (value: unknown): value is AdminTokenPayload => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'userId' in value &&
    typeof (value as { userId?: unknown }).userId === 'string'
  );
};

export async function getAdminUserFromRequest() {
  const { verifyAdminApi } = await import('@/lib/auth');
  return verifyAdminApi();
}

export const slugifyTopic = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
