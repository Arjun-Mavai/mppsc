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
  getGeminiPromptForTest,
  processManualGeminiJSON,
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
  Globe,
} from 'lucide-react';
import { StructuredExplanation } from '@/components/StructuredExplanation';
import { syllabusData } from '@/data/syllabusData';
import { ScrollArea } from '@/components/ui/scroll-area';
import { logger } from '@/lib/logger';
import { parseLenientJSON } from '@/lib/json-utils';
import { CANONICAL_TEST_IDS } from '@/lib/pyq-constants';

const CANONICAL_IDS_LIST = Object.values(CANONICAL_TEST_IDS);

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
  const [upgradeLogs, setUpgradeLogs] = useState<string[]>([]);
  const [explanationFormat, setExplanationFormat] = useState<'expert' | 'classic'>('expert');
  const [lastUpgradedPreview, setLastUpgradedPreview] = useState<any>(null);

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
      toast.error(
        err instanceof Error ? `Invalid JSON: ${err.message}` : 'Invalid JSON format.',
      );
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
        err instanceof Error ? `Invalid JSON Questions: ${err.message}` : 'Invalid JSON Questions',
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
            setLastUpgradedPreview(res.preview);
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
                      <Label className="text-emerald-900 font-bold">Explanation Format</Label>
                      <div className="flex rounded-lg bg-white p-1 shadow-sm border border-emerald-100">
                        <button
                          type="button"
                          onClick={() => setExplanationFormat('expert')}
                          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-black transition-all ${explanationFormat === 'expert' ? 'bg-emerald-600 text-white' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        >
                          <Zap className={`h-3.5 w-3.5 ${explanationFormat === 'expert' ? 'fill-emerald-200' : ''}`} /> Expert Mode
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
                    <p className="text-[10px] text-emerald-700/70 font-medium">
                      {explanationFormat === 'expert' 
                        ? "NEW: Will save structured JSON into 'extendedData'. AI will generate premium bilingual cards." 
                        : "LEGACY: Will save as plain text. Standard student view will be used."}
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
                      className="h-[300px] bg-white font-mono text-xs font-medium text-slate-700 border-emerald-100 focus:border-emerald-500"
                      placeholder={explanationFormat === 'expert' 
                        ? '[{ "questionText": "...", "explanation_hi": "Expert Hindi", "explanation_en": "Expert English", "ncert_reference": "..." }]'
                        : '[{ "questionText": "...", "explanation": "Simple Text" }]'}
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
                  Bulk upgrade old questions to the highly structured \`mppsc_expert\` schema.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col xl:flex-row gap-6 items-stretch">
                  {/* LEFT PANE: Master Queue Selection */}
                  <div className="flex h-[500px] xl:h-[750px] xl:w-[380px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shrink-0">
                    <div className="flex shrink-0 flex-col bg-slate-50 border-b border-slate-100">
                      <div className="p-4 flex justify-between items-center bg-white">
                        <span className="text-sm font-black text-slate-800 tracking-tight uppercase">Content Queue</span>
                        <span className="rounded-full bg-amber-100 text-amber-700 font-bold px-2.5 py-0.5 text-[10px] border border-amber-200">
                          {detailedStats.length} Total
                        </span>
                      </div>
                      
                      <Tabs defaultValue="pyq" value={expertCategory} onValueChange={setExpertCategory} className="w-full">
                        <TabsList className="w-full h-11 bg-slate-50 rounded-none border-y border-slate-100 p-1">
                          {['pyq', 'flt', 'csat', 'unit', 'topic'].map(cat => (
                            <TabsTrigger 
                              key={cat} 
                              value={cat} 
                              className="flex-1 text-[10px] font-black uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-amber-600"
                            >
                              {cat}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </Tabs>
                    </div>

                    <ScrollArea className="flex-1 min-h-0 bg-slate-50/30">
                      <div className="p-3 space-y-2">
                        {(() => {
                           // Filter logic
                           let categoryStats = detailedStats.filter(
                             (s) => s.testType.toLowerCase() === expertCategory
                           );
                           
                           if (expertCategory === 'pyq') {
                               categoryStats = categoryStats.filter(s => CANONICAL_IDS_LIST.includes(s.testId));
                           }

                           if (categoryStats.length === 0) {
                             return (
                               <div className="py-20 text-center space-y-2">
                                 <Database className="h-8 w-8 text-slate-200 mx-auto" />
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Tests Found</p>
                               </div>
                             );
                           }

                           return categoryStats.map((stat) => {
                             const isSelected = selectedTest?.testId === stat.testId;
                             const progressPct = stat.total > 0 ? (stat.upgraded / stat.total) * 100 : 0;

                             return (
                               <div
                                 key={stat.testId}
                                 onClick={() => setSelectedTest(stat)}
                                 className={`cursor-pointer rounded-xl border p-3.5 transition-all duration-200 group ${
                                   isSelected
                                     ? 'border-amber-400 bg-amber-50 shadow-md ring-1 ring-amber-400/20 translate-x-1'
                                     : 'border-slate-100 bg-white hover:border-amber-200 hover:shadow-sm hover:translate-x-0.5'
                                  }`}
                               >
                                 <div className="mb-2.5 flex items-start justify-between">
                                   <span className={`text-[13px] font-black leading-tight ${isSelected ? 'text-amber-900' : 'text-slate-700'}`}>
                                     {stat.testTitle}
                                   </span>
                                   {stat.pending > 0 ? (
                                     <div className="h-5 flex items-center bg-rose-50 text-rose-600 px-2 rounded-full border border-rose-100">
                                       <span className="text-[9px] font-black tabular-nums">{stat.pending}</span>
                                     </div>
                                   ) : (
                                     <div className="h-5 flex items-center bg-emerald-50 text-emerald-600 px-2 rounded-full border border-emerald-100">
                                       <CheckCircle2 className="h-3 w-3" />
                                     </div>
                                   )}
                                 </div>
                                 <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                   <div
                                     className={`h-full transition-all duration-500 origin-left ${stat.pending === 0 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                     style={{ width: `${progressPct}%` }}
                                   />
                                 </div>
                                 <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                   <span>{stat.upgraded} / {stat.total} Done</span>
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
                  <div className="flex-1 flex flex-col gap-6">
                    <ScrollArea className="h-[500px] xl:h-[750px] pr-4">
                      {selectedTest ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                          {/* Selected Test Context */}
                          <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm border-l-4 border-l-amber-500">
                            <h3 className="text-lg font-black text-slate-900">{selectedTest.testTitle}</h3>
                            <div className="mt-4 flex flex-wrap gap-4">
                              <div className="space-y-1">
                                <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Test Category</Label>
                                <p className="text-sm font-bold text-slate-700">{selectedTest.testType}</p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Upgrade Progress</Label>
                                <p className="text-sm font-bold text-amber-600">{selectedTest.upgraded} / {selectedTest.total} Questions</p>
                              </div>
                              <div className="space-y-1 ml-auto">
                                <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Batch Settings</Label>
                                <Select value={batchSize.toString()} onValueChange={(v) => setBatchSize(parseInt(v))}>
                                  <SelectTrigger className="w-[120px] h-8 bg-slate-50 border-slate-200">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[10, 25, 50, 100].map((s) => (
                                      <SelectItem key={s} value={s.toString()}>{s} Questions</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <Button
                              onClick={handleGeneratePrompt}
                              disabled={isUpgrading || selectedTest.total === 0}
                              className="mt-6 w-full h-11 bg-amber-600 font-black tracking-widest uppercase text-xs shadow-lg shadow-amber-200 hover:bg-amber-700"
                            >
                              {isUpgrading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                              Generate Gemini Upgrade Prompt
                            </Button>
                          </div>

                          {/* Generation Results */}
                          {generatedPrompt && (
                            <div className="space-y-4 animate-in zoom-in-95 duration-300">
                              <Card className="border-indigo-100 bg-indigo-50/20">
                                <CardHeader className="py-4 font-black">
                                  <CardTitle className="text-sm font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                                     <Zap className="h-4 w-4 text-indigo-600 fill-indigo-200" />
                                     Gemini Mentorship Prompt
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <Textarea
                                    readOnly
                                    value={generatedPrompt}
                                    className="h-48 bg-white font-mono text-[11px] border-indigo-100"
                                  />
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      navigator.clipboard.writeText(generatedPrompt);
                                      toast.success('Prompt copied to clipboard!');
                                    }}
                                    className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold"
                                  >
                                    Copy Prompt to Clipboard
                                  </Button>
                                </CardContent>
                              </Card>

                              <div className="grid gap-6">
                                <Card className="border-emerald-100 bg-white shadow-lg ring-2 ring-emerald-500/10">
                                  <CardHeader className="py-4 border-b border-emerald-50">
                                    <CardTitle className="text-sm font-black text-emerald-900 uppercase tracking-widest flex items-center gap-2">
                                       <Database className="h-4 w-4 text-emerald-600" />
                                       Paste Results from Gemini
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-6 space-y-4">
                                    <Textarea
                                      value={jsonInput}
                                      onChange={(e) => setJsonInput(e.target.value)}
                                      placeholder="Paste the JSON output exactly as provided by Gemini Advanced..."
                                      className="h-64 font-mono text-[11px] border-emerald-100 focus:border-emerald-500 shadow-inner"
                                    />
                                    <Button
                                      onClick={handleExpertUpgrade}
                                      disabled={isUpgrading || !jsonInput}
                                      className="w-full h-12 bg-emerald-600 font-black tracking-widest uppercase text-xs shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:scale-[1.01] transition-all"
                                    >
                                      {isUpgrading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                      Finalize Database Upgrade
                                    </Button>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          )}

                          {/* Live Preview Card */}
                          {lastUpgradedPreview && (
                            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-2 px-1">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Live Preview: Last Upgraded Question</span>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-3">
                                        <CheckCircle2 className="h-6 w-6 text-emerald-500 opacity-20" />
                                    </div>
                                    <StructuredExplanation extendedData={lastUpgradedPreview} />
                                </div>
                            </div>
                          )}

                          {/* Logs Section */}
                          {upgradeLogs.length > 0 && (
                            <Card className="border-slate-200 bg-slate-900 border-none shadow-xl overflow-hidden">
                              <CardHeader className="py-3 border-b border-slate-800 bg-slate-900/50">
                                <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Logs</CardTitle>
                              </CardHeader>
                              <CardContent className="p-4">
                                <ScrollArea className="h-32">
                                  <div className="space-y-1 font-mono text-[10px] text-emerald-400">
                                    {upgradeLogs.map((log, i) => (
                                      <div key={i} className="flex gap-2">
                                        <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
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
                        <div className="flex h-full flex-col items-center justify-center space-y-4 rounded-3xl border-2 border-dashed border-slate-100 bg-white/50 animate-pulse py-40">
                          <Database className="h-12 w-12 text-slate-200" />
                          <div className="text-center">
                            <p className="text-sm font-bold text-slate-400">Select a Test from Queue</p>
                            <p className="text-xs text-slate-300">Choose a test on the left to start upgrading explanations.</p>
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
