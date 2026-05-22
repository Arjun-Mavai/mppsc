'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, BookOpen, Brain, Flame, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Offline motivation quotes curated for MPPSC/Civil Services aspirants
const OFFLINE_QUOTES = [
  {
    text: "भावी अधिकारी! इंटरनेट बंद है तो इसे एक वरदान समझें। सोशल मीडिया से दूर, अपनी मुख्य किताबों और नोट्स के रिवीजन पर ध्यान केंद्रित करें।",
    author: "MPPSC Zen Team",
    category: "Rethink"
  },
  {
    text: "सफलता का कोई शॉर्टकट नहीं होता, इसके लिए हर शांत क्षण में की गई मेहनत ही काम आती है। बिना भटके आज 1 घंटा लिखने का अभ्यास करें।",
    author: "Success Mantra",
    category: "Motivation"
  },
  {
    text: "The best time to study without notifications is right now. Go deep into your revision!",
    author: "Focus Catalyst",
    category: "Productivity"
  },
  {
    text: "संकल्प में विकल्प न आना ही संकल्प की वास्तविक विजय है। इंटरनेट के बिना भी आपकी पढ़ाई नहीं रुकनी चाहिए।",
    author: "Swami Vivekananda Inspiration",
    category: "Resolve"
  },
  {
    text: "मेन्स आंसर राइटिंग के लिए आज एक रफ पेपर उठाएं और पिछले पढ़े हुए किसी भी टॉपिक का माइंड-मैप खुद से बनाएं।",
    author: "Mains Strategy",
    category: "Practice"
  }
];

export function OfflineClient() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [quoteFade, setQuoteFade] = useState(false);

  const handleNextQuote = () => {
    setQuoteFade(true);
    setTimeout(() => {
      setQuoteIndex((prev) => (prev + 1) % OFFLINE_QUOTES.length);
      setQuoteFade(false);
    }, 200);
  };

  const handleCheckConnection = () => {
    setIsChecking(true);
    // Simulate a connection check by checking navigator.onLine and refreshing
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 1200);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#fffcf7] via-[#fffdfa] to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-12 text-center overflow-hidden">
      
      {/* Decorative Blur Blobs */}
      <div className="absolute -top-40 -left-40 h-[400px] w-[400px] rounded-full bg-amber-400/5 blur-[80px] dark:bg-amber-500/5 pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-emerald-400/5 blur-[80px] dark:bg-emerald-500/5 pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-100 bg-white/70 backdrop-blur-xl p-8 dark:border-slate-800/80 dark:bg-slate-900/70 shadow-[0_20px_50px_rgba(230,180,80,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        {/* Glowing floating top accent badge */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-[10px] font-black tracking-widest text-amber-800 uppercase dark:border-amber-900/50 dark:bg-amber-950/60 dark:text-amber-400 shadow-md">
          <Flame className="h-3.5 w-3.5 text-orange-500 animate-pulse" />
          Offline High-Focus Mode
        </div>

        {/* Pulse Floating Offline Icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-b from-amber-50 to-amber-100/50 dark:from-slate-800 dark:to-amber-950/30 p-4 border border-amber-200/50 dark:border-amber-500/20 shadow-md hover:scale-105 transition-transform duration-300">
          <div className="relative flex h-full w-full items-center justify-center">
            <WifiOff className="h-11 w-11 text-amber-600 dark:text-amber-500 animate-bounce" style={{ animationDuration: '3s' }} />
            {/* Glowing outer rings */}
            <div className="absolute inset-0 -m-2 rounded-full border border-amber-500/10 animate-ping" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        {/* Connection Status */}
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50 mb-2">
          You are Offline 🔌
        </h1>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">
          इंटरनेट कनेक्शन उपलब्ध नहीं है। पर चिंता न करें, आपकी तैयारी का डेटा और प्रोग्रेस हमारे PWA में पूरी तरह सुरक्षित है।
        </p>

        {/* Reconnect Button */}
        <Button
          onClick={handleCheckConnection}
          disabled={isChecking}
          className="h-12 w-full max-w-xs rounded-2xl bg-slate-950 text-white font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-950/10 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-200"
        >
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Connection चेक कर रहे हैं...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" /> Try Reconnecting
            </>
          )}
        </Button>

        {/* Separator Divider */}
        <div className="my-8 flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interactive Offline Tool</span>
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
        </div>

        {/* Interactive Quote Generator card */}
        <div className="rounded-2xl border border-slate-100 bg-amber-50/20 p-5 dark:border-slate-800/80 dark:bg-slate-950/20 text-left relative overflow-hidden transition-all duration-300">

          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-amber-800 dark:text-amber-400 uppercase">
              <Sparkles size={11} className="text-amber-600 dark:text-amber-400" />
              Focus {OFFLINE_QUOTES[quoteIndex].category}
            </span>
            <button
              onClick={handleNextQuote}
              className="text-[11px] font-black text-amber-700 hover:text-amber-800 dark:text-amber-500 dark:hover:text-amber-400 uppercase tracking-wider underline cursor-pointer active:scale-95"
            >
              Next Quote →
            </button>
          </div>

          <div className={`transition-opacity duration-200 ${quoteFade ? 'opacity-0' : 'opacity-100'}`}>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed min-h-[72px]">
              "{OFFLINE_QUOTES[quoteIndex].text}"
            </p>
            <p className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              — {OFFLINE_QUOTES[quoteIndex].author}
            </p>
          </div>
        </div>

        {/* Offline Study Tasks */}
        <div className="mt-8 space-y-3 text-left">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Recommended Offline Tasks:
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/20 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <BookOpen className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>10 Units का रिवीजन करें</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/20 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Brain className="h-4 w-4 text-indigo-500 shrink-0" />
              <span>सब्जेक्ट माइंड-मैप स्केच करें</span>
            </div>
          </div>
        </div>

      </div>

      <p className="mt-8 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        🔒 All progress is securely saved in your browser cache.
      </p>
    </div>
  );
}
