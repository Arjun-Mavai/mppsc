/**
 * Guest Lead Modal: Capture name, number, email before free access
 * 
 * Features:
 * • Minimal form (name, number, email optional)
 * • Saves to localStorage (no repeat)
 * • Sends to backend for tracking
 * • Reusable for different pages (/mains/syllabus, /mains/pyq-library, etc)
 */
'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { X } from 'lucide-react';
import { toast } from 'sonner';

export interface GuestLead {
  name: string;
  phone: string;
  email?: string;
  page: string;
  timestamp: string;
}

export function AshokEmblemIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 120"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>
      
      <g stroke="url(#gold-grad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Top central lion head/mane */}
        <path d="M50 15 C54 15, 57 18, 57 23 C57 28, 55 31, 50 33 C45 31, 43 28, 43 23 C43 18, 46 15, 50 15 Z" fill="url(#gold-grad)" fillOpacity="0.1" />
        {/* Left lion profile */}
        <path d="M38 23 C34 23, 31 25, 31 30 C31 35, 35 38, 40 39" />
        {/* Right lion profile */}
        <path d="M62 23 C66 23, 69 25, 69 30 C69 35, 65 38, 60 39" />
        
        {/* Lion bodies / trunks */}
        <path d="M41 39 C41 45, 45 55, 45 65" />
        <path d="M59 39 C59 45, 55 55, 55 65" />
        <path d="M50 33 L50 65" strokeWidth="4" />
        
        {/* Left/Right shoulders and muscle details */}
        <path d="M33 34 C35 44, 40 48, 40 55" />
        <path d="M67 34 C65 44, 60 48, 60 55" />
        
        {/* Abacus (Base under lions) */}
        <path d="M28 65 L72 65 C74 65, 75 67, 75 69 L75 74 C75 76, 74 77, 72 77 L28 77 C26 77, 25 76, 25 74 L25 69 C25 67, 26 65, 28 65 Z" fill="url(#gold-grad)" fillOpacity="0.2" strokeWidth="4" />
        
        {/* Ashoka Chakra in the center of Abacus */}
        <circle cx="50" cy="71" r="5" strokeWidth="2" fill="none" />
        <path d="M50 66 L50 76 M45 71 L55 71 M46.5 67.5 L53.5 74.5 M46.5 74.5 L53.5 67.5" strokeWidth="1" />
        
        {/* Stylized animals on abacus (Left/Right dots) */}
        <circle cx="36" cy="71" r="1.5" fill="url(#gold-grad)" stroke="none" />
        <circle cx="64" cy="71" r="1.5" fill="url(#gold-grad)" stroke="none" />
        
        {/* Bell-shaped lotus base */}
        <path d="M32 77 C35 95, 40 100, 50 100 C60 100, 65 95, 68 77" strokeWidth="3" />
        {/* Lotus petals lines */}
        <path d="M50 77 L50 100" strokeWidth="1.5" />
        <path d="M44 77 C45 88, 46 95, 41 98" strokeWidth="1.5" />
        <path d="M56 77 C55 88, 54 95, 59 98" strokeWidth="1.5" />
        <path d="M37 77 C40 85, 43 90, 47 93" strokeWidth="1" />
        <path d="M63 77 C60 85, 57 90, 53 93" strokeWidth="1" />
        
        {/* Plinth/Base bottom lines */}
        <path d="M35 101 L65 101" strokeWidth="4" />
        <path d="M30 106 L70 106" strokeWidth="2" />
      </g>
    </svg>
  );
}

const STORAGE_KEY = 'mppsc_guest_lead';
const EXPIRY_DAYS = 7; // Re-show modal after 7 days
const isProtectionEnabled = process.env.NEXT_PUBLIC_DISABLE_CONTENT_PROTECTION !== 'true';

/**
 * Get stored guest lead from localStorage
 */
