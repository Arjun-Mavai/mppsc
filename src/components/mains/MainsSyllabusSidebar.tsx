'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  ChevronRight,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { MainsUnitPart } from '@/lib/mains-syllabus-unit-label';
import { mainsUnitShortBadge, mainsUnitSubtitle } from '@/lib/mains-syllabus-unit-label';
import { useParams, usePathname } from 'next/navigation';

/**
 * 📂 MAINS SYLLABUS SIDEBAR
 * 
 * Bhai, ye sidebar navigation ka engine h.
 * Fast, fluid aur smooth.
 */

interface Topic {
  id: string;
  titleHi: string;
  titleEn: string;
  status: string;
}

interface Unit {
  id: string;
  unitNumber: number;
  part: MainsUnitPart;
  titleHi: string;
  titleEn: string;
  topics: Topic[];
}

interface MainsSyllabusSidebarProps {
  paperNumber: number;
  units: Unit[];
  language: 'hi' | 'en';
  progressData?: Record<string, string>; // topicId -> status
}

export function MainsSyllabusSidebar({ 
  paperNumber,
  units, 
  language,
  progressData = {} 
}: MainsSyllabusSidebarProps) {
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);
  const params = useParams();
  const pathname = usePathname();
  const activeTopicId = params.topicId as string | undefined;
  const activePaperId = params.paperId as string | undefined;

  useEffect(() => {
    if (!activeTopicId) return;
    const unitWithTopic = units.find((u) => u.topics.some((t) => t.id === activeTopicId));
    if (!unitWithTopic) return;
    setExpandedUnits((prev) => (prev.includes(unitWithTopic.id) ? prev : [...prev, unitWithTopic.id]));
  }, [activeTopicId, units]);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => 
      prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]
    );
  };

  const hi = language === 'hi';

  return (
    <div className="flex flex-col h-full bg-slate-950/50 backdrop-blur-xl border-r border-slate-800/50">
      {/* ── Paper Info Header ── */}
      <div className="p-6 border-b border-slate-800/50">
        <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-400" />
          {hi ? 'सिलेबस नेविगेशन' : 'Syllabus Navigation'}
        </h2>
      </div>

      {/* ── Scrollable List ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {units.map((unit) => {
          const isExpanded = expandedUnits.includes(unit.id);
          const completedTopics = unit.topics.filter(t => progressData[t.id] === 'done').length;
          
          return (
            <div key={unit.id} className="space-y-1">
              {/* Unit Header */}
              <button
                onClick={() => toggleUnit(unit.id)}
                className={cn(
                  "flex items-center justify-between w-full p-3 rounded-xl transition-all duration-200 group",
                  isExpanded ? "bg-slate-900/50 text-white" : "hover:bg-slate-900/30 text-slate-400"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex min-w-[2.75rem] items-center justify-center rounded-lg bg-slate-800 px-1 py-0.5 text-[10px] font-black leading-tight text-slate-400 transition-colors group-hover:text-emerald-400"
                    title={mainsUnitSubtitle(paperNumber, unit.part, unit.unitNumber, hi ? 'hi' : 'en')}
                  >
                    {mainsUnitShortBadge(unit.part, unit.unitNumber)}
                  </span>
                  <div className="text-left">
                    <p className="mb-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {mainsUnitSubtitle(paperNumber, unit.part, unit.unitNumber, hi ? 'hi' : 'en')}
                    </p>
                    <p className="max-w-[180px] truncate text-sm font-bold">
                      {hi ? unit.titleHi : unit.titleEn}
                    </p>
                  </div>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded ? "rotate-180" : "")} />
              </button>

              {/* Topics List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-10 space-y-1 pr-2"
                  >
                    {unit.topics.map((topic) => {
                      const isActive = activeTopicId === topic.id;
                      const isDone = progressData[topic.id] === 'done';
                      
                      return (
                        <Link
                          key={topic.id}
                          href={`/mains/syllabus/${activePaperId ?? ''}/${topic.id}`}
                          className={cn(
                            "flex items-center justify-between group p-2 rounded-lg text-sm transition-all",
                            isActive 
                              ? "bg-emerald-500/10 text-emerald-400 font-bold" 
                              : "text-slate-500 hover:text-slate-300"
                          )}
                        >
                          <span className="flex-1 truncate pr-2">
                            {hi ? topic.titleHi : topic.titleEn}
                          </span>
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Circle className="h-3 w-3 text-slate-800 flex-shrink-0 group-hover:text-slate-600" />
                          )}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── Progress Footer ── */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/20">
        <div className="flex items-center justify-between text-xs font-black tracking-widest uppercase text-slate-500 mb-2">
          <span>Overall Progress</span>
          <span className="text-emerald-400">32%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '32%' }}
            className="h-full bg-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}
