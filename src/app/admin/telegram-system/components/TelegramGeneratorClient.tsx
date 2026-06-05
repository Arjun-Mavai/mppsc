'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { sendTelegramBotMessage } from '@/actions/admin-telegram';

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

  const parseUnitNumber = (unitStr: string) => {
    const match = unitStr.match(/Unit\s*(\d+)/i);
    return match ? String(match[1]).padStart(2, '0') : '01';
  };
  
  const generatePrompt = () => {
    if (!selectedTopic || !track) return '';

    const commonFooter = `* Make the post highly searchable with these exact hashtags at the very bottom:
#MPPSC_${track === 'prelims' ? 'Pre' : 'Mains'} #Day${dayNumber} #Unit${parseUnitNumber(selectedUnit)} ${subject ? '#' + subject.replace(/\\s+/g, '') : '#[SubjectNameWithoutSpaces]'}

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
      const res = await sendTelegramBotMessage(publishContent);
      if (res.success) {
        toast.success('Pushed successfully to Telegram Bot! 🚀');
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

        {/* NEW Publish to Bot Panel */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-indigo-900 flex items-center gap-2">
                🚀 Push to Telegram Bot
              </h2>
              <p className="text-sm text-indigo-700/80">
                Paste the AI's response here. The system will auto-format basic markdown to HTML and push it directly to your bot.
              </p>
            </div>
            <button
              onClick={handlePublish}
              disabled={publishing || !publishContent.trim()}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {publishing ? 'Pushing...' : 'Send to Bot'}
            </button>
          </div>

          <textarea
            value={publishContent}
            onChange={(e) => setPublishContent(e.target.value)}
            className="w-full h-[300px] p-4 bg-white text-slate-800 rounded-xl text-sm leading-relaxed border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
            placeholder="Paste exactly what ChatGPT/Claude outputs here..."
          />
        </div>
      </div>
    </div>
  );
}
