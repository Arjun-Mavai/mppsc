'use client';

import React, { useEffect, useState } from 'react';
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
      en: 'Do you provide traditional bookish textbook notes?',
      hi: 'क्या आप इसमें पारंपरिक टेक्स्टबुक नोट्स भी देते हैं?',
    },
    answer: {
      en: 'No. We do NOT provide boring, bulky, or outdated textbook notes to memorize blindly. Instead, we offer complete conceptual clarity, structural topic-wise breakdowns, and exam-focused blueprinting for both Prelims & Mains.',
      hi: 'नहीं! हम रटने वाली पारंपरिक और भारी-भरकम पीडीएफ नोट्स नहीं देते हैं। इसके बजाय, हम आपको प्रारंभिक (Prelims) और मुख्य (Mains) परीक्षा दोनों के लिए उत्कृष्ट वैचारिक स्पष्टता (conceptual clarity) और सटीक लेखन रणनीति (blueprints) प्रदान करते हैं।',
    },
  },
  {
    question: {
      en: 'How is the Prelims content and PYQs structured?',
      hi: 'प्रारंभिक परीक्षा (Prelims) के टेस्ट व PYQs कैसे व्यवस्थित हैं?',
    },
    answer: {
      en: 'Our Prelims modules are systematically organized in a highly structured layout: Year-wise (2020-2026), Unit-wise (Unit 1 to 10), and Subject-wise. Every single question has detailed explanations, analytics, and bilingual retention mnemonics.',
      hi: 'हमारा प्रीलिम्स कंटेंट पूरी तरह से व्यवस्थित है: वर्ष-वार (2020-2026), यूनिट-वार (यूनिट 1 से 10) और विषय-वार (Subject-wise)। हर प्रश्न के साथ आपको मिलेगी स्मार्ट व्याख्या, याद रखने के लिए आसान मेमोनिक्स और सुधारात्मक एनालिटिक्स।',
    },
  },
  {
    question: {
      en: 'What exactly do we get in the Mains module?',
      hi: 'मुख्य परीक्षा (Mains) मॉड्यूल में वास्तव में क्या-क्या मिलेगा?',
    },
    answer: {
      en: 'You get entire syllabus topic-by-topic deep clarity mapped to the syllabus tree. Every single question features 2 completely independent model answers (Double-Style Variations: natural, native drafts written separately in Hindi & English, not machine-translated) paired with Expert Strategy insights (constitutional articles, landmark cases, MP context data, and memory triggers).',
      hi: 'मेंस मॉड्यूल में आपको पूरे सिलेबस ट्री के अनुसार प्रत्येक टॉपिक की गहरी संरचनात्मक समझ मिलती है। इसके अलावा, मुख्य परीक्षा के प्रश्नों के लिए हर प्रश्न के "2 बिल्कुल अलग दृष्टिकोण वाले मॉडल उत्तर" (डबल-स्टाइल उत्तर वेरिएशन) मिलते हैं। ये दोनों भाषाओं (Hindi & English) में बिना मशीन अनुवाद के लिखे गए हैं, साथ ही इनमें रणनीतिक विशेषज्ञ मार्गदर्शन भी शामिल है।',
    },
  },
  {
    question: {
      en: 'What if my access expires or exam gets delayed?',
      hi: 'अगर एक्सेस समाप्त हो जाए या परीक्षा देरी से हो?',
    },
    answer: {
      en: 'If MPPSC delays the exam, we extend your access with no extra charge. Your strategic preparation is fully covered!',
      hi: 'अगर MPPSC परीक्षा में देरी करता है, तो हम आपका एक्सेस बढ़ा देंगे — कोई अतिरिक्त शुल्क नहीं। आपकी तैयारी की सुरक्षा हमारी ज़िम्मेदारी है!',
    },
  },
];

