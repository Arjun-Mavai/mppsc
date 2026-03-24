import { redirect } from 'next/navigation';

// Dashboard is user-specific — must NEVER serve cached/stale page
export const dynamic = 'force-dynamic';
import { getUserAnalytics } from '@/features/analytics/actions';

import AnalyticsDashboardWrapper from '@/app/syllabus/analytics/AnalyticsDashboardWrapper';
import { Badge } from '@/components/ui/badge';
import { syllabusData } from '@/data/syllabusData';
import { verifyAuth } from '@/lib/auth';
import { getUserSyllabusProgress } from '@/features/syllabus/actions/revision';
import { SyllabusProgressWidget } from '@/features/analytics/components/SyllabusProgressWidget';

export default async function DashboardPage() {
  const user = await verifyAuth();

  if (!user) {
    redirect('/login');
  }

  // Fetch Analytics
  const analyticsData = await getUserAnalytics(user.id);
  const syllabusProgress = await getUserSyllabusProgress();
  // Calculate Total Topics from Syllabus Data
  const totalTopics = Object.values(syllabusData.units).reduce((acc: number, unit: any) => {
    return acc + (unit.topics?.length || 0);
  }, 0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafbfc] pt-24 pb-20 font-sans">
      {/* 🎭 PREMIUM BACKGROUND BLURS */}
      <div className="pointer-events-none absolute top-0 left-0 h-[500px] w-full bg-gradient-to-b from-slate-100/30 to-transparent" />
      <div className="pointer-events-none absolute top-[-100px] right-[-100px] h-[500px] w-[500px] rounded-full bg-indigo-50/40 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[20%] left-[-150px] h-[400px] w-[400px] rounded-full bg-emerald-50/30 blur-[100px]" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 px-6">
        {/* Header Section */}
        <div className="mb-4 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
                Welcome back, {user.name?.split(' ')[0]}! 👋
              </h1>
            </div>
            <p className="max-w-2xl text-lg font-medium text-slate-500 md:text-xl">
              Here is your performance snapshot and syllabus progress overview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user.planTier === 'pro' ? (
              <div className="group relative flex items-center gap-3 overflow-hidden rounded-full p-[1px] shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all sm:px-0">
                {/* 🌈 ANIMATED MULTI-COLOR GRADIENT BORDER */}
                <div className="absolute inset-0 animate-[shimmer_3s_linear_infinite] bg-gradient-to-r from-red-500 via-green-500 via-pink-500 to-yellow-500" />
                
                <div className="relative flex items-center gap-3 rounded-full bg-white/90 px-5 py-2 text-[10px] font-black tracking-[0.2em] text-slate-900 uppercase backdrop-blur-md sm:px-6">
                  <div className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                  </div>
                  <span className="relative z-10 drop-shadow-sm">PRO Member</span>
                </div>
              </div>
            ) : user.planTier === 'lite' ? (
              <div className="flex items-center gap-2.5 rounded-full border border-emerald-500/20 bg-emerald-50/50 px-5 py-2 text-[10px] font-black tracking-widest text-emerald-600 uppercase backdrop-blur-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                LITE Member
              </div>
            ) : (
              <Badge
                variant="outline"
                className="rounded-xl border-slate-200 bg-white/50 px-4 py-1.5 text-xs font-bold text-slate-400 backdrop-blur-sm"
              >
                Free Plan
              </Badge>
            )}
          </div>
        </div>

        {/* Dashboard Content — Full Analytics view */}
        <div className="w-full">
          <AnalyticsDashboardWrapper analytics={analyticsData} />
        </div>

        {/* Syllabus Progress — Side by side or stacked based on importance */}
        <div className="w-full">
          <SyllabusProgressWidget data={syllabusProgress} totalTopics={totalTopics} />
        </div>
      </div>
    </div>
  );
}
