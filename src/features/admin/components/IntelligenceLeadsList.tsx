'use client';

import { useEffect, useState } from 'react';
import { getIntelligenceFeedback } from '@/actions/intelligence-actions';
import IntelligenceLeadsClient from '@/app/admin/intelligence-leads/IntelligenceLeadsClient';
import { Loader2 } from 'lucide-react';

export function IntelligenceLeadsList() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const res = await getIntelligenceFeedback();
        if (isMounted) {
          setData(res);
        }
      } catch (error) {
        console.error('Failed to fetch intelligence feedback:', error);
        if (isMounted) {
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50/50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading Intelligence leads...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl bg-slate-50/50 text-xs font-bold uppercase tracking-widest text-slate-400">
        No intelligence leads found.
      </div>
    );
  }

  return <IntelligenceLeadsClient initialData={data} />;
}
