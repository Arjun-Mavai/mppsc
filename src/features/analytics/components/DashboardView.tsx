'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  BrainCircuit,
  TrendingUp,
  Trophy,
  History,
  Clock,
  ChevronRight,
  Target,
  AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';

interface DashboardViewProps {
  data: {
    overallScore: number;
    totalTests: number;
    mastery: {
      id: string;
      name: string;
      nameEn?: string;
      percentage: number;
      status: string;
      color: string;
    }[];
    aiSuggestion?: {
      en: string;
      hi: string;
    };
    recentActivity: any[];
  } | null;
  userName?: string;
}

export function DashboardView({ data, userName }: DashboardViewProps) {
  const router = useRouter();
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  if (!data) {
    return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;
  }
  console.log('data', data);
  const { overallScore, totalTests, mastery, aiSuggestion, recentActivity } = data;
  const weakAreas = mastery.filter((m) => m.percentage < 50).slice(0, 3);
  console.log('mastery', mastery);
  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      {/* Header Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="flex items-center gap-4 border-slate-200 bg-white/50 p-6 shadow-sm backdrop-blur-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Trophy size={24} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Average Score</div>
            <div className="text-3xl font-bold text-slate-900">{overallScore}%</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4 border-slate-200 bg-white/50 p-6 shadow-sm backdrop-blur-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <History size={24} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Tests Taken</div>
            <div className="text-3xl font-bold text-slate-900">{totalTests}</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4 border-slate-200 bg-white/50 p-6 shadow-sm backdrop-blur-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Strongest Unit</div>
            <div className="max-w-[150px] truncate text-xl font-bold text-slate-900">
              {mastery[0] ? (hi ? mastery[0].name : mastery[0].nameEn || mastery[0].name) : 'N/A'}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Column (2/3) */}
        <div className="space-y-8 lg:col-span-2">
          {/* Mastery Chart */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <BarChart3 className="h-5 w-5 text-indigo-600" /> Subject Mastery
              </h3>
              <Badge variant="outline" className="bg-white">
                Real-time Analysis
              </Badge>
            </div>

            <Card className="relative space-y-8 overflow-hidden rounded-3xl border-slate-800 bg-slate-900 p-8 text-white shadow-2xl">
              {/* Background Glow */}
              <div className="pointer-events-none absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[80px]"></div>

              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <div className="mb-1 font-medium text-slate-400">Overall Performance</div>
                  <div className="flex items-center gap-2 text-4xl font-bold text-white">
                    {overallScore}%
                    {totalTests > 0 && (
                      <span className="rounded bg-emerald-500/10 px-2 py-1 text-sm font-bold text-emerald-400">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative z-10 space-y-6">
                {mastery.length === 0 && (
                  <div className="text-sm text-slate-500 italic">No test data available yet.</div>
                )}
                {mastery.map((item) => (
                  <div key={item.id} className="group space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-300 transition-colors group-hover:text-white">
                        {hi ? item.name : item.nameEn || item.name}
                      </span>
                      <span
                        className={`font-bold ${
                          item.color === 'emerald'
                            ? 'text-emerald-400'
                            : item.color === 'amber'
                              ? 'text-amber-400'
                              : 'text-red-400'
                        }`}
                      >
                        {item.status} ({item.percentage}%)
                      </span>
                    </div>
                    <Progress
                      value={item.percentage}
                      className="h-3 bg-slate-800"
                      indicatorClassName={`bg-gradient-to-r ${
                        item.color === 'emerald'
                          ? 'from-emerald-500 to-emerald-400'
                          : item.color === 'amber'
                            ? 'from-amber-500 to-amber-400'
                            : 'from-red-500 to-red-400'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Test History */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <History className="h-5 w-5 text-indigo-600" /> Recent Test History
              </h3>
            </div>
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-0">
                {recentActivity.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {recentActivity.map((activity: any, idx: number) => {
                      const accuracy = Math.min(
                        100,
                        Math.round((activity.score / (activity.totalMarks || 1)) * 100)
                      );
                      return (
                        <div
                          key={idx}
                          onClick={() => router.push(`/syllabus/analytics/history/${activity.id}`)}
                          className="group flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold',
                                accuracy >= 80
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : accuracy >= 60
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-red-50 text-red-600'
                              )}
                            >
                              {accuracy}%
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                                {hi
                                  ? activity.testTitleHi || activity.testTitle || 'Practice Test'
                                  : activity.testTitle || 'Practice Test'}
                              </div>
                              <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                                <Clock size={12} />
                                {new Date(activity.createdAt).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-indigo-500" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500">No tests taken yet.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-8">
          {/* AI Coach Suggestion */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <BrainCircuit className="h-5 w-5 text-purple-600" /> Smart Coach
              </h3>
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Beta</Badge>
            </div>
            <Card className="relative overflow-hidden border-2 border-slate-800 bg-slate-950 text-white shadow-2xl">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />
              <CardContent className="relative z-10 space-y-6 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-600/20 text-indigo-400">
                  <Target className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-lg font-black tracking-tight">Coach Says:</h3>
                  <p className="text-sm leading-relaxed text-slate-400 italic">
                   &quot;{hi ? aiSuggestion?.hi : aiSuggestion?.en}&quot;
                  </p>
                </div>
                <Button
                  className="h-10 w-full rounded-xl bg-indigo-600 text-[10px] font-bold tracking-widest text-white uppercase shadow-lg shadow-indigo-600/20 hover:bg-indigo-500"
                  onClick={() => router.push('/syllabus/quiz/pyq')}
                >
                  START TEST SERIES
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Focus Areas */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <AlertCircle className="h-5 w-5 text-red-500" /> Focus Areas
              </h3>
            </div>
            <Card className="border-slate-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 shadow-sm">
              <CardContent className="space-y-5 p-6">
                {weakAreas.length > 0 ? (
                  weakAreas.map((area, idx) => (
                    <div key={idx}>
                      <div className="mb-1.5 flex justify-between text-sm font-medium">
                        <span className="text-slate-700">
                          {hi ? area.name : area.nameEn || area.name}
                        </span>
                        <span className="text-red-600">{area.percentage}% Acc.</span>
                      </div>
                      <Progress
                        value={area.percentage}
                        className="h-2 bg-white [&>div]:bg-red-500"
                      />
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-sm text-slate-500">
                    No weak areas identified yet! Keep it up!
                  </div>
                )}

                {weakAreas.length > 0 && (
                  <Button
                    variant="outline"
                    className="mt-4 w-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    onClick={() => router.push('/syllabus/quiz/units')}
                  >
                    Practice Weak Areas
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
