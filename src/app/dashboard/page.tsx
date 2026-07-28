import { Suspense } from 'react';
import { redirect } from 'next/navigation';

// Dashboard is user-specific — must NEVER serve cached/stale page
export const dynamic = 'force-dynamic';

import { getUserAnalytics } from '@/features/analytics/actions';
import { syllabusData } from '@/data/syllabusData';
import { verifyAuth } from '@/lib/auth';
import { getSubscriptionStatus } from '@/lib/subscription-status';
import { getUserSyllabusProgress } from '@/features/syllabus/actions/revision';
import { DashboardClient } from './components/DashboardClient';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * 📊 Dashboard Page
 * Optimized for maximum perceived speed using React Suspense + Streaming.
 * The shell (Navbar, Sidebar) loads instantly, while heavy analytics
 * data streams in as it's ready.
 */
export default async function DashboardPage() {
  const user = await verifyAuth();

  if (!user) {
    redirect('/login');
  }

  // 🛡️ Guard: Expired users are redirected directly to /renew
  const statusInfo = getSubscriptionStatus(user);
  if (statusInfo.requiresRenewalRedirect || statusInfo.isExpired) {
    redirect('/renew');
  }

  // Total topics calculation (static data, extremely fast)
  const totalTopics = Object.values(syllabusData.units).reduce((acc: number, unit: any) => {
    return acc + (unit.topics?.length || 0);
  }, 0);

  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<DashboardSkeleton user={user} totalTopics={totalTopics} />}>
        <DashboardDataWrapper user={user} totalTopics={totalTopics} />
      </Suspense>
    </main>
  );
}

import { hasUnreadDoubts } from '@/app/profile/actions';

/** 🏗️ Data Wrapper to handle concurrent async fetches within Suspense */
async function DashboardDataWrapper({ user, totalTopics }: { user: any, totalTopics: number }) {
  // Concurrent fetch without blocking the shell
  const [analyticsData, syllabusProgress, unreadDoubts] = await Promise.all([
    getUserAnalytics(user.id),
    getUserSyllabusProgress(),
    hasUnreadDoubts()
  ]);

  return (
    <DashboardClient 
      user={{ 
        name: user.name, 
        planTier: user.planTier, 
        isSubscribed: user.isSubscribed, 
        accessGrants: user.accessGrants 
      }}
      analyticsData={analyticsData}
      syllabusProgress={syllabusProgress}
      totalTopics={totalTopics}
      hasUnreadDoubts={unreadDoubts}
    />
  );
}

/** 🦴 Dashboard Loading State (Skeleton) */
function DashboardSkeleton({ user, totalTopics }: { user: any, totalTopics: number }) {
  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-48" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[400px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    </div>
  );
}
