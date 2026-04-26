import { sqliteTable, text, integer, real, index, uniqueIndex, numeric, blob, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

// MPPSC Users Table
export const mppscUsers = sqliteTable(
  'mppsc_users',
  {
    id: text('id').primaryKey(), // UUID handled in application logic
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    email: text('email').unique().notNull(),
    password: text('password').notNull(),
    name: text('name'),
    isSubscribed: integer('is_subscribed', { mode: 'boolean' }).default(false),
    planTier: text('plan_tier', { enum: ['free', 'lite', 'pro'] }).default('free'),
    role: text('role').default('guest'), // 'guest' | 'admin'
    adminSecret: text('admin_secret'), // Secure key for admin operations (nullable)
    deletedAt: integer('deleted_at', { mode: 'timestamp' }), // Soft delete support
    // Active flag — admin toggle. Inactive = can't login. Default ON.
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    // ── New Fields ────────────────────────────────────────────────
    // Access expiry — after this timestamp, user can't access content
    // Default: 6 months from creation. Admin can extend per user.
    accessExpiresAt: integer('access_expires_at', { mode: 'timestamp' }),
    // Phone number — optional, for contact
    phone: text('phone'),
    category: text('category', { enum: ['UR', 'OBC', 'SC', 'ST', 'EWS', 'PH'] }).default('UR'),
    gender: text('gender', { enum: ['M', 'F', 'OTHER'] }).default('M'),
    // Metadata — JSON field for location, notes, any extra info admin wants to store
    metadata: text('metadata', { mode: 'json' }),
    // Previous user ID — when lite→pro upgrade happens via soft-delete+recreate
    // Links to the old record for tracking migration history
    previousUserId: text('previous_user_id'),
    // Exam type segregation - UPSC/MPPSC isolation
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'all', 'mppolice'] })
      .default('mppsc')
      .notNull(),
  },
  (table) => [index('idx_users_email').on(table.email)]
);

// Tests Table
export const tests = sqliteTable(
  'tests',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    titleEn: text('title_en'),
    description: text('description'),
    slug: text('slug').unique().notNull(),
    durationMinutes: integer('duration_minutes').notNull(),
    totalQuestions: integer('total_questions').default(0),
    totalMarks: integer('total_marks').notNull(),
    type: text('type', {
      enum: ['FLT', 'UNIT', 'CSAT', 'PYQ', 'TOPIC', 'MISC', 'UPSC_PYQ', 'UPSC_FLT', 'UPSC_FREE_QUIZ'],
    }).notNull(),
    unitId: text('unit_id'), // To link directly to a syllabus unit e.g., 'unit_1'
    topicId: text('topic_id'), // To link to specific topic ID from syllabusData
    tags: text('tags', { mode: 'json' }), // JSON array of related tags e.g., ['history', 'ancient']
    isPro: integer('is_pro', { mode: 'boolean' }).default(false),
    // ── Access Control Flags ──────────────────────────────────────────
    // Ye 3 flags admin panel se control hote hain
    // isFreeAccess = true → Free/Guest users bhi de sakte hain test
    // isLiteAccess = true → Lite plan wale de sakte hain
    // isProAccess = true  → Pro plan wale de sakte hain (default true)
    // Admin ko ye check nahi lagta — wo sab de sakta hai
    isFreeAccess: integer('is_free_access', { mode: 'boolean' }).default(false),
    isLiteAccess: integer('is_lite_access', { mode: 'boolean' }).default(false),
    isProAccess: integer('is_pro_access', { mode: 'boolean' }).default(true),
    displayOrder: integer('display_order').default(0),
    isHidden: integer('is_hidden', { mode: 'boolean' }).default(false),
    maxRetries: integer('max_retries'), // null = unlimited. Standard: Unit=5, FLT=3
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }), // Soft delete support
    // Category cutoffs JSON for result analysis
    // e.g. { "UR_OPEN": 154, "UR_FEMALE": 150, "OBC_OPEN": 148, ... }
    cutoffs: text('cutoffs', { mode: 'json' }).$type<Record<string, number>>(),
    // Exam type segregation - UPSC/MPPSC isolation
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'all', 'mppolice'] })
      .default('mppsc')
      .notNull(),
  },
  (table) => [
    index('idx_tests_slug').on(table.slug),
    index('idx_tests_type_ispro').on(table.type, table.isPro),
  ]
);

