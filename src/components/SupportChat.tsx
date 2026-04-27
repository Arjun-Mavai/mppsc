'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Send, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { submitSupportTicket } from '@/actions/support-actions';
import Link from 'next/link';

type QA = {
  question: { en: string; hi: string };
  answer: { en: React.ReactNode; hi: React.ReactNode };
};

const FAQS: QA[] = [
  {
    question: { en: 'How do I get Pro access?', hi: 'Pro एक्सेस कैसे मिलेगा?' },
    answer: {
      en: (
        <span>
          You can get instant Pro access by completing your payment directly from our{' '}
          <Link href="/pricing" className="font-semibold text-indigo-600 hover:underline">
            Pricing page
          </Link>
          . If you face any issues, our support team is always here to help!
        </span>
      ),
      hi: (
        <span>
          आप हमारे{' '}
          <Link href="/pricing" className="font-semibold text-indigo-600 hover:underline">
            प्राइसिंग पेज
          </Link>{' '}
          से सीधा पेमेंट करके प्रो एक्सेस ले सकते हैं। आपका प्लान तुरंत एक्टिव हो जाएगा।
        </span>
      ),
    },
  },
  {
    question: {
      en: 'What if my access expires or exam gets delayed?',
      hi: 'अगर एक्सेस समाप्त हो जाए या परीक्षा देरी से हो?',
    },
    answer: {
      en: 'If MPPSC delays the exam, we extend your access — no extra charge. Admin can also extend your access anytime from the dashboard.',
      hi: 'अगर MPPSC परीक्षा में देरी करता है, तो हम आपका एक्सेस बढ़ा देंगे — कोई अतिरिक्त शुल्क नहीं।',
    },
  },
  {
    question: {
      en: 'Is this available in Hindi & English?',
      hi: 'क्या यह हिंदी और अंग्रेजी दोनों में उपलब्ध है?',
    },
    answer: {
      en: 'Yes! All tests, blogs, and explanations are available in both Hindi & English with a one-click language toggle.',
      hi: 'हाँ! सभी टेस्ट, ब्लॉग्स और एक्सप्लेनेशन हिंदी और अंग्रेजी दोनों में एक क्लिक से उपलब्ध हैं।',
    },
  },
  {
    question: {
      en: "What's included in the test series?",
      hi: 'टेस्ट सीरीज़ में क्या-क्या शामिल है?',
    },
    answer: {
      en: 'Topic-wise tests, Unit tests, Full Length Tests (100Q), CSAT papers, PYQ papers (2020-2026), smart explanations, and Analytics dashboard.',
      hi: 'टॉपिक वाइज़ टेस्ट, यूनिट टेस्ट, फुल लेंथ टेस्ट (100 प्रश्न), CSAT पेपर, PYQ पेपर (2020-2026), स्मार्ट एक्सप्लेनेशन और एनालिटिक्स डैशबोर्ड।',
    },
  },
];

