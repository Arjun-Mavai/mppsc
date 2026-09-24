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
  const cookieStore = await cookies();
  const { extractAuthToken } = await import('@/lib/auth-constants');
  const token = extractAuthToken(cookieStore);
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!isAdminTokenPayload(decoded)) return null;

  const user = await db.query.mppscUsers.findFirst({
    where: eq(mppscUsers.id, decoded.userId),
  });

  if (!user || user.role !== 'admin') return null;
  return user;
}

export const slugifyTopic = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
