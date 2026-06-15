'use client';

import React, { useState, useEffect } from 'react';
import { Send, Search, Check, CheckCheck, MoreVertical, Phone, Globe, ChevronLeft, MessageCircleOff } from 'lucide-react';
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
          const formatted = res.messages.map((m: any) => ({
            id: m.id,
            text: m.text,
            sender: m.sender as 'bot' | 'user' | 'admin',
            status: m.status,
            timestamp: new Date(m.createdAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
    <div className="fixed top-14 bottom-0 left-0 right-0 lg:top-0 lg:left-64 flex bg-zinc-50 overflow-hidden font-sans z-40">
      
      {/* LEFT PANEL */}
      <div className={cn(
        "flex-col border-r border-zinc-200 bg-white transition-all w-full md:w-80 lg:w-96 flex min-h-0",
        activeId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b border-zinc-200 bg-white shrink-0">
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

        <div className="flex-1 overflow-y-auto min-h-0">
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
          "flex-col flex-1 bg-[#efeae2] flex overflow-hidden min-h-0 min-w-0",
          !activeId ? "hidden md:flex" : "flex"
        )}>
          {/* Header */}
          <div className="h-16 flex items-center px-4 bg-[#f0f2f5] border-b border-[#d1d7db] shrink-0 shadow-sm z-10">
            <button 
              onClick={() => setActiveId(null)}
              className="mr-3 md:hidden p-2 -ml-2 text-zinc-600 hover:bg-zinc-200 rounded-full transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="h-10 w-10 rounded-full bg-zinc-300 flex items-center justify-center mr-3 shrink-0 overflow-hidden">
              <span className="text-zinc-600 font-bold text-lg">{activeConversation.guestName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-[#111b21] text-sm md:text-base truncate">{activeConversation.guestName}</h2>
              <p className="text-xs text-[#667781] flex items-center gap-1 truncate">
                <Phone size={10} className="shrink-0" /> {activeConversation.guestPhone} • Last active: {new Date(activeConversation.lastMessageAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3 flex flex-col bg-[#efeae2] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat relative">
            <div className="absolute inset-0 bg-white/40 pointer-events-none"></div> {/* Subtle overlay to make text readable */}
            
            <div className="text-center my-2 relative z-10">
              <span className="bg-[#ffeecd] text-[#54656f] text-xs px-3 py-1 rounded-lg shadow-sm">
                WhatsApp API does not provide Online or Last Seen statuses.
              </span>
            </div>

            {activeMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex w-full relative z-10",
                  msg.sender === 'user' ? "justify-start" : "justify-end"
                )}
              >
                <div className={cn(
                  "max-w-[85%] md:max-w-[65%] rounded-lg px-3 py-1.5 text-[14.2px] shadow-sm relative",
                  msg.sender === 'user' 
                    ? "bg-white text-[#111b21] rounded-tl-none" 
                    : msg.sender === 'bot'
                      ? "bg-zinc-800 text-white rounded-tr-none"
                      : "bg-[#d9fdd3] text-[#111b21] rounded-tr-none"
                )}>
                  {msg.sender !== 'user' && (
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider mb-0.5 block",
                      msg.sender === 'bot' ? "text-zinc-400" : "text-emerald-700"
                    )}>
                      {msg.sender === 'bot' ? '🤖 Bot' : 'Admin'}
                    </span>
                  )}
                  
                  <p className="leading-snug whitespace-pre-wrap break-words">{msg.text}</p>
                  
                  <div className={cn(
                    "flex items-center justify-end gap-1 mt-0.5 -mb-0.5 text-[#667781]"
                  )}>
                    <span className="text-[10px] opacity-80">{msg.timestamp}</span>
                    {msg.sender !== 'user' && (
                      msg.status === 'read' || msg.status === 'READ' ? <CheckCheck size={14} className="text-[#53bdeb]" /> :
                      msg.status === 'delivered' || msg.status === 'DELIVERED' ? <CheckCheck size={14} className="text-[#8696a0]" /> :
                      <Check size={14} className="text-[#8696a0]" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="shrink-0 w-full bg-[#f0f2f5] border-t border-[#d1d7db] flex flex-col">
            <div className="flex overflow-x-auto gap-2 px-4 py-2 scrollbar-hide items-center bg-[#f0f2f5]">
              <button
                onClick={handleResolveFeedback}
                className="whitespace-nowrap rounded-full bg-white border border-[#d1d7db] px-3 py-1.5 text-xs font-semibold text-[#54656f] shadow-sm hover:bg-zinc-50 transition-colors flex items-center gap-1 shrink-0"
              >
                <CheckCheck size={14} className="text-emerald-500" /> Resolve & Ask Feedback
              </button>
              <div className="w-px h-6 bg-[#d1d7db] mx-1 shrink-0"></div>
              {QUICK_REPLIES.map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => setReplyText(qr.text)}
                  className="whitespace-nowrap rounded-full border border-[#d1d7db] bg-white px-3 py-1.5 text-xs font-medium text-[#54656f] shadow-sm hover:bg-zinc-50 transition-colors"
                >
                  {qr.label}
                </button>
              ))}
            </div>
            
            <div className="px-4 py-2 flex items-end gap-3 pb-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type a message"
                className="flex-1 max-h-32 min-h-[44px] resize-none rounded-xl border-none bg-white px-4 py-3 text-[15px] focus:outline-none focus:ring-0 shadow-sm"
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
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-colors disabled:opacity-50 disabled:pointer-events-none",
                  replyText.trim() ? "bg-[#00a884] hover:bg-[#008f6f]" : "bg-[#8696a0]"
                )}
              >
                <Send size={18} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-[#f0f2f5] flex-col text-[#8696a0] border-b-[6px] border-[#00a884]">
          <div className="w-80 h-80 opacity-50 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] absolute pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#d1d7db] flex items-center justify-center mb-6">
              <MessageCircleOff size={32} className="text-[#8696a0]" />
            </div>
            <h1 className="text-3xl font-light text-[#41525d] mb-4">MPPSC Support Inbox</h1>
            <p className="text-sm font-medium">Select a chat to start messaging</p>
            <p className="text-xs mt-2 opacity-80">End-to-end encryption is managed by WhatsApp Business API.</p>
          </div>
        </div>
      )}
    </div>
  );
}
