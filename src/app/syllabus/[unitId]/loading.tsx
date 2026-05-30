import React from 'react';
import { Loader2 } from 'lucide-react';

export default function UnitLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 font-sans">
      {/* 🧭 PREMIUM SUB-NAV SKELETON */}
      <div className="sticky top-[56px] z-30 border-b border-slate-200/40 bg-white/70 backdrop-blur-xl md:top-[56px]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
          <div className="flex items-center gap-4">
            <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-6 w-32 rounded-md bg-slate-200 animate-pulse hidden sm:block" />
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="h-8 w-24 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 pt-12">
        <div className="flex items-center justify-center mb-12">
           <div className="h-8 w-32 rounded-full bg-slate-200 animate-pulse" />
        </div>

        {/* Skeleton Grid for Topics */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex h-[320px] w-full flex-col justify-between overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-16 rounded-full bg-slate-100 animate-pulse" />
                  <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
                </div>
                <div className="h-12 w-full rounded-md bg-slate-100 animate-pulse" />
                <div className="h-4 w-3/4 rounded-md bg-slate-100 animate-pulse" />
              </div>
              <div className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