// Questions Table
export const questions = sqliteTable(
  'questions',
  {
    id: text('id').primaryKey(),
    testId: text('test_id')
      .references(() => tests.id, { onDelete: 'cascade' })
      .notNull(),
    questionText: text('question_text').notNull(), // Hindi (Default)
    questionTextEn: text('question_text_en'), // English
    options: text('options', { mode: 'json' }).notNull(), // JSON: [{ id: 'A', text: 'Hi', text_en: 'En' }]
    correctAnswer: text('correct_answer').notNull(), // Option ID (e.g., 'A') or Text
    explanation: text('explanation'), // Hindi
    explanationEn: text('explanation_en'), // English
    marks: integer('marks').notNull(),
    negativeMarks: real('negative_marks').default(1),
    idealTime: integer('ideal_time').default(60), // Expected time in seconds
    order: integer('order').notNull(),
    subject: text('subject'), // e.g., 'Indian History', 'Polity'
    // New fields for Matching Support
    type: text('type', { enum: ['standard', 'matching'] }).default('standard'),
    matchPairs: text('match_pairs', { mode: 'json' }), // JSON Array: [{ id: '1', label: 'A', match: 'B', ... }]
    extendedData: text('extended_data', { mode: 'json' }), // New flexible schema for UPSC statement/table questions
    deletedAt: integer('deleted_at', { mode: 'timestamp' }), // Soft delete support
    // Exam type segregation - UPSC/MPPSC isolation
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'all', 'mppolice'] })
      .default('mppsc')
      .notNull(),
  },
  (table) => [index('idx_questions_subject').on(table.testId, table.subject)]
);

// PYQ Canonical Topics
export const pyqTopics = sqliteTable(
  'pyq_topics',
  {
    id: text('id').primaryKey(),
    subject: text('subject').notNull(),
    topicSlug: text('topic_slug').notNull(),
    topicTitle: text('topic_title').notNull(),
    topicTitleEn: text('topic_title_en'),
    description: text('description'),
    aiContent: text('ai_content', { mode: 'json' }), // New field for deep_learning
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    uniqueIndex('pyq_topics_topic_slug_unique').on(table.topicSlug),
    index('idx_pyq_topics_subject').on(table.subject, table.isActive),
  ]
);

