'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, Lightbulb, ThumbsDown, HelpCircle, Check, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { submitIntelligenceFeedback, type IntelligenceReaction } from '@/actions/intelligence-actions';
import { useSettingsStore } from '@/store/useSettingsStore';
import { toast } from 'sonner';

interface QuickFeedbackProps {
  questionId: string;
  questionText: string;
  guestMobile?: string;
  testId?: string;
  source?: string; // 'expert_analysis', 'open_paper_view', etc.
  className?: string;
}

export function QuickFeedback({
  questionId,
  questionText,
  guestMobile,
  testId,
  source,
  className,
}: QuickFeedbackProps) {
  const { isSubscribed, user } = useSettingsStore();
  const [reaction, setReaction] = useState<IntelligenceReaction | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const onReact = async (type: IntelligenceReaction) => {
    if (submitting) return;

    // Toggle logic for Unhelpful and Doubt
    if (type === 'unhelpful' || type === 'doubt') {
      if (reaction === type) {
        setShowFeedbackBox(!showFeedbackBox);
        return;
      }
      setReaction(type);
      setShowFeedbackBox(true);
      return;
    }

    // Normal submission for others
    if (reaction === type) return;

    setSubmitting(true);
    try {
      const res = await submitIntelligenceFeedback({
        questionId,
        questionText,
        guestMobile,
        testId,
        reaction: type,
        isPro: isSubscribed,
        source,
        userId: user?.id,
        userName: user?.name || undefined,
        userEmail: user?.email || undefined,
        guestMobile: guestMobile || user?.phone || undefined,
      });

      if (res.success) {
        setReaction(type);
        toast.success('Thanks for the feedback!', {
          icon: <Check className="h-4 w-4 text-emerald-500" />,
          duration: 2000,
        });
        setShowFeedbackBox(false);
      }
    } catch (e) {
      toast.error('Could not save reaction');
    } finally {
      setSubmitting(false);
    }
  };

  const submitWithComment = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await submitIntelligenceFeedback({
        questionId,
        questionText,
        guestMobile,
        testId,
        reaction: reaction || 'doubt',
        message: feedbackMsg,
        isPro: isSubscribed,
        source,
        userId: user?.id,
        userName: user?.name || undefined,
        userEmail: user?.email || undefined,
        guestMobile: guestMobile || user?.phone || undefined,
      });

      if (res.success) {
        toast.success('Feedback saved. We will improve this!', {
          icon: <Check className="h-4 w-4 text-rose-500" />,
        });
        setShowFeedbackBox(false);
        setFeedbackMsg('');
      }
    } catch (e) {
      toast.error('Failed to save feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn('mt-6 flex flex-col items-end gap-3', className)}>
      <div className="flex items-center gap-1.5 rounded-full border border-slate-200/60 bg-slate-50/50 p-1.5 shadow-sm">
        <p className="px-2 text-[9px] font-black tracking-widest text-slate-400 uppercase">
          Helpful?
        </p>
        
        <div className="flex items-center gap-1">
          <ReactionButton
            icon={<ThumbsUp className="h-3.5 w-3.5" />}
            active={reaction === 'helpful'}
            onClick={() => void onReact('helpful')}
            submitting={submitting && reaction === 'helpful'}
            activeColor="bg-emerald-500"
          />
          <ReactionButton
            icon={<Lightbulb className="h-3.5 w-3.5" />}
            active={reaction === 'insightful'}
            onClick={() => void onReact('insightful')}
            submitting={submitting && reaction === 'insightful'}
            activeColor="bg-amber-400"
          />
          <ReactionButton
            icon={<ThumbsDown className="h-3.5 w-3.5" />}
            active={reaction === 'unhelpful'}
            onClick={() => void onReact('unhelpful')}
            submitting={submitting && reaction === 'unhelpful'}
            activeColor="bg-rose-500"
          />
          <ReactionButton
            icon={<HelpCircle className="h-3.5 w-3.5" />}
            active={reaction === 'doubt'}
            onClick={() => void onReact('doubt')}
            submitting={submitting && reaction === 'doubt'}
            activeColor="bg-blue-500"
          />
        </div>
      </div>

      <AnimatePresence>
        {showFeedbackBox && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-rose-100 bg-white p-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-rose-900 uppercase tracking-tight">How can we improve this?</p>
              <button 
                onClick={() => setShowFeedbackBox(false)} 
                className="rounded-full p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={feedbackMsg}
              onChange={(e) => setFeedbackMsg(e.target.value)}
              placeholder="Tell us what's missing or wrong..."
              className="min-h-[70px] w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-200"
            />
            <Button
              size="sm"
              disabled={submitting || !feedbackMsg.trim()}
              onClick={submitWithComment}
              className="h-9 w-full rounded-xl bg-rose-600 text-[10px] font-black uppercase tracking-wider text-white hover:bg-rose-700 shadow-lg shadow-rose-500/20"
            >
              {submitting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
              Submit Feedback
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReactionButton({
  icon,
  active,
  onClick,
  submitting,
  activeColor,
}: {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  submitting: boolean;
  activeColor: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={submitting}
      className={cn(
        'group relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 active:scale-90',
        active ? cn(activeColor, 'text-white shadow-md') : 'text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-sm'
      )}
    >
      {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : icon}
      {active && (
        <motion.span
          layoutId="reaction-ring"
          className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-current"
        />
      )}
    </button>
  );
}
