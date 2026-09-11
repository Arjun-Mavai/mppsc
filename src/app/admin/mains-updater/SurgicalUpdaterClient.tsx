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

    prompt += `══════════════════════════════════════════════════════════════════
🎯 CORE MANDATE: 100% TOPIC-LINE SPECIFIC QUESTIONS & ANSWERS
══════════════════════════════════════════════════════════════════
TARGET SYLLABUS TOPIC LINE:
• Hindi: "${topic.titleHi}"
• English: "${topic.titleEn}"

EXAMINER INSTRUCTION (CRITICAL):
- You MUST formulate all questions and model answers based strictly and exclusively on THIS EXACT TOPIC LINE.
- Do NOT bring in unrelated PYQs or off-topic questions from other parts of the unit.
- Act as an MPPSC Mains 2026 paper-setter: Create the most probable, high-scoring examination questions (2m, 7m, 10m/11m) that directly test an aspirant's deep conceptual and analytical understanding of "${topic.titleEn}" / "${topic.titleHi}".
- Every question and answer must revolve completely around this topic line's definitions, core dimensions, statutory/constitutional aspects, real-world examples, and MP context.

`;
    
    if (selectedSection === 'modelAnswers') {
      const pn = paper?.paperNumber ?? 1;
      const isPureHindi = pn >= 5;
      const longMarkKey = pn === 4 ? '11m' : '10m';

      prompt += `══════════════════════════════════════════════════════════════════
EXPERT MODEL ANSWERS SUITE (STRICT MPPSC 2026 PATTERN & PYQ DESK QUALITY)
══════════════════════════════════════════════════════════════════
You are an Elite MPPSC Mains Evaluator & Rank-1 Mentor. Generate top-tier, exam-hall ready model answers that fetch 90%+ marks.

OUTPUT REQUIREMENT:
Output EXACTLY ONE raw JSON object. Do NOT wrap in \`\`\`json markdown fences. No pre/post explanatory text.

JSON SHAPE REQUIRED:
{
  "model_answers_hi": {
    "2m": [
      {
        "stem": "सटीक 2-अंक प्रश्न 1?",
        "text": "- **परिभाषा/मर्म:** सीधा उत्तर पहली ही पंक्ति में (शून्य भूमिका)।\\n- **मुख्य तथ्य:** वर्ष, स्थान, संबंधित व्यक्तित्व या संवैधानिक अनुच्छेद।\\n- **अतिरिक्त आयाम:** एक प्रासंगिक उदाहरण या MP संदर्भ।"
      },
      {
        "stem": "सटीक 2-अंक प्रश्न 2?",
        "text": "- **मुख्य बिंदु 1:** सटीक तथ्य, संस्थापक या कानूनी प्रावधान।\\n- **मुख्य बिंदु 2:** मुख्य उद्देश्य, महत्व या प्रभाव।"
      }
    ],
    "7m": [
      {
        "stem": "सटीक 7-अंक प्रश्न?",
        "text": "- **परिचय (Intro Hook):** 1 पंक्ति में विषय का मूल अर्थ, संदर्भ व सामयिक महत्व।\\n## मुख्य आयाम (Key Dimensions)\\n- **प्रावधान/कारण 1:** पहला महत्वपूर्ण बिंदु प्रमाण/तथ्य के साथ।\\n- **प्रावधान/कारण 2:** दूसरा विश्लेषणात्मक बिंदु (कारण-प्रभाव)।\\n- **मध्य प्रदेश संदर्भ (MP Angle):** राज्य की विशिष्ट योजना, नीति, आंकड़ा या उदाहरण।\\n## आगे की राह (Way Forward)\\n- **निष्कर्ष:** 1 पंक्ति में संतुलित, संवैधानिक या भविष्योन्मुखी समापन।"
      }
    ],
    "${longMarkKey}": [
      {
        "stem": "सटीक ${longMarkKey} दीर्घ-उत्तरीय प्रश्न?",
        "text": "- **भूमिका (Introductory Hook):** 1-2 पंक्तियों में विषय की पृष्ठभूमि, संवैधानिक स्थिति या परिभाषा।\\n## कोर संरचना व मुख्य बिंदु (Core Analytical Pillars)\\n- **स्तंभ 1 (ढांचा/कारण):** मुख्य तंत्र, नीतिगत प्रावधान या कानूनी आधार।\\n- **स्तंभ 2 (प्रभाव व चुनौतियां):** सामाजिक-आर्थिक निहितार्थ एवं मौजूदा बाधाएं।\\n- **स्तंभ 3 (संस्थागत कार्यप्रणाली):** क्रियान्वयन की स्थिति व व्यवहारिक पहलू।\\n## मध्य प्रदेश का विशेष दृष्टिकोण (MP Strategic Anchor)\\n- **MP योजना / डेटा:** राज्य का प्रासंगिक डेटा, जनजातीय नायक, जीआई टैग या पहल।\\n## सुधार व मूल्यांकन (Reforms & Way Forward)\\n- **सिफारिश:** 2nd ARC / नीति आयोग रिपोर्ट / सुप्रीम कोर्ट के ऐतिहासिक निर्णय का संदर्भ।\\n- **निष्कर्ष:** 1-2 पंक्तियों में आशावादी, संतुलित व सुशासन पर आधारित समापन।"
      }
    ]${pn === 4 ? `,\n    "case18": []` : ''}
  },
  "model_answers_en": ${isPureHindi ? 'null' : `{
    "2m": [
      {
        "stem": "Exact 2-marker Question 1?",
        "text": "- **Core Meaning:** Direct answer in the very first bullet (zero filler intro).\\n- **Key Fact:** Year, HQ, founder, or constitutional Article.\\n- **Value-Add:** One crisp fact or MP anchor."
      },
      {
        "stem": "Exact 2-marker Question 2?",
        "text": "- **Point 1:** Precise statutory or historical fact.\\n- **Point 2:** Crucial mandate, impact, or objective."
      }
    ],
    "7m": [
      {
        "stem": "Exact 7-marker Question?",
        "text": "- **Intro Hook:** 1 crisp line defining the core essence & contemporary context.\\n## Key Dimensions\\n- **Dimension 1:** First substantive pillar backed by empirical fact or Article.\\n- **Dimension 2:** Analytical core point (cause-effect or institutional trait).\\n- **MP Angle / Example:** Concrete state scheme, survey data, or best practice.\\n## Way Forward\\n- **Conclusion:** 1 forward-looking, constitutionally grounded closing line."
      }
    ],
    "${longMarkKey}": [
      {
        "stem": "Exact ${longMarkKey} Long-Answer Question?",
        "text": "- **Introduction:** 1-2 lines establishing the historical/constitutional context & core definition.\\n## Core Analytical Pillars\\n- **Pillar 1 (Framework):** In-depth explanation of mechanism, statutory basis, or doctrine.\\n- **Pillar 2 (Socio-Economic Impact):** Structural implications and key bottlenecks.\\n- **Pillar 3 (Institutional Role):** Implementation reality and administrative dynamics.\\n## MP Strategic Anchor\\n- **State Link:** Specific MP scheme, survey stat, tribal hero, or flagship initiative.\\n## Reforms & Way Forward\\n- **Recommendation:** Reference to 2nd ARC / NITI Aayog / Landmark SC judgment.\\n- **Conclusion:** 1-2 lines visionary, balanced synthesis upholding good governance."
      }
    ]${pn === 4 ? `,\n    "case18": []` : ''}
  }`}
}

══════════════════════════════════════════════════════════════════
EXAMINER RULES & WORD LIMIT DISCIPLINE (STRICT):
══════════════════════════════════════════════════════════════════
1. 🚨 STRICT LANGUAGE ISOLATION:
   - "model_answers_hi" = 100% pure authentic Hindi questions & answers.
   - "model_answers_en" = 100% pure authentic English questions & answers.
   - NEVER mix Hindi and English in the same array! Each array must contain ONLY its language.
   ${isPureHindi ? '- NOTE: For Papers 5 & 6, English is strictly prohibited. model_answers_en MUST be null.' : '- Both language blocks must have MATCHING questions and mark bands (parallel structure).'}

2. 📏 STRICT WORD LIMITS (Official MPPSC Norms):
   • 2-MARKER (2m): MAXIMUM 20 words total! Exactly 2 to 3 vertical bullets ("- "). No introductory sentences, zero fluff. Pure high-density facts.
   • 7-MARKER (7m): MAXIMUM 60 words total! Structure: 1-line intro hook + "## Section Title" + 3-5 bullet points + 1-line forward conclusion.
   • 10/11-MARKER (${longMarkKey}): ~180 to 200 words! Structured like a topper's copy:
     - 1-2 line crisp definition/intro
     - "## Heading" sections dividing the answer into 2-3 logical pillars
     - Concrete value additions: Article numbers, Reports (2nd ARC / Law Commission / NITI Aayog), or MP-specific schemes
     - 1-2 line visionary, constitutional conclusion.

3. ✍️ POINT-FIRST FORMATTING (Matches ZenScroll PYQ Desk UI):
   - Every substantive line MUST start with "- " (hyphen + space). No long dense paragraphs!
   - Use bold mini-labels at the start of bullets (e.g., "- **कारण:** ...", "- **Impact:** ...") for rapid visual scanning.
   - Use "## Section Heading" lines inside the text for 7m and ${longMarkKey} to organize thought flow.
   - For difference questions, use a clean Markdown table (\`| Basis | Concept A | Concept B |\`).
   - For quotes, landmark cases, or core maxims, use blockquotes (\`> "Quote"\`).

4. 🎯 VALUE-ADDITION INTEGRATION:
   - Include authentic MPPSC hooks: Articles, Acts, MP-specific data/schemes, Committees, Thinkers.
   - Do NOT invent fake PYQ years or speculative statistics.`;
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
        const cleaned = contentInput
          .trim()
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();
        payload = JSON.parse(cleaned);
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
