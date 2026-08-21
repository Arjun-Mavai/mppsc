'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Zap,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { notifyLiveChatSession } from '@/actions/live-chat-actions';
import Link from 'next/link';
import Image from 'next/image';

export type SupportMessage = {
  id?: string;
  type: 'chat' | 'system';
  senderRole: 'student' | 'admin' | 'system';
  senderId: string;
  senderName: string;
  targetId?: string;
  text: string;
  timestamp: string;
};

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
      en: 'No. We do NOT provide boring, bulky textbook notes to memorize. Mains is not cleared by just collecting piles of notes! We eliminate the hassle of checking 10 different PDFs just to navigate the syllabus. Instead, we offer complete conceptual clarity mapped to the syllabus tree and exam-focused answer frameworks.',
      hi: 'नहीं! हम रटने वाली पारंपरिक और भारी-भरकम पीडीएफ नोट्स नहीं देते हैं। सिर्फ नोट्स जमा करने से मेंस क्लियर नहीं होता है! यहां आपको सिलेबस चेक करने के लिए 10 अलग-अलग PDFs देखने के झंझट से मुक्ति मिलती है। हम आपको पूरे सिलेबस ट्री के अनुसार प्रत्येक टॉपिक की गहरी वैचारिक समझ और मॉडल उत्तर प्रारूप प्रदान करते हैं।',
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

