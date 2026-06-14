'use client';

import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  IndianRupee,
  TrendingUp,
  Users,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  Crown,
  Zap,
  Copy,
  BookOpen,
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  planTier: string | null;
  status: string;
  currency: string;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
  userPhone: string | null;
}

interface Stats {
  total: number;
  totalRevenue: number;
  liteCount: number;
  proCount: number;
  mainsCount: number;
  comboCount: number;
  liteRevenue: number;
  proRevenue: number;
  mainsRevenue: number;
  comboRevenue: number;
  today: number;
  todayRevenue: number;
  week: number;
  weekRevenue: number;
  month: number;
  monthRevenue: number;
}

interface DailyData {
  date: string;
  label: string;
  count: number;
  revenue: number;
  lite: number;
  pro: number;
  mains: number;
  combo: number;
}

type FilterType = 'all' | 'today' | 'week' | 'month';

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default function PaymentsPage() {
  const [data, setData] = useState<{
    stats: Stats;
    dailyChart: DailyData[];
    payments: PaymentRecord[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('filter', filter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/payments?${params}`);
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchData(), 400);
    return () => clearTimeout(t);
  }, [search]);

  if (loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!data) return <div className="p-6 text-red-500">Failed to load payment data.</div>;

  const { stats, dailyChart, payments } = data;
  const maxChartVal = Math.max(...dailyChart.map((d) => d.count), 1);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 font-sans md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            Payment Analytics
          </h1>
          <p className="text-sm text-slate-500">Real-time revenue & order tracking</p>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="Total Revenue"
            value={formatRupees(stats.totalRevenue)}
            sub={`${stats.total} orders`}
            icon={<IndianRupee className="h-4 w-4" />}
            color="emerald"
          />
          <MetricCard
            label="Today"
            value={formatRupees(stats.todayRevenue)}
            sub={`${stats.today} orders`}
            icon={<TrendingUp className="h-4 w-4" />}
            color="blue"
          />
          <MetricCard
            label="This Week"
            value={formatRupees(stats.weekRevenue)}
            sub={`${stats.week} orders`}
            icon={<Calendar className="h-4 w-4" />}
            color="violet"
          />
          <MetricCard
            label="This Month"
            value={formatRupees(stats.monthRevenue)}
            sub={`${stats.month} orders`}
            icon={<BarChart3 className="h-4 w-4" />}
            color="amber"
          />
        </div>

        {/* ── Plan Breakdown ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <PlanCard title="Pre (PRO)" count={stats.proCount} revenue={stats.proRevenue} total={stats.total} color="amber" icon={<Crown className="h-5 w-5 text-amber-600" />} />
          <PlanCard title="Mains" count={stats.mainsCount} revenue={stats.mainsRevenue} total={stats.total} color="emerald" icon={<BookOpen className="h-5 w-5 text-emerald-600" />} />
          <PlanCard title="Combo (PRO+)" count={stats.comboCount} revenue={stats.comboRevenue} total={stats.total} color="violet" icon={<Crown className="h-5 w-5 text-violet-600" />} />
          <PlanCard title="Lite (Legacy)" count={stats.liteCount} revenue={stats.liteRevenue} total={stats.total} color="blue" icon={<Zap className="h-5 w-5 text-blue-600" />} />
        </div>

        {/* ── Daily Chart (last 30 days) ── */}
        <Card className="border-slate-200">
          <CardContent className="p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Daily Orders</h3>
                <p className="text-[11px] text-slate-400">Last 30 days</p>
              </div>
              <div className="flex gap-3 text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Pro
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Mains
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-violet-500" /> Pro+
                </span>
              </div>
            </div>
            {/* Bar chart */}
            <div className="flex h-32 items-end gap-[3px] overflow-x-auto pb-1 md:h-40">
              {dailyChart.map((d) => {
                const totalH = (d.count / maxChartVal) * 100;
                const liteH = d.count > 0 ? (d.lite / d.count) * totalH : 0;
                const proH = d.count > 0 ? (d.pro / d.count) * totalH : 0;
                const mainsH = d.count > 0 ? (d.mains / d.count) * totalH : 0;
                const comboH = totalH - liteH - proH - mainsH;
                return (
                  <div
                    key={d.date}
                    className="group relative flex min-w-[8px] flex-1 flex-col items-center gap-0.5"
                  >
                    {/* Tooltip */}
                    <div className="pointer-events-none absolute -top-16 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-slate-900 px-2 py-1.5 text-[10px] whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      <p className="font-bold">{d.label}</p>
                      <p>
                        {d.count} orders • ₹{(d.revenue / 100).toLocaleString('en-IN')}
                      </p>
                      {d.pro > 0 && <p className="text-amber-300">Pro: {d.pro}</p>}
                      {d.mains > 0 && <p className="text-emerald-300">Mains: {d.mains}</p>}
                      {d.combo > 0 && <p className="text-violet-300">Pro+: {d.combo}</p>}
                      {d.lite > 0 && <p className="text-blue-300">Lite: {d.lite}</p>}
                    </div>
                    {/* Bar */}
                    <div className="flex w-full flex-col justify-end" style={{ height: '100%' }}>
                      {d.count > 0 ? (
                        <>
                          <div
                            className="w-full rounded-t-sm bg-violet-400 transition-all"
                            style={{ height: `${comboH}%`, minHeight: comboH > 0 ? 2 : 0 }}
                          />
                          <div
                            className="w-full bg-emerald-400 transition-all"
                            style={{ height: `${mainsH}%`, minHeight: mainsH > 0 ? 2 : 0 }}
                          />
                          <div
                            className="w-full rounded-b-sm bg-amber-400 transition-all"
                            style={{ height: `${proH}%`, minHeight: proH > 0 ? 2 : 0 }}
                          />
                        </>
                      ) : (
                        <div className="w-full rounded-sm bg-slate-100" style={{ height: '4px' }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* X-axis labels (show every 5th) */}
            <div className="mt-1 flex gap-[3px]">
              {dailyChart.map((d, i) => (
                <div key={d.date} className="min-w-[8px] flex-1 text-center">
                  {i % 5 === 0 && (
                    <span className="text-[8px] text-slate-400">{d.label.split(' ')[0]}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Filters + Search ── */}
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="flex gap-1.5 rounded-lg border bg-white p-1">
            {(['all', 'today', 'week', 'month'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  filter === f
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                {f === 'all'
                  ? 'All'
                  : f === 'today'
                    ? 'Today'
                    : f === 'week'
                      ? '7 Days'
                      : '30 Days'}
              </button>
            ))}
          </div>
          <div className="relative max-w-sm flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search name, email, phone, payment ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 bg-white pl-9 text-sm"
            />
          </div>
          <span className="self-center text-xs text-slate-400">
            {payments.length} result{payments.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Payments Table ── */}
        <Card className="overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-slate-600 uppercase">
                    User
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-bold tracking-wider text-slate-600 uppercase sm:table-cell">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold tracking-wider text-slate-600 uppercase">
                    Amount
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-bold tracking-wider text-slate-600 uppercase md:table-cell">
                    Payment ID
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold tracking-wider text-slate-600 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      {search ? 'No payments match your search' : 'No payments yet'}
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-50 transition-colors hover:bg-slate-50/50"
                    >
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="max-w-[180px] truncate text-sm font-semibold text-slate-900">
                            {p.userName || 'Unknown'}
                          </p>
                          <p className="max-w-[180px] truncate text-[11px] text-slate-400">
                            {p.userEmail}
                          </p>
                          {p.userPhone && (
                            <p className="text-[10px] text-slate-300 sm:hidden">{p.userPhone}</p>
                          )}
                          {/* Mobile-only plan badge */}
                          <div className="mt-1 sm:hidden">
                            <PlanBadge plan={p.planTier} />
                          </div>
                        </div>
                      </td>
                      {/* Plan */}
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <PlanBadge plan={p.planTier} />
                      </td>
                      {/* Amount */}
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-slate-900">₹{p.amount}</span>
                      </td>
                      {/* Payment ID */}
                      <td className="hidden px-4 py-3 md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-medium text-slate-500 select-all">
                            {p.paymentId || '—'}
                          </span>
                          {p.paymentId && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(p.paymentId);
                                toast.success('Payment ID copied');
                              }}
                              className="text-slate-300 hover:text-slate-600"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3 text-right">
                        <div className="text-xs font-semibold whitespace-nowrap text-slate-600">
                          {new Date(p.createdAt).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(p.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Sub-components ──

function MetricCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <Card className="border-slate-100 shadow-sm">
      <CardContent className="p-3 md:p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className={`rounded-lg p-1.5 ${colors[color] || colors.blue}`}>{icon}</div>
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {label}
          </span>
        </div>
        <p className="text-xl leading-none font-black text-slate-900 md:text-2xl">{value}</p>
        <p className="mt-1 text-[11px] text-slate-400">{sub}</p>
      </CardContent>
    </Card>
  );
}

function PlanCard({
  title,
  count,
  revenue,
  total,
  color,
  icon,
}: {
  title: string;
  count: number;
  revenue: number;
  total: number;
  color: string;
  icon: React.ReactNode;
}) {
  const bgColors: Record<string, string> = {
    emerald: 'border-emerald-100 bg-emerald-50/30',
    amber: 'border-amber-100 bg-amber-50/30',
    violet: 'border-violet-100 bg-violet-50/30',
    blue: 'border-blue-100 bg-blue-50/30',
    purple: 'border-purple-100 bg-purple-50/30',
  };
  const iconColors: Record<string, string> = {
    emerald: 'bg-emerald-100',
    amber: 'bg-amber-100',
    violet: 'bg-violet-100',
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
  };
  const textColors: Record<string, string> = {
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    violet: 'text-violet-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
  };

  return (
    <Card className={bgColors[color] || bgColors.blue}>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconColors[color] || iconColors.blue}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-bold uppercase ${textColors[color] || textColors.blue}`}>{title}</p>
          <p className="text-lg font-black text-slate-900">{count}</p>
          <p className="text-[11px] text-slate-500">{formatRupees(revenue)}</p>
        </div>
        {total > 0 && (
          <div className="mt-2 text-left sm:ml-auto sm:mt-0 sm:text-right">
            <span className={`text-sm font-bold ${textColors[color] || textColors.blue}`}>
              {Math.round((count / total) * 100)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PlanBadge({ plan }: { plan: string | null }) {
  if (plan === 'combo') {
    return (
      <Badge className="border-violet-200 bg-violet-100 px-1.5 py-0 text-[10px] font-bold text-violet-700 hover:bg-violet-100">
        <Crown className="mr-0.5 h-2.5 w-2.5" /> PRO+
      </Badge>
    );
  }
  if (plan === 'mains') {
    return (
      <Badge className="border-emerald-200 bg-emerald-100 px-1.5 py-0 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100">
        <BookOpen className="mr-0.5 h-2.5 w-2.5" /> MAINS
      </Badge>
    );
  }
  if (plan === 'pro') {
    return (
      <Badge className="border-amber-200 bg-amber-100 px-1.5 py-0 text-[10px] font-bold text-amber-700 hover:bg-amber-100">
        <Crown className="mr-0.5 h-2.5 w-2.5" /> PRO
      </Badge>
    );
  }
  return (
    <Badge className="border-blue-200 bg-blue-100 px-1.5 py-0 text-[10px] font-bold text-blue-700 hover:bg-blue-100">
      <Zap className="mr-0.5 h-2.5 w-2.5" /> LITE
    </Badge>
  );
}
