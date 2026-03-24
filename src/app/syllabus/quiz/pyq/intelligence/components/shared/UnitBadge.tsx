'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getUnitColor } from './constants';

interface UnitBadgeProps {
  unitId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UnitBadge({ unitId, size = 'md', className }: UnitBadgeProps) {
  const colorClass = getUnitColor(unitId);
  
  const sizeClasses = {
    sm: 'h-4 w-1',
    md: 'h-6 w-1.5',
    lg: 'h-8 w-2',
  };

  return (
    <div className={cn('rounded-full shrink-0', colorClass, sizeClasses[size], className)} />
  );
}

interface YearBadgeProps {
  year: number;
  variant?: 'default' | 'pink' | 'indigo' | 'amber' | 'emerald';
  className?: string;
}

export function YearBadge({ year, variant = 'default', className }: YearBadgeProps) {
  const variantClasses = {
    default: 'border-slate-700 bg-slate-900 text-slate-400',
    pink: 'border-pink-500/30 bg-pink-500/5 text-pink-400',
    indigo: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'h-5 px-2 font-mono text-[10px]',
        variantClasses[variant],
        className
      )}
    >
      {year}
    </Badge>
  );
}

interface CountBadgeProps {
  count: number;
  variant?: 'default' | 'highlight';
  className?: string;
}

export function CountBadge({ count, variant = 'default', className }: CountBadgeProps) {
  const variantClasses = {
    default: 'border-slate-700 bg-slate-900 text-slate-400',
    highlight: 'border-pink-500/30 bg-pink-500/10 text-pink-300',
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        'h-6 px-2 font-mono text-xs',
        variantClasses[variant],
        className
      )}
    >
      {count}
    </Badge>
  );
}
