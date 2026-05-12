'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  adminGetPyqPrepOverview,
  adminGetPyqPaperPrepDetail,
  adminBuildPyqAnswersBatchPrompt,
  adminPastePyqAnswersBatchJson,
  purgeAllMainsPyqPreparedVariantsConfirm,
  purgeMainsPyqPreparedVariantsForPaper,
} from '@/actions/mains-pyq-prepared-actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Copy, Sparkles, Save, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import type { AdminMainsPyqPaperOption } from '@/app/admin/mains-pyq/MainsPyqAdminClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MAINS_PYQ_PREPARED_VARIANTS_PURGE_PHRASE } from '@/config/mains-pyq-admin';
import { useSettingsStore } from '@/store/useSettingsStore';

const BATCH_SLOTS = 4;

type BatchWorkspace = {
  paperId: string;
  promptPreview: string;
  pasteJson: string;
  targetQuestionId: string;
};

function emptyWorkspaces(): BatchWorkspace[] {
  return Array.from({ length: BATCH_SLOTS }, () => ({
    paperId: '',
    promptPreview: '',
    pasteJson: '',
    targetQuestionId: '',
  }));
}

export function MainsPyqPreparedAnswersSection({ papers }: { papers: AdminMainsPyqPaperOption[] }) {
  const [overview, setOverview] = useState<{
    totalQuestions: number;
    questionsWithTwoVariants: number;
    questionsWithAnyVariant?: number;
  } | null>(null);
  const [workspaces, setWorkspaces] = useState<BatchWorkspace[]>(emptyWorkspaces);
  const [activeWs, setActiveWs] = useState(0);
  const [detail, setDetail] = useState<{
    progress: { total: number; done: number };
    questions: { id: string; variantCount: number; previewHi: string; previewEn?: string; marks: number; part: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [variantPurgeText, setVariantPurgeText] = useState('');
  const [variantPurging, setVariantPurging] = useState(false);
  const [purgeTargetId, setPurgeTargetId] = useState<string>('ALL');

  const lang = useSettingsStore((s) => s.language);
  const hi = lang === 'hi';

  const paperId = workspaces[activeWs]?.paperId ?? '';

  const patchWorkspace = useCallback((index: number, patch: Partial<BatchWorkspace>) => {
    setWorkspaces((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }, []);

  const loadOverview = useCallback(async () => {
    const r = await adminGetPyqPrepOverview();
    if (r.success && r.data) setOverview(r.data);
  }, []);

  const loadDetail = useCallback(async (pid: string) => {
    if (!pid) return;
    setDetailLoading(true);
    const r = await adminGetPyqPaperPrepDetail(pid);
    setDetailLoading(false);
    if (r.success && r.data) {
      setDetail({
        progress: r.data.progress,
        questions: r.data.questions.map((q) => ({
          id: q.id,
          variantCount: q.variantCount,
          previewHi: q.previewHi,
          previewEn: q.previewEn,
          marks: q.marks,
          part: q.part,
        })),
      });
    } else {
      setDetail(null);
      toast.error((r as { error?: string }).error ?? 'Detail load failed');
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (papers.length === 0) {
      setWorkspaces(emptyWorkspaces());
      return;
    }
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.paperId && papers.some((p) => p.id === w.paperId) ? w : { ...w, paperId: papers[0]!.id }
      )
    );
  }, [papers]);

  useEffect(() => {
    if (paperId) loadDetail(paperId);
    else setDetail(null);
  }, [paperId, loadDetail]);

  const pctBoth =
    overview && overview.totalQuestions > 0
      ? Math.round((overview.questionsWithTwoVariants / overview.totalQuestions) * 100)
      : 0;

  const anyVariant = overview?.questionsWithAnyVariant ?? overview?.questionsWithTwoVariants ?? 0;
  const pctAny =
    overview && overview.totalQuestions > 0 ? Math.round((anyVariant / overview.totalQuestions) * 100) : 0;

  const paperPct =
    detail && detail.progress.total > 0
      ? Math.round((detail.progress.done / detail.progress.total) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-black text-slate-900">
          <Sparkles className="h-6 w-6 text-amber-500" />
          Ready-to-write answers (2 variants × bilingual)
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Batch prompt → AI → paste JSON here. Uses{' '}
          <strong>paper-wise expert scratch</strong> + official stems — rows land in{' '}
          <code className="rounded bg-slate-100 px-1 text-xs">mains_pyq_prepared_variants</code>.
        </p>
        <p className="mt-2 text-sm">
          <Link
            href="/mains/syllabus/pyq-library"
            className="font-bold text-indigo-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Student PYQ library →
          </Link>
        </p>
      </div>

      <Card className="border-amber-100 bg-gradient-to-r from-amber-50/80 to-white p-4">
        <div className="flex flex-wrap items-center gap-4">
          <BarChart3 className="h-8 w-8 text-amber-600" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-wider text-amber-900/70">Global tracker</p>
            <p className="text-sm font-bold text-slate-800">
              {overview ? (
                <>
                  Both variants:{' '}
                  <span className="tabular-nums">
                    {overview.questionsWithTwoVariants} / {overview.totalQuestions}
                  </span>{' '}
                  ({pctBoth}%)
                </>
              ) : (
                'Loading…'
              )}
            </p>
            {overview?.questionsWithAnyVariant != null ? (
              <p className="mt-1 text-xs font-semibold text-amber-900/80">
                At least one variant saved:{' '}
                <span className="tabular-nums">
                  {overview.questionsWithAnyVariant} / {overview.totalQuestions}
                </span>{' '}
                ({pctAny}%){' '}
                <span className="font-normal opacity-90">
                  (PYQ desk shows partial answers once you expand a stem.)
                </span>
              </p>
            ) : null}
            <Progress value={pctBoth} className="mt-2 h-2" />
          </div>
        </div>
      </Card>

      <Card className="border-slate-200 bg-slate-50/90 p-4 text-sm leading-relaxed text-slate-700">
        <p className="font-black text-slate-900">Parallel batches (same 70-Q paper)</p>
        <p className="mt-2">
          Use tabs <strong>Batch 1–4</strong>: each slot keeps its own prompt + pasted JSON — open four AI chats,
          paste four different prompts, paste results back without overwriting.{' '}
          <strong>Generate prompt</strong> picks stems <strong>9–16</strong> for Batch&nbsp;2, <strong>17–24</strong> for Batch&nbsp;3,
          etc. (after sorting incomplete-first), so parallel tabs no longer all request the same first eight questions.
          Same paper can be selected in every slot or mix papers.
        </p>
      </Card>

      <Card className="border-indigo-100 bg-indigo-50/70 p-4 text-sm leading-relaxed text-slate-700">
        <p className="font-black text-indigo-950">“Some rows skipped” / row-wise recovery — kya regenerate se phir aaenge?</p>
        <p className="mt-2">
          <strong>Haan:</strong>{' '}
          <strong>Generate prompt</strong> pehle un stems ko prefer karta hai jin par abhi kam se kam ek bhi variant
          complete nahi (dono slots nahi bharne tak wo “incomplete” pool mein rahenge). Paste me jo row corrupt thi /
          skip hui wo DB par save{' '}
          <em>nahi</em> hoti — iska matlab us stem par kuch corrupt data add nahi hua.
        </p>
        <p className="mt-2">
          Dobara sirf jo q fix karna hai: usi skipped block ko JSON-safe bana kar alag paste karo,{' '}
          <strong>ya</strong>
          dubara Generate prompt dabao — jab tak us stem par dono variants DB mein confirm nahi, wo incomplete list se
          phir prompt me select ho sakti hai (batch size tak). Sab complete ho gaye aur phir generate karo → same
          70 me se phir repeat pool (already done wale) aa sakte hain; tab partial JSON sirf wo rows dalo jo change
          chahiye.
        </p>
      </Card>

      <Card className="border-slate-200 bg-slate-50/90 p-4 text-sm leading-relaxed text-slate-700">
        <p className="font-black text-slate-900">Tables & connections (prepared answers)</p>
        <ol className="mt-2 list-decimal space-y-2 pl-5">
          <li>
            <code className="rounded bg-white px-1 text-xs">mains_pyq_papers</code> — one row per imported exam year
            + paper number (JSON import creates/updates here first).
          </li>
          <li>
            <code className="rounded bg-white px-1 text-xs">mains_pyq_questions</code> — each stem;{' '}
            <code className="text-xs">paper_id</code> → that paper. Optional coaching text in{' '}
            <code className="text-xs">expert_insights_hi</code> / <code className="text-xs">expert_insights_en</code>{' '}
            when your batch JSON includes <code className="text-xs">expert_patch</code>.
          </li>
          <li>
            <code className="rounded bg-white px-1 text-xs">mains_pyq_prepared_variants</code> — model answers only;
            each row has <code className="text-xs">pyq_question_id</code> → stem, plus <code className="text-xs">variant_slot</code>{' '}
            1 or 2 (unique together). Student library reads stems from questions and joins these variants.
          </li>
        </ol>
        <p className="mt-3 text-xs text-slate-500">
          Clearing variants below does not delete papers, stems, or expert_insights — only removes stored answer
          variants so the tracker goes back to 0.
        </p>
      </Card>

      <Card className="border-rose-200 bg-rose-50/60 p-4">
        <p className="text-xs font-black uppercase tracking-wider text-rose-900/80">Reset prepared answers only</p>
        <p className="mt-1 text-sm text-slate-700">
          Type{' '}
          <code className="rounded bg-white px-1 font-mono text-xs text-rose-800">
            {MAINS_PYQ_PREPARED_VARIANTS_PURGE_PHRASE}
          </code>{' '}
          exactly, then confirm — wipes every row in <code className="text-xs">mains_pyq_prepared_variants</code>{' '}
          (fresh start for this workflow).
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="min-w-[220px] flex-1">
            <Label className="text-xs font-bold text-slate-600">Confirmation</Label>
            <Input
              value={variantPurgeText}
              onChange={(e) => setVariantPurgeText(e.target.value)}
              placeholder={MAINS_PYQ_PREPARED_VARIANTS_PURGE_PHRASE}
              className="mt-1 font-mono text-xs"
              autoComplete="off"
            />
          </div>
          <div className="min-w-[200px]">
            <Label className="text-xs font-bold text-slate-600">Target Paper</Label>
            <Select value={purgeTargetId} onValueChange={setPurgeTargetId}>
              <SelectTrigger className="mt-1 font-semibold text-xs h-9">
                <SelectValue placeholder="All Papers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Papers (Global Wipe)</SelectItem>
                {papers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.examYear} · Paper {p.paperNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="destructive"
            className="font-black"
            disabled={variantPurging}
            onClick={async () => {
              setVariantPurging(true);
              let r;
              if (purgeTargetId === 'ALL') {
                r = await purgeAllMainsPyqPreparedVariantsConfirm(variantPurgeText);
              } else {
                if (variantPurgeText !== MAINS_PYQ_PREPARED_VARIANTS_PURGE_PHRASE) {
                  toast.error('Confirmation phrase does not match');
                  setVariantPurging(false);
                  return;
                }
                r = await purgeMainsPyqPreparedVariantsForPaper(purgeTargetId);
              }
              setVariantPurging(false);
              if (!r.success) {
                toast.error((r as { error?: string }).error ?? 'Clear failed');
                return;
              }
              toast.success(purgeTargetId === 'ALL' ? 'All prepared answer variants removed' : 'Paper variants removed');
              setVariantPurgeText('');
              await loadOverview();
              if (paperId) await loadDetail(paperId);
            }}
          >
            {variantPurging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {purgeTargetId === 'ALL' ? 'Clear all variants' : 'Clear for this paper'}
          </Button>
        </div>
      </Card>

      {papers.length === 0 ? (
        <p className="text-slate-500">Import a PYQ paper first.</p>
      ) : (
        <Tabs value={String(activeWs)} onValueChange={(v) => setActiveWs(Number(v))} className="w-full space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <TabsTrigger key={i} value={String(i)} className="text-xs font-black sm:text-sm">
                Batch {i + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          {[0, 1, 2, 3].map((i) => (
            <TabsContent key={i} value={String(i)} className="space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[220px] flex-1">
                  <label className="mb-1 block text-xs font-bold text-slate-600">Imported paper</label>
                  <Select
                    value={workspaces[i]?.paperId ?? ''}
                    onValueChange={(v) => patchWorkspace(i, { paperId: v })}
                  >
                    <SelectTrigger className="font-semibold">
                      <SelectValue placeholder="Pick paper" />
                    </SelectTrigger>
                    <SelectContent>
                      {papers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.examYear} · Paper {p.paperNumber}
                          {p.qCount != null ? ` · ${p.qCount} Q` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {activeWs === i && detail && !detailLoading ? (
                  <Badge variant="outline" className="mb-2 font-black">
                    This paper: {detail.progress.done}/{detail.progress.total} both variants ({paperPct}%)
                  </Badge>
                ) : null}
              </div>

              {activeWs === i && detailLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading paper progress…
                </div>
              ) : activeWs === i && detail ? (
                <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
                  {detail.questions.slice(0, 40).map((q) => (
                    <div key={q.id} className="flex items-center gap-2 border-b border-slate-100 py-1 last:border-0">
                      <span
                        className={
                          q.variantCount >= 2 ? 'font-bold text-emerald-600' : 'font-bold text-amber-700'
                        }
                      >
                        {q.variantCount}/2
                      </span>
                      <span className="text-slate-500">
                        {q.marks}m · {q.part}
                      </span>
                      <span className="line-clamp-1 text-slate-700">
                        {hi ? q.previewHi : (q.previewEn || q.previewHi)}
                      </span>
                    </div>
                  ))}
                  {detail.questions.length > 40 ? (
                    <p className="py-1 text-slate-400">+ {detail.questions.length - 40} more…</p>
                  ) : null}
                </div>
              ) : null}

              {detail?.questions && detail.questions.length > 0 ? (
                <Card className="mt-4 border-slate-200 bg-white p-3">
                  <Label className="mb-1.5 block text-xs font-bold text-slate-700">Targeted Regeneration (Optional)</Label>
                  <Select
                    value={workspaces[i]?.targetQuestionId || ''}
                    onValueChange={(val) => patchWorkspace(i, { targetQuestionId: val === 'none' ? '' : val })}
                  >
                    <SelectTrigger className="h-9 w-full text-xs">
                      <SelectValue placeholder="Select a specific stem to regenerate..." />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      sideOffset={5}
                      viewportClassName="max-h-[300px] overflow-y-auto"
                      className="w-[var(--radix-select-trigger-width)]"
                    >
                      <SelectItem value="none" className="text-slate-400 italic text-xs cursor-pointer">-- Full Batch Mode --</SelectItem>
                      {detail.questions.map((q) => {
                        const text = hi ? q.previewHi : (q.previewEn || q.previewHi);
                        return (
                          <SelectItem key={q.id} value={q.id} className="text-xs cursor-pointer py-2" title={text}>
                            <span className="font-semibold text-slate-800">{q.marks}m · {q.part}</span> · {text.slice(0, 100)}{text.length > 100 ? '...' : ''}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </Card>
              ) : null}

              <Card className="p-4 mt-4">
                <h3 className="mb-2 font-black text-slate-900">
                  {(() => {
                    if (workspaces[i]?.targetQuestionId) {
                      return `① Build single prompt (Targeted Stem Only)`;
                    }
                    const pObj = papers.find(p => p.id === workspaces[i]?.paperId);
                    const bSize = pObj?.paperNumber === 6 ? 2 : 8;
                    return `① Build batch prompt (Batch ${i + 1} → stems ${i * bSize + 1}–${(i + 1) * bSize} in incomplete-first pool)`;
                  })()}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    className="font-black"
                    disabled={loading || !(workspaces[i]?.paperId)}
                    onClick={async () => {
                      const pid = workspaces[i]?.paperId;
                      const targetId = workspaces[i]?.targetQuestionId;
                      if (!pid) return;
                      const pObj = papers.find(p => p.id === pid);
                      const bSize = pObj?.paperNumber === 6 ? 2 : 8;
                      setActiveWs(i);
                      setLoading(true);
                      
                      let r;
                      if (targetId) {
                        r = await adminBuildPyqAnswersBatchPrompt(pid, 1, 0, targetId);
                      } else {
                        r = await adminBuildPyqAnswersBatchPrompt(pid, bSize, i);
                      }
                      
                      setLoading(false);
                      if (!r.success) {
                        toast.error((r as { error?: string }).error ?? 'Prompt failed');
                        return;
                      }
                      patchWorkspace(i, { promptPreview: r.prompt });
                      if (targetId) {
                        toast.success(`Generated targeted prompt for 1 stem`);
                      } else {
                        toast.success(
                          `Batch ${i + 1}: ${r.meta.count} question(s) in prompt (pool order #${i * bSize + 1}–${i * bSize + r.meta.count})`
                        );
                      }
                    }}
                  >
                    {loading && activeWs === i ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {workspaces[i]?.targetQuestionId ? 'Generate for selected stem' : 'Generate prompt'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!workspaces[i]?.promptPreview}
                    className="font-bold"
                    onClick={async () => {
                      const t = workspaces[i]?.promptPreview ?? '';
                      try {
                        await navigator.clipboard.writeText(t);
                        toast.success(`Batch ${i + 1} prompt copied`);
                      } catch {
                        toast.error('Clipboard failed');
                      }
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy prompt
                  </Button>
                </div>
                <Textarea
                  value={workspaces[i]?.promptPreview ?? ''}
                  readOnly
                  onFocus={() => setActiveWs(i)}
                  placeholder="Generate prompt — use in Gemini / ChatGPT as one user message."
                  className="mt-3 h-[120px] min-h-[100px] font-mono text-[11px]"
                />
              </Card>

              <Card className="p-4">
                <h3 className="mb-2 font-black text-slate-900">② Paste AI JSON → save variants</h3>
                <Textarea
                  value={workspaces[i]?.pasteJson ?? ''}
                  onChange={(e) => patchWorkspace(i, { pasteJson: e.target.value })}
                  onFocus={() => setActiveWs(i)}
                  placeholder='variants[]: variant_slot (1|2), style_label_hi + style_label_en, answer_hi, answer_en · legacy style_label=treated as EN'
                  className="h-[120px] min-h-[100px] font-mono text-[11px]"
                />
                <Button
                  type="button"
                  className="mt-3 bg-emerald-600 font-black hover:bg-emerald-700"
                  disabled={loading || !(workspaces[i]?.pasteJson ?? '').trim() || !(workspaces[i]?.paperId)}
                  onClick={async () => {
                    const pid = workspaces[i]?.paperId;
                    const paste = workspaces[i]?.pasteJson ?? '';
                    if (!pid || !paste.trim()) return;
                    setActiveWs(i);
                    setLoading(true);
                    const r = await adminPastePyqAnswersBatchJson(pid, paste);
                    setLoading(false);
                    if (!r.success) {
                      const msg = (r as { error?: string }).error ?? 'Save failed';
                      toast.error(msg.length > 120 ? 'JSON / paste rejected — expand details ↓' : msg, {
                        description: msg.length > 120 ? msg : undefined,
                        duration: 28_000,
                      });
                      return;
                    }
                    const typed = r as {
                      variantsUpserted?: number;
                      insightQuestionsUpdated?: number;
                      warningCount?: number;
                      warnings?: string[];
                    };
                    toast.success(
                      `Batch ${i + 1} saved — ${typed.variantsUpserted ?? 0} variants, ${typed.insightQuestionsUpdated ?? 0} insights`
                    );
                    if (typed.warningCount && (typed.warnings?.length ?? 0) > 0) {
                      toast.message('Some rows were skipped', {
                        description: typed.warnings!.slice(0, 8).join('\n'),
                        duration: 12_000,
                      });
                    }
                    patchWorkspace(i, { pasteJson: '' });
                    await loadOverview();
                    await loadDetail(pid);
                  }}
                >
                  {loading && activeWs === i ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  <Save className="mr-2 h-4 w-4" />
                  Save batch to database
                </Button>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