// PYQ Question <> Topic Mapping
export const pyqQuestionTopics = sqliteTable(
  'pyq_question_topics',
  {
    id: text('id').primaryKey(),
    questionId: text('question_id')
      .references(() => questions.id, { onDelete: 'cascade' })
      .notNull(),
    topicId: text('topic_id')
      .references(() => pyqTopics.id, { onDelete: 'cascade' })
      .notNull(),
    confidence: real('confidence').default(1),
    isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
    source: text('source', { enum: ['manual', 'ai', 'rule'] }).default('manual'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    uniqueIndex('pyq_qt_question_topic_unique').on(table.questionId, table.topicId),
    index('idx_pyq_qt_topic').on(table.topicId),
    index('idx_pyq_qt_question').on(table.questionId),
    index('idx_pyq_qt_primary').on(table.topicId, table.isPrimary),
  ]
);

// PYQ Facts Bank (Student Revision)
export const pyqFactBank = sqliteTable(
  'pyq_fact_bank',
  {
    id: text('id').primaryKey(),
    topicId: text('topic_id')
      .references(() => pyqTopics.id, { onDelete: 'cascade' })
      .notNull(),
    subject: text('subject').notNull(),
    factText: text('fact_text').notNull(),
    factTextEn: text('fact_text_en'),
    memoryTip: text('memory_tip'),
    memoryTipEn: text('memory_tip_en'),
    scamAlert: text('scam_alert'),
    scamAlertEn: text('scam_alert_en'),
    difficulty: text('difficulty', { enum: ['easy', 'medium', 'hard'] }).default('medium'),
    frequencyScore: real('frequency_score').default(0),
    importanceScore: real('importance_score').default(0),
    pyqRefs: text('pyq_refs', { mode: 'json' })
      .$type<{ testId?: string; questionId?: string; year?: number }[]>()
      .default(sql`'[]'`)
      .notNull(),
    tags: text('tags', { mode: 'json' })
      .$type<string[]>()
      .default(sql`'[]'`),
    status: text('status', { enum: ['draft', 'published', 'archived'] }).default('draft'),
    source: text('source', { enum: ['manual', 'ai'] }).default('manual'),
    createdBy: text('created_by'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    index('idx_fact_topic_status').on(table.topicId, table.status),
    index('idx_fact_subject_status').on(table.subject, table.status),
    index('idx_fact_importance').on(table.status, table.importanceScore),
  ]
);

// PYQ Topic Trends Snapshot
export const pyqTopicTrends = sqliteTable(
  'pyq_topic_trends',
  {
    id: text('id').primaryKey(),
    topicId: text('topic_id')
      .references(() => pyqTopics.id, { onDelete: 'cascade' })
      .notNull(),
    subject: text('subject').notNull(),
    year: integer('year').notNull(),
    questionCount: integer('question_count').default(0).notNull(),
    weightPercent: real('weight_percent').default(0).notNull(),
    trendDelta: real('trend_delta').default(0),
    computedAt: integer('computed_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    uniqueIndex('pyq_trends_topic_year_unique').on(table.topicId, table.year),
    index('idx_trends_subject_year').on(table.subject, table.year),
    index('idx_trends_topic_year').on(table.topicId, table.year),
  ]
);

// PYQ Import Jobs (Admin Audit)
export const pyqContentImportJobs = sqliteTable(
  'pyq_content_import_jobs',
  {
    id: text('id').primaryKey(),
    uploadedBy: text('uploaded_by'),
    inputHash: text('input_hash').notNull(),
    totalRecords: integer('total_records'),
    successCount: integer('success_count'),
    failureCount: integer('failure_count'),
    status: text('status', { enum: ['pending', 'processed', 'failed'] }).default('pending'),
    errorReport: text('error_report', { mode: 'json' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [index('idx_pyq_jobs_status_created').on(table.status, table.createdAt)]
);

// PYQ Repeated Questions Cache (Pre-computed for fast reads)
export const pyqRepeatedCache = sqliteTable(
  'pyq_repeated_cache',
  {
    id: text('id').primaryKey(),
    questionId: text('question_id')
      .references(() => questions.id, { onDelete: 'cascade' })
      .notNull(),
    clusterId: text('cluster_id').notNull(), // Groups similar questions
    unitId: text('unit_id'), // unit_1, unit_2, etc.
    unitTitle: text('unit_title'),
    repeatCount: integer('repeat_count').default(1).notNull(),
    years: text('years', { mode: 'json' }).$type<number[]>().notNull(), // [2020, 2021, 2023]
    occurrences: text('occurrences', { mode: 'json' })
      .$type<{ year: number; qNo: number; testId: string }[]>()
      .notNull(),
    relatedQuestionIds: text('related_question_ids', { mode: 'json' }).$type<string[]>().notNull(), // All question IDs in this cluster
    computedAt: integer('computed_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    index('idx_pyq_repeated_cluster').on(table.clusterId),
    index('idx_pyq_repeated_unit').on(table.unitId),
    index('idx_pyq_repeated_count').on(table.repeatCount),
  ]
);

// PYQ Unit Distribution Cache (Pre-computed for fast reads)
export const pyqUnitCache = sqliteTable(
  'pyq_unit_cache',
  {
    id: text('id').primaryKey(),
    year: integer('year').notNull(),
    unitId: text('unit_id').notNull(),
    unitTitle: text('unit_title').notNull(),
    questionCount: integer('question_count').default(0).notNull(),
    questionIds: text('question_ids', { mode: 'json' }).$type<string[]>().notNull(),
    computedAt: integer('computed_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    uniqueIndex('pyq_unit_cache_year_unit_unique').on(table.year, table.unitId),
    index('idx_pyq_unit_cache_year').on(table.year),
  ]
);

// User Attempts Table
export const userAttempts = sqliteTable(
  'user_attempts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .references(() => mppscUsers.id, { onDelete: 'cascade' })
      .notNull(), // Linked to users table
    testId: text('test_id')
      .references(() => tests.id, { onDelete: 'cascade' })
      .notNull(),
    startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
    endTime: integer('end_time', { mode: 'timestamp' }),
    score: real('score'),
    isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }), // Soft delete support
    // Exam type segregation - UPSC/MPPSC isolation
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'all', 'mppolice'] })
      .default('mppsc')
      .notNull(),
  },
  (table) => [
    index('user_id_idx').on(table.userId),
    index('test_id_idx').on(table.testId),
    index('user_test_idx').on(table.userId, table.testId),
    // Optimized for analytics and completion history
    index('completed_idx').on(table.isCompleted, table.endTime),
    // Composite index for fast history lookups
    index('idx_user_test_completed').on(
      table.userId,
      table.testId,
      table.isCompleted,
      table.endTime
    ),
    // Time-based analytics index
    index('idx_attempts_by_date').on(table.userId, table.endTime),
    // NEW: Requested by code review
    index('idx_user_attempts_completion_score').on(table.userId, table.isCompleted, table.score),
  ]
);

// Attempt Answers (Granular tracking)
export const attemptAnswers = sqliteTable(
  'attempt_answers',
  {
    id: text('id').primaryKey(),
    attemptId: text('attempt_id')
      .references(() => userAttempts.id, { onDelete: 'cascade' })
      .notNull(),
    questionId: text('question_id')
      .references(() => questions.id)
      .notNull(),
    userAnswer: text('user_answer'),
    isCorrect: integer('is_correct', { mode: 'boolean' }),
    timeTakenSeconds: integer('time_taken_seconds'),
  },
  (table) => [
    index('attempt_id_idx').on(table.attemptId),
    index('question_id_idx').on(table.questionId),
    // Performance: Composite index for granular analytics
    index('idx_attempt_question').on(table.attemptId, table.questionId),
  ]
);

// Syllabus Topics Table (New)
export const syllabusTopics = sqliteTable(
  'syllabus_topics',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(), // e.g. 'unit_1'
    title: text('title').notNull(),
    titleEn: text('title_en'),
    // Content stored as JSON for flexibility
    // Expected default keys: front, back, details, mnemonic, impact_emoji, important_facts
    content: text('content', { mode: 'json' }).notNull(),
    contentEn: text('content_en', { mode: 'json' }),
    // New AI-enriched content (Points, PYQ, Mnemonic) - Separate from official syllabus text
    aiContent: text('ai_content', { mode: 'json' }),
    aiContentEn: text('ai_content_en', { mode: 'json' }),
    order: integer('order').notNull(),
    // ── Access Control Flags ──────────────────────────────────────
    // isFree = old flag (backward compat) — same as isFreeAccess
    isFree: integer('is_free', { mode: 'boolean' }).default(false),
    // New tier-based flags — admin panel se control karo
    isLiteAccess: integer('is_lite_access', { mode: 'boolean' }).default(false),
    isProAccess: integer('is_pro_access', { mode: 'boolean' }).default(true),
    imgUrl: text('img_url'), // For image support
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    // Exam type segregation - UPSC/MPPSC isolation
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'all', 'mppolice'] })
      .default('mppsc')
      .notNull(),
  },
  (table) => [index('unit_order_idx').on(table.unitId, table.order)]
);

