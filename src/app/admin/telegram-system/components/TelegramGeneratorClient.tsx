'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { sendTelegramBotMessage, sendTelegramPolls, TelegramPollData } from '@/actions/admin-telegram';
import { UploadButton } from '@/utils/uploadthing';
import { HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type TopicItem = { id: string; title: string; titleEn?: string };
type UnitGroup = { unit: string; topics: TopicItem[] };

export default function TelegramGeneratorClient({
  prelims,
  mains,
}: {
  prelims: UnitGroup[];
  mains: UnitGroup[];
}) {
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [track, setTrack] = useState<'prelims' | 'mains' | null>(null);
  const [dayNumber, setDayNumber] = useState<string>('001');
  const [prelimsCount, setPrelimsCount] = useState<string>('5');
  const [mains2mCount, setMains2mCount] = useState<string>('1');
  const [mains7mCount, setMains7mCount] = useState<string>('1');
  const [mains11mCount, setMains11mCount] = useState<string>('1');
  const [includeQuote, setIncludeQuote] = useState<boolean>(true);

  const [publishContent, setPublishContent] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [btn1Text, setBtn1Text] = useState('');
  const [btn1Url, setBtn1Url] = useState('');
  const [btn2Text, setBtn2Text] = useState('');
  const [btn2Url, setBtn2Url] = useState('');

  const [pollJson, setPollJson] = useState('');
  const [publishingPolls, setPublishingPolls] = useState(false);
  const [pollLanguage, setPollLanguage] = useState<'bilingual' | 'hindi' | 'english'>('bilingual');
  const [pollCount, setPollCount] = useState<string>('5');

  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [sendingLink, setSendingLink] = useState(false);

  const [destination, setDestination] = useState<'test' | 'live' | 'constable'>('test');

  const getDestinationLabel = (dest: 'test' | 'live' | 'constable') => {
    if (dest === 'live') {
      return `MPPSC Live Channel (${process.env.NEXT_PUBLIC_MPPSC_TELEGRAM_CHAT_ID || 'not configured'})`;
    }
    if (dest === 'constable') {
      return `Constable Live Channel (${process.env.NEXT_PUBLIC_MP_POLICE_TELEGRAM_CHAT_ID || 'not configured'})`;
    }
    return 'Test Bot';
  };

  const parseUnitNumber = (unitStr: string) => {
    const match = unitStr.match(/Unit\s*(\d+)/i);
    return match ? String(match[1]).padStart(2, '0') : '01';
  };
  
  const generatePrompt = () => {
    if (!selectedTopic || !track) return '';

    const commonFooter = `* Make the post highly searchable with these exact hashtags at the very bottom:
#MPPSC_${track === 'prelims' ? 'Pre' : 'Mains'} #Day${dayNumber} #Unit${parseUnitNumber(selectedUnit)} ${subject ? '#' + subject.replace(/\s+/g, '') : '#[SubjectNameWithoutSpaces]'}

* Then append these links EXACTLY as shown at the very end of the post (Do not change the text or remove the HTML):

<b>━━━━━━━━━━━━━━━━━━━━━━━</b>

🔗 <b>Quick Access:</b>
👉 <a href="https://mppsc.zenscroll.app/syllabus">MPPSC Prelims Syllabus Tracker</a>
👉 <a href="https://mppsc.zenscroll.app/mains">MPPSC Mains Gyankosh</a>`;

    if (track === 'prelims') {
      return `Act as a senior MPPSC Prelims Expert and Examiner.

Task: Generate a high-quality Telegram post for MPPSC Prelims Master Series.

Topic:
${selectedTopic}

Subject:
${subject || '[Detect automatically from MPPSC Context]'}

Unit:
${selectedUnit}

Generate:
${includeQuote ? '\\n1. A relevant, inspiring quote at the beginning (Prefix with > to make it a blockquote)\\n' : ''}
2. ${prelimsCount} MPPSC Prelims level MCQs
* Medium to High Quality
* Hindi + English (Bilingual)
* 4 options
* Correct answer
* 2 line explanation starting with an engaging phrase (e.g. "💡 Explanation:")

3. PYQ Focus
* Focus heavily on the latest MPPSC PYQ trends (Analyze 2026 and go backwards till 2020).
* DO NOT write or mention the PYQ years in the generated output.

Formatting Rules:
* EXACT Post Title Format:
<b>━━━━━━━━━━━━━━━━━━━━━━━</b>
🏆 <b>MPPSC PRELIMS MASTER SERIES</b>
📅 <b>Day ${dayNumber} | Unit ${parseUnitNumber(selectedUnit)} (${subject || 'Subject Name'})</b>
<b>━━━━━━━━━━━━━━━━━━━━━━━</b>
* Use markdown bold (**text**) for important terms and headings.
* Ensure clear double line breaks (empty lines) between the Question, Options, and Explanation for readability.
* DO NOT use Telegram blockquotes (>) for questions or headings.
* USE Telegram blockquotes (>) ONLY for the Explanation section (e.g. '> 💡 **Explanation:** ...').
* STRICTLY NO FLUFF. Do not output any conversational text.

${commonFooter}`;
    } else {
      return `Act as a senior MPPSC Mains Mentor and PYQ Analyst.

Task: Generate a high-quality Telegram post for MPPSC Mains Master Series according to the LATEST marking scheme.

Topic:
${selectedTopic}

Subject:
${subject || '[Detect automatically from MPPSC Context]'}

Unit:
${selectedUnit}

Generate:
${includeQuote ? '\\n1. A relevant, inspiring quote at the beginning (Prefix with > to make it a blockquote)\\n' : ''}
2. MPPSC Mains Questions
${Number(mains2mCount) > 0 ? `* ${mains2mCount}x 2 Marker Question(s)\\n` : ''}${Number(mains7mCount) > 0 ? `* ${mains7mCount}x 7 Marker Question(s)\\n` : ''}${Number(mains11mCount) > 0 ? `* ${mains11mCount}x 11 Marker Question(s)\\n` : ''}${Number(mains11mCount) > 0 ? `
3. Model Direction (Answer Framework) for the 11 Marker ONLY
* Introduction
* 3-5 Main Points
* Conclusion
(Note: Do not write the full answer. Only provide the concise, expert-level framework).

4. Important Keywords
* Add 3-4 highly relevant MPPSC keywords.

5. PYQ Focus
* Focus heavily on the latest MPPSC PYQ trends (Analyze 2024 and go backwards till 2018).
* DO NOT write or mention the PYQ years in the generated output.` : `
3. Important Keywords
* Add 3-4 highly relevant MPPSC keywords.

4. PYQ Focus
* Focus heavily on the latest MPPSC PYQ trends (Analyze 2024 and go backwards till 2018).
* DO NOT write or mention the PYQ years in the generated output.`}

Formatting Rules:
* EXACT Post Title Format:
<b>━━━━━━━━━━━━━━━━━━━━━━━</b>
🏆 <b>MPPSC MAINS MASTER SERIES</b>
📅 <b>Day ${dayNumber} | Unit ${parseUnitNumber(selectedUnit)} (${subject || 'Subject Name'})</b>
<b>━━━━━━━━━━━━━━━━━━━━━━━</b>
* Include beautiful and proper headings for the Questions (e.g. 📝 <u><b>2 MARKERS (HINDI MEDIUM)</b></u>).
* First output all the questions & frameworks in Hindi, then output all the questions & frameworks in English. Add a separator <b>━━━━━━━━━━━━━━━━━━━━━━━</b> between the two languages.
* Provide the questions like: <b>प्रश्न 1: [Question Text]</b> and <b>Q.1: [Question Text]</b>
* Ensure clear double line breaks (empty lines) between Questions and Frameworks.
* DO NOT use Telegram blockquotes (>) for questions.
* STRICTLY NO FLUFF. Do not output any conversational text.

${commonFooter}`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePrompt());
    toast.success('Prompt copied to clipboard!');
  };

  const selectTopic = (unit: string, topic: TopicItem, type: 'prelims' | 'mains') => {
    setTrack(type);
    setSelectedUnit(unit);
    setSelectedTopic(topic.titleEn ? `${topic.titleEn} (${topic.title})` : topic.title);
  };

  const handlePublish = async () => {
    if (!publishContent.trim()) {
      toast.error('Paste the AI response first!');
      return;
    }

    setPublishing(true);
    try {
      const inlineButtons = [];
      if (btn1Text && btn1Url) inlineButtons.push({ text: btn1Text, url: btn1Url });
      if (btn2Text && btn2Url) inlineButtons.push({ text: btn2Text, url: btn2Url });

      const res = await sendTelegramBotMessage(publishContent, {
        photoUrl: photoUrl || undefined,
        inlineButtons: inlineButtons.length > 0 ? inlineButtons : undefined,
        destination
      });
      if (res.success) {
        toast.success(`Pushed successfully to ${getDestinationLabel(destination)}! 🚀`);
        setPublishContent(''); // clear after success
      } else {
        toast.error(res.error || 'Failed to push to bot');
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message);
      } finally {
      setPublishing(false);
    }
  };

  const getPollPrompt = () => {
    let langInstruction = 'The questions MUST be BILINGUAL (Hindi first, then English in the same string).';
    let formatExample = `
    "question": "Q: [Hindi Question] / [English Question]",
    "options": ["[Hindi Option A] / [English Option A]", "[Hindi Option B] / [English Option B]", "[Hindi Option C] / [English Option C]", "[Hindi Option D] / [English Option D]"],
    "explanation": "💡 [Hindi Explanation] / [English Explanation]"`
    
    if (pollLanguage === 'hindi') {
      langInstruction = 'The questions MUST be strictly in HINDI medium only.';
      formatExample = `
    "question": "प्रश्न: [Hindi Question]",
    "options": ["[Hindi Option A]", "[Hindi Option B]", "[Hindi Option C]", "[Hindi Option D]"],
    "explanation": "💡 व्याख्या: [Hindi Explanation]"`
    } else if (pollLanguage === 'english') {
      langInstruction = 'The questions MUST be strictly in ENGLISH medium only.';
      formatExample = `
    "question": "Q: [English Question]",
    "options": ["[English Option A]", "[English Option B]", "[English Option C]", "[English Option D]"],
    "explanation": "💡 Explanation: [English Explanation]"`
    }

    const prompt = `Act as an expert MPPSC examiner.
Task: Generate ${pollCount} high-quality, exam-level MPPSC MCQs based on the topic.
${langInstruction}
ALWAYS refer to MPPSC PYQs to set the difficulty and phrasing. Give top priority to MPPSC exam patterns, followed by UPPSC and BPSC.
IMPORTANT: The explanation must be strictly under 200 characters (Telegram limit).

Topic:
${selectedTopic || '[Insert Topic]'}
Unit: ${selectedUnit || ''}

OUTPUT STRICTLY AS A JSON ARRAY. Do not include any markdown formatting like \`\`\`json or any conversational text. Just the raw JSON array.

Format:
[
  {${formatExample},
    "correctIndex": 0
  }
]`;
    navigator.clipboard.writeText(prompt);
    toast.success('Poll Prompt copied! Paste it in ChatGPT/Claude.');
  };

  const handleSendPolls = async () => {
    if (!pollJson.trim()) {
      toast.error('Paste the JSON first!');
      return;
    }
    
    setPublishingPolls(true);
    try {
      let data: TelegramPollData[];
      try {
        data = JSON.parse(pollJson);
        if (!Array.isArray(data)) throw new Error("Root must be an array");
      } catch(e: any) {
        toast.error('Invalid JSON: ' + e.message);
        setPublishingPolls(false);
        return;
      }

      const res = await sendTelegramPolls(data, destination);
      if (res.success) {
        toast.success(`Successfully sent ${res.sentCount} polls to ${getDestinationLabel(destination)}! 🚀`);
        setPollJson('');
      } else {
        toast.error(res.error || 'Failed to send polls');
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setPublishingPolls(false);
    }
  };

  const handleSendLink = async () => {
    if (!linkText.trim() || !linkUrl.trim()) {
      toast.error('Provide both Text and URL');
      return;
    }
    setSendingLink(true);
    try {
      const message = `🔗 <b>Generated Link:</b>\n\n👉 <a href="${linkUrl}">${linkText}</a>`;
      const res = await sendTelegramBotMessage(message);
      if (res.success) {
        toast.success('Link sent to Telegram Bot!');
        setLinkText('');
        setLinkUrl('');
      } else {
        toast.error(res.error || 'Failed to send link');
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setSendingLink(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT COLUMN: Data Selectors */}
      <div className="lg:col-span-1 space-y-6">
        {/* Prelims Topics Scrollable */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-96">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-100/50">
            <h2 className="font-bold text-slate-800">Prelims Syllabus</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {prelims.map((group) => (
              <div key={group.unit} className="space-y-1">
                <h3 className="text-xs font-bold text-slate-500 uppercase px-2">{group.unit}</h3>
                {group.topics.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => selectTopic(group.unit, t, 'prelims')}
                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    <span className="line-clamp-2">{t.title}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Mains Topics Scrollable */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-96">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-100/50">
            <h2 className="font-bold text-slate-800">Mains Syllabus</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {mains.map((group) => (
              <div key={group.unit} className="space-y-1">
                <h3 className="text-xs font-bold text-slate-500 uppercase px-2">{group.unit}</h3>
                {group.topics.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => selectTopic(group.unit, t, 'mains')}
                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    <span className="line-clamp-2">{t.title}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Prompt Builder & Publisher */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              Prompt Builder
              {track === 'prelims' && <span className="ml-3 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">PRELIMS</span>}
              {track === 'mains' && <span className="ml-3 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">MAINS</span>}
            </h2>
            <div className="flex items-center gap-2">
               <label className="text-sm font-medium text-slate-600">Day:</label>
               <input
                 type="text"
                 value={dayNumber}
                 onChange={(e) => setDayNumber(e.target.value)}
                 className="w-16 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
               />
            </div>
            <div className="flex items-center gap-2 ml-4">
              <input
                type="checkbox"
                id="quoteToggle"
                checked={includeQuote}
                onChange={(e) => setIncludeQuote(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <label htmlFor="quoteToggle" className="text-sm font-medium text-slate-600 cursor-pointer">
                Include Quote
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Subject Name</label>
              <input
                type="text"
                placeholder="Leave blank for AI to detect..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Selected Unit</label>
              <input
                type="text"
                readOnly
                value={selectedUnit}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 text-sm"
              />
            </div>
          </div>
          
          {track === 'prelims' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Number of MCQs</label>
              <input
                type="number"
                min="1"
                max="20"
                value={prelimsCount}
                onChange={(e) => setPrelimsCount(e.target.value)}
                className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          )}

          {track === 'mains' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Question Counts</label>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">2M:</span>
                  <input type="number" min="0" value={mains2mCount} onChange={(e) => setMains2mCount(e.target.value)} className="w-16 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">7M:</span>
                  <input type="number" min="0" value={mains7mCount} onChange={(e) => setMains7mCount(e.target.value)} className="w-16 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">11M:</span>
                  <input type="number" min="0" value={mains11mCount} onChange={(e) => setMains11mCount(e.target.value)} className="w-16 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Selected Topic</label>
            <input
              type="text"
              readOnly
              value={selectedTopic}
              className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 text-sm"
            />
          </div>

          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Generated AI Prompt</label>
              <button
                onClick={handleCopy}
                disabled={!selectedTopic}
                className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Copy Prompt
              </button>
            </div>
            
            <textarea
              readOnly
              value={generatePrompt()}
              className="w-full h-[250px] p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs leading-relaxed border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Select a topic from the left panels to generate the prompt..."
            />
          </div>
        </div>

        {/* DESTINATION TOGGLE */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Publish Destination
              <Dialog>
                <DialogTrigger className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                  <HelpCircle className="h-4 w-4 text-slate-400" />
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Publish Destination Guide</DialogTitle>
                  </DialogHeader>
                  <div className="text-sm text-slate-600 space-y-4">
                    <p><strong>Test Bot:</strong> Posts messages silently to your configured test Telegram Chat using <code>TELEGRAM_EVENTS_CHAT_ID</code>.</p>
                    <p><strong>MPPSC Live Channel:</strong> Posts directly to <strong>{process.env.NEXT_PUBLIC_MPPSC_TELEGRAM_CHAT_ID || 'the configured MPPSC channel'}</strong>.</p>
                    <p><strong>MP Police Constable Channel:</strong> Posts directly to <strong>{process.env.NEXT_PUBLIC_MP_POLICE_TELEGRAM_CHAT_ID || 'the configured MP Police channel'}</strong>.</p>
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100">
                      <strong>⚠️ Crucial Steps for Live Channel:</strong>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Your Bot must be added as an <strong>Administrator</strong> in the selected channel.</li>
                        <li>Open your Channel in Telegram &rarr; Manage Channel &rarr; Administrators &rarr; Add Admin.</li>
                        <li>Search for your bot and give it "Post Messages" permission.</li>
                        <li>If not an Admin, publishing to live will fail!</li>
                      </ol>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </h3>
            <p className="text-xs text-slate-500">Choose where the content will be posted.</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg gap-1 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setDestination('test')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                destination === 'test' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Test Bot
            </button>
            <button
              onClick={() => setDestination('live')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                destination === 'live' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              MPPSC Live
            </button>
            <button
              onClick={() => setDestination('constable')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                destination === 'constable' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Constable Live
            </button>
          </div>
        </div>

        {/* NEW Publish to Bot Panel */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-indigo-900 flex items-center gap-2">
                🚀 Push to {getDestinationLabel(destination)}
                <Dialog>
                  <DialogTrigger className="p-1 hover:bg-indigo-100 rounded-full transition-colors">
                    <HelpCircle className="h-5 w-5 text-indigo-400" />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Push to Telegram Flow</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-slate-600 space-y-4">
                      <p><strong>What it does:</strong> Pushes beautifully formatted rich text directly to Telegram.</p>
                      <p><strong>End Result:</strong> A visually stunning post with optional image previews and clickable action buttons (Inline Keyboard).</p>
                      <div className="bg-indigo-50 p-3 rounded-lg text-indigo-900">
                        <strong>Workflow Steps:</strong>
                        <ol className="list-decimal list-inside mt-2 space-y-1">
                          <li>Select a Topic from Prelims/Mains syllabus above.</li>
                          <li>Click <strong>Copy Prompt</strong> in the prompt box.</li>
                          <li>Paste it in ChatGPT/Claude.</li>
                          <li>Paste the AI response exactly as-is into the text area.</li>
                          <li>(Optional) Upload an Image or add Buttons.</li>
                          <li>Click <strong>Send to Bot/Channel</strong>!</li>
                        </ol>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </h2>
              <p className="text-sm text-indigo-700/80">
                Paste the AI's response here. Add Image URL or Action Buttons if needed.
              </p>
              <div className="mt-2 text-[10px] text-indigo-600/70 font-semibold">
                Steps: 1. Generate Prompt above. 2. Ask ChatGPT. 3. Paste answer here. 4. Click Send.
              </div>
            </div>
            <button
              onClick={handlePublish}
              disabled={publishing || !publishContent.trim()}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {publishing ? 'Pushing...' : 'Send to Bot'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-indigo-900">Image URL (Optional)</label>
              <div className="flex gap-2 h-[38px]">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <UploadButton
                  endpoint="adminImage"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                      setPhotoUrl(res[0].url);
                      toast.success("Image uploaded!");
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Upload Error: ${error.message}`);
                  }}
                  appearance={{
                    button: "ut-ready:bg-indigo-600 bg-indigo-600 text-sm h-full px-4 rounded-lg w-auto whitespace-nowrap",
                    container: "h-full w-auto min-w-max",
                    allowedContent: "hidden"
                  }}
                  content={{
                    button: "Upload Image"
                  }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-indigo-900">Button 1 Text</label>
              <input
                type="text"
                placeholder="e.g. Attempt Free Quiz"
                value={btn1Text}
                onChange={(e) => setBtn1Text(e.target.value)}
                className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-indigo-900">Button 1 URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={btn1Url}
                onChange={(e) => setBtn1Url(e.target.value)}
                className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-indigo-900">Button 2 Text</label>
              <input
                type="text"
                placeholder="e.g. View Syllabus"
                value={btn2Text}
                onChange={(e) => setBtn2Text(e.target.value)}
                className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-indigo-900">Button 2 URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={btn2Url}
                onChange={(e) => setBtn2Url(e.target.value)}
                className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <textarea
            value={publishContent}
            onChange={(e) => setPublishContent(e.target.value)}
            className="w-full h-[300px] p-4 bg-white text-slate-800 rounded-xl text-sm leading-relaxed border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
            placeholder="Paste exactly what ChatGPT/Claude outputs here..."
          />
        </div>

        {/* NEW Native Poll Panel */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-amber-900 flex items-center gap-2">
                📊 Native Quiz / Poll Publisher
                <Dialog>
                  <DialogTrigger className="p-1 hover:bg-amber-100 rounded-full transition-colors">
                    <HelpCircle className="h-5 w-5 text-amber-500" />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Native Telegram Quizzes</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-slate-600 space-y-4">
                      <p><strong>What it does:</strong> Creates native interactive Telegram Quizzes from raw AI JSON.</p>
                      <p><strong>End Result:</strong> A poll where users tap an answer, and upon answering, it reveals the correct option with a lightbulb (💡) popup explanation and an exploding confetti animation!</p>
                      <div className="bg-amber-50 p-3 rounded-lg text-amber-900">
                        <strong>Workflow Steps:</strong>
                        <ol className="list-decimal list-inside mt-2 space-y-1">
                          <li>Select a topic from the syllabus above.</li>
                          <li>Click <strong>Copy AI Prompt</strong> (this creates a prompt for 5 bilingual MCQs based on your selection).</li>
                          <li>Paste it into ChatGPT/Claude.</li>
                          <li>Copy the returned JSON Array and paste it here.</li>
                          <li>Click <strong>Send Quizzes</strong>!</li>
                        </ol>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </h2>
              <p className="text-sm text-amber-700/80">
                Send interactive, native Telegram Quizzes directly to {getDestinationLabel(destination)} from AI JSON.
              </p>
              <div className="mt-2 text-[10px] text-amber-700/70 font-semibold space-y-1">
                <p>Steps: 1. Select Unit/Topic from the top.</p>
                <p>2. Configure Language & Count below &rarr; Click "Copy AI Prompt".</p>
                <p>3. Paste the returned JSON array here and click Send.</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 items-end">
              <div className="flex gap-2">
                <select
                  value={pollLanguage}
                  onChange={(e) => setPollLanguage(e.target.value as any)}
                  className="px-2 py-1.5 border border-amber-200 bg-white rounded-lg text-xs font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="bilingual">Bilingual</option>
                  <option value="hindi">Hindi Only</option>
                  <option value="english">English Only</option>
                </select>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={pollCount}
                  onChange={(e) => setPollCount(e.target.value)}
                  className="w-16 px-2 py-1.5 border border-amber-200 bg-white rounded-lg text-xs font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  title="Number of Questions"
                />
              </div>
              <div className="flex gap-2">
              <button
                onClick={getPollPrompt}
                disabled={!selectedTopic}
                className="px-4 py-2.5 bg-white border border-amber-300 text-amber-700 hover:bg-amber-100 text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                Copy AI Prompt
              </button>
              <button
                onClick={handleSendPolls}
                disabled={publishingPolls || !pollJson.trim()}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow disabled:opacity-50 transition-colors"
              >
                {publishingPolls ? 'Publishing...' : 'Send Quizzes'}
              </button>
            </div>
            </div>
          </div>

          <textarea
            value={pollJson}
            onChange={(e) => setPollJson(e.target.value)}
            className="w-full h-[200px] p-4 bg-slate-900 text-amber-400 rounded-xl font-mono text-xs leading-relaxed border border-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-500"
            placeholder="Paste the JSON Array output from AI here..."
          />
        </div>

        {/* NEW Generate Link Panel */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-emerald-900 flex items-center gap-2">
                🔗 Generate Hidden Link
                <Dialog>
                  <DialogTrigger className="p-1 hover:bg-emerald-100 rounded-full transition-colors">
                    <HelpCircle className="h-5 w-5 text-emerald-500" />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Hidden Link Generator</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-slate-600 space-y-4">
                      <p><strong>What it does:</strong> Creates a cleanly formatted, clickable text link in Telegram.</p>
                      <p><strong>End Result:</strong> Instead of showing ugly long URLs, it shows text like <u>Click Here to Attempt</u> which redirects to your URL when clicked.</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </h2>
              <p className="text-sm text-emerald-700/80">
                Input your text and URL. The system will create a proper hidden hyperlink and push it to the bot.
              </p>
            </div>
            <button
              onClick={handleSendLink}
              disabled={sendingLink || !linkText.trim() || !linkUrl.trim()}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {sendingLink ? 'Sending...' : 'Send Link'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-emerald-900">Link Text (Visible)</label>
              <input
                type="text"
                placeholder="e.g. MPPSC ZenScroll"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-emerald-900">URL (Hidden)</label>
              <input
                type="url"
                placeholder="e.g. https://t.me/your_channel"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
