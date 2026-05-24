'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function MainsPyqInitialImportPromptGenerator() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [paperNumber, setPaperNumber] = useState('1');
  const [prompt, setPrompt] = useState('');

  const generatePrompt = () => {
    const pNum = parseInt(paperNumber);
    const yr = year.trim() || new Date().getFullYear().toString();
    
    let structureHint = '';
    if (pNum === 1 || pNum === 2) {
      structureHint = 'This paper has two parts: Part A (Units 1-5) and Part B (Units 1-5). Please ensure both are captured in the "parts" array.';
    } else if (pNum === 3) {
      structureHint = 'This paper typically has 10 units. Wrap them in "part": "A".';
    } else if (pNum === 4) {
      structureHint = 'This paper has 5 units and Case Studies. Wrap them in "part": "A".';
    } else {
      structureHint = 'Capture all units/questions. Wrap them in "part": "A".';
    }

    const text = `Act as an expert MPPSC Mains data extraction specialist. 
Your task is to convert MPPSC Mains ${yr} Paper ${pNum} into a strict JSON format suitable for database import.

JSON STRUCTURE TEMPLATE:
{
  "mppsc_mains_paper_${yr}": {
    "exam": "MPPSC State Service Mains Examination ${yr}",
    "paper_number": ${pNum},
    "paper_title_hi": "...",
    "paper_title_en": "...",
    "parts": [
      {
        "part": "A",
        "part_title_hi": "...",
        "part_title_en": "...",
        "units": [
          {
            "unit_number": 1,
            "unit_title_hi": "...",
            "unit_title_en": "...",
            "questions": [
              {
                "question_number": "1.1",
                "marks": 2,
                "type": "Very Short",
                "question_hi": "...",
                "question_en": "..."
              }
            ]
          }
        ]
      }
    ]
  }
}

RULES:
1. ${structureHint}
2. "question_number" must be stable and unique within the unit (e.g., 1.1, 1.2 for Very Short; 2.1, 2.2 for Short; 3.1 for Long). This is CRITICAL for data stability.
3. Common marking schemes:
   - Paper 1, 2, 3: 3 marks (Very Short), 5 marks (Short), 11 marks (Long).
   - Paper 4: 2 marks (Very Short), 5 marks (Short), 20 marks (Long/Case Study).
4. "type" should be: "Very Short", "Short", "Long", or "Case Study".
5. Ensure both Hindi (question_hi) and English (question_en) text is extracted accurately.
6. CRITICAL: For Hindi unseen passages (अपठित गद्यांश / Gaddhans) or any other long-form questions, you MUST extract and return the ENTIRE passage word-for-word. Do NOT summarize, truncate, or use triple dots "..." to omit any part of the passage. The complete, raw, long-form passage must be fully present in "question_hi" (and "question_en" if translation is provided).
7. The root key MUST be "mppsc_mains_paper_${yr}".
8. Return ONLY the JSON object. No markdown fences, no preamble.

Please extract the data for MPPSC Mains ${yr} Paper ${pNum} from the text provided in the next message.`;

    setPrompt(text);
    toast.success('Prompt generated!');
  };

  const copyToClipboard = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied to clipboard!');
  };

  return (
    <Card className="border-indigo-100 bg-indigo-50/30 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-indigo-600">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-black text-indigo-950">AI Prompt Generator (Paper Import)</h3>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Generate a prompt to extract JSON from raw paper text</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase text-slate-500">Exam Year</Label>
          <Input 
            value={year} 
            onChange={(e) => setYear(e.target.value)} 
            placeholder="e.g. 2024"
            className="h-10 font-bold"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase text-slate-500">Paper Number</Label>
          <Select value={paperNumber} onValueChange={setPaperNumber}>
            <SelectTrigger className="h-10 font-bold">
              <SelectValue placeholder="Select Paper" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <SelectItem key={n} value={n.toString()} className="font-bold">
                  Paper {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Button onClick={generatePrompt} className="flex-1 font-black bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-[0.98]">
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Prompt
        </Button>
        {prompt && (
          <Button onClick={copyToClipboard} variant="outline" className="font-bold border-indigo-200 hover:bg-indigo-100">
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
        )}
      </div>

      {prompt && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
          <Label className="text-[10px] font-black uppercase text-indigo-600">Generated Prompt Preview</Label>
          <Textarea 
            value={prompt} 
            readOnly 
            className="h-40 text-xs font-mono bg-white border-indigo-100 leading-relaxed"
          />
        </div>
      )}
    </Card>
  );
}
