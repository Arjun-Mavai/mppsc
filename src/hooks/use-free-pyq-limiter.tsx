/**
 * Free PYQ Pattern: Show only N free questions to non-login users
 * Rest: Completely HIDDEN (not blurred) like medium.com paywall
 * 
 * PYQ Library:
 *   • 2-mark x2 free (4 marks)
 *   • 5/7-mark x1 free (5-7 marks)
 *   • 10/11-mark x1 free (10-11 marks)
 *   • Total: ~6 free questions, ~19-22 marks
 *   • Rest: Completely hidden
 * 
 * Syllabus:
 *   • Part A Unit 1 free
 *   • Rest: Locked (visible but can't access)
 */

'use client';

import { useSettingsStore } from '@/store/useSettingsStore';
import { Lock } from 'lucide-react';

// Development toggle (disable in .env.local)
const isProtectionEnabled = process.env.NEXT_PUBLIC_DISABLE_CONTENT_PROTECTION !== 'true';

export interface Question {
  id: string;
  marks: number;
  text: string;
  [key: string]: any;
}

/**
 * Calculate free PYQ questions
 * Returns questions that should be visible for free:
 *   - 2 questions with 2 marks each
 *   - 1 question with 5-7 marks
 *   - 1 question with 10-11 marks
 */
export function getFreePyqQuestions(allQuestions: Question[]): Question[] {
  if (!allQuestions || allQuestions.length === 0) return [];
  if (!isProtectionEnabled) return allQuestions; // Show all if disabled

  const free: Question[] = [];

  // Find 2-mark questions (take 2)
  const twoMarkQuestions = allQuestions.filter((q) => q.marks === 2).slice(0, 2);
  free.push(...twoMarkQuestions);

  // Find 5-7 mark questions (take 1)
  const midMarkQuestions = allQuestions
    .filter((q) => q.marks >= 5 && q.marks <= 7)
    .slice(0, 1);
  free.push(...midMarkQuestions);

  // Find 10-11 mark questions (take 1)
  const highMarkQuestions = allQuestions
    .filter((q) => q.marks >= 10 && q.marks <= 11)
    .slice(0, 1);
  free.push(...highMarkQuestions);

  return free.length > 0 ? free : allQuestions.slice(0, 1);
}

/**
 * Component: Show free PYQ + hidden paywall
 * Completely HIDES locked content (not blurred)
 */
export function FreePyqDisplay({
  questions,
  renderQuestion,
}: {
  questions: Question[];
  renderQuestion: (q: Question, idx: number) => React.ReactNode;
}) {
  const { user } = useSettingsStore();
  const isLoggedIn = !!user;

  if (!questions || questions.length === 0) {
    return <div>No questions available</div>;
  }

  // If logged in OR protection disabled, show all
  if (isLoggedIn || !isProtectionEnabled) {
    return (
      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id}>{renderQuestion(q, idx)}</div>
        ))}
      </div>
    );
  }

  // Non-login: Show only free questions, completely hide rest
  const freeQuestions = getFreePyqQuestions(questions);
  const hiddenCount = questions.length - freeQuestions.length;

  return (
    <div className="space-y-6">
      {/* Free questions - fully visible */}
      {freeQuestions.map((q, idx) => (
        <div key={q.id} className="relative">
          {renderQuestion(q, idx)}
          {/* Free badge */}
          <div className="absolute -top-1 -right-1 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 text-xs font-medium text-green-700">
            ✓ Free
          </div>
        </div>
      ))}

      {/* Paywall section: Show only CTA, no hidden content visible */}
      {hiddenCount > 0 && (
        <div className="mt-12 pt-12 border-t-2 border-slate-200">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 text-center space-y-4 border border-blue-100">
            {/* Lock icon */}
            <div className="flex justify-center">
              <Lock className="w-12 h-12 text-blue-600" />
            </div>

            {/* Heading */}
            <h3 className="text-xl font-bold text-slate-900">
              Unlock {hiddenCount} More Questions
            </h3>

            {/* Description */}
            <p className="text-slate-600 max-w-md mx-auto">
              Get access to complete PYQ library, in-depth analysis, and strategic insights
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-8 pt-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">{hiddenCount}</div>
                <div className="text-xs text-slate-500">more questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">10+</div>
                <div className="text-xs text-slate-500">years of papers</div>
              </div>
            </div>

            {/* CTA Button */}
            <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition inline-block">
              Unlock Library · Pricing
            </button>

            {/* Footer text */}
            <p className="text-xs text-slate-500 pt-4">
              Join thousands of successful MPPSC candidates
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook: Check if user can see all content
 */
export function useCanSeeAllQuestions(): boolean {
  const { user } = useSettingsStore();
  if (!isProtectionEnabled) return true;
  return !!user;
}

/**
 * Component: Free Syllabus Unit (for Part A Unit 1)
 * Completely hides locked units, shows unlock CTA
 */
export function FreeSyllabusDisplay({
  units,
  renderUnit,
}: {
  units: any[];
  renderUnit: (u: any, idx: number) => React.ReactNode;
}) {
  const { user } = useSettingsStore();
  const isLoggedIn = !!user;

  if (!units || units.length === 0) return <div>No units available</div>;

  // If logged in OR protection disabled, show all
  if (isLoggedIn || !isProtectionEnabled) {
    return (
      <div className="space-y-6">
        {units.map((u, idx) => (
          <div key={u.id}>{renderUnit(u, idx)}</div>
        ))}
      </div>
    );
  }

  // Non-login: Show only first unit (Part A Unit 1), hide rest
  const freeUnit = units[0];
  const hiddenCount = units.length - 1;

  return (
    <div className="space-y-6">
      {/* Free unit - fully visible */}
      {freeUnit && (
        <div className="relative">
          {renderUnit(freeUnit, 0)}
          <div className="absolute -top-1 -right-1 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 text-xs font-medium text-green-700">
            ✓ Free
          </div>
        </div>
      )}

      {/* Paywall */}
      {hiddenCount > 0 && (
        <div className="mt-12 pt-12 border-t-2 border-slate-200">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 text-center space-y-4 border border-purple-100">
            <div className="flex justify-center">
              <Lock className="w-12 h-12 text-purple-600" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              Explore {hiddenCount} More Units
            </h3>

            <p className="text-slate-600 max-w-md mx-auto">
              Deep syllabus concepts, authentic bilingual model answers, and strategic insights
            </p>

            <div className="pt-4">
              <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition">
                Unlock Library · Pricing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
