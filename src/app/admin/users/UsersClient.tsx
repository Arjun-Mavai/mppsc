'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Search,
  RefreshCw,
  Users,
  Crown,
  Zap,
  Clock,
  AlertTriangle,
  Shield,
  Pencil,
  Gift,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Key,
  Mail,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { generateManualPasswordLink, testResendEmail } from '@/actions/admin-actions';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  planTier: string | null;
  isSubscribed: boolean | null;
  isActive: boolean | null;
  createdAt: string | null;
  deletedAt: string | null;
  accessExpiresAt: string | null;
  phone: string | null;
  metadata: any;
  previousUserId: string | null;
  examType: 'upsc' | 'mppsc' | 'all' | 'mppolice';
}

interface Stats {
  total: number;
  active: number;
  expired: number;
  deleted: number;
  inactive: number;
  free: number;
  lite: number;
  pro: number;
  migrations: number;
}

interface ActivityLog {
  id: string;
  userId?: string; // Add this
  userEmail: string;
  userName: string | null;
  action: 'PLAN_CHANGE' | 'DELETE' | 'GRANT' | 'UPDATE' | 'LOGIN';
  details: string | null; // JSON string
  createdAt: string;
  adminId: string;
}

type TabFilter = 'all' | 'active' | 'expired' | 'inactive' | 'deleted' | 'logs';

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<TabFilter>('all');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: '',
    planTier: '' as string,
    accessMonths: '',
  });
  const [saving, setSaving] = useState(false);
  const [showGrant, setShowGrant] = useState(false);
  const [grantForm, setGrantForm] = useState({
    name: '',
    email: '',
    phone: '',
    planTier: 'pro' as 'lite' | 'pro',
    password: '',
    reason: '',
    accessMonths: '',
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setStats(data.stats);
      } else toast.error(data.error || 'Failed to load users');
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/user-activities', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) setLogs(data.logs);
    } catch {
      console.error('Failed to fetch logs');
    }
  }, []);

  useEffect(() => {
    if (tab === 'logs') fetchLogs();
    else fetchUsers();
  }, [fetchUsers, fetchLogs, tab]);

  // ── Expand user card for editing ──
  const toggleExpand = (user: User) => {
    if (expandedUser === user.id) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(user.id);
    setEditForm({
      name: user.name || '',
      email: user.email,
      password: '',
      planTier: user.planTier || 'free',
      accessMonths: '',
    });
  };

  // ── Save user changes ──
  const handleSave = async (user: User) => {
    const body: Record<string, any> = { userId: user.id };
    const changes: string[] = [];

    // Only send changed fields
    if (editForm.name && editForm.name !== user.name) {
      body.name = editForm.name;
      changes.push('name');
    }
    if (editForm.email && editForm.email !== user.email) {
      body.email = editForm.email;
      changes.push('email');
    }
    if (editForm.password) {
      body.password = editForm.password;
      changes.push('password');
    }
    if (editForm.planTier && editForm.planTier !== user.planTier) {
      body.planTier = editForm.planTier;
      changes.push('plan');
    }
    if (editForm.accessMonths) {
      body.accessMonths = Number(editForm.accessMonths);
      changes.push('expiry');
    }

    if (changes.length === 0) {
      toast.info('No changes to save');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setExpandedUser(null);
        fetchUsers();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle Active ──
  const handleToggle = async (user: User) => {
    const newActive = user.isActive === false;
    try {
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, isActive: newActive }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchUsers();
      } else toast.error(data.error);
    } catch {
      toast.error('Failed');
    }
  };

  // ── Quick Plan Change ──
  const handleQuickPlan = async (userId: string, planTier: string) => {
    try {
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planTier, isActive: true }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchUsers();
      } else toast.error(data.error);
    } catch {
      toast.error('Failed');
    }
  };

  // ── Grant Plan ──
  const handleGrant = async () => {
    if (!grantForm.name || !grantForm.email || !grantForm.password) {
      toast.error('Name, email, and password are required');
      return;
    }
    try {
      const res = await fetch('/api/admin/grant-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...grantForm,
          accessMonths: grantForm.accessMonths ? Number(grantForm.accessMonths) : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setShowGrant(false);
        setGrantForm({
          name: '',
          email: '',
          phone: '',
          planTier: 'pro',
          password: '',
          reason: '',
          accessMonths: '',
        });
        fetchUsers();
      } else toast.error(data.error);
    } catch {
      toast.error('Failed to grant plan');
    }
  };

  // ── Delete User ──
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure? This will delete the user but keep payment history.')) return;
    if (!confirm('Double check! This cannot be undone.')) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchUsers();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Failed to delete user');
    }
  };

  // ── Generate Manual Link ──
  const handleManualLink = async (userId: string) => {
    try {
      const res = await generateManualPasswordLink(userId);
      if (res.success && res.url) {
        if (!navigator.clipboard) {
          toast.error('Clipboard is unavailable. Copy the password link manually.');
          console.log('Manual URL:', res.url);
          return;
        }

        try {
          await navigator.clipboard.writeText(res.url);
          toast.success('Password link copied! Share it with the user.');
        } catch (err) {
          toast.error('Failed to copy password link');
          console.error('Clipboard error:', err);
        }
      } else {
        toast.error(res.error || 'Failed to generate link');
      }
    } catch (error) {
      toast.error('Error generating link');
      console.error('Action error:', error);
    }
  };

  // ── Test Resend ──
  const handleTestEmail = async () => {
    const email = prompt('Enter email to receive test message:');
    if (!email) return;

    const id = toast.loading('Sending test email via Resend...');
    try {
      const res = await testResendEmail(email);
      if (res.success) {
        toast.success('Test email sent! Check your inbox.', { id });
      } else {
        toast.error(`Error: ${res.error}`, { id, duration: 6000 });
        console.error('Email Debug Details:', res.details);
      }
    } catch (err: any) {
      toast.error('Failed to execute test', { id });
    }
  };

  // ── Filter ──
  const now = new Date();
  const filteredUsers = users.filter((user) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      user.name?.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.phone?.includes(search);
    if (!matchesSearch) return false;

    if (tab === 'active')
      return (
        !user.deletedAt &&
        user.isActive !== false &&
        (!user.accessExpiresAt || new Date(user.accessExpiresAt) >= now)
      );
    if (tab === 'expired')
      return !user.deletedAt && user.accessExpiresAt && new Date(user.accessExpiresAt) < now;
    if (tab === 'inactive') return !user.deletedAt && user.isActive === false;
    if (tab === 'deleted') return !!user.deletedAt;
    return true;
  });

  const getStatus = (user: User) => {
    if (user.deletedAt) return { label: 'Deleted', cls: 'text-red-500 bg-red-50' };
    if (user.isActive === false) return { label: 'Inactive', cls: 'text-gray-500 bg-gray-50' };
    if (user.accessExpiresAt && new Date(user.accessExpiresAt) < now)
      return { label: 'Expired', cls: 'text-amber-600 bg-amber-50' };
    return { label: 'Active', cls: 'text-emerald-600 bg-emerald-50' };
  };

  const planBadge = (tier: string | null) => {
    if (tier === 'pro') return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
    if (tier === 'lite') return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
    return 'bg-slate-200 text-slate-700';
  };

  const formatExpiry = (exp: string | null) => {
    if (!exp) return 'No expiry';
    const date = new Date(exp);
    const d = Math.ceil((date.getTime() - now.getTime()) / 86400000);
    const dateStr = date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return d < 0 ? `Expired (${dateStr})` : `${d}d left (${dateStr})`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold md:text-2xl">User Management</h1>
        <Button
          size="sm"
          onClick={() => setShowGrant(!showGrant)}
          className={`text-xs font-bold ${showGrant ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
        >
          <Gift className="mr-1 h-3.5 w-3.5" />
          {showGrant ? 'Close' : 'Grant Plan'}
        </Button>
      </div>

      {/* Grant Form */}
      {showGrant && (
        <div className="space-y-3 rounded-lg border border-purple-200 bg-purple-50 p-4">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-bold text-purple-800">Grant Lite/Pro — No Payment</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input
              type="text"
              value={grantForm.name}
              placeholder="Full Name *"
              onChange={(e) => setGrantForm((f) => ({ ...f, name: e.target.value }))}
              className="h-9 rounded-lg border px-3 text-xs outline-none focus:border-purple-500"
            />
            <input
              type="email"
              value={grantForm.email}
              placeholder="Email *"
              onChange={(e) => setGrantForm((f) => ({ ...f, email: e.target.value }))}
              className="h-9 rounded-lg border px-3 text-xs outline-none focus:border-purple-500"
            />
            <input
              type="text"
              value={grantForm.phone}
              placeholder="Phone"
              onChange={(e) => setGrantForm((f) => ({ ...f, phone: e.target.value }))}
              className="h-9 rounded-lg border px-3 text-xs outline-none focus:border-purple-500"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input
              type="text"
              value={grantForm.password}
              placeholder="Password (8+ chars, Aa1) *"
              onChange={(e) => setGrantForm((f) => ({ ...f, password: e.target.value }))}
              className="h-9 rounded-lg border px-3 text-xs outline-none focus:border-purple-500"
            />
            <select
              value={grantForm.planTier}
              onChange={(e) =>
                setGrantForm((f) => ({ ...f, planTier: e.target.value as 'lite' | 'pro' }))
              }
              className="h-9 rounded-lg border bg-white px-3 text-xs outline-none focus:border-purple-500"
            >
              <option value="lite">Lite (8 months)</option>
              <option value="pro">Pro (6 months)</option>
            </select>
            <input
              type="text"
              value={grantForm.reason}
              placeholder="Reason (optional)"
              onChange={(e) => setGrantForm((f) => ({ ...f, reason: e.target.value }))}
              className="h-9 rounded-lg border px-3 text-xs outline-none focus:border-purple-500"
            />
            <input
              type="number"
              min={1}
              max={24}
              value={grantForm.accessMonths}
              placeholder="Duration (Months - e.g. 5)"
              onChange={(e) => setGrantForm((f) => ({ ...f, accessMonths: e.target.value }))}
              className="h-9 rounded-lg border bg-white px-3 text-xs outline-none focus:border-purple-500"
            />
          </div>
          <Button
            size="sm"
            className="h-8 bg-purple-600 text-xs font-bold text-white hover:bg-purple-700"
            onClick={handleGrant}
          >
            <Gift className="mr-1 h-3 w-3" /> Create & Grant Plan
          </Button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
          {[
            { l: 'Total', v: stats.total, c: 'text-slate-600' },
            { l: 'Active', v: stats.active, c: 'text-emerald-600' },
            { l: 'Expired', v: stats.expired, c: 'text-amber-600' },
            { l: 'Inactive', v: stats.inactive, c: 'text-gray-500' },
            { l: 'Deleted', v: stats.deleted, c: 'text-red-500' },
            { l: 'Free', v: stats.free, c: 'text-slate-500' },
            { l: 'Lite', v: stats.lite, c: 'text-blue-500' },
            { l: 'Pro', v: stats.pro, c: 'text-amber-500' },
            { l: 'Upgrades', v: stats.migrations, c: 'text-purple-500' },
          ].map(({ l, v, c }) => (
            <div key={l} className="rounded-lg border bg-white p-2 text-center">
              <div className={`text-lg font-bold ${c}`}>{v}</div>
              <div className="text-[10px] text-slate-500">{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* 🛠️ Debug Tools */}
      <div className="flex justify-end">
        <button
          onClick={handleTestEmail}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-indigo-600"
        >
          <Mail className="h-3.5 w-3.5" />
          Test Mail Settings (Debug Resend)
        </button>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone..."
            className="h-9 w-full rounded-lg border pr-4 pl-9 text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {(['all', 'active', 'expired', 'inactive', 'deleted', 'logs'] as TabFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                tab === t
                  ? 'bg-slate-900 text-white'
                  : 'border bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              {t === 'logs' ? 'Activity Log' : t}
            </button>
          ))}
          <button
            onClick={() => (tab === 'logs' ? fetchLogs() : fetchUsers())}
            disabled={loading}
            className="rounded-md border bg-white px-2 py-1.5 text-slate-500 hover:bg-slate-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Results */}
      {tab === 'logs' ? (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">No activity logs found</div>
          ) : (
            logs.map((log) => {
              // Handle both string and object details
              let details: Record<string, any> = {};
              try {
                if (typeof log.details === 'string') {
                  details = JSON.parse(log.details);
                } else if (log.details && typeof log.details === 'object') {
                  details = log.details as Record<string, any>;
                }
              } catch {
                details = {};
              }
              const timeAgo = formatDistanceToNow(new Date(log.createdAt), { addSuffix: true });
              const logDate = new Date(log.createdAt);
              const exactTime = logDate.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              // Use log.userId as primary, fallback to details.userId
              const displayUserId = 'userId' in log ? (log as any).userId : details.userId;

              return (
                <div
                  key={log.id}
                  className="rounded-lg border bg-white p-4 text-sm shadow-sm transition-all hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                          log.action === 'DELETE'
                            ? 'bg-red-100 text-red-700'
                            : log.action === 'PLAN_CHANGE'
                              ? 'bg-amber-100 text-amber-700'
                              : log.action === 'GRANT'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.action}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{log.userEmail}</span>
                        {log.userName && (
                          <span className="text-xs text-slate-500">{log.userName}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-slate-900" title={exactTime}>
                        {timeAgo}
                      </div>
                      <div className="text-[10px] text-slate-400">{exactTime}</div>
                    </div>
                  </div>

                  {/* ID Section & Deleted Date Override */}
                  <div className="mb-3 space-y-2">
                    <div className="flex w-fit items-center gap-2 rounded border border-slate-100 bg-slate-50 p-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        User ID:
                      </span>
                      <code className="font-mono text-xs text-slate-600 select-all">
                        {displayUserId || 'N/A'}
                      </code>
                      {displayUserId && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(displayUserId);
                            toast.success('ID copied');
                          }}
                          className="text-slate-400 transition-colors hover:text-indigo-600"
                          title="Copy ID"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    {log.action === 'DELETE' && (
                      <div className="w-fit rounded border border-red-100 bg-red-50 p-2 text-xs font-medium text-red-600">
                        Deleted on: {exactTime}
                      </div>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 gap-x-4 gap-y-2 rounded-md bg-slate-50/50 p-3 text-xs text-slate-600 sm:grid-cols-2">
                    {Object.entries(details).map(([key, value]) => {
                      if (key === 'userId') return null; // Already shown
                      if (key === 'oldValues' || key === 'newValues' || key === 'changes') {
                        return (
                          <div key={key} className="col-span-full mt-1">
                            <span className="mb-1 block font-semibold text-slate-700 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <pre className="overflow-x-auto rounded border bg-white p-2 text-[10px]">
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          </div>
                        );
                      }
                      return (
                        <div key={key} className="flex gap-2">
                          <span className="min-w-[80px] font-medium text-slate-500 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="truncate" title={String(value)}>
                            {String(value)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400">{filteredUsers.length} users</p>
          <div className="space-y-2">
            {loading ? (
              <div className="py-12 text-center text-slate-400">Loading...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-slate-400">No users found</div>
            ) : (
              filteredUsers.map((user) => {
                const status = getStatus(user);
                const isExpanded = expandedUser === user.id;

                return (
                  <div
                    key={user.id}
                    className={`rounded-lg border bg-white ${user.deletedAt ? 'opacity-50' : ''}`}
                  >
                    {/* Main row */}
                    <div className="p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {/* Name + badges */}
                          <div className="mb-1 flex flex-wrap items-center gap-1.5">
                            <span className="truncate text-sm font-semibold">
                              {user.name || '—'}
                            </span>
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase ${planBadge(user.planTier)}`}
                            >
                              {user.planTier || 'free'}
                            </span>
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${status.cls}`}
                            >
                              {status.label}
                            </span>
                            {/* 🔑 Password Status */}
                            {user.deletedAt ? null : (
                              <span
                                className={`rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${
                                  user.isActive
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : user.planTier !== 'free'
                                      ? 'animate-pulse border-amber-200 bg-amber-50 text-amber-700'
                                      : 'border-slate-200 bg-slate-50 text-slate-500'
                                }`}
                              >
                                🔑{' '}
                                {user.isActive
                                  ? 'Password Set'
                                  : user.planTier !== 'free'
                                    ? 'Password PENDING'
                                    : 'No Password'}
                              </span>
                            )}
                            {user.role === 'admin' && (
                              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                                ADMIN
                              </span>
                            )}
                          </div>
                          {/* Info */}
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
                            <span>{user.email}</span>
                            {user.phone && <span>📱{user.phone}</span>}
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />
                              {formatExpiry(user.accessExpiresAt)}
                            </span>
                          </div>

                          {/* 🕒 Creation Proof & Metadata */}
                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] sm:text-[11px]">
                            <span className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100/50 px-2 py-0.5 font-semibold text-slate-600">
                              <Clock className="h-3 w-3 text-indigo-500" />
                              {user.createdAt ? (
                                <span title={new Date(user.createdAt).toISOString()}>
                                  Created:{' '}
                                  {new Date(user.createdAt).toLocaleString('en-IN', {
                                    weekday: 'short',
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                  })}
                                </span>
                              ) : (
                                'Created: N/A'
                              )}
                            </span>

                            <span className="flex items-center gap-1 text-slate-400">
                              <Shield className="h-3 w-3 text-slate-300" />
                              <code className="rounded border border-slate-100 bg-slate-50 px-1.5 py-0.5 font-mono text-[9px] select-all">
                                ID: {user.id}
                              </code>
                            </span>

                            {/* 🎯 Exam & Source Badges */}
                            <span className="flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
                              Exam: {user.examType || 'mppsc'}
                            </span>

                            {user.metadata?.source && (
                              <span className="flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-600 uppercase">
                                Source: {user.metadata.source}
                              </span>
                            )}

                            {user.metadata?.ip && (
                              <span className="flex items-center gap-1 border-l border-slate-200 pl-3 text-slate-400">
                                <span className="text-[9px] font-medium text-slate-300 uppercase">
                                  IP:
                                </span>
                                {user.metadata.ip}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Actions */}
                        {!user.deletedAt && (
                          <div className="flex shrink-0 items-center gap-1">
                            {/* Quick plan buttons */}
                            {user.planTier !== 'pro' && (
                              <button
                                onClick={() => handleQuickPlan(user.id, 'pro')}
                                className="flex h-7 items-center gap-0.5 rounded-md border border-amber-200 bg-amber-50 px-2 text-[10px] font-bold text-amber-600 hover:bg-amber-100"
                                title="Make Pro"
                              >
                                <Crown className="h-3 w-3" /> Pro
                              </button>
                            )}
                            {user.planTier !== 'lite' && user.planTier !== 'pro' && (
                              <button
                                onClick={() => handleQuickPlan(user.id, 'lite')}
                                className="flex h-7 items-center gap-0.5 rounded-md border border-blue-200 bg-blue-50 px-2 text-[10px] font-bold text-blue-600 hover:bg-blue-100"
                                title="Make Lite"
                              >
                                <Zap className="h-3 w-3" /> Lite
                              </button>
                            )}
                            {/* Toggle active */}
                            <button
                              onClick={() => handleToggle(user)}
                              className={`flex h-7 items-center gap-0.5 rounded-md border px-2 text-[10px] font-bold ${
                                user.isActive === false
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                  : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              <Shield className="h-3 w-3" />
                              {user.isActive === false ? 'On' : 'Off'}
                            </button>
                            {/* Edit expand */}
                            <button
                              onClick={() => toggleExpand(user)}
                              className={`flex h-7 items-center gap-0.5 rounded-md border px-2 text-[10px] font-bold ${
                                isExpanded
                                  ? 'border-indigo-300 bg-indigo-100 text-indigo-700'
                                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              <Pencil className="h-3 w-3" />
                              {isExpanded ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </button>
                            {/* Manual Password Link */}
                            {!user.isActive && !user.deletedAt && (
                              <button
                                onClick={() => handleManualLink(user.id)}
                                className="flex h-7 items-center gap-0.5 rounded-md border border-purple-200 bg-purple-50 px-2 text-[10px] font-bold text-purple-600 hover:bg-purple-100"
                                title="Copy Set Password Link"
                              >
                                <Key className="h-3 w-3" /> Link
                              </button>
                            )}
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="flex h-7 items-center gap-0.5 rounded-md border border-red-200 bg-red-50 px-2 text-[10px] font-bold text-red-600 hover:bg-red-100"
                              title="Delete User"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded edit form */}
                    {isExpanded && !user.deletedAt && (
                      <div className="space-y-3 border-t bg-slate-50 p-3 sm:p-4">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                          <div>
                            <label className="mb-0.5 block text-[10px] font-bold text-slate-400 uppercase">
                              Name
                            </label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                              className="h-8 w-full rounded border px-2 text-xs outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="mb-0.5 block text-[10px] font-bold text-slate-400 uppercase">
                              Email
                            </label>
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) =>
                                setEditForm((f) => ({ ...f, email: e.target.value }))
                              }
                              className="h-8 w-full rounded border px-2 text-xs outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="mb-0.5 block text-[10px] font-bold text-slate-400 uppercase">
                              New Password
                            </label>
                            <input
                              type="text"
                              value={editForm.password}
                              onChange={(e) =>
                                setEditForm((f) => ({ ...f, password: e.target.value }))
                              }
                              className="h-8 w-full rounded border px-2 text-xs outline-none focus:border-indigo-500"
                              placeholder="Leave empty to keep"
                            />
                          </div>
                          <div>
                            <label className="mb-0.5 block text-[10px] font-bold text-slate-400 uppercase">
                              Plan
                            </label>
                            <select
                              value={editForm.planTier}
                              onChange={(e) =>
                                setEditForm((f) => ({ ...f, planTier: e.target.value }))
                              }
                              className="h-8 w-full rounded border bg-white px-2 text-xs outline-none focus:border-indigo-500"
                            >
                              <option value="free">Free</option>
                              <option value="lite">Lite</option>
                              <option value="pro">Pro</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-0.5 block text-[10px] font-bold text-slate-400 uppercase">
                              Set Expiry (Months from now)
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={24}
                              value={editForm.accessMonths}
                              onChange={(e) =>
                                setEditForm((f) => ({ ...f, accessMonths: e.target.value }))
                              }
                              className="h-8 w-full rounded border px-2 text-xs outline-none focus:border-indigo-500"
                              placeholder="e.g. 3"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={saving}
                            className="h-7 bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700"
                            onClick={() => handleSave(user)}
                          >
                            <Check className="mr-1 h-3 w-3" />{' '}
                            {saving ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => setExpandedUser(null)}
                          >
                            <X className="mr-1 h-3 w-3" /> Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
