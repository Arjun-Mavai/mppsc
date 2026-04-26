import { assertAdmin } from './auth';
import { redirect } from 'next/navigation';

/**
 * 🛡️ REQUIRE ADMIN — UI Route protection
 * Verifies user is admin, redirects to login or home if not.
 * Suitable for Page/Layout server components.
 */
export async function requireAdmin() {
  try {
    return await assertAdmin();
  } catch {
    // If not logged in, redirect to login is usually handled by Middleware,
    // but here we redirect to home as a safe fallback for Page components.
    redirect('/');
  }
}