// Test Attempt Limits — category wise max attempts (source of truth)
// null maxAttempts = unlimited
export const testAttemptLimits = sqliteTable('test_attempt_limits', {
  testType: text('test_type', {
    enum: ['FLT', 'UNIT', 'CSAT', 'PYQ', 'TOPIC', 'MISC', 'UPSC_PYQ', 'UPSC_FLT', 'UPSC_FREE_QUIZ'],
  }).primaryKey(),
  maxAttempts: integer('max_attempts'), // null = unlimited
});

// Blog/Vlog Content Table
export const contentBlogs = sqliteTable('content_blogs', {
  id: text('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  excerpt: text('excerpt'), // Auto-generated plain text summary (200-300 chars) that is SEO friendly
  content: text('content', { mode: 'json' }).notNull(), // Mixed content: text, images, etc.
  category: text('category').notNull(), // e.g., 'history', 'geography', 'current_affairs_mp'
  examType: text('exam_type', { enum: ['upsc', 'mppsc', 'all', 'mppolice'] })
    .default('mppsc')
    .notNull(), // Blog exam type for segregation
  imageUrl: text('image_url'),
  readingTime: integer('reading_time'), // in minutes
  contentType: text('content_type', { enum: ['blog', 'vlog'] })
    .default('blog')
    .notNull(),
  unitId: text('unit_id'), // Linked to syllabusUnit e.g., 'unit_1', 'unit_10'
  topicId: text('topic_id'), // Linked to syllabusData topic.id (e.g. '1', '2')
  isPremium: integer('is_premium', { mode: 'boolean' }).default(true), // Legacy flag (kept for backward compat)
  // ── Access Control Flags ──────────────────────────────────────
  // Same pattern as tests — admin panel se toggle karo
  isFreeAccess: integer('is_free_access', { mode: 'boolean' }).default(false),
  isLiteAccess: integer('is_lite_access', { mode: 'boolean' }).default(false),
  isProAccess: integer('is_pro_access', { mode: 'boolean' }).default(true),
  isPublished: integer('is_published', { mode: 'boolean' }).default(false),
  isHidden: integer('is_hidden', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Relations
export const testsRelations = relations(tests, ({ many }) => ({
  questions: many(questions),
  userAttempts: many(userAttempts),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  test: one(tests, {
    fields: [questions.testId],
    references: [tests.id],
  }),
}));

export const userAttemptsRelations = relations(userAttempts, ({ one, many }) => ({
  user: one(mppscUsers, {
    fields: [userAttempts.userId],
    references: [mppscUsers.id],
  }),
  test: one(tests, {
    fields: [userAttempts.testId],
    references: [tests.id],
  }),
  answers: many(attemptAnswers),
}));

// Support Tickets Table
export const supportTickets = sqliteTable('support_tickets', {
  id: text('id').primaryKey(),
  userId: text('user_id'), // Optional, if user is logged in
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  category: text('category').default('general'), // 'general', 'technical', 'payment', 'content'
  message: text('message').notNull(),
  status: text('status', { enum: ['open', 'in_progress', 'resolved', 'closed'] }).default('open'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  // Exam type segregation - UPSC/MPPSC isolation
  examType: text('exam_type', { enum: ['upsc', 'mppsc', 'all', 'mppolice'] })
    .default('mppsc')
    .notNull(),
});

export const attemptAnswersRelations = relations(attemptAnswers, ({ one }) => ({
  attempt: one(userAttempts, {
    fields: [attemptAnswers.attemptId],
    references: [userAttempts.id],
  }),
  question: one(questions, {
    fields: [attemptAnswers.questionId],
    references: [questions.id],
  }),
}));

// Payment Exit Reasons Table
export const paymentExitReasons = sqliteTable('payment_exit_reasons', {
  id: text('id').primaryKey(),
  reason: text('reason').notNull(),
  customReason: text('custom_reason'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  // Exam type segregation - UPSC/MPPSC isolation
  examType: text('exam_type', { enum: ['upsc', 'mppsc', 'all', 'mppolice'] })
    .default('mppsc')
    .notNull(),
});

// Topic Revisions Table (User Progress)
export const topicRevisions = sqliteTable('topic_revisions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => mppscUsers.id, { onDelete: 'cascade' })
    .notNull(),
  topicId: text('topic_id').notNull(), // Matching syllabusData IDs
  unitId: text('unit_id').notNull(),
  revisionCount: integer('revision_count').default(0),
  lastRevisedAt: integer('last_revised_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

// Test Leaderboard Table (Ranking Feature)
export const testLeaderboard = sqliteTable(
  'test_leaderboard',
  {
    id: text('id').primaryKey(),
    testId: text('test_id').notNull(),
    userId: text('user_id'), // Nullable for fake users
    displayName: text('display_name').notNull(),
    score: real('score').notNull(),
    percentage: real('percentage'),
    timeTakenSeconds: integer('time_taken_seconds'),
    rank: integer('rank'),
    isFake: integer('is_fake').default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    // Exam type segregation - UPSC/MPPSC isolation
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'all', 'mppolice'] })
      .default('mppsc')
      .notNull(),
  },
  (table) => [
    index('test_score_idx').on(table.testId, table.score),
    // Ranking index: Score DESC, Time ASC
    index('idx_leaderboard_ranking').on(table.testId, table.score, table.timeTakenSeconds),
  ]
);

// Free Quiz Attempts (Guest score tracking)
export const freeQuizAttempts = sqliteTable(
  'free_quiz_attempts',
  {
    id: text('id').primaryKey(),
    testId: text('test_id')
      .references(() => tests.id, { onDelete: 'cascade' })
      .notNull(),
    guestId: text('guest_id'),
    score: real('score'),
    totalQuestions: integer('total_questions'),
    percentage: real('percentage'),
    timeTakenSeconds: integer('time_taken_seconds'),
    completedAt: integer('completed_at', { mode: 'timestamp' }).default(
      sql`(strftime('%s', 'now'))`
    ),
    // Exam type segregation - UPSC/MPPSC isolation  
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'all', 'mppolice'] })
      .default('mppsc')  // Preserve existing attempts as MPPSC
      .notNull(),
  },
  (table) => [
    index('idx_free_attempts_test').on(table.testId),
    index('idx_free_attempts_guest').on(table.guestId),
  ]
);

// User Feedback Table
export const feedbacks = sqliteTable(
  'feedbacks',
  {
    id: text('id').primaryKey(),
    userId: text('user_id'), // Optional, if user is logged in
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'), // Optional phone number
    message: text('message').notNull(),
    rating: integer('rating').notNull(), // 1 to 5
    // Categories: 'bug', 'content', 'ui', 'feature_request', 'other'
    category: text('category').default('other'),
    // Alignment with Testimonials
    role: text('role'), // e.g., 'Aspirant', 'Selected Officer', 'Teacher'
    location: text('location'), // e.g., 'Indore', 'Bhopal'
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    // Exam type segregation - UPSC/MPPSC isolation
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'all', 'mppolice'] })
      .default('mppsc')
      .notNull(),
  },
  (table) => [
    index('idx_feedbacks_created_at').on(table.createdAt),
    index('idx_feedbacks_category').on(table.category),
    index('idx_feedbacks_role').on(table.role),
  ]
);

