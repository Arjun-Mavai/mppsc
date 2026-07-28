'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Quote, Loader2, ArrowLeft, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { logger } from '@/lib/logger';
import { loginUserAction } from '@/actions/auth-actions';
import { shouldRedirectPreSyllabusToMains } from '@/lib/product-portal-policy';
import { AuthenticatedUser } from '@/types/auth';

import { getSubscriptionStatus } from '@/lib/subscription-status';

/**
 * Login Screen Flow (Client)
 * 1) Normal login submit
 * 2) Server बोले requiresConfirmation -> inline dialog open
 * 3) "Kick others" confirm -> force login
 * 4) reason=multi_device ke saath aaye to stale client auth state turant saaf
 *    so navbar/menu/avatar instantly logged-out dikhte hain.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🛡️ Handle redirect reasons (e.g. normal logout / multi-device logout)
  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'multi_device' || reason === 'logged_out') {
      // Login screen par aate hi stale client auth state ko hard reset.
      useSettingsStore.getState().setUser(null, false);
      useSettingsStore.getState().setAuthCheckStatus('checked');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('settings-storage');
      }
      if (reason === 'multi_device') {
        toast.error('Security Alert', {
          description: 'You have been logged out because someone else logged in to your account from another device.',
          duration: 8000,
        });
        setError('You were logged out due to another login session.');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e?: React.FormEvent, force: boolean = false) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginUserAction({ email, password, force });

      if (data.requiresConfirmation) {
        setShowConfirmDialog(true);
        setLoading(false);
        return;
      }

      if (data.success && data.user) {
        setShowConfirmDialog(false);
        // Update Global Store with fresh user data
        const storeUser = data.user as AuthenticatedUser;
        useSettingsStore.getState().setUser(storeUser, !!storeUser.isSubscribed);

        toast.success('Welcome back!', {
          description: data.message || 'Accessing your syllabus...',
        });

        // 🛡️ Smart Redirect: Expired users -> /renew, else redirectTo query, else /dashboard
        const statusInfo = getSubscriptionStatus(storeUser);
        const redirectTo = searchParams.get('redirectTo');
        
        let destination = '/dashboard';
        if (statusInfo.requiresRenewalRedirect || statusInfo.isExpired) {
          destination = '/renew';
        } else if (redirectTo && redirectTo.startsWith('/')) {
          destination = redirectTo;
        }

        // Wait a bit for store to sync then redirect
        setTimeout(() => {
          if (storeUser) {
            window.location.href = destination;
          }
        }, 600);
      } else {
        setError(data.error || 'Login failed');
        toast.error('Login failed', {
          description: data.error || 'Please check your credentials',
        });
      }
    } catch (err) {
      logger.error('Login submit error', err, {
        category: 'auth',
        metadata: { email },
      });
      setError('Something went wrong. Please try again.');

      toast.error('Connection Error', {
        description: 'Unable to connect to server. Please check your internet connection.',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-50 font-sans lg:grid-cols-2">
      {/* Left Side: Visuals */}
      <div className="relative hidden items-center justify-center overflow-hidden bg-slate-900 p-12 lg:flex">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-indigo-500/30 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-purple-500/30 blur-[100px]"></div>

        <div className="relative z-10 max-w-lg space-y-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl"
          >
            <Quote className="h-10 w-10 text-white" />
          </motion.div>
          <div className="space-y-4">
            <h1 className="font-display text-4xl font-bold tracking-tight text-white">
              MPPSC Syllabus
            </h1>
            <p className="text-lg text-slate-400">
              Your comprehensive guide to mastering the exam. Access detailed unit breakdowns and
              premium content.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden px-4 py-12 sm:p-12">
        {/* Mobile Background Image (Visible only on small screens) */}
        <div className="absolute inset-0 z-0 lg:hidden">
          <div className="absolute inset-0 z-10 bg-slate-900/90"></div>
          <img
            src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop"
            alt="Background"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="absolute top-6 left-6 z-20">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white lg:text-slate-500 lg:hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 w-full max-w-md space-y-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8"
        >
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Sign in to MPPSC Prep</h2>
            <p className="text-sm text-slate-500">
              Enter your credentials to access your dashboard
            </p>
          </div>

          <form onSubmit={(e) => handleSubmit(e)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 w-full rounded-lg border border-slate-200 px-4 text-slate-900 transition-all outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 w-full rounded-lg border border-slate-200 px-4 pr-10 text-slate-900 transition-all outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-center text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {/* 🛡️ Login Confirmation Dialog */}
            {showConfirmDialog && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-amber-900">Active Session Detected</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      You are already logged in on another device. Logging in here will <b>instantly logout</b> all other sessions. Continue?
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => handleSubmit(undefined, true)}
                    disabled={loading}
                    className="h-8 flex-1 bg-amber-600 text-xs font-bold text-white hover:bg-amber-700 shadow-sm"
                  >
                    {loading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                    Yes, Login & Kick Others
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowConfirmDialog(false)}
                    disabled={loading}
                    className="h-8 flex-1 border-amber-200 bg-white text-xs font-bold text-amber-700 hover:bg-amber-100"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}

            {!showConfirmDialog && (
              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full bg-slate-900 font-bold text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            )}
          </form>

          <div className="space-y-2 pt-2 text-center">
            <p className="text-xs text-slate-400">
              <Link
                href="/pricing"
                className="font-semibold transition-colors hover:text-indigo-600"
              >
                Buy Premium Plan
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
