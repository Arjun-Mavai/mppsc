import React from 'react';
import IntelligenceLeadsClient from './IntelligenceLeadsClient';
import { getIntelligenceFeedback } from '@/actions/intelligence-actions';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Intelligence Leads | Admin',
};

export default async function IntelligenceLeadsPage() {
  const leads = await getIntelligenceFeedback();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Intelligence Leads</h2>
      </div>
      <IntelligenceLeadsClient initialData={leads as any} />
    </div>
  );
}