// Guests Table (Lead Generation)
export const guests = sqliteTable(
  'guests',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email'),
    mobile: text('mobile'), // Primary identifier for upsert (last 10 digits stored)
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    // Exam type segregation - UPSC/MPPSC isolation  
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'all', 'mppolice'] })
      .default('mppsc')  // Preserve existing guests as MPPSC
      .notNull(),
    /** Where the lead was captured, e.g. free_quiz, open_pyq_2026 */
    leadSource: text('lead_source'),
  },
  (table) => [
    index('idx_guests_email').on(table.email),
    uniqueIndex('idx_guests_mobile_unique').on(table.mobile), // Unique for upsert logic
    index('idx_guests_lead_source').on(table.leadSource),
  ]
);

// Intelligence Feedback Table (for emoji reactions on solutions)
export const intelligenceFeedback = sqliteTable(
  'intelligence_feedback',
  {
    id: text('id').primaryKey(),
    guestId: text('guest_id').references(() => guests.id),
    questionId: text('question_id').notNull(),
    questionText: text('question_text'), // Cache of the question stem for admin display
    testId: text('test_id'),
    reaction: text('reaction', { enum: ['helpful', 'insightful', 'unhelpful', 'doubt'] }).notNull(),
    message: text('message'), // For doubt details
    isPro: integer('is_pro', { mode: 'boolean' }).default(false),
    source: text('source'), // e.g., 'intelligence_page', 'paper_solution'
    userId: text('user_id'), // For logged-in users
    userName: text('user_name'),
    userMobile: text('user_mobile'),
    userEmail: text('user_email'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'all', 'mppolice'] })
      .default('mppsc')
      .notNull(),
  },
  (table) => [
    index('idx_intel_feedback_guest').on(table.guestId),
    index('idx_intel_feedback_question').on(table.questionId),
    index('idx_intel_feedback_reaction').on(table.reaction),
  ]
);

