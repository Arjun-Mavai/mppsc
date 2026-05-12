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
import { useSession } from 'next-auth/react';
import { X } from 'lucide-react';

export interface GuestLead {
  name: string;
  phone: string;
  email?: string;
  page: string;
  timestamp: string;
}

const STORAGE_KEY = 'mppsc_guest_lead';
const EXPIRY_DAYS = 7; // Re-show modal after 7 days

/**
 * Get stored guest lead from localStorage
 */
export function getStoredGuestLead(): GuestLead | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const data = JSON.parse(stored);
    const storedTime = new Date(data.timestamp).getTime();
    const now = new Date().getTime();
    const daysPassed = (now - storedTime) / (1000 * 60 * 60 * 24);

    // If older than expiry, clear
    if (daysPassed > EXPIRY_DAYS) {
      localStorage.removeItem(STORAGE_KEY);
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
async function saveGuestLead(lead: GuestLead) {
  if (typeof window === 'undefined') return;

  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lead));

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
}: GuestLeadModalProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);

  // Show modal only if:
  // 1. User not logged in
  // 2. No stored lead or lead expired
  useEffect(() => {
    const isLoggedIn = !!session?.user;
    if (isLoggedIn) {
      setIsOpen(false);
      return;
    }

    const storedLead = getStoredGuestLead();
    if (!storedLead) {
      setIsOpen(true);
    }
  }, [session]);

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

    await saveGuestLead(lead);
    onSubmit?.(lead);
    setIsOpen(false);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-in">
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-600 mb-6">{subtitle}</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter your name"
              className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="10-digit phone number"
              className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Email (Optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="your@email.com"
              className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.name || !formData.phone}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Unlocking...' : 'Unlock Access'}
          </button>

          {/* Footer text */}
          <p className="text-xs text-slate-500 text-center">
            We'll send you updates and resources
          </p>
        </form>
      </div>
    </div>
  );
}
