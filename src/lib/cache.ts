import { unstable_cache } from 'next/cache';
import { revalidateTag as originalRevalidateTag } from 'next/cache';
const revalidateTag = originalRevalidateTag as any;

export const REVALIDATE_TIME = 60 * 60 * 24 * 7; // 7 Days (Default Long Cache)
export const SHORT_CACHE = 60 * 60; // 1 Hour (for frequently updated content)
export const MEDIUM_CACHE = 60 * 60 * 3; // 3 Hours (for moderately updated content)
export const LONG_CACHE = 60 * 60 * 24; // 24 Hours (for stable content)

// Centralized Cache System
// Usage:
// - Fetching: use CACHE.BLOGS.GET_ALL.tags
// - Invalidating: revalidateTag(CACHE.BLOGS.TAGS.ALL)

export const CACHE = {
  BLOGS: {
    TAGS: {
      ALL: 'blogs-list',
      DETAIL: (slug: string) => `blog-${slug}`,
    },
    GET_ALL: {
      tags: ['blogs-list'],
      revalidate: SHORT_CACHE, // 1 hour for blogs
    },
    GET_BY_SLUG: (slug: string) => ({
      tags: [`blog-${slug}`],
      revalidate: SHORT_CACHE, // 1 hour for blog details
    }),
  },
  SYLLABUS: {
    TAGS: {
      ALL: 'syllabus-topics',
      UNIT: (unitId: string) => `syllabus-unit-${unitId}`,
      PAPER: (paperId: string) => `syllabus-paper-${paperId}`,
    },
    GET_ALL: {
      tags: ['syllabus-topics'],
      revalidate: LONG_CACHE,
    },
    GET_BY_UNIT: (unitId: string) => ({
      tags: [`syllabus-unit-${unitId}`],
      revalidate: LONG_CACHE,
    }),
    GET_BY_PAPER: (paperId: string) => ({
      tags: [`syllabus-paper-${paperId}`],
      revalidate: LONG_CACHE,
    }),
  },
  // NEW: PYQ Library Caching (Questions, Answers, Variants)
  PYQ: {
    TAGS: {
      ALL: 'pyq-library-all',
      PAPER: (paperNumber: number) => `pyq-paper-${paperNumber}`,
      QUESTION: (questionId: string) => `pyq-question-${questionId}`,
      YEAR: (year: number) => `pyq-year-${year}`,
      ANALYSIS: 'pyq-analysis-data',
      TRENDS: 'pyq-trends',
      REPEATED: 'pyq-repeated-questions',
      INTELLIGENCE: 'pyq-intelligence-data',
    },
    GET_ALL: {
      tags: ['pyq-library-all'],
      revalidate: LONG_CACHE,
    },
    GET_BY_PAPER: (paperNumber: number) => ({
      tags: [`pyq-paper-${paperNumber}`, 'pyq-library-all'],
      revalidate: LONG_CACHE,
    }),
    GET_BY_YEAR: (year: number) => ({
      tags: [`pyq-year-${year}`, 'pyq-library-all'],
      revalidate: LONG_CACHE,
    }),
    GET_QUESTION: (questionId: string) => ({
      tags: [`pyq-question-${questionId}`],
      revalidate: LONG_CACHE,
    }),
    GET_ANALYSIS: {
      tags: ['pyq-analysis-data'],
      revalidate: MEDIUM_CACHE, // More frequently updated
    },
    GET_TRENDS: {
      tags: ['pyq-trends'],
      revalidate: MEDIUM_CACHE,
    },
    GET_REPEATED: {
      tags: ['pyq-repeated-questions'],
      revalidate: MEDIUM_CACHE,
    },
    GET_INTELLIGENCE: {
      tags: ['pyq-intelligence-data'],
      revalidate: MEDIUM_CACHE,
    },
  },
  // NEW: Mains Content Caching (Topics, Concepts, Model Answers)
  MAINS: {
    TAGS: {
      ALL: 'mains-content-all',
      TOPIC: (topicId: string) => `mains-topic-${topicId}`,
      UNIT: (unitId: string) => `mains-unit-${unitId}`,
      PAPER: (paperNumber: number) => `mains-paper-${paperNumber}`,
      CONCEPTS: 'mains-concepts',
    },
    GET_ALL: {
      tags: ['mains-content-all'],
      revalidate: LONG_CACHE,
    },
    GET_TOPIC: (topicId: string) => ({
      tags: [`mains-topic-${topicId}`, 'mains-content-all'],
      revalidate: LONG_CACHE,
    }),
    GET_BY_UNIT: (unitId: string) => ({
      tags: [`mains-unit-${unitId}`],
      revalidate: LONG_CACHE,
    }),
    GET_BY_PAPER: (paperNumber: number) => ({
      tags: [`mains-paper-${paperNumber}`],
      revalidate: LONG_CACHE,
    }),
    GET_CONCEPTS: {
      tags: ['mains-concepts'],
      revalidate: LONG_CACHE,
    },
  },
  TESTS: {
    TAGS: {
      ALL: 'tests-list',
      DETAIL: (id: string) => `test-${id}`,
      BY_TOPIC: (topicId: string) => `tests-topic-${topicId}`,
    },
    GET_ALL: {
      tags: ['tests-list'],
      revalidate: SHORT_CACHE, // 1 hour for tests
    },
  },
  ATTEMPT_LIMITS: {
    TAGS: {
      ALL: 'attempt-limits',
    },
    GET_ALL: {
      tags: ['attempt-limits'],
      revalidate: REVALIDATE_TIME,
    },
  },
};

