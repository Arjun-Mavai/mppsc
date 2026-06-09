'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from './LanguageToggle';

interface PYQHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function PYQHeader({ title, subtitle, icon }: PYQHeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl md:top-[89px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="-ml-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <h1 className="flex items-center gap-2 text-lg font-black text-slate-900 sm:text-xl">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 shadow-sm ring-1 ring-slate-200">
                  {icon || <Zap className="h-5 w-5" />}
                </span>
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs font-medium text-slate-500">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
