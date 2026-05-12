'use client';

import { useState, useEffect, useCallback } from 'react';
import { importMainsPyqPaperJson, listMainsPyqPapers } from '@/actions/mains-pyq-actions';
import { MainsPyqPreparedAnswersSection } from '@/app/admin/mains-pyq/MainsPyqPreparedAnswersSection';
import { MainsPyqVaultGuideAndManage } from '@/app/admin/mains-pyq/MainsPyqVaultGuideAndManage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, Database, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export type AdminMainsPyqPaperOption = {
  id: string;
  examYear: number;
  paperNumber: number;
  slug: string;
  titleEn: string | null;
  titleHi: string | null;
  examLabel?: string | null;
  rawJson?: string | null;
  isHidden?: boolean;
  qCount?: number;
};

export function MainsPyqAdminClient() {
  const [raw, setRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [papers, setPapers] = useState<AdminMainsPyqPaperOption[]>([]);

  const load = useCallback(async () => {
    const res = await listMainsPyqPapers();
    if (res.success) setPapers(res.data ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadSampleJson = async () => {
    try {
      const res = await fetch('/samples/mains-pyq-minimal-example.json');
      if (!res.ok) throw new Error('Sample not found');
      setRaw(await res.text());
      toast.success('Sample loaded — Paper 1 · Part A · Unit 1 (click Save to DB)');
    } catch {
      toast.error('Could not load sample (is dev server running?)');
    }
  };

  const onImport = async () => {
    if (!raw.trim()) {
      toast.error('Paste JSON first');
      return;
    }
    setLoading(true);
    const res = await importMainsPyqPaperJson(raw);
    setLoading(false);
    if (!res.success) {
      toast.error(res.error ?? 'Import failed');
      return;
    }
    toast.success(
      `${res.count} stems · ${res.examYear} Paper ${res.paperNumber}: +${res.inserted} new, ${res.updated} updated, −${res.removed} removed${
        res.mergedDuplicatePapers ? ` · merged ${res.mergedDuplicatePapers} duplicate paper row(s)` : ''
      }`
    );
    setRaw('');
    await load();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 md:p-8">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-black">
          <Database className="h-8 w-8 text-indigo-600" />
          Mains — previous year papers (PYQ JSON)
        </h1>
        <p className="mt-2 text-slate-600">
          Paste one paper JSON (e.g. <code className="text-xs">mppsc_mains_paper_2024</code> root). Upsert key:{' '}
          <strong>exam year + paper number</strong>. Stem match: <strong>part + unit + question #</strong>. Same stem =
          stable UUID so prepared variants & topic links survive re-import.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          After import →{' '}
          <Link href="/admin/mains" className="font-bold text-indigo-600 underline">
            Mains content
          </Link>{' '}
          topic prompt uses real PYQs for that unit. Terminal:{' '}
          <code className="rounded bg-slate-100 px-1 text-xs">npm run mains:overview</code>.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="mb-3 text-lg font-black">Import JSON</h2>
        <Textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder='{ "mppsc_mains_paper_2024": { "paper_number": 1, "parts": [...] } }'
          className="h-[120px] min-h-[100px] font-mono text-xs"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="font-bold" onClick={() => loadSampleJson()}>
            <FileJson className="mr-2 h-4 w-4" />
            Load sample JSON (test)
          </Button>
          <Button className="font-black" disabled={loading} onClick={() => onImport()}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Save to database
          </Button>
        </div>
      </Card>

      <MainsPyqVaultGuideAndManage papers={papers} onRefresh={load} />

      <MainsPyqPreparedAnswersSection papers={papers} />
    </div>
  );
}
