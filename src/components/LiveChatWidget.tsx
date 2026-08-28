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
  Bell,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getChatHistory } from '@/app/admin/live-chat/actions';
import { notifyLiveChatSession } from '@/actions/live-chat-actions';
import Link from 'next/link';
import {
  useChatStorage,
  loadMessages,
  saveMessages,
  incrementUnread,
} from '@/hooks/useChatStorage';

// Verified Blue Tick Badge
const CustomBadge = () => (
  <svg viewBox="0 0 15 16" className="size-[14px] drop-shadow-sm">
    <path
      className="fill-blue-500"
      d="M14.5425 6.8973L13.5 5.8398C13.4273 5.76858 13.3699 5.68331 13.3312 5.58919C13.2925 5.49507 13.2734 5.39405 13.275 5.2923V3.7923C13.274 3.58681 13.2324 3.38353 13.1527 3.19414C13.0729 3.00476 12.9565 2.833 12.8101 2.68874C12.6638 2.54448 12.4904 2.43055 12.2998 2.35351C12.1093 2.27647 11.9055 2.23783 11.7 2.2398H10.2C10.0982 2.24141 9.99722 2.22228 9.9031 2.1836C9.80898 2.14492 9.72371 2.08749 9.65249 2.0148L8.60249 0.957304C8.30998 0.665106 7.91344 0.500977 7.49999 0.500977C7.08654 0.500977 6.68999 0.665106 6.39749 0.957304L5.33999 1.9998C5.26876 2.07249 5.1835 2.12992 5.08937 2.1686C4.99525 2.20728 4.89424 2.22641 4.79249 2.2248H3.29249C3.08699 2.22578 2.88371 2.26735 2.69432 2.34713C2.50494 2.4269 2.33318 2.54331 2.18892 2.68966C2.04466 2.83602 1.93073 3.00943 1.85369 3.19994C1.77665 3.39046 1.73801 3.59431 1.73999 3.7998V5.2998C1.74159 5.40155 1.72247 5.50256 1.68378 5.59669C1.6451 5.69081 1.58767 5.77608 1.51499 5.8473L0.457487 6.8973C0.165289 7.18981 0.00115967 7.58635 0.00115967 7.9998C0.00115967 8.41325 0.165289 8.80979 0.457487 9.1023L1.49999 10.1598C1.57267 10.231 1.6301 10.3163 1.66878 10.4104C1.70747 10.5045 1.72659 10.6056 1.72499 10.7073V12.2073C1.72597 12.4128 1.76754 12.6161 1.84731 12.8055C1.92709 12.9949 2.04349 13.1666 2.18985 13.3109C2.3362 13.4551 2.50961 13.5691 2.70013 13.6461C2.89064 13.7231 3.0945 13.7618 3.29999 13.7598H4.79999C4.90174 13.7582 5.00275 13.7773 5.09687 13.816C5.191 13.8547 5.27627 13.9121 5.34749 13.9848L6.40499 15.0423C6.69749 15.3345 7.09404 15.4986 7.50749 15.4986C7.92094 15.4986 8.31748 15.3345 8.60999 15.0423L9.65999 13.9998C9.73121 13.9271 9.81647 13.8697 9.9106 13.831C10.0047 13.7923 10.1057 13.7732 10.2075 13.7748H11.7075C12.1212 13.7748 12.518 13.6104 12.8106 13.3179C13.1031 13.0253 13.2675 12.6285 13.2675 12.2148V10.7148C13.2659 10.6131 13.285 10.512 13.3237 10.4179C13.3624 10.3238 13.4198 10.2385 13.4925 10.1673L14.55 9.1098C14.6953 8.96434 14.8104 8.79157 14.8887 8.60146C14.9671 8.41134 15.007 8.20761 15.0063 8.00199C15.0056 7.79638 14.9643 7.59293 14.8847 7.40334C14.8051 7.21376 14.6888 7.04178 14.5425 6.8973Z"
    />
    <path
      className="fill-white"
      d="M10.635 6.6498L6.95249 10.2498C6.90055 10.3024 6.83864 10.3441 6.77038 10.3724C6.70212 10.4007 6.62889 10.4152 6.55499 10.4148C6.48062 10.4138 6.40719 10.398 6.33896 10.3684C6.27073 10.3388 6.20905 10.2959 6.15749 10.2423L4.37999 8.4423C4.32532 8.39026 4.28169 8.32775 4.25169 8.25849C4.22169 8.18923 4.20593 8.11464 4.20536 8.03916C4.20479 7.96369 4.21941 7.88887 4.24836 7.81916C4.27731 7.74946 4.31999 7.68629 4.37387 7.63342C4.42774 7.58056 4.4917 7.53908 4.56194 7.51145C4.63218 7.48382 4.70726 7.47061 4.78271 7.4726C4.85816 7.4746 4.93244 7.49176 5.00112 7.52306C5.0698 7.55436 5.13148 7.59917 5.18249 7.6548L6.56249 9.0573L9.84749 5.8473C9.95296 5.74197 10.0959 5.6828 10.245 5.6828C10.394 5.6828 10.537 5.74197 10.6425 5.8473C10.6953 5.90016 10.737 5.963 10.7653 6.03216C10.7935 6.10132 10.8077 6.17542 10.807 6.25013C10.8063 6.32483 10.7908 6.39865 10.7612 6.46728C10.7317 6.5359 10.6888 6.59795 10.635 6.6498Z"
    />
  </svg>
);