export function SupportChat() {
  const user = useSettingsStore((state) => state.user);
  const language = useSettingsStore((state) => state.language);
  const hi = language === 'hi';
  const pathname = usePathname();
  const isMainsPage = pathname.startsWith('/mains');
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'faq'>('chat');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [isNudgeOpen, setIsNudgeOpen] = useState(true);

  useEffect(() => {
    if (isMainsPage && isNudgeOpen) {
      const timer = setTimeout(() => {
        setIsNudgeOpen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isMainsPage, isNudgeOpen]);

  const dynamicFaqs = isMainsPage
    ? [
        {
          question: { en: 'How to unlock the Mains Vault?', hi: 'मेंस वॉल्ट (Mains Vault) कैसे अनलॉक करें?' },
          answer: {
            en: (
              <span>
                You can unlock instant access to the entire Mains syllabus tree & PYQ Library with dual-variant model answers directly from our{' '}
                <Link href="/pricing?need=mains" className="font-semibold text-indigo-600 hover:underline">
                  Pricing page
                </Link>
                . No rote-learning generic notes — pure exam blueprints!
              </span>
            ),
            hi: (
              <span>
                आप हमारे{' '}
                <Link href="/pricing?need=mains" className="font-semibold text-indigo-600 hover:underline">
                  प्राइसिंग पेज
                </Link>{' '}
                से सीधे मेंस प्लान लेकर पूरे सिलेबस ट्री और PYQ लाइब्रेरी को अनलॉक कर सकते हैं। यहाँ कोई रटने वाले लंबे नोट्स नहीं, बल्कि केवल काम के टू-वे मॉडल उत्तर और रणनीतिक इनसाइट्स हैं!
              </span>
            ),
          }
        },
        {
          question: { en: 'Are model answers bilingual and dual-style?', hi: 'क्या मॉडल उत्तर हिंदी और अंग्रेजी में हैं और इनके 2 वेरिएंट्स हैं?' },
          answer: {
            en: 'Yes! Every question features 2 completely independent model answers (Double-Style Variations: natural drafts written separately in Hindi & English, not machine translation) with dedicated subject-expert perspectives and strategic value additions.',
            hi: 'हाँ! प्रत्येक प्रश्न के लिए हिंदी और अंग्रेजी दोनों भाषाओं में स्वतंत्र रूप से लिखे गए "2 बिल्कुल अलग दृष्टिकोण वाले मॉडल उत्तर" (डबल-स्टाइल उत्तर वेरिएशन) दिए गए हैं। ये बिना किसी मशीन अनुवाद के हैं और इनमें विषय-विशेषज्ञों द्वारा रणनीतिक मार्गदर्शन शामिल है।',
          }
        },
        {
          question: { en: 'Do you provide textbook syllabus notes for Mains?', hi: 'क्या आप मुख्य परीक्षा (Mains) के लिए टेक्स्टबुक नोट्स भी देते हैं?' },
          answer: {
            en: 'No. We do NOT sell boring, outdated textbook notes to memorize. Instead, we provide entire syllabus topic-by-topic deep structural clarity mapped directly to the syllabus tree, strategically enriched with constitutional articles, landmark cases, MP context data, and high-scoring model answer frameworks!',
            hi: 'नहीं, हम रटने वाले पारंपरिक पीडीएफ नोट्स नहीं देते हैं। इसके बजाय, हम आपको सिलेबस ट्री के अनुसार प्रत्येक टॉपिक की गहरी वैचारिक समझ, रणनीतिक मूल्यवर्धन (संवैधानिक अनुच्छेद, कोर्ट फैसले, MP-विशिष्ट डेटा) और मॉडल उत्तर प्रारूप प्रदान करते हैं।',
          }
        },
        {
          question: { en: 'What if the Mains exam gets delayed?', hi: 'अगर मुख्य परीक्षा (Mains) में देरी हुई तो?' },
          answer: {
            en: 'If MPPSC delays the Mains exam, we extend your access accordingly with no extra charge.',
            hi: 'अगर MPPSC मुख्य परीक्षा में देरी करता है, तो हम आपका मेंस एक्सेस उसी हिसाब से बिना किसी अतिरिक्त शुल्क के बढ़ा देंगे।',
          }
        }
      ]
    : FAQS;

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
  
  // 🎯 Detect exam context from pathname and user access grants
  const userAccessGrants = user?.accessGrants || [];
  const hasMainsAccess = userAccessGrants.includes('mppsc_mains');
  const hasPreAccess = userAccessGrants.includes('mppsc_pre');
  
  // Determine support category based on context
  const getSupportCategory = (): 'pre_content' | 'mains_content' | 'general' => {
    if (isMainsPage && hasMainsAccess) return 'mains_content';
    if (!isMainsPage && hasPreAccess) return 'pre_content';
    return 'general';
  };
  
  // Show ONLY on the Home page & /mains landing page to reduce clutter, especially on mobile
  if (pathname !== '/' && pathname !== '/mains') return null;

  const handleWhatsApp = () => {
    const message = isMainsPage
      ? 'Hi, I have a query regarding the MPPSC Mains module.'
      : 'Hi, I need help with the MPPSC App. My query is:';
    window.open(`https://wa.me/918766451748?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleTelegram = () => {
    const url = isMainsPage
      ? 'https://t.me/MPPSC_Support_Bot?start=mppsc_mains_query'
      : 'https://t.me/mppss_26_bot';
    window.open(url, '_blank');
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
        category: getSupportCategory(),
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
                    {dynamicFaqs.map((faq, idx) => (
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
              className="mr-1 mb-1 flex origin-bottom-right items-center gap-3 rounded-2xl border border-amber-500/30 bg-[#060a12]/95 px-4 py-3.5 shadow-2xl backdrop-blur-md text-white ring-1 ring-white/5"
            >
              <div className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500"></span>
              </div>
              <div>
                <p className="text-sm leading-tight font-black text-white">
                  {isMainsPage 
                    ? (hi ? 'Mains पूछताछ?' : 'Mains Query?')
                    : (hi ? 'मदद चाहिए?' : 'Need Help?')}
                </p>
                <p className="text-[11px] font-semibold whitespace-nowrap text-slate-400 mt-0.5">
                  {hi ? 'सपोर्ट टीम से बात करें' : 'Chat with support team'}
                </p>
              </div>

              {/* Close Button for Nudge */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNudgeOpen(false);
                }}
                className="ml-2 rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
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
            'group relative flex h-14 w-14 items-center justify-center rounded-full border-3 border-slate-950 bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-500 text-white shadow-2xl shadow-amber-500/20 transition-all duration-300 hover:scale-110 active:scale-95',
            isOpen ? 'rotate-90 bg-slate-800' : 'hover:shadow-[0_0_30px_rgba(245,158,11,0.45)]'
          )}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6 transition-transform group-hover:rotate-12" />
          )}

          {/* Ping animation when closed */}
          {!isOpen && (
            <span className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-red-500" />
          )}

          {/* Golden Ring Pulse when closed */}
          {!isOpen && (
            <span className="absolute inset-0 -z-10 rounded-full bg-amber-500/10 animate-ping" />
          )}
        </button>
      </div>
    </>
  );
}
