'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Search,
  Users,
  Activity,
  Trophy,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Medal,
  Calendar,
  Target,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import type { UserWithStats, TestAttemptDetail } from './actions';
import { getUserTestHistory } from './actions';

const TIER_COLORS: Record<string, string> = {
  pro: 'bg-amber-100 text-amber-700',
  lite: 'bg-blue-100 text-blue-700',
  free: 'bg-slate-100 text-slate-600',
};

const TEST_TYPE_COLORS: Record<string, string> = {
  FLT: 'bg-violet-100 text-violet-700',
  UNIT: 'bg-blue-100 text-blue-700',
  CSAT: 'bg-amber-100 text-amber-700',
  PYQ: 'bg-emerald-100 text-emerald-700',
  TOPIC: 'bg-rose-100 text-rose-700',
  MISC: 'bg-slate-100 text-slate-600',
};

interface Props {
  users: UserWithStats[];
}

export default function UserDashboardClient({ users }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'attempts' | 'score'>('recent');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [testHistory, setTestHistory] = useState<Record<string, TestAttemptDetail[]>>({});
  const [loadingHistory, setLoadingHistory] = useState<string | null>(null);
  const PAGE_SIZE = 30;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.totalAttempts > 0).length;
  const totalAttempts = users.reduce((s, u) => s + u.totalAttempts, 0);

  // Top 10 performers (by avg score, min 3 attempts)
  const topPerformers = [...users]
    .filter((u) => u.totalAttempts >= 3 && u.avgScore != null && u.avgScore > 0)
    .sort((a, b) => (b.avgScore ?? 0) - (a.avgScore ?? 0))
    .slice(0, 10);

  // Filter + Sort
  const filtered = users
    .filter((u) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'attempts') return b.totalAttempts - a.totalAttempts;
      if (sortBy === 'score') return (b.avgScore ?? -1) - (a.avgScore ?? -1);
      // recent — by lastActiveAt, nulls last
      const aTime = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
      const bTime = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
      return bTime - aTime;
    });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Load test history when user is expanded
  const handleExpand = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }

    setExpandedUser(userId);

    // Load history if not already loaded
    if (!testHistory[userId]) {
      setLoadingHistory(userId);
      try {
        const history = await getUserTestHistory(userId);
        setTestHistory((prev) => ({ ...prev, [userId]: history }));
      } catch (error) {
        console.error('Failed to load test history', error);
      } finally {
        setLoadingHistory(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-black text-slate-900 md:text-2xl">
              <Users className="h-5 w-5 text-slate-700 md:h-6 md:w-6" />
              Student Dashboard
            </h1>
            <p className="text-xs text-slate-500 md:text-sm">
              Performance tracking • Test history • Insights
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard
            icon={<Users className="h-4 w-4" />}
            label="Students"
            value={totalUsers}
            color="blue"
          />
          <SummaryCard
            icon={<Activity className="h-4 w-4" />}
            label="Active"
            value={activeUsers}
            color="emerald"
          />
          <SummaryCard
            icon={<Trophy className="h-4 w-4" />}
            label="Tests"
            value={totalAttempts}
            color="violet"
          />
        </div>

        {/* Top Performers Section */}
        {topPerformers.length > 0 && (
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-white">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-black uppercase tracking-wide text-amber-800">
                  Top Performers
                </h2>
                <span className="text-[10px] text-amber-600">(min 3 tests)</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {topPerformers.map((user, idx) => (
                  <div
                    key={user.id}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border p-2.5 transition-all hover:shadow-sm',
                      idx === 0
                        ? 'border-amber-300 bg-amber-100/50'
                        : idx === 1
                          ? 'border-slate-300 bg-slate-100/50'
                          : idx === 2
                            ? 'border-orange-200 bg-orange-50/50'
                            : 'border-slate-100 bg-white'
                    )}
                  >
                    {/* Rank */}
                    <div
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black',
                        idx === 0
                          ? 'bg-amber-500 text-white'
                          : idx === 1
                            ? 'bg-slate-400 text-white'
                            : idx === 2
                              ? 'bg-orange-400 text-white'
                              : 'bg-slate-200 text-slate-600'
                      )}
                    >
                      {idx + 1}
                    </div>
                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-800">
                        {user.name || user.email.split('@')[0]}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-emerald-600">
                          {user.avgScore?.toFixed(0)}%
                        </span>
                        <span className="text-[10px] text-slate-400">
                          • {user.totalAttempts} tests
                        </span>
                      </div>
                    </div>
                    {idx < 3 && <Medal className="h-4 w-4 text-amber-500" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search + Sort */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
            />
          </div>
          <div className="flex gap-2">
            {(['recent', 'attempts', 'score'] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={sortBy === s ? 'default' : 'outline'}
                onClick={() => setSortBy(s)}
                className="text-xs"
              >
                {s === 'recent' ? '🕐 Recent' : s === 'attempts' ? '🔢 Tests' : '🏆 Score'}
              </Button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400">{filtered.length} students found</p>

        {/* User List */}
        <div className="space-y-2">
          {visible.map((user) => {
            const isExpanded = expandedUser === user.id;
            const userHistory = testHistory[user.id] || [];
            const isLoading = loadingHistory === user.id;

            return (
              <Card key={user.id} className="border transition-all hover:shadow-sm">
                <CardContent className="p-3 md:p-4">
                  {/* Main Row */}
                  <div
                    className="flex cursor-pointer items-center gap-3 md:gap-4"
                    onClick={() => handleExpand(user.id)}
                  >
                    {/* Avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600 md:h-10 md:w-10">
                      {(user.name?.[0] || user.email[0]).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="truncate text-sm font-bold text-slate-900">
                          {user.name || 'No Name'}
                        </h3>
                        <Badge className={cn('text-[9px]', TIER_COLORS[user.planTier || 'free'])}>
                          {user.planTier || 'free'}
                        </Badge>
                        {user.renewalCount && user.renewalCount > 0 ? (
                          <Badge className="bg-emerald-100 text-emerald-800 text-[9px] font-black border border-emerald-300">
                            🔁 Renewed ({user.renewalCount}x)
                          </Badge>
                        ) : null}
                        {user.accessExpiresAt ? (
                          new Date(user.accessExpiresAt) < new Date() ? (
                            <Badge className="bg-rose-100 text-rose-700 text-[9px] font-bold">
                              🔴 Expired
                            </Badge>
                          ) : (Math.ceil((new Date(user.accessExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 10) ? (
                            <Badge className="bg-amber-100 text-amber-800 text-[9px] font-bold">
                              🟠 Expiring ({Math.ceil((new Date(user.accessExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d left)
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-700 text-[9px] font-semibold">
                              🟢 Active
                            </Badge>
                          )
                        ) : null}
                      </div>
                      <p className="truncate text-[11px] text-slate-400">{user.email}</p>
                    </div>

                    {/* Quick Stats - Desktop */}
                    <div className="hidden shrink-0 items-center gap-3 text-xs sm:flex">
                      <div className="flex items-center gap-1 font-bold text-slate-700">
                        <Target className="h-3.5 w-3.5 text-slate-400" />
                        {user.totalAttempts}
                      </div>
                      {user.avgScore != null && user.avgScore > 0 && (
                        <div
                          className={cn(
                            'rounded-md px-2 py-0.5 text-xs font-bold',
                            user.avgScore >= 70
                              ? 'bg-emerald-100 text-emerald-700'
                              : user.avgScore >= 50
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-100 text-rose-700'
                          )}
                        >
                          {user.avgScore.toFixed(0)}%
                        </div>
                      )}
                      {user.lastActiveAt && (
                        <span className="text-[11px] text-slate-400">
                          {formatSmartDate(new Date(user.lastActiveAt))}
                        </span>
                      )}
                    </div>

                    {/* Quick Stats - Mobile */}
                    <div className="flex shrink-0 items-center gap-2 text-xs sm:hidden">
                      <span className="font-bold text-slate-600">{user.totalAttempts}</span>
                      {user.avgScore != null && user.avgScore > 0 && (
                        <span
                          className={cn(
                            'font-bold',
                            user.avgScore >= 70
                              ? 'text-emerald-600'
                              : user.avgScore >= 50
                                ? 'text-amber-600'
                                : 'text-rose-600'
                          )}
                        >
                          {user.avgScore.toFixed(0)}%
                        </span>
                      )}
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                      {/* Category Stats */}
                      <div className="grid grid-cols-5 gap-2">
                        <CategoryStat label="FLT" count={user.fltCount} emoji="📝" color="violet" />
                        <CategoryStat label="Unit" count={user.unitCount} emoji="📚" color="blue" />
                        <CategoryStat label="CSAT" count={user.csatCount} emoji="🧠" color="amber" />
                        <CategoryStat label="PYQ" count={user.pyqCount} emoji="📜" color="emerald" />
                        <CategoryStat label="Topic" count={user.topicCount} emoji="🎯" color="rose" />
                      </div>

                      {/* Quick Info */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                        <span>
                          <strong className="text-slate-700">
                            {user.completedAttempts}/{user.totalAttempts}
                          </strong>{' '}
                          completed
                        </span>
                        <span>
                          Joined{' '}
                          <strong className="text-slate-700">
                            {user.createdAt && isValidDate(new Date(user.createdAt))
                              ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'N/A'}
                          </strong>
                        </span>
                        {user.accessExpiresAt && isValidDate(new Date(user.accessExpiresAt)) && (
                          <span>
                            Expires{' '}
                            <strong className={cn(
                              new Date(user.accessExpiresAt) < new Date() ? 'text-rose-600' : 'text-emerald-600'
                            )}>
                              {new Date(user.accessExpiresAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </strong>
                          </span>
                        )}
                        {user.lastActiveAt && isValidDate(new Date(user.lastActiveAt)) && (
                          <span>
                            Active{' '}
                            <strong className="text-slate-700">
                              {formatSmartDate(new Date(user.lastActiveAt))}
                            </strong>
                          </span>
                        )}
                      </div>

                      {/* Test History Section */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50/50">
                        <div className="flex items-center justify-between rounded-t-xl border-b border-slate-200 bg-white px-3 py-2.5 md:px-4">
                          <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-700">
                            <FileText className="h-3.5 w-3.5 text-indigo-600" />
                            Test History
                          </h4>
                          <span className="text-[10px] text-slate-500">
                            {userHistory.length} tests
                          </span>
                        </div>

                        <div className="max-h-[320px] overflow-y-auto p-2 md:p-3">
                          {isLoading ? (
                            <div className="flex items-center justify-center py-8 text-slate-400">
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Loading...
                            </div>
                          ) : userHistory.length === 0 ? (
                            <div className="py-8 text-center text-sm text-slate-400">
                              No tests attempted yet
                            </div>
                          ) : (
                            <div className="space-y-2 md:space-y-1.5">
                              {userHistory.map((test) => (
                                <TestHistoryRow key={test.id} test={test} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {hasMore && (
          <div className="pt-2 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
            >
              Load More ({filtered.length - visibleCount} remaining)
            </Button>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400">No students found.</div>
        )}
      </div>
    </div>
  );
}

function TestHistoryRow({ test }: { test: TestAttemptDetail }) {
  const startDate = new Date(test.startTime);
  const timeStr = startDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const dateStr = startDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

  const rightMarks = test.correctAnswers * 3;
  const wrongMarks = test.wrongAnswers * 1;

  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3 transition-colors hover:border-slate-200 sm:p-3">
      {/* 📱 Mobile Layout - Detailed Breakdown */}
      <div className="flex flex-col gap-3 sm:hidden">
        {/* Top: Title & Date-Time */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-50 pb-2">
          <div className="min-w-0">
            <p className="font-black text-slate-800 text-sm leading-tight mb-1" title={test.testTitle}>
              {test.testTitle}
            </p>
            <div className="flex items-center gap-1.5">
              <Badge className={cn('h-4 text-[9px] px-1', TEST_TYPE_COLORS[test.testType])}>
                {test.testType}
              </Badge>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                {test.totalQuestions} Qs • {Math.floor((new Date(test.endTime || '').getTime() - new Date(test.startTime).getTime()) / 60000)}m
              </span>
            </div>
          </div>
          <div className="shrink-0 text-right bg-slate-50 px-2 py-1 rounded border border-slate-100">
            <div className="text-[9px] font-black text-slate-700 uppercase">{test.dayOfWeek}</div>
            <div className="text-[10px] font-bold text-indigo-600">{dateStr}</div>
            <div className="text-[8px] text-slate-400 font-medium">{timeStr}</div>
          </div>
        </div>

        {/* Stats Grid: Right, Wrong, Skip, Score */}
        <div className="grid grid-cols-4 gap-1.5">
          <div className="flex flex-col items-center rounded-lg bg-emerald-50/50 p-1.5 border border-emerald-100/50">
            <span className="text-[7px] text-emerald-600 font-black uppercase">Right</span>
            <span className="text-xs font-black text-emerald-700">{test.correctAnswers}</span>
            <span className="text-[7px] text-emerald-500/70 font-bold">+{rightMarks}</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-rose-50/50 p-1.5 border border-rose-100/50">
            <span className="text-[7px] text-rose-600 font-black uppercase">Wrong</span>
            <span className="text-xs font-black text-rose-700">{test.wrongAnswers}</span>
            <span className="text-[7px] text-rose-500/70 font-bold">-{wrongMarks}</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-slate-50 p-1.5 border border-slate-100">
            <span className="text-[7px] text-slate-500 font-black uppercase">Skip</span>
            <span className="text-xs font-black text-slate-600">{test.skippedAnswers}</span>
            <span className="text-[7px] text-slate-400 font-bold">0</span>
          </div>
          <div className={cn(
            "flex flex-col items-center justify-center rounded-lg p-1.5 border bg-white shadow-sm",
            test.netScore > 0 
              ? "border-emerald-100 text-emerald-700" 
              : test.netScore < 0
              ? "border-rose-100 text-rose-700"
              : "border-slate-100 text-slate-600"
          )}>
            <span className="text-[7px] font-black uppercase opacity-60 text-slate-400">Score</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-black">{test.netScore > 0 ? '+' : ''}{test.netScore}</span>
              <span className="text-[8px] opacity-70">/{test.maxMarks}</span>
            </div>
            <span className="text-[7px] font-bold opacity-60 text-slate-400">
              {rightMarks}-{wrongMarks}={test.netScore}
            </span>
          </div>
        </div>
      </div>

      {/* 💻 Desktop Layout - Professional Table Row */}
      <div className="hidden sm:flex items-center gap-3">
        {/* Status */}
        <div className="shrink-0">
          {test.isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <XCircle className="h-4 w-4 text-slate-300" />
          )}
        </div>

        {/* Test Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-800 mb-1" title={test.testTitle}>
            {test.testTitle}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className={cn('h-4 text-[9px]', TEST_TYPE_COLORS[test.testType])}>
              {test.testType}
            </Badge>
            <span className="text-[10px] text-slate-400 font-medium">
              {test.totalQuestions} Qs
            </span>
            {test.isCompleted && test.endTime && (
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                ⏱️ {Math.floor((new Date(test.endTime).getTime() - new Date(test.startTime).getTime()) / 60000)}m
              </span>
            )}
          </div>
        </div>

        {/* Correct/Wrong/Skipped Counters */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Right (+3)</span>
            <span className="flex items-center justify-center min-w-[36px] rounded bg-white px-2 py-1 text-xs font-black text-emerald-700 border border-slate-100 shadow-sm">
              {test.correctAnswers}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Wrong (-1)</span>
            <span className="flex items-center justify-center min-w-[36px] rounded bg-white px-2 py-1 text-xs font-black text-rose-700 border border-slate-100 shadow-sm">
              {test.wrongAnswers}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Skip (0)</span>
            <span className="flex items-center justify-center min-w-[36px] rounded bg-white px-2 py-1 text-xs font-black text-slate-500 border border-slate-100 shadow-sm">
              {test.skippedAnswers}
            </span>
          </div>
        </div>

        {/* Final Score Badge - CLEAN WHITE VERSION */}
        <div className="shrink-0 ml-2">
          <div
            className={cn(
              'flex flex-col items-center justify-center min-w-[90px] rounded-xl px-3 py-2 text-[11px] font-black shadow-sm border bg-white',
              test.netScore > 0
                ? 'border-emerald-100 text-emerald-700'
                : test.netScore < 0
                ? 'border-rose-100 text-rose-700'
                : 'border-slate-100 text-slate-600'
            )}
            title={`Math: (${test.correctAnswers} × 3) - (${test.wrongAnswers} × 1) = ${test.netScore}`}
          >
            <div className="flex items-baseline gap-0.5">
              <span className="text-[9px] opacity-40 mr-0.5 text-slate-400">Score:</span>
              <span className="text-sm">{test.netScore > 0 ? '+' : ''}{test.netScore}</span>
              <span className="text-[9px] opacity-40 text-slate-400">/{test.maxMarks}</span>
            </div>
            <span className="text-[8px] font-bold opacity-40 tracking-tight text-slate-400">
              {rightMarks} - {wrongMarks} = {test.netScore}
            </span>
          </div>
        </div>

        {/* Date & Time Info */}
        <div className="shrink-0 text-right min-w-[80px] border-l border-slate-100 pl-3 ml-1">
          <div className="text-[10px] font-black text-slate-800 uppercase tracking-tight">
            {test.dayOfWeek}
          </div>
          <div className="text-[10px] font-bold text-slate-600">
            {dateStr}
          </div>
          <div className="text-[9px] font-medium text-slate-400 mt-0.5">
            {timeStr}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <Card className="border-slate-100">
      <CardContent className="flex items-center gap-2 p-3 md:gap-3 md:p-4">
        <div className={cn('rounded-full p-2', colors[color])}>{icon}</div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 md:text-[10px]">
            {label}
          </p>
          <p className="text-lg font-black text-slate-900 md:text-xl">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryStat({
  label,
  count,
  emoji,
  color,
}: {
  label: string;
  count: number;
  emoji: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    violet: 'bg-violet-50 border-violet-100',
    blue: 'bg-blue-50 border-blue-100',
    amber: 'bg-amber-50 border-amber-100',
    emerald: 'bg-emerald-50 border-emerald-100',
    rose: 'bg-rose-50 border-rose-100',
  };
  return (
    <div className={cn('rounded-xl border p-2 text-center md:p-3', colors[color])}>
      <div className="text-sm md:text-lg">{emoji}</div>
      <div className="text-base font-black text-slate-900 md:text-lg">{count}</div>
      <div className="text-[8px] font-bold uppercase text-slate-500 md:text-[10px]">{label}</div>
    </div>
  );
}

/**
 * Smart date formatter - shows meaningful relative/absolute dates
 */
function formatSmartDate(date: Date): string {
  if (!isValidDate(date)) return 'N/A';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Today/Yesterday
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  // Within last 7 days - show day name
  if (diffDays < 7) {
    return date.toLocaleDateString('en-IN', { weekday: 'short' });
  }

  // Within last 30 days - show "X days ago"
  if (diffDays < 30) {
    return `${diffDays}d ago`;
  }

  // Within same year - show date without year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  // Older - show full date
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  });
}

/**
 * Check if date is valid (not 1970, not NaN)
 */
function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime()) && date.getFullYear() > 1980;
}
