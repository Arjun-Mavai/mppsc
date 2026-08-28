'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  Send,
  User,
  Wifi,
  WifiOff,
  Search,
  Zap,
  Sparkles,
  ShieldCheck,
  CheckCheck,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Markdown URL parser to make links clickable and parse bold text in messages
const MarkdownRenderer = ({ text, isAdmin }: { text: string; isAdmin?: boolean }) => {
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
            <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer" className={cn("underline underline-offset-2 transition-colors font-bold", isAdmin ? "text-white hover:text-white/80" : "text-slate-900 hover:text-black")}>
              {match[1]}
            </a>
          );
        }
      }
      if (part.startsWith('http')) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={cn("underline underline-offset-2 transition-colors font-semibold break-all", isAdmin ? "text-white hover:text-white/80" : "text-slate-900 hover:text-black")}>
            {part}
          </a>
        );
      }
      return <React.Fragment key={i}>{processBold(part)}</React.Fragment>;
    });
  };

  return <span className="whitespace-pre-wrap">{processText(text)}</span>;
};

const CustomBadge = () => {
  return (
    <svg viewBox="0 0 15 16" className="size-5">
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
};

export type SupportMessage = {
  id?: string;
  type: 'chat' | 'system';
  senderRole: 'student' | 'admin' | 'system';
  senderId: string;
  senderName: string;
  targetId?: string;
  text: string;
  timestamp: string;
  msgType?: 'text' | 'rich_link' | 'interactive';
  metadata?: any;
};

export type StudentSession = {
  id: string;
  name: string;
  lastMessage: string;
  lastTime: string;
  lastTimestamp?: number;
  unreadCount: number;
  isOnline: boolean;
  messages: SupportMessage[];
  isBanned?: boolean;
};

import { getActiveSessions, getChatHistory, banStudentAction, unbanStudentAction } from './actions';

export default function AdminLiveChatPage() {
  const queryClient = useQueryClient();
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isBanning, setIsBanning] = useState(false);
  const [isUnbanning, setIsUnbanning] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeStudentIdRef = useRef<string | null>(null);

  // 1. Initial sessions fetch via TanStack Query (no useEffect needed)
  const { data: students = {} } = useQuery<Record<string, StudentSession>>({
    queryKey: ['adminChatSessions'],
    queryFn: async () => {
      const activeSessions = await getActiveSessions();
      const result: Record<string, StudentSession> = {};
      if (activeSessions && Array.isArray(activeSessions)) {
        activeSessions.forEach((session) => {
          const sessionTime = new Date(session.updatedAt || Date.now());
          result[session.id] = {
            id: session.id,
            name: session.name || 'Aspirant',
            lastMessage: session.isBanned ? '🚫 Banned' : 'Tap to load history...',
            lastTime: sessionTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            lastTimestamp: sessionTime.getTime(),
            unreadCount: 0,
            isOnline: false,
            messages: [],
            isBanned: session.isBanned || false,
          };
        });
      }
      return result;
    },
    staleTime: Infinity, // Ensure this only fetches once on mount
  });


  // Connect Admin WebSocket
  const connectAdminWs = useCallback(() => {
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const getWsUrl = () => {
      if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
      if (process.env.NODE_ENV === 'production') return 'wss://websocket-realtime-chat-render.onrender.com/ws';
      return 'ws://localhost:8080/ws';
    };
    const baseUrl = getWsUrl();
    const adminUrl = `${baseUrl}?role=admin&userId=admin_arjun&name=${encodeURIComponent('Admin Arjun')}`;

    try {
      const socket = new WebSocket(adminUrl);

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const msg: SupportMessage = JSON.parse(event.data);
          
          const textLower = msg.text.toLowerCase();
          // Completely discard the annoying backend system welcome messages
          if (
            textLower.includes('admin team online hai') || 
            textLower.includes('naya student connect hua') ||
            textLower.includes('has joined the chat')
          ) {
            return;
          }

          // Assign ID if missing
          const msgId = msg.id || `${msg.senderId}_${msg.timestamp}_${msg.text}`;
          msg.id = msgId;

          // Identify student ID
          const studentId =
            msg.senderRole === 'student'
              ? msg.senderId
              : msg.targetId || 'unknown_student';

          if (!studentId || studentId === 'admin_arjun') return;

          // Handle ban/unban system messages
          let isBanUpdate = false;
          let newBanState = false;
          
          if (msg.type === 'system') {
            if (msg.text === 'BAN_USER' || textLower.includes('banned')) {
              isBanUpdate = true;
              newBanState = true;
            } else if (msg.text === 'UNBAN_USER' || textLower.includes('unbanned')) {
              isBanUpdate = true;
              newBanState = false;
            }
          }

          queryClient.setQueryData<Record<string, StudentSession>>(['adminChatSessions'], (prev = {}) => {
            const existing = prev[studentId] || {
              id: studentId,
              name: msg.senderName || 'Aspirant',
              lastMessage: isBanUpdate ? (newBanState ? '🚫 Banned' : '✅ Unbanned') : msg.text,
              lastTime: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              lastTimestamp: Date.now(),
              unreadCount: 0,
              isOnline: true,
              messages: [],
              isBanned: newBanState,
            };

            // If it's just a ban status update system message, update state and don't add to messages array
            if (isBanUpdate) {
              return {
                ...prev,
                [studentId]: {
                  ...existing,
                  lastMessage: newBanState ? '🚫 Banned' : '✅ Unbanned',
                  isBanned: newBanState,
                }
              };
            }

            // Deduplication Check by Message ID
            if (existing.messages.some((m) => m.id === msgId)) {
              return prev;
            }

            const currentActiveId = activeStudentIdRef.current;
            const isCurrentActive = currentActiveId === studentId;
            const updatedUnread =
              !isCurrentActive && msg.senderRole === 'student'
                ? existing.unreadCount + 1
                : existing.unreadCount;

            const displayName =
              msg.senderName && msg.senderName !== 'Admin Arjun' && msg.senderName !== 'ZenScroll Team'
                ? msg.senderName
                : existing.name;

            return {
              ...prev,
              [studentId]: {
                ...existing,
                name: displayName,
                lastMessage: msg.text,
                lastTime: msg.timestamp || existing.lastTime,
                lastTimestamp: Date.now(),
                unreadCount: updatedUnread,
                isOnline: true,
                messages: [...existing.messages, msg],
              },
            };
          });
        } catch (err) {
          console.error('Failed to parse incoming WS message:', err);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
      };

      ws.current = socket;
    } catch (err) {
      console.error('Failed to connect Admin WebSocket:', err);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    connectAdminWs();
    return () => {
      if (ws.current) ws.current.close();
    };
  }, [connectAdminWs]);



  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [students, activeStudentId]);

  // Select student & reset unread count & fetch history
  const handleSelectStudent = async (id: string) => {
    setActiveStudentId(id);
    activeStudentIdRef.current = id; // Sync ref in the event handler (no useEffect needed)
    
    queryClient.setQueryData<Record<string, StudentSession>>(['adminChatSessions'], (prev = {}) => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          unreadCount: 0,
        },
      };
    });

    // Fetch history using Server Action
    try {
      const history = await getChatHistory(id);
      if (history && history.length > 0) {
        queryClient.setQueryData<Record<string, StudentSession>>(['adminChatSessions'], (prev = {}) => {
          const existing = prev[id];
          if (!existing) return prev;
          
          // Deduplicate
          const allMessages = [...history, ...existing.messages];
          const uniqueMessages = Array.from(new Map(allMessages.map(m => [m.id, m])).values());
          
          return {
            ...prev,
            [id]: {
              ...existing,
              messages: uniqueMessages,
            },
          };
        });
      }
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
    }
  };

  const handleBanStudent = async () => {
    if (!activeStudentId) return;
    if (!confirm('Are you sure you want to ban this user for 10 minutes?')) return;
    
    setIsBanning(true);
    const res = await banStudentAction(activeStudentId);
    if (res.success) {
      alert('User banned successfully for 10 minutes.');
      queryClient.setQueryData<Record<string, StudentSession>>(['adminChatSessions'], (prev = {}) => ({
        ...prev,
        [activeStudentId]: {
          ...prev[activeStudentId],
          lastMessage: '🚫 Banned',
          isBanned: true,
        }
      }));

      // Tell Go server to instantly drop the user's connection
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          id: `sys_ban_${Date.now()}`,
          type: 'system',
          senderRole: 'admin',
          senderId: 'admin_arjun',
          targetId: activeStudentId,
          text: 'BAN_USER'
        }));
      }
    } else {
      alert('Failed to ban user.');
    }
    setIsBanning(false);
  };

  const handleUnbanStudent = async () => {
    if (!activeStudentId) return;
    if (!confirm('Are you sure you want to unban this user?')) return;
    
    setIsUnbanning(true);
    const res = await unbanStudentAction(activeStudentId);
    if (res.success) {
      alert('User unbanned successfully.');
      queryClient.setQueryData<Record<string, StudentSession>>(['adminChatSessions'], (prev = {}) => ({
        ...prev,
        [activeStudentId]: {
          ...prev[activeStudentId],
          lastMessage: '✅ Unbanned',
          isBanned: false,
        }
      }));

      // Tell frontend to allow messages again
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          id: `sys_unban_${Date.now()}`,
          type: 'system',
          senderRole: 'admin',
          senderId: 'admin_arjun',
          targetId: activeStudentId,
          text: 'UNBAN_USER'
        }));
      }
    } else {
      alert('Failed to unban user.');
    }
    setIsUnbanning(false);
  };

  // Send message to active student
  const sendMessage = (e?: React.FormEvent, customText?: string, msgType: 'text' | 'rich_link' | 'interactive' = 'text', metadata?: any) => {
    if (e) e.preventDefault();
    if (!activeStudentId || (!input.trim() && !customText)) return;

    const textToSend = customText || input;
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgId = `msg_admin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const payload: SupportMessage = {
      id: msgId,
      type: 'chat',
      senderRole: 'admin',
      senderId: 'admin_arjun',
      senderName: 'Admin Arjun',
      targetId: activeStudentId,
      text: textToSend.trim(),
      timestamp,
      msgType,
      metadata,
    };

    // Send over WebSocket (WebSocket will echo it back to ws.onmessage)
    ws.current.send(JSON.stringify(payload));
    if (!customText) setInput('');
  };

  const QUICK_REPLIES = [
    { label: '👋 Hi (Hindi)', text: 'नमस्ते! 🙏\n\nमैं अर्जुन बात कर रहा हूँ। MPPSC ZenScroll की सपोर्ट टीम से जुड़ने के लिए धन्यवाद।\n\nमैं आज आपकी क्या सहायता कर सकता हूँ?\n\nRegards,\nArjun\n*MPPSC ZenScroll Team*' },
    { label: '👋 Hi (English)', text: 'Hello! 🙏\n\nThis is Arjun. Thank you for reaching out to MPPSC ZenScroll support.\n\nHow can I help you today?\n\nRegards,\nArjun\n*MPPSC ZenScroll Team*' },
    { label: '🔗 Pre + Mains Links', text: '🎯 *MPPSC ZenScroll - Active Libraries* 🚀\n\nनमस्ते! 🙏\n\nआप अपनी तैयारी के अनुसार नीचे दिए गए डायरेक्ट लिंक्स से हमारी लाइब्रेरीज को एक्सप्लोर कर सकते हैं:\n\n💻 [Home (Prelims Library)](https://mppsc.zenscroll.app)\n🏛️ [Mains Library (Syllabus & Model Answers)](https://mppsc.zenscroll.app/mains)\n\nRegards,\n*MPPSC ZenScroll Team*' },
    { label: '💡 Pre Strategy Advice', text: '💡 *MPPSC Prelims - ZenScroll Strategy* 🎯\n\nनमस्ते! 🙏\n\nPrelims की तैयारी को लेकर हमारी एप्रोच बहुत सिंपल है:\n\n1️⃣ *Syllabus की गहरी समझ:* रटने से पहले पूरे सिलेबस (Unit-wise) को माइक्रो-लेवल पर समझें।\n2️⃣ *PYQs का गहरा विश्लेषण:* पिछले साल के प्रश्नों (PYQs) को समझें ताकि पता चले कि आयोग किस तरह के प्रश्न और फैक्ट्स पूछ रहा है।\n3️⃣ *Clarity Before Content:* पहले अपनी समझ मजबूत करें, फिर कंटेंट पढ़ें।\n\nअपनी तैयारी शुरू करने के लिए यहाँ जाएँ:\n🔗 [Home / Prelims](https://mppsc.zenscroll.app)\n🔗 [Free Demo Quiz](https://mppsc.zenscroll.app/free-quiz)\n\nRegards,\n*MPPSC ZenScroll Team*' },
    { label: '💡 Mains Strategy Advice', text: '💡 *MPPSC Mains - ZenScroll Strategy* 🏛️\n\nनमस्ते! 🙏\n\nMains परीक्षा को क्रैक करने के लिए हमारी थिंकिंग:\n\n1️⃣ *Keyword Level Decoding:* सिलेबस के हर एक टॉपिक पर आपके पास 3, 5, और 11 markers के पॉइंट तैयार होने चाहिए।\n2️⃣ *PYQ Integration:* टॉपिक को पुराने साल के प्रश्नों से लिंक करके पढ़ें ताकि एग्जाम का पैटर्न समझ आए।\n3️⃣ *Answer Thinking (उत्तर सोचने का तरीका):* नोट्स रटने के बजाय सही उत्तर लिखने की एप्रोच सीखें।\n\nमैल्यू-ऐडेड नोट्स और मॉडल उत्तर देखने के लिए यहाँ जाएँ:\n🔗 [Mains Library](https://mppsc.zenscroll.app/mains)\n\nRegards,\n*MPPSC ZenScroll Team*' },
    { label: '💳 Pre Payment', text: '🎯 *Prelims Intelligence Course*\n\nनमस्ते! 🙏\nCourse access ke liye aap apna secure payment yahan se complete kar sakte hain:\n\n🔗 [Payment Link](https://mppsc.zenscroll.app/pricing?need=pre)\n\n⚡ (Payment complete hone ke baad please yahan ek screenshot bhej dijiye!)\n\nRegards,\n*MPPSC ZenScroll Team*' },
    { label: '💳 Mains Payment', text: '🏛️ *Mains Syllabus Hub*\n\nनमस्ते! 🙏\nCourse access ke liye aap apna secure payment yahan se complete kar sakte hain:\n\n🔗 [Payment Link](https://mppsc.zenscroll.app/pricing?need=mains)\n\n⚡ (Payment complete hone ke baad please yahan ek screenshot bhej dijiye!)\n\nRegards,\n*MPPSC ZenScroll Team*' },
    { label: '💳 Combo Plan', text: '🏛️ *Combo Plan (Prelims + Mains)*\n\nनमस्ते! 🙏\nPrelims and Mains dono courses ko join karne ke liye secure payment complete karein:\n\n🔗 [Pricing Page](https://mppsc.zenscroll.app/pricing)\n👉 [Direct Prelims](https://mppsc.zenscroll.app/pricing?need=pre)\n👉 [Direct Mains](https://mppsc.zenscroll.app/pricing?need=mains)\n\nRegards,\n*MPPSC ZenScroll Team*' },
    { label: '⚙️ Tech Fixed', text: '🛠️ *Issue Resolved / तकनीकी समस्या हल*\n\nनमस्ते! 🙏\nAapne jo issue report kiya tha, humari technical team ne use successfully resolve kar diya hai.\n\nKripya ek baar website ko refresh karein aur check karein.\n\nRegards,\n*MPPSC ZenScroll Team*' },
    { label: '⏳ Follow up', text: '⏳ *Awaiting Your Reply / प्रतीक्षा*\n\nनमस्ते! 🙏\nHum aapke reply ka wait kar rahe hain. Agar aapko abhi bhi koi doubt ya issue hai, toh please humein batayein.\n\nHum aapki help karne ke liye ready hain!\n\nRegards,\n*MPPSC ZenScroll Team*' },
    { label: '🔐 Login Issue', text: '🔐 *Login Assistance /ログイン सहायता*\n\nनमस्ते! 🙏\nLogin karne me issue aa raha hai?\n\nPlease make sure ki aap exactly usi Google Account (Gmail) se login karein, jisse aapne payment kiya tha. Agar aapko yaad nahi hai toh please yahan apna email id likh kar bhej dein.\n\nRegards,\n*MPPSC ZenScroll Team*' },
    { label: '🎯 Pre Strategy', text: '🎯 *MPPSC Prelims 2026 - Master Strategy*\n\nनमस्ते! 🙏\nAgar aap MPPSC Prelims ki taiyari ekdum ZERO se start kar rahe hain, toh humne aapke liye ek detailed step-by-step strategy blog banaya hai.\n\nIse dhyaan se padhein:\n🔗 [Prelims 2026 Strategy Blog](https://mppsc.zenscroll.app/blogs/how-to-crack-mppsc-prelims-2026-strategy?from=category%3Dgeneral)\n\nRegards,\n*MPPSC ZenScroll Team*' },
    { label: '🏛️ Mains Strategy', text: '🏛️ *MPPSC Mains - Zero to Selection Strategy*\n\nनमस्ते! 🙏\nMPPSC Mains syllabus ko samajhne aur answer writing master karne ke liye humara yeh comprehensive blog zarur padhein.\n\nLink par click karein:\n🔗 [Mains Strategy Blog](https://mppsc.zenscroll.app/blogs/mppsc-mains-master-strategy-2024-zero-to-selection-comprehensive)\n\nRegards,\n*MPPSC ZenScroll Team*' },
    { label: '🎁 Free Resources', text: '🎁 *Explore MPPSC ZenScroll Free Resources*\n\nनमस्ते! 🙏\nMPPSC ki taiyari ko directional aur simple banane ke liye humare saare free resources check karein:\n\n🎯 *Prelims Library & Demo:*\n👉 [Attempt Free Demo Quiz](https://mppsc.zenscroll.app/free-quiz)\n👉 [Track Syllabus Unit-wise](https://mppsc.zenscroll.app/syllabus)\n\n🏛️ *Mains Library:*\n👉 [Explore Syllabus Map & Model Answer Frameworks](https://mppsc.zenscroll.app/mains)\n\n📝 *Strategy Blogs & Preparation Tips:*\n🔗 [Read Blogs](https://mppsc.zenscroll.app/blogs)\n\nRegards,\n*MPPSC ZenScroll Team*' },
    { label: '📱 App Download', text: '📱 *MPPSC ZenScroll App Install Guide*\n\nनमस्ते! 🙏\nZenScroll fast aur lightweight Web-App hai. Ise install karne ke liye niche diye step-by-step points check karein:\n\n🤖 *For Android Users (Chrome):*\n1️⃣ Open: 🔗 https://mppsc.zenscroll.app\n2️⃣ Click **Three Dots (⋮)** in top right corner.\n3️⃣ Tap **"Add to Home screen"**.\n4️⃣ Click **"Add"** again. Done! 🎉\n\n🍎 *For iPhone Users (Safari):*\n1️⃣ Open: 🔗 https://mppsc.zenscroll.app\n2️⃣ Tap **Share icon** (square with up arrow) at bottom.\n3️⃣ Scroll down & tap **"Add to Home Screen"** ➕.\n4️⃣ Tap **"Add"** in top right. Done! 🎉\n\nAb aap ZenScroll ko direct app ki tarah use kar sakte hain! 🚀\n\nRegards,\n*MPPSC ZenScroll Team*' },
    { label: '📄 2026 Paper Solution', text: '📄 *MPPSC 2026 Official Prelims Paper Solution*\n\nनमस्ते! 🙏\nHumne MPPSC 2026 ka Prelims Paper detailed analytics aur official answer key ke sath upload kar diya hai.\n\n🔗 [Check Paper Solution Here](https://mppsc.zenscroll.app/paper-solution)\n\nRegards,\n*MPPSC ZenScroll Team*' },
  ];

  const studentList = Object.values(students)
    .filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (b.lastTimestamp || 0) - (a.lastTimestamp || 0));

  const activeStudent = activeStudentId ? students[activeStudentId] : null;

  return (
    <div className="fixed top-14 bottom-0 left-0 right-0 lg:top-0 lg:left-64 flex flex-col bg-[#FAFAFA] text-slate-900 overflow-hidden z-40" style={{ fontFamily: 'var(--font-outfit), var(--font-inter), system-ui, sans-serif' }}>
      {/* ─── GLOBAL HEADER (FIXED HEIGHT) ───────────────────────────────── */}
      <header className="h-14 shrink-0 flex items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
            <Zap size={16} className="fill-white" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              Support Desk
              <span className="hidden sm:inline-flex text-[9px] font-mono bg-slate-100 text-slate-900 border border-slate-300 px-2 py-0.5 rounded-full font-bold">
                PRO ENGINE
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 text-[11px] font-bold px-3.5 py-1.5 rounded-full border shadow-sm transition-all duration-300",
            isConnected ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-rose-500/10 border-rose-500/20 text-rose-600"
          )}>
            {isConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff size={12} />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── MAIN SPLIT LAYOUT (FLEX-1 OVERFLOW-HIDDEN) ──────────────────── */}
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden bg-slate-50/30">
        
        {/* ─── LEFT SIDEBAR: STUDENT LIST ─── */}
        <div className={cn(
          "w-full md:w-[350px] lg:w-[400px] flex-col bg-white border-r border-slate-200 shrink-0 min-w-0 h-full",
          activeStudentId ? "hidden md:flex" : "flex"
        )}>
          {/* Sidebar Search - Fixed Top */}
          <div className="p-4 shrink-0 border-b border-slate-100 bg-white/50 backdrop-blur-xl">
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-slate-900" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or ID..."
                className="w-full rounded-xl bg-slate-100/50 border border-slate-200/60 pl-9 pr-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/10 focus:border-slate-400 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Sidebar List - Scrollable */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {studentList.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <MessageSquare className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm font-bold text-slate-700">Inbox Zero</p>
                <p className="text-[11px] font-medium text-slate-500 mt-1 max-w-[200px]">
                  Waiting for student queries...
                </p>
              </div>
            ) : (
              studentList.map((student) => {
                const isActive = activeStudentId === student.id;
                return (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student.id)}
                    className={cn(
                      'w-full text-left p-3.5 rounded-2xl transition-all duration-200 flex items-center gap-3.5 relative border outline-none group',
                      isActive
                        ? 'bg-white border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] ring-1 ring-slate-900/20'
                        : 'bg-transparent border-transparent hover:bg-white/60 hover:shadow-sm'
                    )}
                  >
                    <div className="relative shrink-0">
                      <div className={cn(
                        "h-11 w-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm transition-colors",
                        isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 border border-slate-200/60 group-hover:bg-slate-200/50"
                      )}>
                        {student.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={cn("text-[13px] font-bold truncate tracking-tight flex items-center gap-1.5", isActive ? "text-black" : "text-slate-900")}>
                          {student.name}
                          {student.isBanned && <span className="bg-red-100 text-red-600 text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider">BANNED</span>}
                        </h4>
                        <span className={cn("text-[10px] font-semibold shrink-0 ml-2", isActive ? "text-slate-600" : "text-slate-400")}>
                          {student.lastTime}
                        </span>
                      </div>
                      <p className={cn("text-[11px] truncate leading-relaxed", student.unreadCount > 0 ? "text-slate-900 font-bold" : "text-slate-500 font-medium")}>
                        {student.lastMessage || 'Connected'}
                      </p>
                    </div>

                    {student.unreadCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white shadow-sm shrink-0">
                        {student.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ─── RIGHT CHAT WINDOW ─── */}
        <div className={cn(
          "flex-col flex-1 h-full min-w-0 bg-white overflow-hidden",
          !activeStudentId ? "hidden md:flex" : "flex"
        )}>
          {activeStudent ? (
            <>
              {/* Chat Header - Fixed Top */}
              <div className="h-16 shrink-0 flex items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setActiveStudentId(null);
                      activeStudentIdRef.current = null;
                    }}
                    className="md:hidden h-8 w-8 -ml-2 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shadow-sm">
                    {activeStudent.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 truncate">
                      {activeStudent.name}
                    </h3>
                    <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" /> Active Now
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  {activeStudent.isBanned ? (
                    <Button variant="outline" size="sm" onClick={handleUnbanStudent} disabled={isUnbanning} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 shadow-sm h-8">
                      {isUnbanning ? 'Unbanning...' : '✅ Unban User'}
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleBanStudent} disabled={isBanning} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 shadow-sm h-8">
                      {isBanning ? 'Banning...' : '🚫 Ban (10m)'}
                    </Button>
                  )}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <ShieldCheck size={14} className="text-slate-600" />
                    <span>Private</span>
                  </div>
                </div>
              </div>

              {/* Chat Messages - Scrollable Flex-1 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50/50 custom-scrollbar">
                {activeStudent.messages.map((msg, idx) => {
                  const isAdmin = msg.senderRole === 'admin';
                  const isSystem = msg.type === 'system';

                  if (isSystem) {
                    return (
                      <div key={idx} className="flex justify-center my-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200/70 text-slate-500 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id || idx}
                      className={cn(
                        'flex items-end gap-2 max-w-[85%] md:max-w-[65%]',
                        isAdmin ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'
                      )}
                    >
                      {/* Avatar */}
                      <div className="relative w-fit m-1 overflow-visible">
                        <Avatar className={cn(
                          'h-8 w-8 shrink-0 shadow-sm', 
                          isAdmin 
                            ? 'ring-offset-background animate-pulse ring-2 ring-green-500 ring-offset-2 bg-white' 
                            : 'border border-slate-200 bg-slate-100'
                        )}>
                          {isAdmin && (
                            <AvatarImage src="/images/avatars/notion-admin.jpg" alt="Admin" className="object-cover" />
                          )}
                          {!isAdmin && (
                            <AvatarImage src={`https://api.dicebear.com/9.x/notionists/svg?seed=${activeStudent.name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`} alt={activeStudent.name} />
                          )}
                          <AvatarFallback
                            className={cn(
                              'text-[10px] font-black',
                              isAdmin
                                ? 'bg-transparent text-slate-800'
                                : 'bg-slate-200 text-slate-700'
                            )}
                          >
                            {isAdmin ? 'AD' : activeStudent.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        {isAdmin && (
                          <>
                            <span style={{ top: '-0.5rem', right: '-0.5rem' }} className="absolute z-10">
                              <CustomBadge />
                            </span>
                            <span className="border-white absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 bg-green-500 z-10" />
                          </>
                        )}
                      </div>

                      <div className="min-w-0 flex flex-col gap-1">
                        <div
                          className={cn(
                            'flex items-center gap-2 text-[10px] font-semibold text-slate-500',
                            isAdmin ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <span className="truncate">{isAdmin ? 'Admin' : activeStudent.name}</span>
                          <span className="font-normal text-[9px]">{msg.timestamp}</span>
                        </div>

                        {/* Light Mode Distinct Message Bubbles */}
                        <div
                          className={cn(
                            'px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm font-medium break-words max-w-[320px]',
                            msg.msgType === 'rich_link'
                              ? 'bg-slate-50 border border-slate-200/80 rounded-br-[4px] shadow-sm'
                              : isAdmin
                                ? 'bg-slate-900 text-white rounded-br-[4px] shadow-sm'
                                : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-[4px] shadow-sm'
                          )}
                        >
                          {msg.msgType === 'rich_link' ? (
                            <div className="flex flex-col gap-3">
                              <p className="text-slate-800 leading-relaxed text-sm"><MarkdownRenderer text={msg.text} isAdmin={isAdmin} /></p>
                              {msg.metadata?.url && (
                                <a 
                                  href={msg.metadata.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center w-full px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md hover:bg-black hover:shadow-lg transition-all"
                                >
                                  {msg.metadata.title || 'View Link'}
                                </a>
                              )}
                            </div>
                          ) : (
                            <MarkdownRenderer text={msg.text} isAdmin={isAdmin} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Admin Responses - Fixed Bottom Above Input */}
              <div className="shrink-0 px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto hide-scrollbar shadow-sm z-10">
                <span className="text-[10px] font-bold text-slate-800 flex items-center gap-1 shrink-0 uppercase tracking-wide">
                  <Sparkles size={12} /> Send:
                </span>
                <button
                  onClick={() => sendMessage(undefined, 'Here is the direct link to the MPPSC 2026 Prelims Solved Paper.', 'rich_link', { title: '2026 Prelims Solution', url: '/open/2026-mppsc-prelims' })}
                  className="whitespace-nowrap rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1 shrink-0"
                >
                  <Zap size={14} className="text-slate-700" /> 2026 Prelims Link
                </button>
                <button
                  onClick={() => sendMessage(undefined, 'Here is the link to our Pricing & Plans.', 'rich_link', { title: 'View Pricing & Plans', url: '/pricing' })}
                  className="whitespace-nowrap rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1 shrink-0"
                >
                  <Zap size={14} className="text-slate-700" /> Pricing Link
                </button>
                <button
                  onClick={() => sendMessage(undefined, 'You can access the Mains Gyan Kosh here.', 'rich_link', { title: 'Mains Gyan Kosh', url: '/pricing?need=mains' })}
                  className="whitespace-nowrap rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1 shrink-0"
                >
                  <Sparkles size={14} className="text-emerald-500" /> Mains Kosh Link
                </button>
                <button
                  onClick={() => setInput('✅ क्या आपकी समस्या का समाधान हो गया है? (Has your query been resolved?)\n\nआपको हमारा सपोर्ट कैसा लगा? कृपया नीचे दिए गए बटनों में से कोई एक चुनें (How was your experience?):\n\nRegards,\n*MPPSC ZenScroll Team*')}
                  className="whitespace-nowrap rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1 shrink-0"
                >
                  <CheckCheck size={14} className="text-emerald-500" /> Resolve & Ask Feedback
                </button>
                <button
                  onClick={() => setInput('नमस्ते! 🙏\n\nबातचीत के बाद आपसे फीडबैक लेना चाहते हैं। आपको हमारा सपोर्ट और गाइडेंस कैसा लगा? कृपया नीचे दिए गए बटनों में से कोई एक चुनें:\n\nRegards,\n*MPPSC ZenScroll Team*')}
                  className="whitespace-nowrap rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1 shrink-0"
                >
                  <Heart size={14} className="text-rose-500" /> Ask General Feedback
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1 shrink-0"></div>
                {QUICK_REPLIES.map((qr, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(qr.text)}
                    className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>

              {/* Chat Input - Fixed Bottom */}
              <div className="shrink-0 p-4 md:p-5 bg-white border-t border-slate-100 z-10">
                {activeStudent.isBanned ? (
                  <div className="w-full bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-4 py-4 rounded-xl text-center flex items-center justify-center gap-2 shadow-sm">
                    <ShieldCheck size={18} className="text-red-500" />
                    This user is currently banned. You cannot send them messages until you unban them.
                  </div>
                ) : (
                  <>
                    <form onSubmit={sendMessage} className="flex gap-3 items-end max-w-4xl mx-auto">
                      <div className="flex-1 relative group">
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                          placeholder={`Message ${activeStudent.name}...`}
                          className="w-full resize-none rounded-2xl bg-slate-50 border border-slate-200/80 px-4 py-3.5 text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/10 focus:border-slate-400 transition-all min-h-[52px] max-h-[140px] custom-scrollbar shadow-sm"
                          rows={1}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={!input.trim()}
                        className="h-[52px] w-[52px] md:w-auto md:px-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold transition-all shrink-0 active:scale-95 disabled:opacity-50 shadow-md shadow-slate-900/20"
                      >
                        <Send size={20} className="md:mr-2 shrink-0" /> <span className="hidden md:inline text-sm">Send</span>
                      </Button>
                    </form>
                    <div className="text-center mt-2">
                       <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Press Enter to send, Shift+Enter for new line</p>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="h-20 w-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-inner">
                <MessageSquare className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No Conversation Selected</h3>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                Choose a student from the sidebar to view their thread and send a reply. All chats are securely routed 1-on-1.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Sleek Scrollbar CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