export function SupportChat() {
  const user = useSettingsStore((state) => state.user);
  const language = useSettingsStore((state) => state.language);
  const hi = language === 'hi';
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'faq'>('chat');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [isNudgeOpen, setIsNudgeOpen] = useState(true);

  /**
   * Enterprise-grade user name detection with multiple fallback strategies
   * Priority: Guest localStorage > Authenticated User > Default
   *
   * @returns Sanitized user name or default greeting
   */
  const getUserDisplayName = (): string => {
    try {
      // Strategy 1: Check localStorage for guest name (from quiz)
      // This is set when guest users take tests
      if (typeof window !== 'undefined') {
        const guestName = localStorage.getItem('mppsc_guest_name');
        if (guestName && guestName.trim()) {
          // Sanitize and validate
          const sanitized = guestName.trim().slice(0, 50); // Max 50 chars
          if (sanitized.length > 0) {
            return sanitized;
          }
        }
      }

      // Strategy 2: Check authenticated user from store
      // This comes from NextAuth session
      if (user?.name && typeof user.name === 'string') {
        const sanitized = user.name.trim().slice(0, 50);
        if (sanitized.length > 0) {
          return sanitized;
        }
      }

      // Strategy 3: Fallback to default
      return 'there';
    } catch (error) {
      // Fail gracefully - never crash the UI
      console.error('[SupportChat] Error getting user name:', error);
      return 'there';
    }
  };

  // Get display name once on mount and when user changes
  // Memoize to prevent unnecessary re-renders
  const displayName = React.useMemo(() => getUserDisplayName(), [user?.name]);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Show ONLY on the Home page to reduce clutter, especially on mobile
  if (pathname !== '/') return null;

  const handleWhatsApp = () => {
    const message = 'Hi, I need help with the MPPSC App. My query is:';
    window.open(`https://wa.me/918766451748?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleTelegram = () => {
    window.open('https://t.me/mppss_26_bot', '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitSupportTicket({
        ...formData,
        userId: user?.id || null,
        category: 'general',
      });

      if (result.success) {
        toast.success("Message sent! We'll get back to you shortly.");
        setFormData({ ...formData, message: '' });
        setIsOpen(false);
      } else {
        toast.error('Something went wrong. Try WhatsApp instead.');
      }
    } catch (error) {
      toast.error('Failed to send message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay - Prevents background clicks and closes chat */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[99] bg-black/20 backdrop-blur-[2px]"
              aria-hidden="true"
            />

            {/* Chat Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed right-6 bottom-24 z-[100] flex max-h-[600px] w-[90vw] max-w-[380px] flex-col overflow-hidden overscroll-y-none rounded-2xl border border-indigo-100 bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="relative overflow-hidden bg-gradient-to-r from-[#00F0FF] to-[#00D1E0] p-6 text-slate-900">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <MessageCircle size={100} />
                </div>
                <h3 className="relative z-10 mb-1 font-sans text-xl font-bold text-slate-900">
                  {hi ? 'नमस्ते' : 'Hello'}
                  {displayName !== 'there' ? `, ${displayName}` : ''}! 👋
                </h3>
                <p className="relative z-10 text-sm font-medium text-slate-700">
                  {hi
                    ? 'हम आमतौर पर कुछ ही घंटों में जवाब देते हैं।'
                    : 'We usually reply within a few hours.'}
                </p>

                <div className="relative z-10 mt-4 flex gap-2">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={cn(
                      'flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
                      activeTab === 'chat'
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white/30 text-slate-800 backdrop-blur-sm hover:bg-white/50'
                    )}
                  >
                    Contact Us
                  </button>
                  <button
                    onClick={() => setActiveTab('faq')}
                    className={cn(
                      'flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
                      activeTab === 'faq'
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white/30 text-slate-800 backdrop-blur-sm hover:bg-white/50'
                    )}
                  >
                    FAQs
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto bg-slate-50">
                {activeTab === 'chat' ? (
                  <div className="space-y-6 p-5">
                    {/* Quick Connect */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleWhatsApp}
                        className="group flex flex-col items-center justify-center rounded-xl border border-green-200 bg-green-50/80 p-3 transition-colors hover:bg-green-100"
                      >
                        <Phone className="mb-1 h-6 w-6 text-green-600 transition-transform group-hover:scale-110" />
                        <span className="text-xs font-semibold text-green-800">WhatsApp</span>
                      </button>
                      <button
                        onClick={handleTelegram}
                        className="group flex flex-col items-center justify-center rounded-xl border border-sky-200 bg-sky-50/80 p-3 transition-colors hover:bg-sky-100"
                      >
                        <Send className="mb-1 h-6 w-6 text-sky-600 transition-transform group-hover:scale-110" />
                        <span className="text-xs font-semibold text-sky-800">Telegram</span>
                      </button>
                    </div>

                    <div className="relative flex items-center py-1">
                      <div className="flex-grow border-t border-slate-200"></div>
                      <span className="mx-4 flex-shrink-0 text-xs font-medium text-slate-400">
                        OR SEND A MESSAGE
                      </span>
                      <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
                          placeholder="Your Name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600">Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
                            placeholder="john@example.com"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600">Phone</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
                            placeholder="+91..."
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Message</label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={3}
                          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
                          placeholder="How can we help you?"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <>
                            <Send size={16} />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-2 p-4">
                    <p className="mb-2 px-1 text-xs font-medium text-slate-500">Common Questions</p>
                    {FAQS.map((faq, idx) => (
                      <div
                        key={idx}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-all"
                      >
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                          className="flex w-full items-center justify-between p-3 text-left"
                        >
                          <span className="text-sm font-semibold text-slate-700">
                            {hi ? faq.question.hi : faq.question.en}
                          </span>
                          {expandedFaq === idx ? (
                            <ChevronUp size={16} className="ml-2 flex-shrink-0 text-indigo-600" />
                          ) : (
                            <ChevronDown size={16} className="ml-2 flex-shrink-0 text-slate-400" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedFaq === idx && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-slate-100 bg-slate-50/50 p-3 pt-0 text-sm text-slate-600">
                                {hi ? faq.answer.hi : faq.answer.en}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}

                    <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-center">
                      <p className="mb-2 text-sm font-medium text-indigo-900">
                        {hi ? 'और सवाल हैं?' : 'Still have questions?'}
                      </p>
                      <button
                        onClick={() => setActiveTab('chat')}
                        className="rounded-full border border-indigo-200 bg-white px-4 py-2 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-50"
                      >
                        {hi ? 'सपोर्ट से बात करें' : 'Chat with Support'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="fixed right-6 bottom-6 z-[100] flex flex-col items-end gap-3">
        {/* Hover Nudge - Visual Lead Gen */}
        <AnimatePresence>
          {!isOpen && isNudgeOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="mr-1 mb-1 flex origin-bottom-right items-center gap-3 rounded-xl border border-indigo-100 bg-white px-4 py-3 shadow-xl"
            >
              <div className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
              </div>
              <div>
                <p className="text-sm leading-tight font-bold text-slate-800">
                  {hi ? 'मदद चाहिए?' : 'Need Help?'}
                </p>
                <p className="text-xs font-medium whitespace-nowrap text-slate-500">
                  {hi ? 'सपोर्ट टीम से बात करें' : 'Chat with our support team'}
                </p>
              </div>

              {/* Close Button for Nudge */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // We rely on the parent logic or just let user click the main button
                  // Ideally we would have a separate state to dismiss JUST the nudge,
                  // but user said "click ke baad hat jaaye" (main button click).
                  // Adding a visual distinct close just in case, but functionally
                  // clicking the main button is the primary dismissal.
                  setIsNudgeOpen(false);
                }}
                className="ml-2 rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onMouseEnter={() => !isOpen} // Just for interaction tracking if needed
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'group relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 transition-all duration-300 hover:scale-105 hover:bg-indigo-700 active:scale-95',
            isOpen && 'rotate-90 border-slate-700 bg-slate-800'
          )}
        >
          {isOpen ? (
            <X className="h-7 w-7" />
          ) : (
            <MessageCircle className="h-7 w-7 transition-transform group-hover:rotate-12" />
          )}

          {/* Ping animation when closed */}
          {!isOpen && (
            <span className="absolute top-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-red-500" />
          )}
        </button>
      </div>
    </>
  );
}