// --- Missing Tables from Remote Turso (Added to prevent accidental deletion) ---

export const questionsFts = sqliteTable("questions_fts", {
	id: numeric(),
	testId: numeric(),
	questionText: numeric(),
	questionsFts: numeric("questions_fts"),
	rank: numeric(),
});

export const questionsFtsData = sqliteTable("questions_fts_data", {
	id: integer().primaryKey(),
	block: blob(),
});

export const questionsFtsIdx = sqliteTable("questions_fts_idx", {
	segid: numeric().notNull(),
	term: numeric().notNull(),
	pgno: numeric(),
},
(table) => [
	primaryKey({ columns: [table.segid, table.term], name: "questions_fts_idx_segid_term_pk"})
]);

export const questionsFtsContent = sqliteTable("questions_fts_content", {
	id: integer().primaryKey(),
	c0: numeric(),
	c1: numeric(),
	c2: numeric(),
});

export const questionsFtsDocsize = sqliteTable("questions_fts_docsize", {
	id: integer().primaryKey(),
	sz: blob(),
});

export const questionsFtsConfig = sqliteTable("questions_fts_config", {
	k: numeric().primaryKey().notNull(),
	v: numeric(),
});

export const mppoliceOneLinerFacts = sqliteTable("mppolice_one_liner_facts", {
	id: text().primaryKey().notNull(),
	subjectTag: text("subject_tag").notNull(),
	stemHi: text("stem_hi").notNull(),
	stemEn: text("stem_en"),
	answerHi: text("answer_hi").notNull(),
	answerEn: text("answer_en"),
	importanceScore: real("importance_score"),
	sortOrder: integer("sort_order").default(0),
	extendedData: text("extended_data"),
	status: text().default("draft"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	updatedAt: integer("updated_at").default(sql`(strftime('%s', 'now'))`),
},
(table) => [
	index("idx_mppol_ol_importance").on(table.status, table.importanceScore),
	index("idx_mppol_ol_subject_status").on(table.subjectTag, table.status),
]);

export const mppoliceOneLinerRevisions = sqliteTable("mppolice_one_liner_revisions", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => mppscUsers.id, { onDelete: "cascade" } ),
	factId: text("fact_id").notNull().references(() => mppoliceOneLinerFacts.id, { onDelete: "cascade" } ),
	revisionCount: integer("revision_count").default(0),
	lastRevisedAt: integer("last_revised_at").default(sql`(strftime('%s', 'now'))`),
},
(table) => [
	uniqueIndex("idx_mppol_rel_user_fact").on(table.userId, table.factId),
	index("idx_mppol_rel_fact").on(table.factId),
	index("idx_mppol_rel_user").on(table.userId),
]);

