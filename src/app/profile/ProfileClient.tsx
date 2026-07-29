'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, User, Lock, CheckCircle2, Loader2, Sparkles, Eye, EyeOff, MessageCircleQuestion, Clock, ShieldCheck, MessageSquare, ChevronDown, ChevronUp, ThumbsUp, CornerDownRight, Send, Library, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateUserName, updateUserPassword, markDoubtsAsRead } from './actions';
import { submitIntelligenceFeedback } from '@/actions/intelligence-actions';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getPlanDisplayName } from '@/lib/access-grants';

interface ProfileClientProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    planTier: string | null;
    createdAt?: string | Date | null;
  };
  doubts: any[];
}

const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
];

export default function ProfileClient({ user, doubts }: ProfileClientProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDoubts, setShowDoubts] = useState(false);

  // Doubts local state for immediate UI updates
  const [localDoubts, setLocalDoubts] = useState<any[]>(doubts || []);
  const [activeFollowUpId, setActiveFollowUpId] = useState<string | null>(null);
  const [followUpText, setFollowUpText] = useState('');
  const [submittingFollowUp, setSubmittingFollowUp] = useState<string | null>(null);
  const [markingResolved, setMarkingResolved] = useState<string | null>(null);
  
  // Organization state
  const [doubtTab, setDoubtTab] = useState<'active' | 'resolved'>('active');
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});

  // New thread state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newContext, setNewContext] = useState('');
  const [newDoubtText, setNewDoubtText] = useState('');
  const [submittingNew, setSubmittingNew] = useState(false);

  const toggleThread = (questionId: string) => {
    setExpandedThreads(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleSubmitFollowUp = async (doubt: any) => {
    if (!followUpText.trim()) return;
    setSubmittingFollowUp(doubt.id);
    
    const res = await submitIntelligenceFeedback({
      questionId: doubt.questionId,
      questionText: doubt.questionText || '',
      testId: doubt.testId,
      reaction: 'doubt',
      message: `Follow-up: ${followUpText}`,
      isPro: user.planTier === 'pro',
      source: doubt.source,
      userId: user.id,
      userName: user.name || '',
      userEmail: user.email,
    });

    if (res.success) {
      toast.success("Follow-up sent successfully!");
      setLocalDoubts([{
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        questionId: doubt.questionId,
        questionText: doubt.questionText,
        source: doubt.source,
        message: `Follow-up: ${followUpText}`,
        adminReply: null,
      }, ...localDoubts]);
      setFollowUpText('');
      setActiveFollowUpId(null);
    } else {
      toast.error("Failed to send follow-up");
    }
    setSubmittingFollowUp(null);
  };

  const handleMarkResolved = async (doubt: any) => {
    setMarkingResolved(doubt.id);
    const res = await submitIntelligenceFeedback({
      questionId: doubt.questionId,
      questionText: doubt.questionText || '',
      testId: doubt.testId,
      reaction: 'helpful',
      message: 'Marked as resolved by user from Profile.',
      isPro: user.planTier === 'pro',
      source: doubt.source,
      userId: user.id,
      userName: user.name || '',
      userEmail: user.email,
    });
    
    if (res.success) {
      toast.success("Glad we could help! Marked as resolved.");
      // Optimistic UI Update
      setLocalDoubts([{
        id: Math.random().toString(36).substring(2, 11),
        createdAt: new Date(),
        questionId: doubt.questionId,
        questionText: doubt.questionText,
        source: doubt.source,
        reaction: 'helpful',
        message: 'Marked as resolved by user from Profile.',
        adminReply: null,
      }, ...localDoubts]);
      // Switch tab to resolved automatically to show the user where it went
      setDoubtTab('resolved');
      setExpandedThreads(prev => ({...prev, [doubt.questionId || '']: true}));
    } else {
      toast.error("Failed to submit feedback");
    }
    setMarkingResolved(null);
  };

  const handleCreateNewThread = async () => {
    if (!newContext.trim() || !newDoubtText.trim()) return;
    setSubmittingNew(true);
    
    // Generate a pseudo-ID so this maps as a distinct group
    const fakeQuestionId = `direct-${Date.now()}`;
    
    const newFeedback = {
      questionId: fakeQuestionId,
      questionText: newContext.trim(),
      testId: 'direct_from_profile',
      reaction: 'doubt' as const,
      message: newDoubtText.trim(),
      isPro: user.planTier === 'pro',
      source: 'profile_direct',
      userId: user.id,
      userName: user.name || '',
      userEmail: user.email,
    };

    const res = await submitIntelligenceFeedback(newFeedback);
    
    if (res.success) {
      toast.success("New doubt submitted successfully!");
      setLocalDoubts([{
        id: Math.random().toString(36).substring(2, 11),
        createdAt: new Date(),
        questionId: fakeQuestionId,
        questionText: newContext.trim(),
        source: 'profile_direct',
        reaction: 'doubt',
        message: newDoubtText.trim(),
        adminReply: null,
      }, ...localDoubts]);
      setIsCreatingNew(false);
      setNewContext('');
      setNewDoubtText('');
      setDoubtTab('active');
      setExpandedThreads(prev => ({...prev, [fakeQuestionId]: true}));
    } else {
      toast.error("Failed to submit doubt.");
    }
    setSubmittingNew(false);
  };

  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  // Group doubts by questionId to create conversational threads
  const groupedDoubts = useMemo(() => {
    if (!localDoubts || localDoubts.length === 0) return [];
    
    const groups: Record<string, any[]> = {};
    localDoubts.forEach(doubt => {
      const key = doubt.questionId || doubt.id;
      if (!groups[key]) groups[key] = [];
      groups[key].push(doubt);
    });

    return Object.values(groups).map(thread => {
      // Sort thread by createdAt ASC (oldest message first inside the thread)
      thread.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      const isResolved = thread.some(d => d.reaction === 'helpful' || (d.message && d.message.includes('Marked as resolved')));
      // The topic text usually comes from questionText, or we fallback to source or message
      const firstValidDoubt = thread.find(d => d.questionText) || thread[0];
      const questionText = firstValidDoubt.questionText || "General Query / Doubt";
      const source = thread[0].source || 'General';
      const latestDate = thread[thread.length - 1].createdAt;

      return {
        questionId: thread[0].questionId || thread[0].id,
        questionText,
        source,
        isResolved,
        latestDate,
        messages: thread,
      };
    }).sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime()); // Latest active threads on top
  }, [localDoubts]);

  const activeThreads = groupedDoubts.filter(t => !t.isResolved);
  const resolvedThreads = groupedDoubts.filter(t => t.isResolved);
  const displayedThreads = doubtTab === 'active' ? activeThreads : resolvedThreads;

  // Auto-expand first active thread on mount/open if none expanded
  useEffect(() => {
    if (showDoubts && activeThreads.length > 0 && Object.keys(expandedThreads).length === 0) {
      setExpandedThreads({ [activeThreads[0].questionId]: true });
    }
  }, [showDoubts, activeThreads.length]);

  const setHasUnreadDoubts = useSettingsStore((s) => s.setHasUnreadDoubts);

  useEffect(() => {
    if (showDoubts) {
      setHasUnreadDoubts(false);
      markDoubtsAsRead().catch(() => {});
    }
  }, [showDoubts, setHasUnreadDoubts]);

  const handleNameUpdate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a valid name');
      return;
    }

    setSavingName(true);
    const result = await updateUserName(name);
    setSavingName(false);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSavingPassword(true);
    const result = await updateUserPassword(currentPassword, newPassword);
    setSavingPassword(false);

    if (result.success) {
      toast.success('Password updated! Logging out for security...');
      // Logout user after password change for security
      setTimeout(async () => {
        await fetch('/api/auth/mppsc-logout', { method: 'POST' });
        router.push('/login');
      }, 1500);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
          <Badge variant="outline" className="border-slate-200 text-xs font-bold text-slate-500">
            Profile Settings
          </Badge>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-8 px-4 py-12">
        {/* Quote Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center">
          <div className="absolute top-4 right-4">
            <Sparkles className="h-5 w-5 text-slate-600" />
          </div>
          <div className="absolute bottom-4 left-4">
            <Sparkles className="h-4 w-4 text-slate-700" />
          </div>
          <p className="mb-3 text-lg font-medium leading-relaxed tracking-tight text-white md:text-xl">
            "{quote.text}"
          </p>
          <p className="text-sm font-bold tracking-wider text-slate-400 uppercase">
            — {quote.author}
          </p>
        </div>

        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-slate-200">
            <Image src="/default-avatar.png" alt={user.name || 'User'} fill className="object-cover scale-150" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              {user.name || 'Your Profile'}
            </h1>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge
                className={cn(
                  'text-[10px] font-black uppercase px-2.5 py-0.5',
                  (user.planTier === 'pro' || user.planTier === 'combo')
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : user.planTier === 'mains'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : user.planTier === 'lite'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-slate-100 text-slate-600'
                )}
              >
                {getPlanDisplayName(user)}
              </Badge>
              {user.createdAt && (
                <span className="text-[10px] text-slate-400">
                  Member since{' '}
                  {new Date(user.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Name Update Section */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <User className="h-5 w-5 text-slate-700" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Display Name</h2>
                <p className="text-xs text-slate-500">This is how others will see you</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-xs font-bold uppercase text-slate-500">
                  Your Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1.5 border-slate-200 bg-slate-50 font-medium focus:border-slate-900 focus:ring-slate-900"
                  maxLength={50}
                />
              </div>

              <Button
                onClick={handleNameUpdate}
                disabled={savingName || name === user.name}
                className="w-full bg-slate-900 text-white hover:bg-slate-800"
              >
                {savingName ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Update Name
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password Update Section */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <Lock className="h-5 w-5 text-slate-700" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Change Password</h2>
                <p className="text-xs text-slate-500">Keep your account secure</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-xs font-bold uppercase text-slate-500">
                  Current Password
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="border-slate-200 bg-slate-50 pr-10 font-medium focus:border-slate-900 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                    aria-pressed={showCurrentPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword" className="text-xs font-bold uppercase text-slate-500">
                  New Password
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="border-slate-200 bg-slate-50 pr-10 font-medium focus:border-slate-900 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    aria-pressed={showNewPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase text-slate-500">
                  Confirm New Password
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="border-slate-200 bg-slate-50 pr-10 font-medium focus:border-slate-900 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                    aria-pressed={showConfirmPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handlePasswordUpdate}
                disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="w-full bg-slate-900 text-white hover:bg-slate-800"
              >
                {savingPassword ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* My Doubts & Solutions Section (Accordion) */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div 
            className="bg-slate-900 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors"
            onClick={() => setShowDoubts(!showDoubts)}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700">
                <MessageSquare className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="font-bold text-white">My Doubts & Solutions</h2>
                <p className="text-xs text-slate-400">Track expert replies to your queries</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {groupedDoubts && groupedDoubts.length > 0 && (
                <Badge className="bg-amber-500/20 text-amber-400 border-none px-2 py-0.5">
                  {groupedDoubts.length} Thread{groupedDoubts.length !== 1 && 's'}
                </Badge>
              )}
              {showDoubts ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </div>
          </div>
          {showDoubts && (
            <CardContent className="p-0 bg-slate-50/50 border-t border-slate-200">
              {!groupedDoubts || groupedDoubts.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center text-center text-slate-500">
                  <MessageCircleQuestion className="h-10 w-10 text-slate-300 mb-3" />
                  <p className="font-medium text-slate-700">No doubts raised yet.</p>
                  <p className="text-xs max-w-xs mt-1">When you raise a doubt in a syllabus topic or PYQ, it will appear here.</p>
                </div>
              ) : (
                <div className="flex flex-col max-h-[600px]">
                  {/* Tabs & Action Bar */}
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
                    <div className="flex bg-slate-200/60 p-1 rounded-xl w-fit shadow-inner">
                      <button 
                        onClick={() => { setDoubtTab('active'); setIsCreatingNew(false); }} 
                        className={cn("px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all", doubtTab === 'active' && !isCreatingNew ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                      >
                        Active Doubts ({activeThreads.length})
                      </button>
                      <button 
                        onClick={() => { setDoubtTab('resolved'); setIsCreatingNew(false); }} 
                        className={cn("px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all", doubtTab === 'resolved' && !isCreatingNew ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                      >
                        Past Chats ({resolvedThreads.length})
                      </button>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => setIsCreatingNew(!isCreatingNew)}
                      className={cn(
                        "h-8 px-3 text-[11px] font-bold rounded-lg transition-all",
                        isCreatingNew 
                          ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          : "bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                      )}
                    >
                      {isCreatingNew ? "Cancel" : <><Plus className="w-3.5 h-3.5 mr-1.5" /> New Thread</>}
                    </Button>
                  </div>
                  
                  {isCreatingNew ? (
                    <div className="p-6 bg-slate-50/30 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 max-w-2xl">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                            <MessageSquare className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800">Start a New Thread</h3>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Ask a question directly to our experts.</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="context" className="text-xs font-bold text-slate-700 uppercase mb-1.5 block">
                              Topic Context <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="context"
                              value={newContext}
                              onChange={(e) => setNewContext(e.target.value)}
                              placeholder="e.g., GS Paper 2 - Right to Education, or MP History"
                              className="bg-slate-50 text-sm h-10 border-slate-200 focus-visible:ring-slate-900"
                            />
                            <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Mention what this doubt is related to so experts can assist better.</p>
                          </div>

                          <div>
                            <Label htmlFor="doubt" className="text-xs font-bold text-slate-700 uppercase mb-1.5 block">
                              Your Doubt <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              id="doubt"
                              value={newDoubtText}
                              onChange={(e) => setNewDoubtText(e.target.value)}
                              placeholder="Describe your doubt in detail here..."
                              className="min-h-[100px] text-sm resize-y bg-slate-50 border-slate-200 focus-visible:ring-slate-900"
                            />
                          </div>

                          <div className="pt-2 flex justify-end">
                            <Button 
                              onClick={handleCreateNewThread}
                              disabled={submittingNew || !newContext.trim() || !newDoubtText.trim()}
                              className="bg-slate-900 hover:bg-slate-800 text-white shadow-md font-bold px-6"
                            >
                              {submittingNew ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4 mr-2" />
                              )}
                              Send to Experts
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : displayedThreads.length === 0 ? (
                     <div className="p-12 flex flex-col items-center justify-center text-center text-slate-400">
                       <CheckCircle2 className="h-12 w-12 text-slate-200 mb-3" />
                       <p className="font-semibold text-slate-600">No {doubtTab} threads found.</p>
                       <p className="text-xs max-w-xs mt-1">
                         {doubtTab === 'active' ? "Awesome! You've resolved all your doubts." : "You haven't marked any doubts as resolved yet."}
                       </p>
                     </div>
                  ) : (
                    <div className="divide-y divide-slate-100 overflow-y-auto">
                      {displayedThreads.map((thread: any) => {
                        const isExpanded = expandedThreads[thread.questionId];
                        return (
                          <div key={thread.questionId} className="hover:bg-slate-50/30 transition-colors relative flex flex-col">
                            
                            {/* Thread Header (Collapsible Trigger) */}
                            <div 
                              className="px-6 py-5 cursor-pointer flex items-start gap-4 select-none hover:bg-slate-50/80"
                              onClick={() => toggleThread(thread.questionId)}
                            >
                              <div className={cn("mt-1 flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center border shadow-sm", thread.isResolved ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-amber-50 border-amber-100 text-amber-600")}>
                                {thread.isResolved ? <CheckCircle2 className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <Badge variant="outline" className="text-[9px] uppercase font-bold text-slate-500 bg-white border-slate-200">
                                    {thread.source === 'mains_syllabus_topic' ? 'Syllabus Topic' : thread.source.replace(/_/g, ' ')}
                                  </Badge>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {new Date(thread.latestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                  </span>
                                </div>
                                <p className="text-[14px] text-slate-800 font-bold leading-relaxed line-clamp-2 pr-8">
                                  {thread.questionText}
                                </p>
                                {!isExpanded && (
                                  <p className="text-xs text-slate-500 mt-2 line-clamp-1 font-medium">
                                    <span className="font-bold text-slate-700">Last reply:</span> {thread.messages[thread.messages.length - 1].message || thread.messages[thread.messages.length - 1].adminReply}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex-shrink-0 ml-auto mt-2">
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                            </div>

                            {/* Thread Body (Expanded State) */}
                            {isExpanded && (
                              <div className="px-6 pb-6 pt-2 animate-in fade-in duration-200">
                                {/* Messages Timeline */}
                                <div className="space-y-5 pl-4 border-l-2 border-slate-100 ml-1">
                        {thread.messages.map((msg: any) => (
                          <div key={msg.id} className="relative">
                            {msg.reaction === 'helpful' || (msg.message && msg.message.includes('Marked as resolved')) ? (
                               <div className="relative">
                                 <div className="absolute -left-[25px] top-0 h-5 w-5 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center z-10 shadow-sm">
                                   <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                 </div>
                                 <div className="ml-3 bg-emerald-50/50 inline-block px-3 py-1.5 rounded-lg border border-emerald-100">
                                   <p className="text-[10px] text-emerald-700 font-bold italic">You marked this thread as resolved 👍</p>
                                 </div>
                               </div>
                            ) : (
                              <>
                                {/* User Message */}
                                <div className="mb-4 relative group">
                                  <div className="absolute -left-[25px] top-0 h-5 w-5 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center z-10 shadow-sm">
                                    <User className="w-3 h-3 text-slate-500" />
                                  </div>
                                  <div className="ml-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-[11px] font-black text-slate-700 uppercase">You</p>
                                      <p className="text-[9px] text-slate-400 font-medium">{new Date(msg.createdAt).toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' })}</p>
                                    </div>
                                    <p className="text-[13px] text-slate-600 leading-relaxed font-medium bg-white border border-slate-100 shadow-sm p-3 rounded-2xl rounded-tl-sm inline-block max-w-[90%]">
                                      {msg.message ? msg.message.replace('Follow-up: ', '') : 'Raised a doubt for this topic.'}
                                    </p>
                                  </div>
                                </div>

                                {/* Admin Reply */}
                                {msg.adminReply && (
                                  <div className="mb-4 relative">
                                    <div className="absolute -left-[25px] top-2 h-5 w-5 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center z-10 shadow-sm">
                                      <ShieldCheck className="w-3 h-3 text-emerald-700" />
                                    </div>
                                    <div className="ml-3 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl rounded-tl-sm p-4 border border-emerald-200/60 shadow-sm relative overflow-hidden">
                                      <div className="absolute top-0 right-0 p-2 opacity-5">
                                        <Sparkles className="w-16 h-16 text-emerald-900" />
                                      </div>
                                      <div className="flex items-center justify-between mb-2 relative z-10">
                                        <p className="text-[10px] font-black text-emerald-800 uppercase flex items-center gap-1.5 bg-emerald-200/50 px-2 py-0.5 rounded-md">
                                          <ShieldCheck className="w-3 h-3" /> Admin Response
                                        </p>
                                        {msg.repliedAt && (
                                          <p className="text-[9px] text-emerald-600/80 font-medium">{new Date(msg.repliedAt).toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' })}</p>
                                        )}
                                      </div>
                                      <p className="text-[13px] text-emerald-950 whitespace-pre-wrap font-medium leading-relaxed relative z-10">{msg.adminReply}</p>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Action Bar (Show only if not resolved) */}
                      {!thread.isResolved && (
                        <div className="mt-5 pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-3 text-[11px] text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100 bg-emerald-50 border border-emerald-100 font-bold"
                              onClick={() => handleMarkResolved(thread.messages[thread.messages.length - 1])}
                              disabled={markingResolved === thread.messages[thread.messages.length - 1].id}
                            >
                              {markingResolved === thread.messages[thread.messages.length - 1].id ? (
                                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                              ) : (
                                <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
                              )}
                              Mark as Resolved
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-3 text-[11px] text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-bold border border-transparent hover:border-slate-200"
                              onClick={() => setActiveFollowUpId(activeFollowUpId === thread.questionId ? null : thread.questionId)}
                            >
                              <CornerDownRight className="h-3.5 w-3.5 mr-1.5" />
                              Ask Follow-up
                            </Button>
                          </div>
                          
                          {/* Follow-up Input Box (Attached to the thread) */}
                          {activeFollowUpId === thread.questionId && (
                            <div className="mt-4 flex gap-2 items-start animate-in fade-in slide-in-from-top-2 duration-300">
                              <Textarea 
                                value={followUpText}
                                onChange={(e) => setFollowUpText(e.target.value)}
                                placeholder="Type your follow-up doubt here..."
                                className="min-h-[70px] text-[13px] resize-y bg-white border-slate-300 focus-visible:ring-slate-900 shadow-sm rounded-xl"
                              />
                              <Button 
                                size="sm" 
                                className="bg-slate-900 hover:bg-slate-800 text-white shrink-0 h-10 w-10 rounded-xl shadow-md p-0 flex items-center justify-center transition-transform active:scale-95"
                                onClick={() => handleSubmitFollowUp(thread.messages[thread.messages.length - 1])}
                                disabled={submittingFollowUp === thread.messages[thread.messages.length - 1].id || !followUpText.trim()}
                              >
                                {submittingFollowUp === thread.messages[thread.messages.length - 1].id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4 ml-0.5" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Footer */}
        <div className="pt-4 text-center">
          <p className="text-xs text-slate-400">
            Changes are saved automatically to your account
          </p>
        </div>
      </div>
    </div>
  );
}
