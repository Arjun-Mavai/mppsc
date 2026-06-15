'use client';

import React, { useState, useEffect } from 'react';
import { Send, Search, CheckCircle2, MoreVertical, Phone, Globe, ChevronLeft, MessageCircleOff, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getConversations, getMessages, sendAdminReply, markAsRead } from '@/actions/support-inbox-actions';
import { toast } from 'sonner';

type Message = {
  id: string;
  text: string;
  sender: 'bot' | 'user' | 'admin';
  timestamp: string;
  status?: string | null;
};

type Conversation = {
  id: string;
  guestName: string;
  guestPhone: string;
  lastMessageAt: Date;
  unreadCount: number;
  platform: 'whatsapp' | 'telegram';
  language: string;
};

export default function SupportInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Polling to keep inbox live
  useEffect(() => {
    const fetchInbox = async () => {
      const res = await getConversations();
      if (res.success) {
        setConversations(res.conversations as any);
      }
    };
    
    fetchInbox(); // initial
    const interval = setInterval(fetchInbox, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch active conversation messages
  useEffect(() => {
    if (activeId) {
      const fetchMsgs = async () => {
        const res = await getMessages(activeId);
        if (res.success) {
          // Map DB messages to UI format
          const formatted = res.messages.map(m => ({
            id: m.id,
            text: m.text,
            sender: m.sender as 'bot' | 'user' | 'admin',
            timestamp: new Date(m.createdAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: m.status
          }));
          setActiveMessages(formatted);
        }
        await markAsRead(activeId);
      };
      
      fetchMsgs();
      const interval = setInterval(fetchMsgs, 3000); // Poll active chat faster
      return () => clearInterval(interval);
    } else {
      setActiveMessages([]);
    }
  }, [activeId]);

  const activeConversation = conversations.find(c => c.id === activeId);

  const handleSend = async () => {
    if (!replyText.trim() || !activeId || !activeConversation) return;
    
    const textToSend = replyText;
    setReplyText(''); // Clear instantly for UI speed

    // Optimistically add to UI
    setActiveMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'admin',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    }]);

    // Send via API and Save to DB
    const res = await sendAdminReply(activeId, textToSend);
    if (!res.success) {
      toast.error('Failed to send message via API. Please try again.');
    }
  };

  const handleResolveFeedback = async () => {
    if (!activeId || !activeConversation) return;
    
    const textToSend = '✅ आपकी समस्या का समाधान कर दिया गया है।\n\nआपको हमारा सपोर्ट कैसा लगा? कृपया नीचे दिए गए बटनों में से कोई एक चुनें (How was your experience?):';
    
    // Optimistically add to UI
    setActiveMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: textToSend + '\n[Buttons: Excellent, Good, Bad]',
      sender: 'admin',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    const res = await sendAdminReply(activeId, textToSend, {
      buttons: [
        { id: 'FDBK_EXC', title: '🤩 बहुत बढ़िया' },
        { id: 'FDBK_AVG', title: '👍 ठीक था' },
        { id: 'FDBK_BAD', title: '😞 बेकार' }
      ]
    });
    
    if (!res.success) {
      toast.error('Failed to send feedback request.');
    } else {
      toast.success('Feedback request sent!');
    }
  };

  const QUICK_REPLIES = [
    { label: '👋 Hi (Hindi)', text: 'नमस्ते! 🙏 MPPSC ZenScroll की सपोर्ट टीम से जुड़ने के लिए धन्यवाद। मैं आपकी क्या सहायता कर सकता हूँ?' },
    { label: '👋 Hi (English)', text: 'Hello! 🙏 Thank you for reaching out to MPPSC ZenScroll support. How can I help you today?' },
    { label: '💳 Pre Payment', text: '🎯 *Prelims Intelligence Course*\n\nHere is your secure payment link:\n🔗 https://mppsc.zenscroll.app/pricing?need=pre\n\n⚡ (Let us know once the payment is completed!)' },
    { label: '💳 Mains Payment', text: '🏛️ *Mains Syllabus Hub*\n\nHere is your secure payment link:\n🔗 https://mppsc.zenscroll.app/pricing?need=mains\n\n⚡ (Let us know once the payment is completed!)' },
    { label: '💳 Combo Payment', text: '🔥 *Super Combo (Pre + Mains)*\n\nHere is your secure payment link:\n🔗 https://mppsc.zenscroll.app/pricing?need=combo\n\n⚡ (Let us know once the payment is completed!)' },
    { label: '📚 Mains Demo', text: '🏛️ *Mains Module Demo*\n\nOur Mains module offers deep structural clarity mapped directly to the syllabus tree, completely distinct from traditional PDF dumps!\n\nCheck it out here:\n🔗 https://mppsc.zenscroll.app/mains' },
  ];

  const filteredConversations = conversations.filter(c => 
    c.guestName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.guestPhone?.includes(searchQuery)
  );

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] lg:h-[calc(100dvh)] w-full bg-zinc-50 overflow-hidden font-sans">
      
      {/* LEFT PANEL */}
      <div className={cn(
        "flex-col border-r border-zinc-200 bg-white transition-all w-full md:w-80 lg:w-96 flex",
        activeId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b border-zinc-200 bg-white">
          <h1 className="text-xl font-semibold text-zinc-900 mb-4">Support Inbox</h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-sm">No conversations found.</div>
          ) : filteredConversations.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveId(chat.id)}
              className={cn(
                "cursor-pointer border-b border-zinc-100 p-4 transition-colors hover:bg-zinc-50",
                activeId === chat.id ? "bg-indigo-50/50" : ""
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-zinc-900 text-sm truncate pr-2">{chat.guestName}</h3>
                <span className="text-xs text-zinc-400 whitespace-nowrap">
                  {new Date(chat.lastMessageAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <p className="text-xs text-zinc-500 truncate mb-2">{chat.guestPhone}</p>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1",
                  chat.platform === 'whatsapp' ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-blue-200 bg-blue-50 text-blue-700"
                )}>
                  {chat.platform === 'whatsapp' ? '🟢 WA' : '🔵 TG'}
                </span>
                
                {chat.unreadCount > 0 && (
                  <span className="ml-auto bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    {chat.unreadCount} New
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      {activeId && activeConversation ? (
        <div className={cn(
          "flex-col flex-1 bg-[#efeae2] relative flex",
          !activeId ? "hidden md:flex" : "flex"
        )}>
          {/* Header */}
          <div className="h-16 flex items-center px-4 bg-white border-b border-zinc-200 sticky top-0 z-10 shadow-sm shrink-0">
            <button 
              onClick={() => setActiveId(null)}
              className="mr-3 md:hidden p-2 -ml-2 text-zinc-600 hover:bg-zinc-100 rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1">
              <h2 className="font-semibold text-zinc-900 text-sm md:text-base">{activeConversation.guestName}</h2>
              <p className="text-xs text-zinc-500 flex items-center gap-1">
                <Phone size={10} /> {activeConversation.guestPhone} ({activeConversation.platform})
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32 flex flex-col">
            {activeMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex w-full",
                  msg.sender === 'user' ? "justify-start" : "justify-end"
                )}
              >
                <div className={cn(
                  "max-w-[85%] md:max-w-[65%] rounded-2xl px-4 py-2 text-[15px] shadow-sm relative",
                  msg.sender === 'user' 
                    ? "bg-white text-zinc-800 rounded-tl-sm border border-zinc-100" 
                    : msg.sender === 'bot'
                      ? "bg-zinc-800 text-white rounded-tr-sm"
                      : "bg-[#dcf8c6] text-emerald-950 rounded-tr-sm"
                )}>
                  {msg.sender !== 'user' && (
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider mb-1 block",
                      msg.sender === 'bot' ? "text-zinc-400" : "text-emerald-700"
                    )}>
                      {msg.sender === 'bot' ? '🤖 Bot' : '👨‍💻 You (Admin)'}
                    </span>
                  )}
                  
                  <p className="leading-snug whitespace-pre-wrap break-words">{msg.text}</p>
                  
                  <div className={cn(
                    "flex items-center justify-end gap-1 mt-1",
                    msg.sender === 'bot' ? "text-zinc-500" : "text-emerald-800"
                  )}>
                    <span className="text-[10px] opacity-70">{msg.timestamp}</span>
                    {msg.sender !== 'user' && (
                      msg.status === 'read' ? <CheckCheck size={14} className="text-blue-500" /> :
                      msg.status === 'delivered' ? <CheckCheck size={14} className="text-zinc-400" /> :
                      <Check size={14} className="text-zinc-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="absolute bottom-0 w-full bg-[#f0f2f5]">
            <div className="flex overflow-x-auto gap-2 px-4 py-2 scrollbar-hide bg-[#f0f2f5] items-center">
              <button
                onClick={handleResolveFeedback}
                className="whitespace-nowrap rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm hover:bg-emerald-200 transition-colors flex items-center gap-1 shrink-0"
              >
                <CheckCircle2 size={14} /> Resolve & Ask Feedback
              </button>
              <div className="w-px h-6 bg-zinc-300 mx-1 shrink-0"></div>
              {QUICK_REPLIES.map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => setReplyText(qr.text)}
                  className="whitespace-nowrap rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                >
                  {qr.label}
                </button>
              ))}
            </div>
            
            <div className="p-3 md:p-4 flex items-end gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 max-h-32 min-h-[44px] resize-none rounded-2xl border-0 bg-white px-4 py-3 text-[15px] focus:outline-none focus:ring-0 shadow-sm"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button 
                onClick={handleSend}
                disabled={!replyText.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white shadow-sm transition-colors hover:bg-[#008f6f] disabled:opacity-50 disabled:pointer-events-none"
              >
                <Send size={18} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-zinc-50 flex-col text-zinc-400">
          <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
            <MessageCircleOff size={32} />
          </div>
          <p className="text-sm font-medium">Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
}
