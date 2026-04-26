'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { uploadBlog } from '@/actions/blog-actions';
import { uploadTestFromJSON, getExistingTests } from '@/actions/admin-actions';
import {
  getDetailedUpgradeStats,
  getClassicColumnProgressForTest,
  getClassicPendingBatchPrompt,
  getGeminiPromptForTest,
  processManualGeminiJSON,
  processManualClassicExplanationsJSON,
} from '@/actions/expert-upgrade-actions';
import { toast } from 'sonner';
import {
  Loader2,
  FileJson,
  Upload,
  BookOpen,
  Video,
  FileText,
  CheckCircle2,
  Plus,
  Database,
  Zap,
  AlignLeft,
  Badge,
  Copy,
} from 'lucide-react';
import { StructuredExplanation } from '@/components/StructuredExplanation';
import { syllabusData } from '@/data/syllabusData';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { parseLenientJSON } from '@/lib/json-utils';
import { CANONICAL_TEST_IDS } from '@/lib/pyq-constants';

const CANONICAL_IDS_LIST = Object.values(CANONICAL_TEST_IDS);
/** 2026 Prelims paper row in `tests` (filter questions by `testId` in DB / UI). */
const PYQ_2026_CANONICAL_TEST_ID = CANONICAL_TEST_IDS[2026];
const INTELLIGENCE_QUESTIONS_HREF = '/syllabus/quiz/pyq/intelligence/questions';
const PYQ_PROMPT_HREF = '/prompts/pyq_dual_explanation_generation.md';

const CLASSIC_BULK_AI_BATCH_PROMPT = `You are helping fill CLASSIC bilingual explanations for MPPSC PYQ questions that already exist in our database.

I will give you at most 25 items: each has "questionId" (exact id from our app) and optionally one line of question text for context.

Return ONLY a raw JSON array (no markdown, no backticks, no trailing commas). Each object must be:
{
  "questionId": "<same id I gave you>",
  "explanation_hi": "Hindi: use markers — e.g. lines with ✅ **सही तर्क, 💡 **एग्जाम फैक्ट, 🧠 **मेमोरी टिप (see project prompt). Separate blocks with newlines; escape newlines in JSON as \\\\n.",
  "explanationEn": "English: **Correct Logic, **Exam Fact, **Memory Tip, **Scam Alert as appropriate."
}

Rules: do not change or invent questionIds. Strict JSON. Bilingual. One batch, max 25 objects.

The batch (ids + optional context) follows:
`;

const UNITS = Array.from({ length: 10 }, (_, i) => `unit_${i + 1}`);

const BLOG_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'history', label: 'History' },
  { value: 'geography', label: 'Geography' },
  { value: 'polity', label: 'Polity' },
  { value: 'strategy', label: 'Strategy' },
  { value: 'current_affairs_mp', label: 'MP Current Affairs' },
  { value: 'economics', label: 'Economics' },
  { value: 'science', label: 'Science & Tech' },
  { value: 'mp_gk', label: 'Madhya Pradesh GK' },
  { value: 'mp_polity', label: 'Madhya Pradesh Polity' },
  { value: 'mp_current_affairs', label: 'Madhya Pradesh Current Affairs' },
];

