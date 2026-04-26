'use client';

import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  MessageSquare,
  ThumbsUp,
  Lightbulb,
  ThumbsDown,
  ExternalLink,
  Smartphone,
  HelpCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Lead {
  id: string;
  guestId: string | null;
  questionId: string;
  questionText?: string | null;
  testId: string | null;
  reaction: 'helpful' | 'insightful' | 'unhelpful' | 'doubt';
  message: string | null;
  createdAt: string | number | Date;
  guest?: {
    name: string;
    mobile: string;
    email: string | null;
  };
  isPro?: boolean;
  source?: string | null;
  userId?: string | null;
  userName?: string | null;
  userMobile?: string | null;
  userEmail?: string | null;
  question?: {
    subject: string | null;
  };
}

interface IntelligenceLeadsClientProps {
  initialData: Lead[];
}

export default function IntelligenceLeadsClient({ initialData }: IntelligenceLeadsClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReaction, setFilterReaction] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    return initialData.filter((item) => {
      const matchesSearch =
        (item.userName || item.guest?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.userMobile || item.guest?.mobile || '').includes(searchTerm) ||
        item.questionId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterReaction ? item.reaction === filterReaction : true;
      const matchesSubject = filterSubject ? item.question?.subject === filterSubject : true;

      return matchesSearch && matchesFilter && matchesSubject;
    });
  }, [initialData, searchTerm, filterReaction, filterSubject]);

  const uniqueSubjects = useMemo(() => {
    const subjects = initialData
      .map((item) => item.question?.subject)
      .filter((s): s is string => !!s);
    return Array.from(new Set(subjects)).sort();
  }, [initialData]);

  const stats = useMemo(() => {
    return {
      total: initialData.length,
      helpful: initialData.filter((i) => i.reaction === 'helpful').length,
      insightful: initialData.filter((i) => i.reaction === 'insightful').length,
      unhelpful: initialData.filter((i) => i.reaction === 'unhelpful').length,
      doubt: initialData.filter((i) => i.reaction === 'doubt').length,
    };
  }, [initialData]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard
          title="Total"
          value={stats.total}
          icon={<MessageSquare className="h-4 w-4" />}
          color="text-slate-600"
        />
        <StatCard
          title="Helpful (👍)"
          value={stats.helpful}
          icon={<ThumbsUp className="h-4 w-4" />}
          color="text-emerald-600"
        />
        <StatCard
          title="Insightful (💡)"
          value={stats.insightful}
          icon={<Lightbulb className="h-4 w-4" />}
          color="text-amber-600"
        />
        <StatCard
          title="Unhelpful (👎)"
          value={stats.unhelpful}
          icon={<ThumbsDown className="h-4 w-4" />}
          color="text-rose-600"
        />
        <StatCard
          title="Doubt (❓)"
          value={stats.doubt}
          icon={<HelpCircle className="h-4 w-4" />}
          color="text-blue-600"
        />
      </div>

      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, mobile, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={filterReaction === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilterReaction(null)}
            >
              All
            </Badge>
            <Badge
              variant={filterReaction === 'helpful' ? 'default' : 'outline'}
              className="cursor-pointer border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              onClick={() => setFilterReaction('helpful')}
            >
              Helpful
            </Badge>
            <Badge
              variant={filterReaction === 'insightful' ? 'default' : 'outline'}
              className="cursor-pointer border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
              onClick={() => setFilterReaction('insightful')}
            >
              Insightful
            </Badge>
            <Badge
              variant={filterReaction === 'unhelpful' ? 'default' : 'outline'}
              className="cursor-pointer border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              onClick={() => setFilterReaction('unhelpful')}
            >
              Unhelpful
            </Badge>
            <Badge
              variant={filterReaction === 'doubt' ? 'default' : 'outline'}
              className="cursor-pointer border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              onClick={() => setFilterReaction('doubt')}
            >
              Doubt
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={filterSubject === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilterSubject(null)}
            >
              All Subjects
            </Badge>
            {uniqueSubjects.map((sub) => (
              <Badge
                key={sub}
                variant={filterSubject === sub ? 'default' : 'outline'}
                className="cursor-pointer border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                onClick={() => setFilterSubject(sub)}
              >
                {sub}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-slate-200">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[180px]">Date & Time</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Reaction</TableHead>
                <TableHead>Subject & Context</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                    No intelligence leads found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((lead) => {
                  const date = new Date(lead.createdAt);
                  return (
                    <TableRow key={lead.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {format(date, 'EEE, dd MMM yyyy')}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <Clock className="h-3 w-3" />
                            {format(date, 'hh:mm a')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">
                            {lead.userName || lead.guest?.name || 'Guest'}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Smartphone className="h-3 w-3" />
                            {lead.userMobile || lead.guest?.mobile || 'N/A'}
                          </div>
                          {lead.userEmail && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                              {lead.userEmail}
                            </div>
                          )}
                          {lead.isPro && (
                            <Badge className="w-fit mt-1 bg-amber-500 text-[9px] font-black uppercase text-black h-4 px-1.5 leading-none">
                              Pro
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ReactionBadge reaction={lead.reaction} />
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="flex flex-col gap-1.5">
                          {lead.questionId === 'ZEN_COMPLETION' ? (
                            <Badge className="w-fit bg-gradient-to-r from-violet-600 to-indigo-600 text-[10px] font-black uppercase tracking-wider text-white shadow-sm ring-1 ring-white/20">
                              Zen Feedback
                            </Badge>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {lead.question?.subject && (
                                <Badge variant="secondary" className="w-fit text-[9px] font-black uppercase tracking-tighter h-4 px-1.5">
                                  {lead.question.subject}
                                </Badge>
                              )}
                              <code className="w-fit text-[9px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                                ID: {lead.questionId}
                              </code>
                              {lead.questionText && (
                                <p className="line-clamp-2 text-[11px] font-medium leading-relaxed text-slate-600 italic">
                                  "{lead.questionText}"
                                </p>
                              )}
                            </div>
                          )}
                          {lead.source && (
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                              Source: {lead.source.replace(/_/g, ' ')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate text-xs text-slate-600" title={lead.message || ''}>
                          {lead.message || '—'}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          onClick={() =>
                            lead.guest?.mobile &&
                            window.open(`https://wa.me/91${lead.guest.mobile}`, '_blank')
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        {lead.question?.subject && (
                          <button
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                            title="View all questions for this subject"
                            onClick={() =>
                              window.open(`/admin/syllabus/analysis?subject=${encodeURIComponent(lead.question?.subject || '')}`, '_blank')
                            }
                          >
                            <Search className="h-4 w-4" />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card className="flex items-start justify-between p-4">
      <div>
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <p className={cn('mt-1 text-2xl font-bold', color)}>{value}</p>
      </div>
      <div className={cn('rounded-lg bg-slate-50 p-2', color)}>{icon}</div>
    </Card>
  );
}

function ReactionBadge({ reaction }: { reaction: string }) {
  const configs = {
    helpful: {
      label: 'Helpful',
      icon: <ThumbsUp className="h-3 w-3" />,
      class: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    insightful: {
      label: 'Insightful',
      icon: <Lightbulb className="h-3 w-3" />,
      class: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    unhelpful: {
      label: 'Unhelpful',
      icon: <ThumbsDown className="h-3 w-3" />,
      class: 'bg-rose-50 text-rose-700 border-rose-100',
    },
    doubt: {
      label: 'Doubt',
      icon: <HelpCircle className="h-3 w-3" />,
      class: 'bg-blue-50 text-blue-700 border-blue-100',
    },
  };

  const config = configs[reaction as keyof typeof configs] || configs.helpful;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
        config.class
      )}
    >
      {config.icon}
      {config.label}
    </div>
  );
}