export const pricingConfigOld = sqliteTable("pricing_config_old", {
	examType: text("exam_type").primaryKey(),
	litePrice: integer("lite_price").default(99),
	liteOriginalPrice: integer("lite_original_price").default(299),
	liteValidityText: text("lite_validity_text").default("Valid till Exam"),
	liteMonths: integer("lite_months").default(8),
	proPrice: integer("pro_price").default(299),
	proOriginalPrice: integer("pro_original_price").default(999),
	proValidityText: text("pro_validity_text").default("Valid for 1 Year"),
	proMonths: integer("pro_months").default(12),
	upgradePrice: integer("upgrade_price").default(199),
	upgradeOriginalPrice: integer("upgrade_original_price").default(299),
	urgencyText: text("urgency_text").default("Special Offer"),
	urgencyTextHi: text("urgency_text_hi").default("विशेष ऑफर"),
	studentsBought: integer("students_bought").default(23),
	updatedAt: integer("updated_at").default(sql`(strftime('%s', 'now'))`),
});

// User Activity Logs (Audit Trail)
export const mppscUserActivities = sqliteTable(
  'mppsc_user_activities',
  {
    id: text('id').primaryKey(),
    userId: text('user_id'), // Kept even if user is deleted (for history)
    userEmail: text('user_email').notNull(),
    userName: text('user_name'),
    adminId: text('admin_id'), // Who performed the action
    action: text('action', {
      enum: ['PLAN_CHANGE', 'DELETE', 'GRANT', 'UPDATE', 'LOGIN'],
    }).notNull(),
    details: text('details', { mode: 'json' }), // Store old/new values
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    index('idx_activities_user_id').on(table.userId),
    index('idx_activities_action').on(table.action),
    index('idx_activities_created_at').on(table.createdAt),
  ]
);

