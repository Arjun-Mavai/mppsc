'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, Wand2, ShieldAlert, FileJson, AlertCircle, ClipboardPaste } from 'lucide-react';
import { updateMainsContentSurgically, getTopicContentForAdmin } from '@/actions/mains-actions';
import { buildMainsPyqReferenceForTopic } from '@/actions/mains-pyq-actions';

interface SurgicalUpdaterClientProps {
  initialPapers: any[];
}

const SECTIONS = [
  { id: 'conceptHi', name: 'Concept & Theory (Hindi)' },
  { id: 'conceptEn', name: 'Concept & Theory (English)' },
  { id: 'expertStrategyHi', name: 'Expert Strategy (Hindi)' },
  { id: 'expertStrategyEn', name: 'Expert Strategy (English)' },
  { id: 'modelAnswers', name: 'Model Answers (JSON)' },
  { id: 'keyTermsHi', name: 'Key Terms (Hindi)' },
  { id: 'keyTermsEn', name: 'Key Terms (English)' },
  { id: 'practiceQuestions', name: 'Practice Questions (JSON)' },
  { id: 'richPayload', name: 'Rich Payload (JSON)' },
];

export default function SurgicalUpdaterClient({ initialPapers }: SurgicalUpdaterClientProps) {
  const router = useRouter();
  
  // Selection State
  const [selectedPaperId, setSelectedPaperId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedSection, setSelectedSection] = useState('modelAnswers');
  
  // Content State
  const [contentInput, setContentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingStatus, setExistingStatus] = useState<'loading' | 'empty' | 'exists' | null>(null);
  
  // PYQ State
  const [pyqReference, setPyqReference] = useState('');
  const [hasPyqs, setHasPyqs] = useState(false);

  // Cascading Lookups
  const paper = useMemo(() => initialPapers.find(p => p.id === selectedPaperId), [initialPapers, selectedPaperId]);
  const unit = useMemo(() => paper?.units?.find((u: any) => u.id === selectedUnitId), [paper, selectedUnitId]);
  const topic = useMemo(() => unit?.topics?.find((t: any) => t.id === selectedTopicId), [unit, selectedTopicId]);

  // Check Existing Content & Fetch PYQs
  const checkExistingContent = async (topicId: string, section: string) => {
    setExistingStatus('loading');
    
    // Fetch PYQ data for the topic in parallel
    buildMainsPyqReferenceForTopic(topicId).then(pyqRes => {
      setPyqReference(pyqRes.text);
      setHasPyqs(pyqRes.hadAnyImportedPyq);
    }).catch(err => console.error("PYQ Fetch Error:", err));

    const res = await getTopicContentForAdmin(topicId);
    if (res.success && res.data?.content) {
      const val = (res.data.content as any)[section];
      if (val === null || val === undefined || val === '' || (typeof val === 'object' && Object.keys(val).length === 0)) {
        setExistingStatus('empty');
      } else {
        setExistingStatus('exists');
      }
    } else {
      setExistingStatus('empty');
    }
  };

  const handleTopicSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tid = e.target.value;
    setSelectedTopicId(tid);
    if (tid) {
      checkExistingContent(tid, selectedSection);
    } else {
      setExistingStatus(null);
    }
  };

  const handleSectionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sec = e.target.value;
    setSelectedSection(sec);
    if (selectedTopicId) {
      checkExistingContent(selectedTopicId, sec);
    }
  };

  const generatePrompt = () => {
    if (!topic) return;
    const isJson = selectedSection === 'modelAnswers' || selectedSection === 'practiceQuestions' || selectedSection === 'richPayload';
    
    let prompt = `Act as a senior MPPSC Mains mentor & former evaluator (10+ years). You write ONLY for MPPSC State Service Mains 2026.
    
TARGET PAPER: ${paper?.paperNumber} - ${paper?.titleEn}
UNIT: ${unit?.unitNumber}
TOPIC LINE: "${topic.titleEn}" / "${topic.titleHi}"

ENGAGEMENT (NOT A WIKIPEDIA DUMP)
- Tone: warm, confident coaching — like a topper friend. No robotic lists.
- Write in structured bullet points, not long paragraphs.
- Hindi: बोलचाल की सरलता + परीक्षा की गंभीरता.
- English: crisp, human, examiner-grade.
- Everything must be ready-to-write for the exam hall.

`;

    // 🚀 INJECT PYQs OR EXPECTED QUESTIONS LOGIC
    if (hasPyqs && pyqReference) {
      prompt += `══════════════════════════════════════════════════════════════════
LATEST — TARGET + REAL QUESTIONS (PYQs)
══════════════════════════════════════════════════════════════════
The following are real past year questions (2023-2024) from MPPSC Mains for this topic. 
You MUST provide model answers for these exact questions where applicable. Do not invent new questions if these cover the dimensions well.

${pyqReference}

`;
    } else {
      prompt += `══════════════════════════════════════════════════════════════════
LATEST — TARGET + EXPECTED QUESTIONS
══════════════════════════════════════════════════════════════════
--- NO IMPORTED PYQ STEMS FOUND ---
You MUST invent highly probable, MPPSC-style "Expected" questions based on the syllabus line.
Think like an examiner: What are the most likely dimensions to be asked this year?
Generate:
- 2-marker expected questions.
- 7-marker expected questions.
- 10/11-marker expected questions.

`;
    }
    
    if (selectedSection === 'modelAnswers') {
      prompt += `Generate STRICTLY BILINGUAL model answers for this topic.
You must output ONE raw JSON object. Do not include markdown formatting like \`\`\`json outside the structure.

JSON SHAPE REQUIRED:
{
  "2m": [{"stem": "Hindi Q1", "text": "- point 1\\n- point 2"}, {"stem": "English Q1", "text": "- point 1\\n- point 2"}],
  "7m": [{"stem": "Hindi Q2", "text": "- point 1\\n- point 2"}, {"stem": "English Q2", "text": "- point 1\\n- point 2"}],
  "10m": [{"stem": "Hindi Q3", "text": "- point 1\\n- point 2"}, {"stem": "English Q3", "text": "- point 1\\n- point 2"}]
}

RULES:
1. Provide exactly three 2-marker questions (max 20 words each).
2. Provide two 7-marker questions (max 60 words each).
3. Provide one 10/11-marker question (max 200 words each).
4. For each mark category, provide BOTH Hindi and English variants as separate objects in the array.
5. All text answers MUST use vertical bullet points starting with "- " (hyphen + space). No giant paragraphs.`;
    } else if (selectedSection === 'richPayload') {
      prompt += `Generate the complete Expert-Rich payload for this topic.
You must output ONE raw JSON object. Do not include markdown formatting like \`\`\`json outside the structure.

JSON SHAPE REQUIRED:
{
  "schema_version": "v3_history_rich",
  "syllabus_grasp_hi": "- bullet 1\\n- bullet 2",
  "syllabus_grasp_en": "- bullet 1\\n- bullet 2",
  "model_answers_hi": {
    "2m": [{"stem": "Q", "text": "- ans"}],
    "7m": [{"stem": "Q", "text": "- ans"}],
    "10m": [{"stem": "Q", "text": "- ans"}]
  },
  "model_answers_en": {
    "2m": [{"stem": "Q", "text": "- ans"}],
    "7m": [{"stem": "Q", "text": "- ans"}],
    "10m": [{"stem": "Q", "text": "- ans"}]
  },
  "key_terms_cards_hi": [{"emoji": "📜", "term": "Term", "hint": "Hint"}],
  "key_terms_cards_en": [{"emoji": "📜", "term": "Term", "hint": "Hint"}]
}

RULES:
- Word discipline MUST match MPPSC limits (2m: 20 words, 7m: 60 words, 10m: 200 words).
- Narrative blocks must be bullets ("- ").
- Model answer keys must contain arrays of {stem, text} objects.
- Hindi block = authentic Hindi. English block = authentic English (not lazy translation).`;
    } else if (selectedSection.includes('concept')) {
      prompt += `Provide a comprehensive theoretical explanation, definitions, and core concepts. Do not exceed 500 words.
Make it engaging, use micro-stories, contrasts, and an 'examiner-grade' tone.
Output raw text using Markdown headings. 
Use these specific headings (or similar):
## शब्द / विषय का मर्म (Core meaning)
## मूलभाव व संदर्भ (Essence & context)
## MPPSC एंगल (MPPSC angle)
## डॉट्स जोड़ो (Connecting the dots)`;
    } else if (selectedSection.includes('Strategy')) {
      prompt += `Provide strategic advice on how to tackle this topic in the exam.
Include:
- Mark-wise game plan: how to open 2m vs 7m vs long.
- Ready-to-write skeleton (intro line + body pillars + closing line) for long answers.
- Value-add list: diagram ideas, tables, quotes, or Articles.
- Micro-notes (exam bullets): 8-14 bullets covering the syllabus line end-to-end.
- Common traps that cost marks.
Output raw text using Markdown headings and bullets.`;
    } else if (selectedSection.includes('keyTerms')) {
      prompt += `Generate an array of JSON flashcard objects for key terms related to this topic.
Required format:
[
  { "emoji": "📜", "term": "Term Name", "hint": "Short powerful hint (max 30 words)." }
]
Generate 8-12 high-value cards. Output raw JSON array only. No markdown fences.`;
    } else {
      prompt += `Provide the required content optimally based on standard MPPSC Mains parameters.`;
    }

    navigator.clipboard.writeText(prompt);
    toast.success("Magic Prompt copied to clipboard!");
  };

  const handleSubmit = async () => {
    if (!selectedTopicId || !contentInput.trim()) return;
    
    setIsSubmitting(true);
    let payload: any = contentInput;
    
    console.log('--- SURGICAL UPDATE FLOW STARTED (CLIENT) ---');
    console.log(`[1] Selected Topic ID: ${selectedTopicId}`);
    console.log(`[2] Target Section: ${selectedSection}`);
    
    const isJson = selectedSection === 'modelAnswers' || selectedSection === 'practiceQuestions' || selectedSection === 'richPayload';
    
    if (isJson) {
      console.log(`[3] Parsing JSON input...`);
      try {
        payload = JSON.parse(contentInput);
        console.log(`[4] JSON parsed successfully.`);
      } catch (e) {
        toast.error("Invalid JSON format. Please validate your JSON.");
        setIsSubmitting(false);
        return;
      }
    }

    console.log(`[5] Calling Server Action 'updateMainsContentSurgically' with payload...`);
    const res = await updateMainsContentSurgically(selectedTopicId, selectedSection as any, payload);
    console.log(`[6] Server Action returned:`, res);
    
    if (res.success) {
      toast.success("Surgical Update Successful! 🎉");
      setContentInput('');
      checkExistingContent(selectedTopicId, selectedSection);
      router.refresh();
    } else {
      toast.error(`Update failed: ${res.error}`);
    }
    setIsSubmitting(false);
    console.log('--- SURGICAL UPDATE FLOW ENDED (CLIENT) ---');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 pt-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-emerald-600" />
          Surgical Content Updater
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Safely update specific sections of a topic without overwriting existing data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column - Selection */}
        <div className="md:col-span-4 space-y-5">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">1. Select Target</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Paper</Label>
                <select 
                  className="w-full text-sm rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500"
                  value={selectedPaperId}
                  onChange={(e) => {
                    setSelectedPaperId(e.target.value);
                    setSelectedUnitId('');
                    setSelectedTopicId('');
                    setExistingStatus(null);
                  }}
                >
                  <option value="">-- Select Paper --</option>
                  {initialPapers.map(p => (
                    <option key={p.id} value={p.id}>GS Paper {p.paperNumber}</option>
                  ))}
                </select>
              </div>

              {paper && (
                <div>
                  <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Unit</Label>
                  <select 
                    className="w-full text-sm rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500"
                    value={selectedUnitId}
                    onChange={(e) => {
                      setSelectedUnitId(e.target.value);
                      setSelectedTopicId('');
                      setExistingStatus(null);
                    }}
                  >
                    <option value="">-- Select Unit --</option>
                    {paper.units.map((u: any) => (
                      <option key={u.id} value={u.id}>Unit {u.unitNumber} {u.part !== 'NONE' ? `(Part ${u.part})` : ''} - {u.titleEn.substring(0,25)}...</option>
                    ))}
                  </select>
                </div>
              )}

              {unit && (
                <div>
                  <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Topic</Label>
                  <select 
                    className="w-full text-sm rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500"
                    value={selectedTopicId}
                    onChange={handleTopicSelect}
                  >
                    <option value="">-- Select Topic --</option>
                    {unit.topics.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.titleEn}</option>
                    ))}
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={!selectedTopicId ? "opacity-50 pointer-events-none" : ""}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">2. Target Section</CardTitle>
            </CardHeader>
            <CardContent>
              <select 
                className="w-full text-sm rounded-lg border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-emerald-900 bg-emerald-50/50"
                value={selectedSection}
                onChange={handleSectionSelect}
              >
                {SECTIONS.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              
              {existingStatus && (
                <div className="mt-4 p-3 rounded-lg flex items-center gap-2 text-sm font-medium border bg-slate-50 border-slate-100">
                  {existingStatus === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                  {existingStatus === 'empty' && (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-slate-600">Section is currently empty.</span>
                    </>
                  )}
                  {existingStatus === 'exists' && (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-amber-700">Warning: Content already exists here. Update will overwrite it.</span>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Editor */}
        <div className="md:col-span-8">
          <Card className={`h-full border-slate-200 shadow-sm flex flex-col ${!selectedTopicId ? "opacity-50 pointer-events-none" : ""}`}>
            <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-start justify-between bg-slate-50/50 rounded-t-xl">
              <div>
                <CardTitle className="text-lg">3. Content Injection</CardTitle>
                <CardDescription className="mt-1 font-medium">
                  {topic ? topic.titleEn : 'Select a topic first'}
                </CardDescription>
              </div>
              <Button onClick={generatePrompt} variant="outline" size="sm" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 bg-white">
                <Wand2 className="w-3.5 h-3.5 mr-1.5" /> Magic Prompt
              </Button>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col">
              <div className="flex justify-end mb-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={!selectedTopicId}
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setContentInput(text);
                      toast.success("Content pasted from clipboard");
                    } catch (err) {
                      toast.error("Failed to read clipboard data");
                    }
                  }}
                  className="h-8 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border-slate-200 transition-colors"
                >
                  <ClipboardPaste className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Paste JSON / Text
                </Button>
              </div>
              
              <Textarea 
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                placeholder={selectedSection.includes('modelAnswers') || selectedSection.includes('richPayload') || selectedSection.includes('practice') ? 'Paste strictly valid JSON here...' : 'Paste markdown/text here...'}
                className="h-[450px] w-full font-mono text-sm bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl p-4 resize-none placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-emerald-500 shadow-inner overflow-y-auto mb-4"
              />

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {(selectedSection === 'modelAnswers' || selectedSection === 'practiceQuestions' || selectedSection === 'richPayload') && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <FileJson className="w-3 h-3 mr-1" /> JSON Expected
                    </Badge>
                  )}
                </div>
                <Button 
                  onClick={handleSubmit}
                  disabled={!contentInput.trim() || isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md px-8 font-bold"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                  Execute Surgical Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