export function getStoredGuestLead(page?: string): GuestLead | null {
  if (typeof window === 'undefined') return null;

  const key = page && (page === 'mains-syllabus' || page === 'mains-pyq-library' || page.includes('mains'))
    ? 'mains_guest_lead'
    : 'mppsc_guest_lead';

  const stored = localStorage.getItem(key);
  if (!stored) {
    // Lead Reuse: Fallback to the main pre lead key so we don't annoy users who already signed up
    const fallbackStored = localStorage.getItem('mppsc_guest_lead');
    if (!fallbackStored) return null;
    try {
      const data = JSON.parse(fallbackStored);
      // Backfill to the mains key for future requests
      localStorage.setItem('mains_guest_lead', fallbackStored);
      return data;
    } catch {
      return null;
    }
  }

  try {
    const data = JSON.parse(stored);
    const storedTime = new Date(data.timestamp).getTime();
    const now = new Date().getTime();
    const daysPassed = (now - storedTime) / (1000 * 60 * 60 * 24);

    // If older than expiry, clear
    if (daysPassed > EXPIRY_DAYS) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Save guest lead to localStorage and send to backend
 */
async function saveGuestLead(lead: GuestLead, page: string) {
  if (typeof window === 'undefined') return;

  const key = page === 'mains-syllabus' || page === 'mains-pyq-library' || page.includes('mains')
    ? 'mains_guest_lead'
    : 'mppsc_guest_lead';

  // Save to both page-specific key and backup key for cross-module unlock support
  localStorage.setItem(key, JSON.stringify(lead));
  localStorage.setItem('mppsc_guest_lead', JSON.stringify(lead));

  // Send to backend
  try {
    await fetch('/api/tracking/guest-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
  } catch (error) {
    console.error('Failed to save guest lead:', error);
  }
}

interface GuestLeadModalProps {
  page: 'mains-syllabus' | 'mains-pyq-library' | 'free-quiz';
  title?: string;
  subtitle?: string;
  onSubmit?: (lead: GuestLead) => void;
  mandatory?: boolean;
}

/**
 * Modal Component: Capture guest lead
 * Usage: <GuestLeadModal page="mains-pyq-library" title="Unlock Full PYQ Library" />
 */
export function GuestLeadModal({
  page,
  title = '📚 Unlock Full Access',
  subtitle = 'Get access to complete question bank',
  onSubmit,
  mandatory = false,
}: GuestLeadModalProps) {
  const { user } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);

  const isMains = page.startsWith('mains');

  // Show modal only if:
  // 1. User not logged in
  // 2. No stored lead or lead expired
  useEffect(() => {
    const isLoggedIn = !!user;
    if (isLoggedIn) {
      setIsOpen(false);
      return;
    }

    const storedLead = getStoredGuestLead(page);
    if (!storedLead) {
      setIsOpen(true);
    }
  }, [user, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setLoading(true);
    const lead: GuestLead = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      page,
      timestamp: new Date().toISOString(),
    };

    // 🚀 INSTANT ASYNC BACKGROUND UNLOCK
    // Save to localStorage and invoke database/Telegram API in the background
    saveGuestLead(lead, page).catch((err) => {
      console.error('Failed to save guest lead in background:', err);
    });

    // Close modal and resolve state instantly
    setIsOpen(false);
    setLoading(false);
    onSubmit?.(lead);

    // Elegant Sonner Toast Notification
    const moduleName = page === 'mains-pyq-library' ? 'PYQ Library' : 'Syllabus & Topics';
    toast.success('भावी अधिकारी, स्वागत है आपका! 🏛️', {
      description: `Free ${moduleName} unlocked successfully. All the best!`,
      duration: 4500,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-gradient-to-b from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in overflow-hidden">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

        {/* Close button */}
        {!mandatory ? (
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}

        {/* Header Content */}
        <div className="flex flex-col items-center text-center mb-6">
          {isMains ? (
            <div className="relative mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-b from-amber-50 to-amber-100/30 p-2 shadow-md dark:from-slate-900 dark:to-amber-950/20 border-2 border-amber-300/50 dark:border-amber-500/20">
              <img 
                src="/ashok_emblem_gold.png" 
                alt="National Emblem of India" 
                className="w-20 h-20 object-contain drop-shadow-[0_4px_8px_rgba(180,83,9,0.35)] select-none"
              />
              {/* Subtle pulsing gold background glow */}
              <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-amber-400/5 blur-md" />
            </div>
          ) : (
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-100/50 dark:border-emerald-900/50 flex items-center justify-center mb-4 shadow-sm">
              <span className="text-3xl" role="img" aria-label="Unlock icon">🔓</span>
            </div>
          )}
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
            {title}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-semibold px-2">
            {subtitle}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter your full name"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold shadow-inner text-sm"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="10-digit mobile number"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold shadow-inner text-sm"
            />
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold shadow-inner text-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.name || !formData.phone}
            className="w-full h-11 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Unlocking content...' : "Let's Do It!"}
          </button>

          {/* Privacy Trust Note */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 pt-1">
            <span>🔒 Your privacy is fully secured</span>
          </div>
        </form>
      </div>
    </div>
  );
}