export default function AdminUploadPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('blog');

  // Blog State
  const [blogData, setBlogData] = useState({
    imageUrl: '',
    contentJson: '',
  });

  // Test State
  const [testMode, setTestMode] = useState<'new' | 'existing'>('new');
  const [existingTests, setExistingTests] = useState<
    { id: string; title: string; type: string; totalQuestions: number }[]
  >([]);
  const [topicLang, setTopicLang] = useState<'hi' | 'en'>('hi'); // Language toggle for topics

  const [testData, setTestData] = useState({
    type: 'TOPIC', // FLT | UNIT | TOPIC | CSAT | MISC
    title: '',
    unitId: 'unit_1',
    topicId: '', // For Topic Tests
    subjectTag: '', // MISC type ke liye subject tag
    description: '',
    existingTestId: '',
    questionsJson: '',
  });

  type DetailedStat = {
    testId: string;
    testTitle: string;
    testType: string;
    pending: number;
    upgraded: number;
    total: number;
  };
  const [detailedStats, setDetailedStats] = useState<DetailedStat[]>([]);
  const [selectedTest, setSelectedTest] = useState<DetailedStat | null>(null);
  const [batchSize, setBatchSize] = useState<number>(25);

  const [expertCategory, setExpertCategory] = useState<string>('pyq');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [jsonInput, setJsonInput] = useState<string>('');
  const [classicBulkInput, setClassicBulkInput] = useState<string>('');
  const [isClassicBulkLoading, setIsClassicBulkLoading] = useState(false);
  /** 2026 canonical PYQ: same sizes as expert queue (10 / 25 / 50) */
  const [classicGenBatchSize, setClassicGenBatchSize] = useState<10 | 25 | 50>(25);
  const [generatedClassicPrompt, setGeneratedClassicPrompt] = useState<string>('');
  const [classicGenMeta, setClassicGenMeta] = useState<{
    testTitle: string;
    count: number;
    pendingTotal: number;
    totalInTest: number;
    classicDoneCount: number;
  } | null>(null);
  const [isClassicGenLoading, setIsClassicGenLoading] = useState(false);
  const [upgradeLogs, setUpgradeLogs] = useState<string[]>([]);
  const [explanationFormat, setExplanationFormat] = useState<'expert' | 'classic'>('expert');
  const [lastUpgradedPreview, setLastUpgradedPreview] = useState<Record<string, unknown> | null>(null);
  /** Bilingual “classic” copy so Expert ↔︎ Classic toggle in live preview is real. Cleared after a successful DB upgrade from pasted JSON. */
  const [livePreviewClassic, setLivePreviewClassic] = useState<{
    hi: string;
    en: string;
  } | null>(null);

  const fetchDetailedStats = async () => {
    const res = await getDetailedUpgradeStats();
    if (res.success && res.data) {
      setDetailedStats(res.data);
      if (selectedTest) {
        const updated = res.data.find((s: DetailedStat) => s.testId === selectedTest.testId);
        setSelectedTest(updated || null);
      }
    }
  };

  useEffect(() => {
    getExistingTests().then(setExistingTests);
    fetchDetailedStats();
  }, []);

  // Derived: Get Topics for selected Unit
  const availableTopics = useMemo(() => {
    if (!testData.unitId) return [];
    // @ts-ignore
    const unit = syllabusData.units[testData.unitId];
    // Handle language structure differences
    if (topicLang === 'hi') {
      return unit?.topics || [];
    } else {
      return unit?.topics_en || unit?.topics || [];
    }
  }, [testData.unitId, topicLang]);

  const handleBlogChange = (e: any) => {
    const { name, value } = e.target;
    setBlogData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTestChange = (e: any) => {
    const { name, value } = e.target;
    setTestData((prev) => ({ ...prev, [name]: value }));
  };

  // --- SUBMIT BLOG ---
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let parsed: unknown = parseLenientJSON(blogData.contentJson);

      // If AI returns an array, take the first element
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
          toast.error('JSON array is empty. Please provide valid content.');
          setIsLoading(false);
          return;
        }
        parsed = parsed[0];
      }

      if (!parsed || typeof parsed !== 'object') {
        toast.error("Invalid JSON: expected an object with 'metadata' and 'content'.");
        setIsLoading(false);
        return;
      }

      const blogDoc = parsed as {
        metadata?: { title?: string; slug?: string; category?: string; type?: string };
        content?: { hi?: unknown; en?: unknown };
      };

      if (!blogDoc.metadata || !blogDoc.content) {
        toast.error("Invalid JSON: Must contain 'metadata' and 'content' keys.");
        setIsLoading(false);
        return;
      }

      const { metadata, content } = blogDoc;

      // Validate metadata fields
      if (!metadata.title || !metadata.slug || !metadata.category) {
        toast.error('Missing required metadata: title, slug, or category.');
        setIsLoading(false);
        return;
      }

      // Validate content structure
      if (!content.hi || !content.en) {
        toast.error("Content must have both 'hi' and 'en' keys.");
        setIsLoading(false);
        return;
      }

      const res = await uploadBlog({
        imageUrl: blogData.imageUrl,
        contentJson: JSON.stringify(blogDoc),
      });

      if (res.success) {
        toast.success(`${metadata.type === 'vlog' ? 'Vlog' : 'Blog'} uploaded successfully!`);
        setBlogData({
          imageUrl: '',
          contentJson: '',
        });
      } else {
        toast.error(res.error || 'Upload failed');
      }
    } catch (err) {
      logger.error('Blog Upload Failed:', err);
      toast.error(err instanceof Error ? `Invalid JSON: ${err.message}` : 'Invalid JSON format.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- SUBMIT TEST ---
  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const parsedQuestions = parseLenientJSON(testData.questionsJson);
      if (!Array.isArray(parsedQuestions)) {
        toast.error('Questions JSON must be an array.');
        return;
      }

      const formData = new FormData();
      formData.append('mode', testMode);
      formData.append('jsonData', JSON.stringify(parsedQuestions));

      if (testMode === 'new') {
        let finalTitle = testData.title;
        // Auto-generate title if Topic Test
        if (testData.type === 'TOPIC' && testData.topicId) {
          const topic = availableTopics.find((t: any) => t.id.toString() === testData.topicId);
          if (topic && !finalTitle) {
            finalTitle = `Quick Check: ${topic.front}`;
          }
        }

        formData.append('title', finalTitle);
        formData.append('type', testData.type);
        formData.append('unitId', testData.unitId);
        formData.append('topicId', testData.topicId); // Pass topicId
        // MISC type ke liye subject tag bhi bhejo
        if (testData.type === 'MISC' && testData.subjectTag) {
          formData.append('subjectTag', testData.subjectTag);
        }
      } else {
        formData.append('existingTestId', testData.existingTestId);
      }

      formData.append('explanationFormat', explanationFormat);

      const res = await uploadTestFromJSON(null, formData);

      if (res.success) {
        toast.success(res.message);
        setTestData((prev) => ({ ...prev, questionsJson: '', title: '' }));
        // Refresh existing tests
        getExistingTests().then(setExistingTests);
      } else {
        toast.error(res.message || 'Upload failed');
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? `Invalid JSON Questions: ${err.message}` : 'Invalid JSON Questions'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- PREPARE PROMPT ---
  const handleGeneratePrompt = async () => {
    if (!selectedTest) return toast.error('Please select a test from the left panel first.');
    setIsUpgrading(true);
    setUpgradeLogs((prev) => [
      ...prev,
      `Fetching pending questions for ${selectedTest.testTitle}...`,
    ]);
    try {
      const res = await getGeminiPromptForTest(
        batchSize,
        selectedTest.testId,
        selectedTest.testType,
        selectedTest.testTitle
      );
      if (res.error) {
        toast.error(res.error);
        setUpgradeLogs((prev) => [...prev, `ERROR: ${res.error}`]);
      } else if (res.prompt) {
        setGeneratedPrompt(res.prompt);
        setUpgradeLogs((prev) => [
          ...prev,
          `Generated prompt for ${res.count} questions. Paste this in Gemini.`,
        ]);
        toast.success(`Prompt generated for ${res.count} questions!`);
      } else {
        toast.success(res.message);
        setUpgradeLogs((prev) => [...prev, `[Result]: ${res.message}`]);
      }
    } catch (err: any) {
      setUpgradeLogs((prev) => [...prev, `CRITICAL ERROR: ${err.message}`]);
      toast.error('Failed to generate prompt: ' + err.message);
    } finally {
      setIsUpgrading(false);
    }
  };

  // --- SUBMIT EXPERT UPGRADE (MANUAL JSON) ---
  const handleExpertUpgrade = async () => {
    if (!jsonInput.trim()) {
      toast.error('Please paste the JSON output from Gemini first.');
      return;
    }

    setIsUpgrading(true);
    setUpgradeLogs((prev) => [...prev, 'Processing pasted JSON from Gemini...']);
    try {
      const res = await processManualGeminiJSON(jsonInput);
      setUpgradeLogs((prev) => [
        ...prev,
        `[Result]: ${res.message || (res.success ? 'Success' : 'Failed')}`,
      ]);
      if (res.error) {
        toast.error(res.error);
        setUpgradeLogs((prev) => [...prev, `ERROR: ${res.error}`]);
      } else {
        toast.success(`Upgraded ${res.processedCount} questions!`);
        setJsonInput(''); // Clear input on success
        setGeneratedPrompt(''); // Clear prompt
        if (res.preview) {
          setLastUpgradedPreview(res.preview as unknown as Record<string, unknown>);
          setLivePreviewClassic(null);
        }
        // Refresh stats
        await fetchDetailedStats();
      }
    } catch (err: any) {
      setUpgradeLogs((prev) => [...prev, `CRITICAL ERROR: ${err.message}`]);
      toast.error('Upgrade failed: ' + err.message);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleClassicBulkApply = async () => {
    if (!classicBulkInput.trim()) {
      toast.error('Paste a JSON array with questionId + explanation text first.');
      return;
    }
    setIsClassicBulkLoading(true);
    setUpgradeLogs((prev) => [...prev, 'Applying classic explanation text by questionId...']);
    try {
      const res = await processManualClassicExplanationsJSON(classicBulkInput);
      setUpgradeLogs((prev) => [
        ...prev,
        `[Classic]: ${res.message || (res.success ? 'Done' : 'Failed')}`,
      ]);
      if (!res.success) {
        toast.error(res.error || 'Classic bulk update failed');
      } else {
        toast.success(
          res.processedCount != null
            ? `Classic text saved for ${res.processedCount} question(s).`
            : 'Classic bulk update done.'
        );
        if (res.notFoundCount || res.skippedCount) {
          toast.message('Some rows were skipped', {
            description: res.message,
          });
        }
        setClassicBulkInput('');
        await fetchDetailedStats();
        try {
          const p = await getClassicColumnProgressForTest(PYQ_2026_CANONICAL_TEST_ID);
          if (p.success) {
            setClassicGenMeta((prev) => ({
              testTitle: p.testTitle,
              count: prev?.count ?? 0,
              totalInTest: p.totalInTest,
              pendingTotal: p.pendingTotal,
              classicDoneCount: p.classicDoneCount,
            }));
          }
        } catch {
          /* ignore */
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setUpgradeLogs((prev) => [...prev, `ERROR [Classic]: ${msg}`]);
      toast.error('Classic bulk update failed: ' + msg);
    } finally {
      setIsClassicBulkLoading(false);
    }
  };

  const copyClassicAiBatchPrompt = () => {
    void navigator.clipboard.writeText(CLASSIC_BULK_AI_BATCH_PROMPT);
    toast.success('AI instructions copied — add up to 25 questionIds in chat, then paste the JSON back here.');
  };

  const handleGenerateClassicBatchPrompt = async () => {
    setIsClassicGenLoading(true);
    setUpgradeLogs((prev) => [
      ...prev,
      `Loading classic-pending questions for 2026 test (${classicGenBatchSize} max)...`,
    ]);
    try {
      const res = await getClassicPendingBatchPrompt(
        PYQ_2026_CANONICAL_TEST_ID,
        classicGenBatchSize
      );
      if (!res.success) {
        toast.error(res.error || 'Failed to load batch');
        setUpgradeLogs((prev) => [...prev, `ERROR [Classic batch]: ${'error' in res ? res.error : 'unknown'}`]);
        return;
      }
      if (res.count === 0) {
        const msg =
          'emptyMessage' in res && res.emptyMessage
            ? res.emptyMessage
            : 'No questions in this batch.';
        setGeneratedClassicPrompt('');
        setClassicGenMeta({
          testTitle: res.testTitle,
          count: 0,
          pendingTotal: res.pendingTotal,
          totalInTest: res.totalInTest,
          classicDoneCount: res.classicDoneCount,
        });
        toast.info(msg);
        setUpgradeLogs((prev) => [...prev, `[Classic batch]: ${msg}`]);
        return;
      }
      if (res.fullPrompt) {
        setGeneratedClassicPrompt(res.fullPrompt);
        setClassicGenMeta({
          testTitle: res.testTitle,
          count: res.count,
          pendingTotal: res.pendingTotal,
          totalInTest: res.totalInTest,
          classicDoneCount: res.classicDoneCount,
        });
        toast.success(
          `Loaded ${res.count} question(s) in this batch. Classic ${res.classicDoneCount} / ${res.totalInTest} done; ${res.pendingTotal} pending.`
        );
        setUpgradeLogs((prev) => [
          ...prev,
          `[Classic batch]: prompt ready for ${res.count} ids (${res.pendingTotal} pending in test).`,
        ]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Classic batch: ' + msg);
      setUpgradeLogs((prev) => [...prev, `CRITICAL [Classic batch]: ${msg}`]);
    } finally {
      setIsClassicGenLoading(false);
    }
  };

  const copyGeneratedClassicPrompt = () => {
    if (!generatedClassicPrompt) return;
    void navigator.clipboard.writeText(generatedClassicPrompt);
    toast.success('Full prompt copied — paste in Gemini, then put the JSON array in the box below.');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Admin Upload Center
            </h1>
            <p className="text-slate-500">Manage content, quizzes, and learning resources.</p>
          </div>
        </div>

        <Tabs
          defaultValue="blog"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid h-12 w-full grid-cols-3 border bg-white p-1 shadow-sm md:w-[600px]">
            <TabsTrigger
              value="blog"
              className="h-full text-sm data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600"
            >
              <FileText className="mr-2 h-4 w-4" /> Content (Blog)
            </TabsTrigger>
            <TabsTrigger
              value="test"
              className="h-full text-sm data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Tests
            </TabsTrigger>
            <TabsTrigger
              value="expert"
              className="h-full text-sm data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600"
            >
              <Database className="mr-2 h-4 w-4" /> Expert Upgrade
            </TabsTrigger>
          </TabsList>

          {/* === BLOG / VLOG TAB === */}
          <TabsContent value="blog">
            <Card className="border-indigo-100 shadow-md">
              <CardHeader className="border-b border-indigo-50/50 bg-gradient-to-r from-indigo-50 to-white">
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  Blog & Vlog Upload
                </CardTitle>
                <CardDescription>Create rich articles or video lessons.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleBlogSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Image URL (Optional)</Label>
                    <Input
                      name="imageUrl"
                      value={blogData.imageUrl}
                      onChange={handleBlogChange}
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-slate-400">Cover image for the blog post</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex justify-between">
                      <span>AI-Generated JSON (with Metadata + Content)</span>
                      <div className="flex gap-2">
                        <span className="text-xs font-normal text-slate-400">
                          Format: <code>{`{ "metadata": {...}, "content": {...} }`}</code>
                        </span>
                        <a
                          href="/prompts/blog_generation.md"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-indigo-500 hover:underline"
                        >
                          View Prompt
                        </a>
                      </div>
                    </Label>
                    <Textarea
                      name="contentJson"
                      value={blogData.contentJson}
                      onChange={handleBlogChange}
                      className="h-[400px] bg-slate-50 font-mono text-xs"
                      placeholder='{ "metadata": { "title": "...", "slug": "...", "description": "...", "category": "...", "readingTime": 5, "type": "blog" }, "content": { "hi": [...], "en": [...] } }'
                      required
                    />
                    <p className="text-[10px] text-slate-400">
                      Paste the complete JSON response from the AI generator. It should include both
                      metadata and bilingual content.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload Blog
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === TEST UPLOAD TAB === */}
          <TabsContent value="test">
            <Card className="border-emerald-100 shadow-md">
              <CardHeader className="border-b border-emerald-50/50 bg-gradient-to-r from-emerald-50 to-white">
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Test & Quiz Upload
                </CardTitle>
                <CardDescription>
                  Create new assessments or append questions to existing ones.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleTestSubmit} className="space-y-6">
                  {/* Mode Toggle */}
                  <RadioGroup
                    value={testMode}
                    onValueChange={(v) => setTestMode(v as 'new' | 'existing')}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div
                      className={`flex cursor-pointer items-center space-x-2 rounded-xl border p-4 transition-all ${testMode === 'new' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <RadioGroupItem value="new" id="new" className="text-emerald-600" />
                      <Label
                        htmlFor="new"
                        className="flex cursor-pointer items-center gap-2 font-bold"
                      >
                        <Plus className="h-4 w-4" /> Create New Test
                      </Label>
                    </div>
                    <div
                      className={`flex cursor-pointer items-center space-x-2 rounded-xl border p-4 transition-all ${testMode === 'existing' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <RadioGroupItem value="existing" id="existing" className="text-emerald-600" />
                      <Label
                        htmlFor="existing"
                        className="flex cursor-pointer items-center gap-2 font-bold"
                      >
                        <Database className="h-4 w-4" /> Add to Existing
                      </Label>
                    </div>
                  </RadioGroup>

                  {testMode === 'new' ? (
                    <>
                      {/* Test Type Selection */}
                      <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
                        <Label className="mb-2 block text-emerald-800">Test Type</Label>
                        <div className="flex flex-wrap gap-2">
                          {['TOPIC', 'UNIT', 'FLT', 'CSAT', 'PYQ', 'MISC'].map((type) => (
                            <div
                              key={type}
                              onClick={() => setTestData((p) => ({ ...p, type }))}
                              className={`cursor-pointer rounded-md border px-4 py-2 text-sm font-medium transition-all ${
                                testData.type === type
                                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                                  : 'border-emerald-200 bg-white text-emerald-900 hover:border-emerald-400'
                              } `}
                            >
                              {type === 'TOPIC'
                                ? 'Topic Check'
                                : type === 'MISC'
                                  ? 'Free Quiz'
                                  : type}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Dynamic Fields based on Type */}
                        {(testData.type === 'TOPIC' ||
                          testData.type === 'UNIT' ||
                          testData.type === 'MISC') && (
                          <div className="space-y-2">
                            <Label>Select Unit</Label>
                            <Select
                              value={testData.unitId}
                              onValueChange={(v) =>
                                setTestData((p) => ({ ...p, unitId: v, topicId: '' }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {UNITS.map((u) => (
                                  <SelectItem key={u} value={u}>
                                    Unit {u.split('_')[1]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {testData.type === 'TOPIC' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Select Topic (from Syllabus)</Label>
                              <div className="flex rounded-md bg-slate-100 p-1">
                                <button
                                  type="button"
                                  onClick={() => setTopicLang('hi')}
                                  className={`rounded px-2 py-0.5 text-xs transition-all ${topicLang === 'hi' ? 'bg-white font-bold text-indigo-600 shadow' : 'text-slate-500'}`}
                                >
                                  हिंदी
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTopicLang('en')}
                                  className={`rounded px-2 py-0.5 text-xs transition-all ${topicLang === 'en' ? 'bg-white font-bold text-indigo-600 shadow' : 'text-slate-500'}`}
                                >
                                  EN
                                </button>
                              </div>
                            </div>
                            <Select
                              value={testData.topicId}
                              onValueChange={(v) => setTestData((p) => ({ ...p, topicId: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a topic..." />
                              </SelectTrigger>
                              <SelectContent>
                                <ScrollArea className="h-64">
                                  {availableTopics.map((t: any) => (
                                    <SelectItem key={t.id} value={t.id.toString()}>
                                      {t.front.substring(0, 40)}...
                                    </SelectItem>
                                  ))}
                                </ScrollArea>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {testData.type === 'MISC' && (
                          <div className="space-y-2">
                            <Label>Subject Tag (Filter me dikhega)</Label>
                            <Select
                              value={testData.subjectTag}
                              onValueChange={(v) => setTestData((p) => ({ ...p, subjectTag: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Subject choose karo..." />
                              </SelectTrigger>
                              <SelectContent>
                                {[
                                  'History',
                                  'MP Culture',
                                  'Geography',
                                  'MP Geography',
                                  'Polity',
                                  'Economy',
                                  'Science',
                                  'Current Affairs',
                                  'ICT',
                                  'MP Tribes',
                                ].map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            name="title"
                            value={testData.title}
                            onChange={handleTestChange}
                            placeholder={
                              testData.type === 'TOPIC' ? 'Auto-generated if empty' : 'Test Title'
                            }
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label>Select Existing Test</Label>
                      <Select
                        value={testData.existingTestId}
                        onValueChange={(v) => setTestData((p) => ({ ...p, existingTestId: v }))}
                      >
                        <SelectTrigger className="h-12 bg-white">
                          <SelectValue placeholder="Search or select a test..." />
                        </SelectTrigger>
                        <SelectContent>
                          <ScrollArea className="h-[300px]">
                            {existingTests.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No tests found
                              </SelectItem>
                            ) : (
                              existingTests.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  <span className="font-medium">{t.title}</span>
                                  <span className="ml-2 text-xs text-slate-400">
                                    ({t.type} • {t.totalQuestions} Qs)
                                  </span>
                                </SelectItem>
                              ))
                            )}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold text-emerald-900">Explanation Format</Label>
                      <div className="flex rounded-lg border border-emerald-100 bg-white p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setExplanationFormat('expert')}
                          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-black transition-all ${explanationFormat === 'expert' ? 'bg-emerald-600 text-white' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        >
                          <Zap
                            className={`h-3.5 w-3.5 ${explanationFormat === 'expert' ? 'fill-emerald-200' : ''}`}
                          />{' '}
                          Expert Mode
                        </button>
                        <button
                          type="button"
                          onClick={() => setExplanationFormat('classic')}
                          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-black transition-all ${explanationFormat === 'classic' ? 'bg-slate-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          <AlignLeft className="h-3.5 w-3.5" /> Classic
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] font-medium text-emerald-700/70">
                      {explanationFormat === 'expert'
                        ? "NEW: Will save structured JSON into 'extendedData'. AI will generate premium bilingual cards."
                        : 'LEGACY: Will save as plain text. Standard student view will be used.'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex justify-between">
                      <span>Questions JSON Array</span>
                      <div className="flex gap-2">
                        <span className="text-xs font-normal text-slate-400">
                          Format:{' '}
                          <code>
                            [{`{ "questionText": "...", "options": ["A","B"], "correctAnswer": 0 }`}
                            ]
                          </code>
                        </span>
                        {testData.type === 'MISC' && (
                          <a
                            href="/prompts/free_quiz_generation.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-emerald-500 hover:underline"
                          >
                            View Prompt
                          </a>
                        )}
                      </div>
                    </Label>
                    <Textarea
                      name="questionsJson"
                      value={testData.questionsJson}
                      onChange={handleTestChange}
                      className="h-[300px] border-emerald-100 bg-white font-mono text-xs font-medium text-slate-700 focus:border-emerald-500"
                      placeholder={
                        explanationFormat === 'expert'
                          ? '[{ "questionText": "...", "explanation_hi": "Expert Hindi", "explanation_en": "Expert English", "ncert_reference": "..." }]'
                          : '[{ "questionText": "...", "explanation": "Simple Text" }]'
                      }
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full bg-emerald-600 text-base font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 animate-spin" />
                    ) : testMode === 'new' ? (
                      <>
                        <Upload className="mr-2 h-4 w-4" /> Create & Upload Test
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" /> Append to Test
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === EXPERT UPGRADE TAB === */}
          <TabsContent value="expert">
            <Card className="border-amber-100 shadow-md">
              <CardHeader className="border-b border-amber-50/50 bg-gradient-to-r from-amber-50 to-white">
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Database className="h-5 w-5 text-amber-600" />
                  AI Expert Explanation Upgrade
                </CardTitle>
                <CardDescription>
                  Bulk upgrade old questions to the highly structured \`mppsc_expert\` schema. Use
                  the panel below to patch legacy bilingual text (e.g. 2026) so Classic view works
                  even when that year only had expert JSON.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black tracking-tight text-slate-900">
                        Classic explanations by question ID
                      </h3>
                      <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
                        Expert-style upgrade jaisa: JSON array with{' '}
                        <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">questionId</code> + classic
                        strings. Yeh server par columns{' '}
                        <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">explanation</code> /{' '}
                        <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">explanation_en</code> mein likhta
                        hai (Tests &ldquo;Classic&rdquo; jaisa) — isliye key names wahi rakhna jo neeche likhe
                        hain, random keys ignore ho jaate hain.
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-bold text-slate-500">
                      optional · mppsc
                    </span>
                  </div>

                  <div className="mb-4 rounded-xl border border-amber-200/70 bg-gradient-to-r from-amber-50/80 to-white p-4 shadow-sm">
                    <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-tight text-amber-900">
                          2026 Prelims — classic batch (same as expert queue)
                        </p>
                        <p className="mt-0.5 break-all font-mono text-[10px] text-slate-500">
                          testId: {PYQ_2026_CANONICAL_TEST_ID}
                        </p>
                        <p className="mt-1 text-[10px] leading-relaxed text-slate-600">
                          Sirf woh questions jinke{' '}
                          <code className="rounded bg-white px-1 font-mono">explanation</code> ya{' '}
                          <code className="rounded bg-white px-1 font-mono">explanation_en</code> abhi khali
                          hain — paper order mein next batch. Generate → Gemini → neeche box mein JSON paste →
                          Upsert.
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <Select
                          value={String(classicGenBatchSize)}
                          onValueChange={(v) =>
                            setClassicGenBatchSize(Number(v) as 10 | 25 | 50)
                          }
                        >
                          <SelectTrigger className="h-9 w-[120px] border-amber-200 bg-white text-xs font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[10, 25, 50].map((n) => (
                              <SelectItem key={n} value={String(n)}>
                                {n} questions
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          onClick={handleGenerateClassicBatchPrompt}
                          disabled={isClassicGenLoading}
                          className="h-9 bg-amber-600 text-xs font-black uppercase tracking-wide text-white hover:bg-amber-700"
                        >
                          {isClassicGenLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="mr-2 h-4 w-4" />
                          )}
                          Generate batch prompt
                        </Button>
                      </div>
                    </div>
                    {classicGenMeta && classicGenMeta.totalInTest > 0 && (
                      <div className="mb-3 space-y-1.5">
                        <div className="flex flex-wrap items-baseline justify-between gap-2 text-[10px]">
                          <span className="font-bold text-slate-800">
                            {classicGenMeta.testTitle} — both classic columns (Hindi + English)
                          </span>
                          <span className="shrink-0 font-black tabular-nums text-amber-900">
                            {classicGenMeta.classicDoneCount} / {classicGenMeta.totalInTest} updated
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                          <div
                            className="h-full min-w-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(
                                  (classicGenMeta.classicDoneCount / classicGenMeta.totalInTest) * 100
                                )
                              )}%`,
                            }}
                          />
                        </div>
                        <p className="text-[9px] text-slate-500">
                          {classicGenMeta.count > 0
                            ? `This Gemini batch: ${classicGenMeta.count} ids. `
                            : ''}
                          <strong className="text-slate-700">{classicGenMeta.pendingTotal}</strong> abhi
                          bhi dono mein se koi column khali.
                        </p>
                      </div>
                    )}
                    {generatedClassicPrompt ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Gemini input (copy)
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={copyGeneratedClassicPrompt}
                            className="h-7 border-amber-200 text-[10px] font-bold text-amber-800"
                          >
                            <Copy className="mr-1 h-3 w-3" />
                            Copy prompt
                          </Button>
                        </div>
                        <Textarea
                          readOnly
                          value={generatedClassicPrompt}
                          className={cn(
                            'h-32 min-h-0 max-h-32 resize-none overflow-y-auto border-amber-100 bg-white',
                            'font-mono text-[10px] leading-relaxed [scrollbar-gutter:stable]'
                          )}
                        />
                        <p className="text-[10px] text-slate-500">
                          Model se array aane ke baad neeche wale field mein sirf JSON array paste karo,
                          phir <strong>Upsert classic text</strong>.
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <ol className="mb-3 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-slate-600">
                    <li>
                      <span className="font-semibold text-slate-800">2026 (aur kisi year) ke ids:</span> logged-in
                      admin se{' '}
                      <a
                        href={INTELLIGENCE_QUESTIONS_HREF}
                        className="font-bold text-amber-700 underline-offset-2 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {INTELLIGENCE_QUESTIONS_HREF}
                      </a>{' '}
                      se question rows mein <code className="font-mono">id</code> copy karo, ya DB mein filter{' '}
                      <code className="break-all font-mono text-[10px]">testId = {PYQ_2026_CANONICAL_TEST_ID}</code>.
                    </li>
                    <li>
                      <span className="font-semibold text-slate-800">Batches of 25:</span> har baar chat ko max 25{' '}
                      <code className="font-mono">questionId</code> do; JSON output wapas yahan paste karo, phir
                      &ldquo;Upsert&rdquo; — next 25.
                    </li>
                    <li>
                      <span className="font-semibold text-slate-800">Naya full paper JSON:</span> full PYQ
                      upload prompt (keys DB mapping) ke liye{' '}
                      <a
                        href={PYQ_PROMPT_HREF}
                        className="font-bold text-amber-700 underline-offset-2 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {PYQ_PROMPT_HREF}
                      </a>{' '}
                      padho — wahan <code className="font-mono">explanation_hi</code> /{' '}
                      <code className="font-mono">explanation_en</code> kahan save hote hain likha hai.
                    </li>
                  </ol>

                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyClassicAiBatchPrompt}
                      className="h-8 border-amber-200 bg-amber-50/50 text-xs font-bold text-amber-900 hover:bg-amber-50"
                    >
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copy AI instructions (batch 25)
                    </Button>
                    <span className="text-[10px] text-slate-500">
                      Prompt ke baad apni chat mein ids list paste karo; model se aaya JSON yahan.
                    </span>
                  </div>

                  <Textarea
                    value={classicBulkInput}
                    onChange={(e) => setClassicBulkInput(e.target.value)}
                    placeholder={`[\n  {\n    "questionId": "nanoid-from-list",\n    "explanation_hi": "Hindi: ✅ **सही तर्क\\n💡 **एग्जाम फैक्ट",\n    "explanationEn": "English: **Correct Logic\\n**Exam Fact"\n  }\n]`}
                    className="min-h-[160px] border-slate-200 font-mono text-[11px] shadow-inner"
                    spellCheck={false}
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      onClick={handleClassicBulkApply}
                      disabled={isClassicBulkLoading || !classicBulkInput.trim()}
                      className="h-9 bg-slate-800 text-xs font-bold text-white hover:bg-slate-900"
                    >
                      {isClassicBulkLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <AlignLeft className="mr-2 h-4 w-4" />
                      )}
                      Upsert classic text
                    </Button>
                    <span className="text-[10px] text-slate-400">
                      Keys: <code className="font-mono">explanation_hi</code> or string{' '}
                      <code className="font-mono">explanation</code> · <code className="font-mono">explanationEn</code> /{' '}
                      <code className="font-mono">explanation_en</code>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-stretch gap-6 xl:flex-row">
                  {/* LEFT PANE: Master Queue Selection */}
                  <div className="flex h-[500px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:h-[750px] xl:w-[380px]">
                    <div className="flex shrink-0 flex-col border-b border-slate-100 bg-slate-50">
                      <div className="flex items-center justify-between bg-white p-4">
                        <span className="text-sm font-black tracking-tight text-slate-800 uppercase">
                          Content Queue
                        </span>
                        <span className="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                          {detailedStats.length} Total
                        </span>
                      </div>

                      <Tabs
                        defaultValue="pyq"
                        value={expertCategory}
                        onValueChange={setExpertCategory}
                        className="w-full"
                      >
                        <TabsList className="h-11 w-full rounded-none border-y border-slate-100 bg-slate-50 p-1">
                          {['pyq', 'flt', 'csat', 'unit', 'topic'].map((cat) => (
                            <TabsTrigger
                              key={cat}
                              value={cat}
                              className="flex-1 text-[10px] font-black tracking-tighter uppercase data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm"
                            >
                              {cat}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </Tabs>
                    </div>

                    <ScrollArea className="min-h-0 flex-1 bg-slate-50/30">
                      <div className="space-y-2 p-3">
                        {(() => {
                          // Filter logic
                          let categoryStats = detailedStats.filter(
                            (s) => s.testType.toLowerCase() === expertCategory
                          );

                          if (expertCategory === 'pyq') {
                            categoryStats = categoryStats.filter((s) =>
                              CANONICAL_IDS_LIST.includes(s.testId)
                            );
                          }

                          if (categoryStats.length === 0) {
                            return (
                              <div className="space-y-2 py-20 text-center">
                                <Database className="mx-auto h-8 w-8 text-slate-200" />
                                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                  No Tests Found
                                </p>
                              </div>
                            );
                          }

                          return categoryStats.map((stat) => {
                            const isSelected = selectedTest?.testId === stat.testId;
                            const progressPct =
                              stat.total > 0 ? (stat.upgraded / stat.total) * 100 : 0;

                            return (
                              <div
                                key={stat.testId}
                                onClick={() => setSelectedTest(stat)}
                                className={`group cursor-pointer rounded-xl border p-3.5 transition-all duration-200 ${
                                  isSelected
                                    ? 'translate-x-1 border-amber-400 bg-amber-50 shadow-md ring-1 ring-amber-400/20'
                                    : 'border-slate-100 bg-white hover:translate-x-0.5 hover:border-amber-200 hover:shadow-sm'
                                }`}
                              >
                                <div className="mb-2.5 flex items-start justify-between">
                                  <span
                                    className={`text-[13px] leading-tight font-black ${isSelected ? 'text-amber-900' : 'text-slate-700'}`}
                                  >
                                    {stat.testTitle}
                                  </span>
                                  {stat.pending > 0 ? (
                                    <div className="flex h-5 items-center rounded-full border border-rose-100 bg-rose-50 px-2 text-rose-600">
                                      <span className="text-[9px] font-black tabular-nums">
                                        {stat.pending}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex h-5 items-center rounded-full border border-emerald-100 bg-emerald-50 px-2 text-emerald-600">
                                      <CheckCircle2 className="h-3 w-3" />
                                    </div>
                                  )}
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className={`h-full origin-left transition-all duration-500 ${stat.pending === 0 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                    style={{ width: `${progressPct}%` }}
                                  />
                                </div>
                                <div className="mt-2 flex justify-between text-[10px] font-bold tracking-tighter text-slate-400 uppercase">
                                  <span>
                                    {stat.upgraded} / {stat.total} Done
                                  </span>
                                  <span>{Math.round(progressPct)}%</span>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* RIGHT PANE: Workspace */}
                  <div className="flex flex-1 flex-col gap-6">
                    <ScrollArea className="h-[500px] pr-4 xl:h-[750px]">
                      {selectedTest ? (
                        <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-500">
                          {/* Selected Test Context */}
                          <div className="rounded-2xl border border-l-4 border-amber-200 border-l-amber-500 bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-black text-slate-900">
                              {selectedTest.testTitle}
                            </h3>
                            <div className="mt-4 flex flex-wrap gap-4">
                              <div className="space-y-1">
                                <Label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                  Test Category
                                </Label>
                                <p className="text-sm font-bold text-slate-700">
                                  {selectedTest.testType}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                  Upgrade Progress
                                </Label>
                                <p className="text-sm font-bold text-amber-600">
                                  {selectedTest.upgraded} / {selectedTest.total} Questions
                                </p>
                              </div>
                              <div className="ml-auto space-y-1">
                                <Label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                  Batch Settings
                                </Label>
                                <Select
                                  value={batchSize.toString()}
                                  onValueChange={(v) => setBatchSize(parseInt(v))}
                                >
                                  <SelectTrigger className="h-8 w-[120px] border-slate-200 bg-slate-50">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[10, 25, 50, 100].map((s) => (
                                      <SelectItem key={s} value={s.toString()}>
                                        {s} Questions
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <Button
                              onClick={handleGeneratePrompt}
                              disabled={isUpgrading || selectedTest.total === 0}
                              className="mt-6 h-11 w-full bg-amber-600 text-xs font-black tracking-widest uppercase shadow-lg shadow-amber-200 hover:bg-amber-700"
                            >
                              {isUpgrading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Plus className="mr-2 h-4 w-4" />
                              )}
                              Generate Gemini Upgrade Prompt
                            </Button>
                          </div>

                          {/* Generation Results */}
                          {generatedPrompt && (
                            <div className="animate-in zoom-in-95 space-y-4 duration-300">
                              <Card className="border-indigo-100 bg-indigo-50/20">
                                <CardHeader className="py-4 font-black">
                                  <CardTitle className="flex items-center gap-2 text-sm font-black tracking-widest text-indigo-900 uppercase">
                                    <Zap className="h-4 w-4 fill-indigo-200 text-indigo-600" />
                                    Gemini Mentorship Prompt
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <Textarea
                                    readOnly
                                    value={generatedPrompt}
                                    className="h-48 border-indigo-100 bg-white font-mono text-[11px]"
                                  />
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      navigator.clipboard.writeText(generatedPrompt);
                                      toast.success('Prompt copied to clipboard!');
                                    }}
                                    className="w-full border-indigo-200 font-bold text-indigo-600 hover:bg-indigo-50"
                                  >
                                    Copy Prompt to Clipboard
                                  </Button>
                                </CardContent>
                              </Card>

                              <div className="grid gap-6">
                                <Card className="border-emerald-100 bg-white shadow-lg ring-2 ring-emerald-500/10">
                                  <CardHeader className="border-b border-emerald-50 py-4">
                                    <CardTitle className="flex items-center gap-2 text-sm font-black tracking-widest text-emerald-900 uppercase">
                                      <Database className="h-4 w-4 text-emerald-600" />
                                      Paste Results from Gemini
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4 p-6">
                                    <Textarea
                                      value={jsonInput}
                                      onChange={(e) => setJsonInput(e.target.value)}
                                      placeholder="Paste the JSON output exactly as provided by Gemini Advanced..."
                                      className="h-64 border-emerald-100 font-mono text-[11px] shadow-inner focus:border-emerald-500"
                                    />
                                    <Button
                                      onClick={handleExpertUpgrade}
                                      disabled={isUpgrading || !jsonInput}
                                      className="h-12 w-full bg-emerald-600 text-xs font-black tracking-widest uppercase shadow-lg shadow-emerald-200 transition-all hover:scale-[1.01] hover:bg-emerald-700"
                                    >
                                      {isUpgrading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      ) : (
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                      )}
                                      Finalize Database Upgrade
                                    </Button>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          )}

                          {/* Live Preview — same StructuredExplanation as student app; no grey wrapper (was hiding gradient) */}
                          {lastUpgradedPreview && (
                            <div className="space-y-4">
                              <h3 className="text-sm font-bold text-slate-900">Live Preview</h3>
                              <StructuredExplanation
                                extendedData={lastUpgradedPreview}
                                language="hi"
                              />
                            </div>
                          )}

                          {/* Logs Section */}
                          {upgradeLogs.length > 0 && (
                            <Card className="overflow-hidden border-none border-slate-200 bg-slate-900 shadow-xl">
                              <CardHeader className="border-b border-slate-800 bg-slate-900/50 py-3">
                                <CardTitle className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                  System Logs
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-4">
                                <ScrollArea className="h-32">
                                  <div className="space-y-1 font-mono text-[10px] text-emerald-400">
                                    {upgradeLogs.map((log, i) => (
                                      <div key={i} className="flex gap-2">
                                        <span className="text-slate-600">
                                          [{new Date().toLocaleTimeString()}]
                                        </span>
                                        <span>{log}</span>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      ) : (
                        <div className="flex h-full animate-pulse flex-col items-center justify-center space-y-4 rounded-3xl border-2 border-dashed border-slate-100 bg-white/50 py-40">
                          <Database className="h-12 w-12 text-slate-200" />
                          <div className="text-center">
                            <p className="text-sm font-bold text-slate-400">
                              Select a Test from Queue
                            </p>
                            <p className="text-xs text-slate-300">
                              Choose a test on the left to start upgrading explanations.
                            </p>
                          </div>
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