// Generic cache wrapper
export const cachedData = <T, Args extends unknown[]>(
  fetcher: (...args: Args) => Promise<T>,
  keys: string[],
  tags: string[],
  revalidate: number = REVALIDATE_TIME
) => {
  return unstable_cache(fetcher, keys, {
    revalidate: revalidate,
    tags: tags,
  });
};

/**
 * Batch revalidate multiple related caches
 * Useful when a single upload affects multiple pages
 */
export const revalidateMultipleTags = async (tags: string[]) => {
  for (const tag of tags) {
    revalidateTag(tag, 'max');
  }
};


/**
 * Revalidate all PYQ-related caches when new answers/variants are uploaded
 */
export const revalidatePyqOnUpload = async (paperNumber?: number, questionId?: string) => {
  revalidateTag(CACHE.PYQ.TAGS.ALL, 'max');
  if (paperNumber !== undefined) {
    revalidateTag(CACHE.PYQ.TAGS.PAPER(paperNumber), 'max');
  }
  if (questionId) {
    revalidateTag(CACHE.PYQ.TAGS.QUESTION(questionId), 'max');
  }
  revalidateTag(CACHE.PYQ.TAGS.ANALYSIS, 'max');
  revalidateTag(CACHE.PYQ.TAGS.TRENDS, 'max');
  revalidateTag(CACHE.PYQ.TAGS.INTELLIGENCE, 'max');
};

/**
 * Revalidate all Mains-related caches when topics/concepts are uploaded
 */
export const revalidateMainsOnUpload = async (topicId?: string, unitId?: string, paperNumber?: number) => {
  revalidateTag(CACHE.MAINS.TAGS.ALL, 'max');
  if (topicId) {
    revalidateTag(CACHE.MAINS.TAGS.TOPIC(topicId), 'max');
  }
  if (unitId) {
    revalidateTag(CACHE.MAINS.TAGS.UNIT(unitId), 'max');
  }
  if (paperNumber !== undefined) {
    revalidateTag(CACHE.MAINS.TAGS.PAPER(paperNumber), 'max');
  }
  revalidateTag(CACHE.MAINS.TAGS.CONCEPTS, 'max');
};