// Payments Table
export const payments = sqliteTable(
  'payments',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => mppscUsers.id, { onDelete: 'set null' }), // Set null on user delete
    orderId: text('order_id').notNull(),
    paymentId: text('payment_id').unique(),
    signature: text('signature'),
    amount: integer('amount').notNull(),
    planTier: text('plan_tier', { enum: ['lite', 'pro'] }),
    status: text('status', { enum: ['created', 'captured', 'failed'] })
      .default('created')
      .notNull(),
    currency: text('currency').default('INR').notNull(),
    receipt: text('receipt'),
    notes: text('notes', { mode: 'json' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    // Exam type segregation - UPSC/MPPSC isolation
    examType: text('exam_type', { enum: ['upsc', 'mppsc', 'all', 'mppolice'] })
      .default('mppsc')
      .notNull(),
  },
  (table) => [
    index('idx_payments_order_id').on(table.orderId),
    index('idx_payments_user_id').on(table.userId),
    index('idx_payments_status').on(table.status),
    index('idx_payments_payment_id').on(table.paymentId),
  ]
);

// Verification Tokens Table (for set password / email verification)
export const verificationTokens = sqliteTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(), // email or userId
    token: text('token').notNull(),
    expires: integer('expires', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    index('idx_verification_tokens_identifier').on(table.identifier),
    index('idx_verification_tokens_token').on(table.token),
  ]
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 PRICING CONFIG TABLE — Dynamic pricing, admin se change karo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Single row table (key-value style) — stores current pricing.
// Admin updates → cache busts → pricing page shows new prices.
// No deploy needed to change prices!
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const pricingConfig = sqliteTable('pricing_config', {
  examType: text('exam_type', { enum: ['upsc', 'mppsc', 'mppolice'] }).primaryKey(),
  litePrice: integer('lite_price').default(99),
  liteOriginalPrice: integer('lite_original_price').default(299),
  liteValidityText: text('lite_validity_text').default('Valid till Exam'),
  liteMonths: integer('lite_months').default(8),
  proPrice: integer('pro_price').default(299),
  proOriginalPrice: integer('pro_original_price').default(999),
  proValidityText: text('pro_validity_text').default('Valid for 1 Year'),
  proMonths: integer('pro_months').default(12),
  upgradePrice: integer('upgrade_price').default(199),
  upgradeOriginalPrice: integer('upgrade_original_price').default(299),
  urgencyText: text('urgency_text').default('Special Offer'),
  urgencyTextHi: text('urgency_text_hi').default('विशेष ऑफर'),
  studentsBought: integer('students_bought').default(23),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

// Test Feedback Table
export const testFeedback = sqliteTable('test_feedback', {
  id: text('id').primaryKey(),
  testId: text('test_id').notNull(),
  userId: text('user_id'), // Optional for guest users
  testType: text('test_type', { enum: ['free', 'premium', 'pyq'] }).notNull(),
  testName: text('test_name'), // Identifies the test title (e.g., 'Modern History Quiz')

  // Feedback ratings
  overallRating: integer('overall_rating').notNull(), // 1-5 stars
  difficultyLevel: text('difficulty_level', {
    enum: ['too_easy', 'just_right', 'too_hard'],
  }).notNull(),
  questionQuality: text('question_quality', {
    enum: ['excellent', 'good', 'average', 'poor'],
  }).notNull(),
  wouldRecommend: text('would_recommend', {
    enum: ['definitely', 'probably', 'maybe', 'no'],
  }).notNull(),

  // Optional text feedback
  comments: text('comments'),

  // User Info (Added to identify guest/logged-in users easily)
  userName: text('user_name'),
  userEmail: text('user_email'),

  // Metadata
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  
  // Exam type segregation - UPSC/MPPSC isolation  
  examType: text('exam_type', { enum: ['upsc', 'mppsc', 'all', 'mppolice'] })
    .default('mppsc')  // Preserve existing test feedback as MPPSC
    .notNull(),
});

export const testFeedbackRelations = relations(testFeedback, ({ one }) => ({
  user: one(mppscUsers, {
    fields: [testFeedback.userId],
    references: [mppscUsers.id],
  }),
  test: one(tests, {
    fields: [testFeedback.testId],
    references: [tests.id],
  }),
}));

export const intelligenceFeedbackRelations = relations(intelligenceFeedback, ({ one }) => ({
  guest: one(guests, {
    fields: [intelligenceFeedback.guestId],
    references: [guests.id],
  }),
  question: one(questions, {
    fields: [intelligenceFeedback.questionId],
    references: [questions.id],
  }),
}));
