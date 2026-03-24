import { z } from 'zod';

/**
 * FEEDBACK FORM SCHEMA
 *
 * HOW TO ADD NEW FIELDS:
 * 1. Add the field to the schema below (e.g., z.string(), z.number(), z.enum([...]))
 * 2. Add the field to FeedbackFormType (TypeScript interface will auto-generate)
 * 3. Add the field to the form in TestSeriesFeedbackModal component
 * 4. Update the API endpoint to save the new field to your database
 *
 * FIELD TYPES:
 * - z.string() → text input
 * - z.number() → numeric input (for ratings)
 * - z.enum([...]) → radio buttons or select
 * - z.boolean() → checkbox or toggle
 * - z.number().min(1).max(5) → rating scale (1-5 stars)
 */

export const feedbackFormSchema = z.object({
  overallRating: z
    .number()
    .min(1, 'Please provide a rating')
    .max(5),

  difficultyLevel: z.enum(['too_easy', 'just_right', 'too_hard'] as const),

  wouldRecommend: z.enum(['yes', 'no'] as const).default('yes'),
});

export type FeedbackFormType = z.infer<typeof feedbackFormSchema>;

export const feedbackQuestions = [
  {
    id: 'overallRating',
    name: 'overallRating' as const,
    label: 'How was the test quality?',
    type: 'stars' as const,
    maxStars: 5,
  },
  {
    id: 'difficultyLevel',
    name: 'difficultyLevel' as const,
    label: 'Test Difficulty?',
    type: 'radio' as const,
    options: [
      { value: 'too_easy', label: 'Easy 😊' },
      { value: 'just_right', label: 'Balanced ⚖️' },
      { value: 'too_hard', label: 'Hard 🤯' },
    ],
  },
  {
    id: 'wouldRecommend',
    name: 'wouldRecommend' as const,
    label: 'Recommend to others?',
    type: 'radio' as const,
    options: [
      { value: 'yes', label: 'Yes! 👍' },
      { value: 'no', label: 'Not really 👎' },
    ],
  },
];
