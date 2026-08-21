'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CustomBadge = () => {
  return (
    <svg viewBox="0 0 15 16" className="size-4">
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
};

export type StudentSession = {
  id: string;
  name: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  isOnline: boolean;
  messages: SupportMessage[];
};

export default function AdminLiveChatPage() {
  const [students, setStudents] = useState<Record<string, StudentSession>>({});
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeStudentIdRef = useRef<string | null>(null);

  // Keep activeStudentId ref synced for onmessage callbacks
  useEffect(() => {
    activeStudentIdRef.current = activeStudentId;
  }, [activeStudentId]);

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
          
          // Completely discard the annoying backend system welcome message (case-insensitive)
          if (msg.text.toLowerCase().includes('admin team online hai')) {
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

          setStudents((prev) => {
            const existing = prev[studentId] || {
              id: studentId,
              name: msg.senderName || 'Aspirant',
              lastMessage: msg.text,
              lastTime: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              unreadCount: 0,
              isOnline: true,
              messages: [],
            };

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

  // Select student & reset unread count
  const handleSelectStudent = (id: string) => {
    setActiveStudentId(id);
    setStudents((prev) => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          unreadCount: 0,
        },
      };
    });
  };

  // Send message to active student
  const sendMessage = (e?: React.FormEvent, customText?: string) => {
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
    };

    // Send over WebSocket (WebSocket will echo it back to ws.onmessage)
    ws.current.send(JSON.stringify(payload));
    if (!customText) setInput('');
  };

  // Canned Admin Quick Replies
  const cannedResponses = [
    'Namaste! Welcome to ZenScroll. How can I help you today?',
    'You can unlock Pro access directly from our Pricing page.',
    'Our Mains model answers feature 2 distinct variations in Hindi & English.',
    'Prelims Unit-wise tests and mnemonics are available under Prelims section.',
  ];

  const studentList = Object.values(students).filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeStudent = activeStudentId ? students[activeStudentId] : null;

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] lg:h-[100dvh] w-full bg-white text-slate-900 overflow-hidden font-sans">
      {/* ─── GLOBAL HEADER (FIXED HEIGHT) ───────────────────────────────── */}
      <header className="h-14 shrink-0 flex items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <Zap size={16} className="fill-white" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              Support Desk
              <span className="hidden sm:inline-flex text-[9px] font-mono bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                PRO ENGINE
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-1.5 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm transition-colors",
            isConnected ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"
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
      <div className="flex flex-1 overflow-hidden relative bg-slate-50/30">
        
        {/* ─── LEFT SIDEBAR: STUDENT LIST ─── */}
        <div className={cn(
          "w-full md:w-80 h-full shrink-0 flex flex-col border-r border-slate-200 bg-white/80 backdrop-blur-xl absolute md:relative z-10 transition-transform duration-300 shadow-sm",
          activeStudentId ? "-translate-x-full md:translate-x-0" : "translate-x-0"
        )}>
          {/* Sidebar Search - Fixed Top */}
          <div className="p-3 shrink-0 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student..."
                className="w-full rounded-lg bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
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
                      'w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 relative border outline-none',
                      isActive
                        ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                        : 'bg-transparent border-transparent hover:bg-slate-100'
                    )}
                  >
                    <div className="relative shrink-0">
                      <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 shadow-sm">
                        {student.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className={cn("text-sm font-bold truncate", isActive ? "text-indigo-900" : "text-slate-900")}>
                          {student.name}
                        </h4>
                        <span className="text-[10px] font-medium text-slate-400 shrink-0 ml-2">
                          {student.lastTime}
                        </span>
                      </div>
                      <p className={cn("text-xs truncate", student.unreadCount > 0 ? "text-slate-900 font-semibold" : "text-slate-500 font-medium")}>
                        {student.lastMessage || 'Connected'}
                      </p>
                    </div>

                    {student.unreadCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm shrink-0">
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
        <div className="flex-1 h-full flex flex-col min-w-0 w-full absolute md:relative inset-0 transition-transform duration-300 bg-white">
          {activeStudent ? (
            <>
              {/* Chat Header - Fixed Top */}
              <div className="h-16 shrink-0 flex items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveStudentId(null)}
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

                <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                  <ShieldCheck size={14} className="text-indigo-500" />
                  <span>Private Thread</span>
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
                      <div className="relative w-fit">
                        <Avatar className={cn('h-8 w-8 shrink-0 shadow-sm mt-0.5', isAdmin ? 'ring-offset-background animate-pulse ring-2 ring-emerald-500 ring-offset-1 bg-white' : 'border-2 border-slate-200 bg-slate-100')}>
                          {isAdmin && (
                            <AvatarImage src={`https://api.dicebear.com/9.x/micah/svg?seed=AdminJude&backgroundColor=ffffff`} alt="Admin" />
                          )}
                          {!isAdmin && (
                            <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${activeStudent.name}&backgroundColor=e2e8f0`} alt={activeStudent.name} />
                          )}
                          <AvatarFallback
                            className={cn(
                              'text-[10px] font-black',
                              isAdmin
                                ? 'bg-transparent text-white'
                                : 'bg-slate-200 text-slate-700'
                            )}
                          >
                            {isAdmin ? 'AD' : activeStudent.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {isAdmin && (
                          <span className="absolute -top-0.5 -right-0.5 bg-white rounded-full p-[1px] shadow-sm">
                            <CustomBadge />
                          </span>
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
                            'px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm font-medium break-words',
                            isAdmin
                              ? 'bg-indigo-600 text-white rounded-br-sm shadow-indigo-600/20'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                          )}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Admin Responses - Fixed Bottom Above Input */}
              <div className="shrink-0 px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto hide-scrollbar shadow-sm z-10">
                <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 shrink-0 uppercase tracking-wide">
                  <Sparkles size={12} /> Canned:
                </span>
                {cannedResponses.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(undefined, preset)}
                    className="text-[11px] bg-slate-50 border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-all shrink-0 font-semibold whitespace-nowrap shadow-sm"
                  >
                    {preset.substring(0, 35)}...
                  </button>
                ))}
              </div>

              {/* Chat Input - Fixed Bottom */}
              <div className="shrink-0 p-3 md:p-4 bg-white border-t border-slate-200 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                <form onSubmit={sendMessage} className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder={`Reply to ${activeStudent.name}...`}
                      className="w-full resize-none rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[48px] max-h-[120px] custom-scrollbar shadow-sm"
                      rows={1}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!input.trim()}
                    className="h-[48px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shrink-0 active:scale-95 disabled:opacity-50 shadow-md shadow-indigo-600/20"
                  >
                    <Send size={18} className="md:mr-2" /> <span className="hidden md:inline">Send</span>
                  </Button>
                </form>
                <div className="text-center mt-2">
                   <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Press Enter to send, Shift+Enter for new line</p>
                </div>
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
