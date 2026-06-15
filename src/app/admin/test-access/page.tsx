import { requireAdmin } from '@/lib/auth-admin';
import TestAccessClient from './TestAccessClient';
import { getAllTestsForAdmin, getAttemptLimits } from './actions';

// Server Component — Admin only, no caching
export const dynamic = 'force-dynamic';

export default async function TestAccessPage() {
  try {
    await requireAdmin();
    const [tests, attemptLimits] = await Promise.all([getAllTestsForAdmin(), getAttemptLimits()]);
    return <TestAccessClient initialTests={tests} initialAttemptLimits={attemptLimits} />;
  } catch (error: any) {
    console.error("TestAccessPage Error:", error);
    return <div>Error loading test access: {error.message || "Unknown error"}</div>;
  }
}