export function LiveChatWidget() {
  const user = useSettingsStore((state) => state.user);
  const language = useSettingsStore((state) => state.language);
  const hi = language === 'hi';
  const pathname = usePathname();
  const isMainsPage = pathname.startsWith('/mains');

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'faq'>('chat');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isNudgeOpen, setIsNudgeOpen] = useState(true);
  const [hasNotifiedTelegram, setHasNotifiedTelegram] = useState(false);

  // Persistent Unique Student ID & Name
  const [studentId, setStudentId] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');

  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic FAQs based on route
  const dynamicFaqs = isMainsPage
    ? [
        {
          question: { en: 'How to unlock Mains Gyan Kosh?', hi: 'मेंस ज्ञानकोश (Mains Gyan Kosh) कैसे अनलॉक करें?' },
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
            en: 'No! We do NOT sell boring, outdated textbook notes to memorize. Mains is not cleared by just collecting piles of notes! We eliminate the hassle of checking 10 different PDFs just to navigate the syllabus. Instead, we provide entire syllabus topic-by-topic deep structural clarity mapped directly to the syllabus tree, strategically enriched with constitutional articles, landmark cases, and high-scoring model answer frameworks!',
            hi: 'नहीं! हम रटने वाले पारंपरिक पीडीएफ नोट्स नहीं देते हैं। सिर्फ नोट्स जमा करने से मेंस क्लियर नहीं होता है! यहां आपको सिलेबस चेक करने के लिए 10 अलग-अलग PDFs देखने के झंझट से मुक्ति मिलती है। हम आपको पूरे सिलेबस ट्री के अनुसार प्रत्येक टॉपिक की गहरी वैचारिक समझ, रणनीतिक मूल्यवर्धन और मॉडल उत्तर प्रारूप प्रदान करते हैं।',
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

  // Auto-dismiss nudge after 6 seconds
  useEffect(() => {
    if (isNudgeOpen) {
      const timer = setTimeout(() => setIsNudgeOpen(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [isNudgeOpen]);

  // Setup Student Identifier on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedId = localStorage.getItem('zen_support_user_id');
      if (!storedId) {
        storedId = 'student_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('zen_support_user_id', storedId);
      }
      setStudentId(storedId);

      const guestName = localStorage.getItem('mppsc_guest_name');
      const name = user?.name || guestName || 'Aspirant';
      setStudentName(name);
    }
  }, [user?.name]);

  // Connect WebSocket
  const connectWebSocket = useCallback(() => {
    if (!studentId) return;
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setIsConnecting(true);

    const getWsUrl = () => {
      if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
      if (process.env.NODE_ENV === 'production') return 'wss://websocket-realtime-chat-render.onrender.com/ws';
      return 'ws://localhost:8080/ws';
    };
    const baseUrl = getWsUrl();
    const socketUrl = `${baseUrl}?role=student&userId=${encodeURIComponent(studentId)}&name=${encodeURIComponent(studentName)}`;

    try {
      const socket = new WebSocket(socketUrl);

      socket.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
      };

      socket.onmessage = (event) => {
        try {
          const data: SupportMessage = JSON.parse(event.data);
          const msgId = data.id || `${data.senderId}_${data.timestamp}_${data.text}`;
          data.id = msgId;

          setMessages((prev) => {
            if (prev.some((m) => m.id === msgId)) return prev;
            return [...prev, data];
          });
        } catch {
          const rawText = event.data;
          setMessages((prev) => {
            // Check if this exact system message is already in the list to prevent repeats
            if (prev.some(m => m.text === rawText && m.senderId === 'admin_sys')) {
              return prev;
            }
            
            return [
              ...prev,
              {
                id: `raw_${Date.now()}`,
                type: 'chat',
                senderRole: 'admin',
                senderId: 'admin_sys',
                senderName: 'ZenScroll Team',
                text: rawText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ];
          });
        }
      };

      socket.onerror = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };

      socket.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };

      ws.current = socket;
    } catch {
      setIsConnecting(false);
      setIsConnected(false);
    }
  }, [studentId, studentName]);

  // Connect when open
  useEffect(() => {
    if (isOpen) {
      connectWebSocket();
    }
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [isOpen, connectWebSocket]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send Message Handler
  const sendMessage = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || input;

    if (!textToSend.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgId = `msg_student_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const payload: SupportMessage = {
      id: msgId,
      type: 'chat',
      senderRole: 'student',
      senderId: studentId,
      senderName: studentName || 'Aspirant',
      text: textToSend.trim(),
      timestamp,
    };

    // Send over WebSocket (Backend echoes it back to socket.onmessage, where it will be appended cleanly)
    ws.current.send(JSON.stringify(payload));
    if (!customText) setInput('');

    // Trigger Telegram Alert to Arjun (Admin) on first message of session
    if (!hasNotifiedTelegram) {
      setHasNotifiedTelegram(true);
      notifyLiveChatSession({
        studentId,
        studentName: studentName || 'Aspirant',
        initialMessage: textToSend.trim(),
      }).catch(() => {});
    }
  };

  // Quick Query Presets
  const quickPresets = [
    'What is MPPSC ZenScroll?',
    'Mains Answer Writing & Model Answers',
    'Prelims Unit-wise Tests & Mnemonics',
    'Pricing & Pro Access',
  ];

  // Show only on Home Page & Mains Landing Page
  if (pathname !== '/' && pathname !== '/mains') return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[101] bg-black/30 backdrop-blur-[2px]"
              aria-hidden="true"
            />

            {/* Chat Drawer Card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.92 }}
              className="fixed right-6 bottom-24 z-[102] flex max-h-[620px] h-[85vh] w-[92vw] max-w-[390px] flex-col overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-2xl"
            >
              {/* Sleek Header exactly matching original SupportChat */}
              <div className="relative overflow-hidden bg-gradient-to-r from-[#00F0FF] to-[#00D1E0] p-6 text-slate-900 shadow-sm shrink-0">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <MessageCircle size={100} />
                </div>
                
                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-1 font-sans text-xl font-bold text-slate-900 flex items-center gap-2">
                      {hi ? 'नमस्ते' : 'Hello'}
                      {studentName !== 'Aspirant' ? `, ${studentName}` : ''}!
                      <Image 
                        src="/images/avatars/notion-namaste.png" 
                        alt="Namaste" 
                        width={26} 
                        height={26} 
                        priority 
                        className="object-contain"
                      />
                    </h3>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      {hi ? 'लाइव मार्गदर्शन' : 'Live Guidance'}
                      {isConnected ? (
                        <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] border border-emerald-200 shadow-sm font-bold">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          </span>
                          Online
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[10px] border border-amber-200 font-bold">
                          <WifiOff size={10} /> Connecting
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-1.5 text-slate-700 hover:bg-black/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Tabs */}
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
                    Live Chat
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

              {/* Content Area */}
              <div className="flex-1 overflow-hidden bg-slate-50 flex flex-col min-h-0">
                {activeTab === 'chat' ? (
                  <div className="flex flex-col h-full overflow-hidden">
                    <ScrollArea className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                      <div className="flex flex-col gap-3">
                        {/* Quick Presets if no messages */}
                        {messages.length <= 1 && (
                          <div className="mt-1 space-y-2">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                              Common Queries
                            </p>
                            <div className="flex flex-col gap-1.5">
                              {quickPresets.map((preset, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => sendMessage(undefined, preset)}
                                  className="text-left text-xs bg-white border border-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-900 transition-all font-medium flex items-center justify-between group shadow-2xs"
                                >
                                  <span>{preset}</span>
                                  <Sparkles size={13} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Render Messages */}
                        {messages.map((msg, idx) => {
                          const isStudent = msg.senderRole === 'student';
                          const isSystem = msg.type === 'system';

                          if (isSystem) {
                            return (
                              <div key={idx} className="flex justify-center my-1">
                                <span className="text-[10px] font-semibold bg-slate-200/80 text-slate-700 px-3 py-1 rounded-full border border-slate-300/60 shadow-2xs">
                                  📢 {msg.text}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={msg.id || idx}
                              className={cn(
                                'flex items-start gap-2.5 max-w-[85%]',
                                isStudent ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'
                              )}
                            >
                              <Avatar className="h-7 w-7 shrink-0 border border-slate-200 shadow-xs mt-0.5">
                                <AvatarFallback
                                  className={cn(
                                    'text-[10px] font-black',
                                    isStudent
                                      ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                                      : 'bg-gradient-to-tr from-[#00D1E0] to-[#0091A8] text-white'
                                  )}
                                >
                                  {isStudent ? (
                                    studentName.substring(0, 2).toUpperCase()
                                  ) : (
                                    <ShieldCheck size={14} className="text-white" />
                                  )}
                                </AvatarFallback>
                              </Avatar>

                              <div className="min-w-0">
                                <div
                                  className={cn(
                                    'px-3.5 py-2.5 rounded-2xl text-[11px] sm:text-xs leading-relaxed shadow-xs font-medium break-words',
                                    isStudent
                                      ? 'bg-slate-900 text-white rounded-tr-none'
                                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                                  )}
                                >
                                  {msg.text}
                                </div>
                                <span
                                  className={cn(
                                    'text-[9px] text-slate-400 mt-1 block font-medium px-1',
                                    isStudent ? 'text-right' : 'text-left'
                                  )}
                                >
                                  {msg.timestamp}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Input Footer */}
                    <div className="p-3 border-t bg-white shrink-0">
                      <form onSubmit={sendMessage} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={
                            isConnected
                              ? 'Ask your doubt...'
                              : 'Connecting...'
                          }
                          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#00D1E0] focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
                        />
                        <button
                          type="submit"
                          disabled={!input.trim()}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md hover:bg-slate-800 disabled:opacity-50 transition-all shrink-0 active:scale-95"
                        >
                          <Send size={15} />
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  /* FAQs Tab */
                  <div className="space-y-2 p-4 flex-1 overflow-y-auto custom-scrollbar">
                    <p className="mb-2 px-1 text-xs font-semibold text-slate-500">
                      Frequently Asked Questions
                    </p>
                    {dynamicFaqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-all shadow-2xs"
                      >
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                          className="flex w-full items-center justify-between p-3 text-left font-semibold text-xs text-slate-800"
                        >
                          <span>{hi ? faq.question.hi : faq.question.en}</span>
                          {expandedFaq === idx ? (
                            <ChevronUp size={16} className="text-[#00D1E0] shrink-0" />
                          ) : (
                            <ChevronDown size={16} className="text-slate-400 shrink-0" />
                          )}
                        </button>
                        {expandedFaq === idx && (
                          <div className="border-t border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 leading-relaxed">
                            {hi ? faq.answer.hi : faq.answer.en}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Action Launcher */}
      <div className="fixed right-6 bottom-6 z-[100] flex flex-col items-end gap-3">
        <AnimatePresence>
          {!isOpen && isNudgeOpen && (
            <motion.div
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="mr-1 mb-1 flex origin-bottom-right items-center gap-3 rounded-2xl border border-amber-500/30 bg-[#060a12]/95 px-4 py-3.5 shadow-2xl backdrop-blur-md text-white ring-1 ring-white/5"
            >
              <div className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500"></span>
              </div>
              <div>
                <p className="text-sm leading-tight font-black text-white">
                  {pathname.startsWith('/mains') 
                    ? (hi ? 'Mains पूछताछ?' : 'Mains Query?')
                    : (hi ? 'मदद चाहिए?' : 'Need Help?')}
                </p>
                <p className="text-[11px] font-semibold whitespace-nowrap text-slate-400 mt-0.5">
                  {hi ? 'सपोर्ट टीम से बात करें' : 'Chat with support team'}
                </p>
              </div>

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

        <div className="relative flex h-14 w-14 items-center justify-center">
          {/* Animated Glowing Ring Backdrop (Tailwind Native & Safari Safe) */}
          <div className="absolute -inset-[10px] -z-10 blur-[12px] opacity-85 will-change-transform">
            <div 
              className="h-full w-full animate-spin rounded-full bg-[linear-gradient(135deg,rgb(47,190,238),rgb(218,57,143),rgb(139,255,23))]" 
              style={{ animationDuration: '2s' }} 
            />
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'group relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-3 border-slate-950 bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-500 text-white shadow-2xl shadow-amber-500/20 transition-all duration-300 hover:scale-110 active:scale-95',
              isOpen ? 'rotate-90 bg-slate-800' : 'hover:shadow-[0_0_30px_rgba(245,158,11,0.45)]'
            )}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MessageCircle className="h-6 w-6 transition-transform group-hover:rotate-12" />
            )}

            {!isOpen && (
              <span className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-red-500" />
            )}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.8); }
      `}} />
    </>
  );
}