// Markdown URL parser to make links clickable and parse bold text in messages
const MarkdownRenderer = ({ text, isStudent }: { text: string; isStudent?: boolean }) => {
  if (!text) return null;
  
  const processBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <strong key={i} className="font-bold">{part.slice(1, -1)}</strong>;
      }
      return part;
    });
  };

  const processText = (str: string) => {
    const urlRegex = /(\[.*?\]\(https?:\/\/[^\s\)]+\)|https?:\/\/[^\s\)]+)/g;
    const parts = str.split(urlRegex);
    
    return parts.map((part, i) => {
      if (part.startsWith('[')) {
        const match = part.match(/\[(.*?)\]\((https?:\/\/[^\s]+)\)/);
        if (match) {
          return (
            <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition-colors font-bold text-slate-900 hover:text-black">
              {match[1]}
            </a>
          );
        }
      }
      if (part.startsWith('http')) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition-colors font-semibold break-all text-slate-900 hover:text-black">
            {part}
          </a>
        );
      }
      return <React.Fragment key={i}>{processBold(part)}</React.Fragment>;
    });
  };

  return <span className="whitespace-pre-wrap">{processText(text)}</span>;
};

export type SupportMessage = {
  id?: string;
  type: 'chat' | 'system';
  msgType?: 'text' | 'rich_link' | 'interactive';
  metadata?: any;
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
          <Link href="/pricing" className="font-semibold text-slate-900 hover:underline">
            Pricing page
          </Link>
          . If you face any issues, our support team is always here to help!
        </span>
      ),
      hi: (
        <span>
          आप हमारे{' '}
          <Link href="/pricing" className="font-semibold text-slate-900 hover:underline">
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
  const [activeTab, setActiveTab] = useState<'chat' | 'faq' | 'contact'>('chat');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isNudgeOpen, setIsNudgeOpen] = useState(true);
  const [hasNotifiedTelegram, setHasNotifiedTelegram] = useState(false);
  const [showReconnectBanner, setShowReconnectBanner] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');
  const [tempName, setTempName] = useState('');
  const [isBanned, setIsBanned] = useState(false);
  const welcomeMessageTriggered = useRef(false);

  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);

  // Sync isOpen state to ref for websocket callbacks without triggering reconnections
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Persistent visitor-based identity (SSR-safe, never changes across sessions)
  const { visitorId, studentId: persistentStudentId, unreadCount, clearUnreadCount } = useChatStorage();
  const [studentId, setStudentId] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');

  // Dynamic FAQs based on route
  const dynamicFaqs = isMainsPage
    ? [
        {
          question: { en: 'How to unlock Mains Gyan Kosh?', hi: 'मेंस ज्ञानकोश (Mains Gyan Kosh) कैसे अनलॉक करें?' },
          answer: {
            en: (
              <span>
                You can unlock instant access to the entire Mains syllabus tree & PYQ Library with dual-variant model answers directly from our{' '}
                <Link href="/pricing?need=mains" className="font-semibold text-slate-900 hover:underline">
                  Pricing page
                </Link>
                . No rote-learning generic notes — pure exam blueprints!
              </span>
            ),
            hi: (
              <span>
                आप हमारे{' '}
                <Link href="/pricing?need=mains" className="font-semibold text-slate-900 hover:underline">
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

  // Setup Student Identifier using persistent visitorId from useChatStorage
  useEffect(() => {
    if (persistentStudentId) {
      setStudentId(persistentStudentId);
    }
    if (typeof window !== 'undefined') {
      const guestName = localStorage.getItem('mppsc_guest_name');
      const name = user?.name || guestName;
      if (name) {
        setStudentName(name);
      }
    }
  }, [persistentStudentId, user?.name]);

  // Sync identity
  useEffect(() => {
    if (user?.name) {
      setStudentName(user.name);
    } else {
      const storedName = localStorage.getItem('mppsc_guest_name');
      if (storedName) {
        setStudentName(storedName);
      }
    }
  }, [user?.name]);

  // Welcome Message Logic (Always show to make it feel like a live chat)
  useEffect(() => {
    if (isOpen && messages.length === 0 && !welcomeMessageTriggered.current) {
      welcomeMessageTriggered.current = true;
      const timer = setTimeout(() => {
        setMessages([{
          id: 'welcome_msg',
          type: 'chat',
          msgType: 'text',
          senderRole: 'admin',
          senderId: 'admin_arjun',
          senderName: 'Arjun (ZenScroll)',
          text: studentName 
            ? `Hi ${studentName}! 👋 How can I help you today?` 
            : "Hi! 👋 Welcome to ZenScroll Support.\nTo help me assist you better, what is your good name?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, studentName, messages.length]);
  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      localStorage.setItem('mppsc_guest_name', tempName.trim());
      setStudentName(tempName.trim());
      setShowNameModal(false);
      
      // Send the intercepted message immediately
      if (pendingMessage.trim()) {
        sendMessage(undefined, pendingMessage.trim(), undefined, true);
        setPendingMessage('');
      }
    }
  };

  // Restore messages from persistent storage and fetch latest from backend
  useEffect(() => {
    if (isOpen && studentId) {
      // 1. Load instantly from LocalStorage (Optimistic UI)
      const persisted = loadMessages<SupportMessage>(visitorId);
      if (persisted.length > 0) {
        let currentBanState = false;
        persisted.forEach(m => {
          if (m.text === 'BAN_USER' || m.text.toLowerCase().includes('banned')) currentBanState = true;
          if (m.text === 'UNBAN_USER' || m.text.toLowerCase().includes('unbanned')) currentBanState = false;
        });
        setIsBanned(currentBanState);
        
        setMessages(persisted.filter(m => 
          m.text !== 'BAN_USER' && m.text !== 'UNBAN_USER' && 
          !m.text.toLowerCase().includes('banned') && !m.text.toLowerCase().includes('unbanned')
        ));
      }

      // 2. Fetch from Backend to get any offline replies from Admin (Server-to-Server)
      const fetchHistory = async () => {
        try {
          const history = await getChatHistory(studentId);
          if (history && history.length > 0) {
            
            let currentBanState = false;
            history.forEach(m => {
              if (m.text === 'BAN_USER' || m.text.toLowerCase().includes('banned')) currentBanState = true;
              if (m.text === 'UNBAN_USER' || m.text.toLowerCase().includes('unbanned')) currentBanState = false;
            });
            setIsBanned(currentBanState);
            
            const filteredHistory = history.filter(m => 
              m.text !== 'BAN_USER' && m.text !== 'UNBAN_USER' && 
              !m.text.toLowerCase().includes('banned') && !m.text.toLowerCase().includes('unbanned')
            );

            setMessages((prev) => {
              // Deduplicate: Combine history and local messages, keeping unique IDs
              const allMessages = [...filteredHistory, ...prev];
              const uniqueMessages = Array.from(new Map(allMessages.map(m => [m.id, m])).values());
              return uniqueMessages as SupportMessage[];
            });
            
            if (history.length > persisted.length) {
              setShowReconnectBanner(true);
              setTimeout(() => setShowReconnectBanner(false), 4000);
            }
          }
        } catch (err) {
          console.error('Failed to sync history from server action:', err);
        }
      };

      fetchHistory();
    }
  }, [isOpen, studentId, visitorId]);

  // Persist messages whenever they change (with 24hr TTL)
  useEffect(() => {
    if (visitorId && messages.length > 0) {
      saveMessages<SupportMessage>(visitorId, messages);
    }
  }, [messages, visitorId]);

  // Clear unread count when chat is opened
  useEffect(() => {
    if (isOpen) {
      clearUnreadCount();
    }
  }, [isOpen, clearUnreadCount]);

  // (messages are now persisted via saveMessages in the effect above)

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
          console.log("from socket",data);
          
          // Completely discard the annoying backend system welcome message (case-insensitive)
          if (data.text.toLowerCase().includes('admin team online hai')) {
            return;
          }

          if (data.type === 'system') {
            if (data.text === 'BAN_USER' || data.text.toLowerCase().includes('banned')) {
              setIsBanned(true);
              return;
            }
            if (data.text === 'UNBAN_USER' || data.text.toLowerCase().includes('unbanned')) {
              setIsBanned(false);
              return;
            }
          }

          const msgId = data.id || `${data.senderId}_${data.timestamp}_${data.text}`;
          data.id = msgId;

          // Process side effects outside of the setState updater to prevent React render errors
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === msgId);
            if (!exists && data.senderRole === 'admin' && !isOpenRef.current) {
              // Wait until next tick to avoid any sync issues during React render phase
              setTimeout(() => incrementUnread(visitorId), 0);
            }
            return exists ? prev : [...prev, data];
          });
        } catch {
          const rawText = event.data;
          
          // Completely discard the annoying backend welcome message (case-insensitive)
          if (rawText.toLowerCase().includes('admin team online hai')) {
            return;
          }
          
          if (rawText.includes('BAN_USER') || rawText.toLowerCase().includes('banned')) {
            setIsBanned(true);
            return;
          }

          if (rawText.includes('UNBAN_USER') || rawText.toLowerCase().includes('unbanned')) {
            setIsBanned(false);
            return;
          }

          setMessages((prev) => {
            // Check if this exact system message is already in the list to prevent repeats
            const exists = prev.some(m => m.text === rawText && m.senderId === 'admin_sys');
            if (!exists && !isOpenRef.current) {
              setTimeout(() => incrementUnread(visitorId), 0);
            }
            
            return exists ? prev : [
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
  }, [studentId, studentName, visitorId]);

  // Connect when studentId is available (stay connected across open/close)
  useEffect(() => {
    if (studentId) {
      connectWebSocket();
    }
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [studentId, connectWebSocket]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send Message Handler
  const sendMessage = (e?: React.FormEvent, customText?: string, msgType?: string, bypassNameCheck?: boolean) => {
    if (e) e.preventDefault();
    if (isBanned) return;

    const textToSend = customText || input;

    if (!textToSend.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN) {
      return;
    }

    // Intercept if name is missing
    if (!bypassNameCheck && !studentName && !localStorage.getItem('mppsc_guest_name')) {
      setPendingMessage(textToSend);
      setShowNameModal(true);
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

    // Optimistically add the message locally right away (don't wait for backend echo)
    setMessages((prev) => {
      if (prev.some((m) => m.id === msgId)) return prev;
      return [...prev, payload];
    });

    // Send over WebSocket
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
      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed right-4 sm:right-6 bottom-20 sm:bottom-24 z-[100] flex h-[calc(100dvh-100px)] sm:h-[600px] w-[calc(100vw-32px)] sm:max-w-[380px] flex-col overflow-hidden overscroll-y-none rounded-2xl border border-slate-200/60 bg-[#FAFAFA] shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
            >
              {/* Header */}
              <div className="relative shrink-0 overflow-hidden bg-[#00e5ff] p-5 text-slate-900 z-10 rounded-t-2xl">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <MessageCircle size={120} className="text-slate-900" />
                </div>
                
                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-1 font-sans text-xl font-bold text-slate-900 flex items-center gap-2">
                      {hi ? 'नमस्ते' : 'Hello'}
                      {studentName !== 'Aspirant' ? `, ${studentName}` : ''}! 👋
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
                <div className="relative z-10 mt-4 flex gap-1.5">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={cn(
                      'flex-1 rounded-full px-2 py-1.5 text-xs font-semibold transition-all',
                      activeTab === 'chat'
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    Live Chat
                  </button>
                  <button
                    onClick={() => setActiveTab('faq')}
                    className={cn(
                      'flex-1 rounded-full px-2 py-1.5 text-xs font-semibold transition-all',
                      activeTab === 'faq'
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    FAQs
                  </button>
                  <button
                    onClick={() => setActiveTab('contact')}
                    className={cn(
                      'flex-1 rounded-full px-2 py-1.5 text-xs font-semibold transition-all',
                      activeTab === 'contact'
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    Contact
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-hidden bg-white flex flex-col min-h-0">
                {activeTab === 'chat' ? (
                  <div className="flex flex-col h-full overflow-hidden">
                    {/* Reconnect Banner */}
                    {showReconnectBanner && (
                      <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px] text-emerald-800 font-semibold shadow-xs">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        </span>
                        Welcome back! Reconnecting your chat history...
                      </div>
                    )}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                                className="text-left text-xs bg-slate-50 border border-slate-100 text-slate-700 px-3.5 py-2.5 rounded-xl hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 transition-all font-medium"
                              >
                                {preset}
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
                            <div key={idx} className="flex justify-center my-2">
                              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                                {msg.text}
                              </span>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={msg.id || idx}
                            className={cn(
                              'flex items-end gap-2 max-w-[90%] md:max-w-[85%]',
                              isStudent ? 'ml-auto flex-row-reverse' : 'mr-auto'
                            )}
                          >
                            {/* Avatar */}
                            {!isStudent ? (
                              <div className="relative shrink-0 mb-1">
                                <Avatar className="h-7 w-7 ring-offset-background ring-2 ring-green-500 ring-offset-1 bg-white shadow-sm z-10">
                                  <AvatarImage src="/images/avatars/notion-admin.jpg" alt="Admin" className="object-cover" />
                                  <AvatarFallback className="text-[10px] font-black bg-slate-100 text-slate-900">A</AvatarFallback>
                                </Avatar>
                                <span style={{ top: '-0.3rem', right: '-0.3rem' }} className="absolute z-20">
                                  <CustomBadge />
                                </span>
                                <span className="border-white absolute -right-0.5 bottom-0 h-2.5 w-2.5 rounded-full border-2 bg-green-500 z-20" />
                              </div>
                            ) : (
                              <Avatar className="h-7 w-7 border border-slate-200 shadow-sm shrink-0 mb-1 bg-slate-50">
                                <AvatarImage src={`https://api.dicebear.com/9.x/notionists/svg?seed=${studentName}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`} alt={studentName} />
                                <AvatarFallback className="text-[10px] font-black bg-slate-100 text-slate-600">{studentName.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            )}

                            {/* Message Bubble */}
                            <div
                              className={cn(
                                'px-4 py-3 rounded-2xl text-[13px] shadow-sm leading-relaxed border',
                                msg.msgType === 'rich_link'
                                  ? 'bg-slate-50 border-slate-200/80 rounded-bl-[4px] shadow-sm w-full min-w-[200px]'
                                  : isStudent
                                    ? 'bg-white border-slate-200/80 text-slate-800 rounded-br-[4px]'
                                    : 'bg-white border-slate-200/80 text-slate-800 rounded-bl-[4px]'
                              )}
                            >
                              {msg.msgType === 'rich_link' ? (
                                <div className="flex flex-col gap-3">
                                  <p className="text-slate-800 font-medium text-xs leading-relaxed"><MarkdownRenderer text={msg.text} isStudent={isStudent} /></p>
                                  {msg.metadata?.url && (
                                    <a 
                                      href={msg.metadata.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center w-full px-4 py-2.5 bg-slate-900 text-white text-[11px] uppercase tracking-wide font-black rounded-xl shadow hover:bg-black hover:shadow-md transition-all active:scale-[0.98]"
                                    >
                                      {msg.metadata.title || 'View Link'}
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <MarkdownRenderer text={msg.text} isStudent={isStudent} />
                              )}
                              <span
                                className={cn(
                                  "text-[9px] font-semibold mt-1.5 block select-none text-right opacity-80 text-slate-400"
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

                    {/* Input Footer */}
                    <div className="shrink-0 p-3 bg-white border-t border-slate-100 relative">
                      <AnimatePresence>
                        {showNameModal && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full left-0 right-0 mb-3 mx-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 flex flex-col items-center"
                          >
                            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-slate-200 rotate-45 z-[-1]"></div>
                            <h4 className="text-[13px] font-bold text-slate-900 mb-1 text-center">Before sending your message...</h4>
                            <p className="text-[11px] font-medium text-slate-500 mb-3 text-center">What is your good name?</p>
                            <form onSubmit={handleSaveName} className="w-full flex gap-2">
                              <input
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                placeholder="Your name..."
                                autoFocus
                                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 focus:outline-none transition-all"
                              />
                              <button
                                type="submit"
                                disabled={!tempName.trim()}
                                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-black disabled:opacity-50 transition-colors"
                              >
                                Send
                              </button>
                            </form>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {isBanned ? (
                        <div className="w-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold px-4 py-2.5 rounded-xl text-center flex items-center justify-center gap-2">
                          <ShieldCheck size={14} className="text-rose-500" />
                          You have been restricted from Live Chat.
                        </div>
                      ) : (
                        <form onSubmit={sendMessage} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:outline-none transition-all"
                          />
                          <button
                            type="submit"
                            disabled={!input.trim()}
                            className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-900 text-white disabled:opacity-50 shrink-0 hover:bg-black transition-colors"
                          >
                            <Send size={14} />
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                ) : activeTab === 'faq' ? (
                  /* FAQs Tab */
                  <div className="space-y-2 p-4 flex-1 overflow-y-auto">
                    <p className="mb-2 px-1 text-xs font-semibold text-slate-500">
                      Frequently Asked Questions
                    </p>
                    {dynamicFaqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                      >
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                          className="flex w-full items-center justify-between p-3 text-left font-semibold text-xs text-slate-800"
                        >
                          <span>{hi ? faq.question.hi : faq.question.en}</span>
                          {expandedFaq === idx ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                        {expandedFaq === idx && (
                          <div className="border-t border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 leading-relaxed">
                            {hi ? faq.answer.hi : faq.answer.en}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Still have questions CTA */}
                    <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center shadow-sm">
                      <p className="text-sm font-semibold text-slate-900 mb-3">Still have questions?</p>
                      <button
                        onClick={() => setActiveTab('chat')}
                        className="rounded-full bg-white border border-slate-300 px-5 py-2 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-100 hover:border-slate-400 transition-all active:scale-95"
                      >
                        Chat with Support
                      </button>
                    </div>
                  </div>
                ) : activeTab === 'contact' ? (
                  /* Contact Us Tab */
                  <div className="flex flex-col gap-4 p-5 overflow-y-auto flex-1">

                    <div className="flex gap-3 mb-2 mt-2">
                      {/* WhatsApp Card */}
                      <a
                        href="https://wa.me/919109090606?text=Hello%2C%20I%20need%20help%20with%20MPPSC%20ZenScroll"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 relative overflow-hidden group flex flex-col items-center justify-center rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm hover:border-green-400 hover:shadow-md transition-all"
                      >
                        <div className="absolute top-2 right-2 bg-green-100 border border-green-200 text-green-700 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> ONLINE
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 shadow-sm mb-3 group-hover:scale-110 transition-transform">
                          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        </div>
                        <p className="text-sm font-black text-slate-800">WhatsApp</p>
                        <p className="text-[10px] font-semibold text-green-600">Instant Reply</p>
                      </a>

                      {/* Telegram Card */}
                      <a
                        href="https://t.me/mppolice_constable_si"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 group flex flex-col items-center justify-center rounded-2xl border border-[#229ED9]/20 bg-sky-50 p-4 shadow-sm hover:border-[#229ED9] hover:shadow-md transition-all"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#229ED9] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                          </svg>
                        </div>
                        <p className="text-sm font-black text-slate-800">Telegram</p>
                        <p className="text-[10px] font-semibold text-[#229ED9]">Automated Bot</p>
                      </a>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-3">
                      <div className="h-px flex-1 bg-slate-200"></div>
                      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Or Send A Message</span>
                      <div className="h-px flex-1 bg-slate-200"></div>
                    </div>

                    {/* Form Placeholder */}
                    <form className="flex flex-col gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1 ml-1">Name</label>
                        <input type="text" placeholder="Your Name" className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all" />
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-[11px] font-bold text-slate-600 mb-1 ml-1">Email</label>
                          <input type="email" placeholder="john@example.com" className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[11px] font-bold text-slate-600 mb-1 ml-1">Phone</label>
                          <input type="text" placeholder="+91..." className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1 ml-1">Message</label>
                        <textarea placeholder="How can we help you?" rows={3} className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all resize-none"></textarea>
                      </div>
                      <button type="button" className="w-full bg-[#111827] text-white font-bold py-3 rounded-xl mt-1 hover:bg-slate-800 transition-colors shadow-md">
                        Send Message
                      </button>
                    </form>
                  </div>
                ) : null}
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

        <div className={cn(
          "relative flex h-14 items-center justify-center transition-all duration-300",
          !isOpen && unreadCount > 0 ? "w-auto min-w-[5.5rem]" : "w-14"
        )}>
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
              'group relative z-10 flex h-14 items-center justify-center rounded-full border-3 border-slate-950 bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-500 text-white shadow-2xl shadow-amber-500/20 transition-all duration-300 hover:scale-110 active:scale-95 overflow-visible',
              isOpen 
                ? 'rotate-90 bg-slate-800 w-14' 
                : unreadCount > 0 
                  ? 'w-full px-4 gap-2 border-red-500 bg-gradient-to-tr from-red-600 to-rose-500' 
                  : 'w-14 hover:shadow-[0_0_30px_rgba(245,158,11,0.45)]'
            )}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : unreadCount > 0 ? (
              <>
                <Bell className="h-5 w-5 animate-wiggle" />
                <span className="font-black text-sm tracking-wide">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </>
            ) : (
              <MessageCircle className="h-6 w-6 transition-transform group-hover:rotate-12" />
            )}
          </button>

          {/* Ping dot indicator placed OUTSIDE the button to absolutely prevent any browser clipping/stacking issues */}
          {!isOpen && unreadCount > 0 && (
            <span style={{ top: '-0.25rem', right: '-0.25rem' }} className="absolute z-[99999] flex h-4 w-4 pointer-events-none">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-slate-950"></span>
            </span>
          )}
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
