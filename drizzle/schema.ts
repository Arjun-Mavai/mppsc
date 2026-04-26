import { sqliteTable, AnySQLiteColumn, index, foreignKey, text, integer, real, uniqueIndex, numeric, blob, primaryKey } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const attemptAnswers = sqliteTable("attempt_answers", {
	id: text().primaryKey().notNull(),
	attemptId: text("attempt_id").notNull().references(() => userAttempts.id, { onDelete: "cascade" } ),
	questionId: text("question_id").notNull().references(() => questions.id),
	userAnswer: text("user_answer"),
	isCorrect: integer("is_correct"),
	timeTakenSeconds: integer("time_taken_seconds"),
},
(table) => [
	index("idx_attempt_question").on(table.attemptId, table.questionId),
	index("question_id_idx").on(table.questionId),
	index("attempt_id_idx").on(table.attemptId),
]);

export const questions = sqliteTable("questions", {
	id: text().primaryKey().notNull(),
	testId: text("test_id").notNull().references(() => tests.id, { onDelete: "cascade" } ),
	questionText: text("question_text").notNull(),
	options: text().notNull(),
	correctAnswer: text("correct_answer").notNull(),
	explanation: text(),
	marks: integer().notNull(),
	negativeMarks: real("negative_marks").default(1),
	order: integer().notNull(),
	subject: text(),
	questionTextEn: text("question_text_en"),
	explanationEn: text("explanation_en"),
	idealTime: integer("ideal_time").default(60),
	type: text().default("standard"),
	matchPairs: text("match_pairs"),
	deletedAt: integer("deleted_at"),
	extendedData: text("extended_data"),
	examType: text("exam_type").default("mppsc").notNull(),
},
(table) => [
	index("idx_questions_subject").on(table.testId, table.subject),
]);

export const tests = sqliteTable("tests", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	slug: text().notNull(),
	durationMinutes: integer("duration_minutes").notNull(),
	totalMarks: integer("total_marks").notNull(),
	type: text().notNull(),
	isPro: integer("is_pro").default(false),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	updatedAt: integer("updated_at").default(sql`(strftime('%s', 'now'))`),
	unitId: text("unit_id"),
	tags: text(),
	maxRetries: integer("max_retries"),
	totalQuestions: integer("total_questions").default(0),
	topicId: text("topic_id"),
	displayOrder: integer("display_order").default(0),
	deletedAt: integer("deleted_at"),
	titleEn: text("title_en"),
	isFreeAccess: integer("is_free_access").default(false),
	isLiteAccess: integer("is_lite_access").default(false),
	isProAccess: integer("is_pro_access").default(true),
	isHidden: integer("is_hidden").default(false),
	cutoffs: text(),
	examType: text("exam_type").default("mppsc").notNull(),
},
(table) => [
	index("idx_tests_type_ispro").on(table.type, table.isPro),
	index("idx_tests_slug").on(table.slug),
	uniqueIndex("tests_slug_unique").on(table.slug),
]);

export const mppscUsers = sqliteTable("mppsc_users", {
	id: text().primaryKey().notNull(),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	email: text().notNull(),
	password: text().notNull(),
	name: text(),
	isSubscribed: integer("is_subscribed").default(false),
	role: text().default("guest"),
	planTier: text("plan_tier").default("free"),
	adminSecret: text("admin_secret"),
	deletedAt: integer("deleted_at"),
	accessExpiresAt: integer("access_expires_at"),
	phone: text(),
	metadata: text(),
	previousUserId: text("previous_user_id"),
	isActive: integer("is_active").default(true),
	category: text().default("UR"),
	gender: text().default("M"),
	examType: text("exam_type").default("mppsc").notNull(),
},
(table) => [
	index("idx_users_email").on(table.email),
	uniqueIndex("mppsc_users_email_unique").on(table.email),
]);

export const syllabusTopics = sqliteTable("syllabus_topics", {
	id: text().primaryKey().notNull(),
	unitId: text("unit_id").notNull(),
	title: text().notNull(),
	titleEn: text("title_en"),
	content: text().notNull(),
	contentEn: text("content_en"),
	order: integer().notNull(),
	isFree: integer("is_free").default(false),
	imgUrl: text("img_url"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	aiContent: text("ai_content"),
	aiContentEn: text("ai_content_en"),
	isLiteAccess: integer("is_lite_access").default(false),
	isProAccess: integer("is_pro_access").default(true),
	examType: text("exam_type").default("mppsc").notNull(),
},
(table) => [
	index("unit_order_idx").on(table.unitId, table.order),
]);

export const contentBlogs = sqliteTable("content_blogs", {
	id: text().primaryKey().notNull(),
	slug: text().notNull(),
	title: text().notNull(),
	description: text(),
	content: text().notNull(),
	category: text().notNull(),
	imageUrl: text("image_url"),
	readingTime: integer("reading_time"),
	isPublished: integer("is_published").default(false),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	updatedAt: integer("updated_at").default(sql`(strftime('%s', 'now'))`),
	contentType: text("content_type").default("blog").notNull(),
	unitId: text("unit_id"),
	topicId: text("topic_id"),
	isPremium: integer("is_premium").default(true),
	isFreeAccess: integer("is_free_access").default(false),
	isLiteAccess: integer("is_lite_access").default(false),
	isProAccess: integer("is_pro_access").default(true),
	isHidden: integer("is_hidden").default(false),
	excerpt: text(),
	examType: text("exam_type").default("mppsc").notNull(),
},
(table) => [
	uniqueIndex("content_blogs_slug_unique").on(table.slug),
]);

export const supportTickets = sqliteTable("support_tickets", {
	id: text().primaryKey().notNull(),
	userId: text("user_id"),
	name: text().notNull(),
	email: text().notNull(),
	phone: text(),
	category: text().default("general"),
	message: text().notNull(),
	status: text().default("open"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	examType: text("exam_type").default("mppsc").notNull(),
});

export const paymentExitReasons = sqliteTable("payment_exit_reasons", {
	id: text().primaryKey().notNull(),
	reason: text().notNull(),
	customReason: text("custom_reason"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	examType: text("exam_type").default("mppsc").notNull(),
});

export const testLeaderboard = sqliteTable("test_leaderboard", {
	id: text().primaryKey().notNull(),
	testId: text("test_id").notNull(),
	userId: text("user_id"),
	displayName: text("display_name").notNull(),
	score: real().notNull(),
	percentage: real(),
	timeTakenSeconds: integer("time_taken_seconds"),
	rank: integer(),
	isFake: integer("is_fake").default(0),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	examType: text("exam_type").default("mppsc").notNull(),
},
(table) => [
	index("idx_leaderboard_ranking").on(table.testId, table.score, table.timeTakenSeconds),
	index("test_score_idx").on(table.testId, table.score),
]);

export const feedbacks = sqliteTable("feedbacks", {
	id: text().primaryKey().notNull(),
	userId: text("user_id"),
	name: text().notNull(),
	email: text(),
	phone: text(),
	message: text().notNull(),
	rating: integer().notNull(),
	category: text().default("other"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	role: text(),
	location: text(),
	examType: text("exam_type").default("mppsc").notNull(),
},
(table) => [
	index("idx_feedbacks_role").on(table.role),
	index("idx_feedbacks_category").on(table.category),
	index("idx_feedbacks_created_at").on(table.createdAt),
]);

export const guests = sqliteTable("guests", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text(),
	mobile: text(),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	updatedAt: integer("updated_at").default(sql`(strftime('%s', 'now'))`),
	examType: text("exam_type").default("mppsc").notNull(),
	leadSource: text("lead_source"),
},
(table) => [
	index("idx_guests_lead_source").on(table.leadSource),
	uniqueIndex("idx_guests_mobile_unique").on(table.mobile),
	index("idx_guests_email").on(table.email),
]);

export const verificationTokens = sqliteTable("verification_tokens", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: integer().notNull(),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
},
(table) => [
	index("idx_verification_tokens_token").on(table.token),
	index("idx_verification_tokens_identifier").on(table.identifier),
]);

export const testAttemptLimits = sqliteTable("test_attempt_limits", {
	testType: text("test_type").primaryKey().notNull(),
	maxAttempts: integer("max_attempts"),
});

export const mppscUserActivities = sqliteTable("mppsc_user_activities", {
	id: text().primaryKey().notNull(),
	userId: text("user_id"),
	userEmail: text("user_email").notNull(),
	userName: text("user_name"),
	adminId: text("admin_id"),
	action: text().notNull(),
	details: text(),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
},
(table) => [
	index("idx_activities_created_at").on(table.createdAt),
	index("idx_activities_action").on(table.action),
	index("idx_activities_user_id").on(table.userId),
]);

export const userAttempts = sqliteTable("user_attempts", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => mppscUsers.id, { onDelete: "cascade" } ),
	testId: text("test_id").notNull().references(() => tests.id, { onDelete: "cascade" } ),
	startTime: integer("start_time").notNull(),
	endTime: integer("end_time"),
	score: real(),
	isCompleted: integer("is_completed").default(false),
	deletedAt: integer("deleted_at"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	examType: text("exam_type").default("mppsc").notNull(),
},
(table) => [
	index("idx_user_attempts_completion_score").on(table.userId, table.isCompleted, table.score),
	index("idx_attempts_by_date").on(table.userId, table.endTime),
	index("idx_user_test_completed").on(table.userId, table.testId, table.isCompleted, table.endTime),
	index("completed_idx").on(table.isCompleted, table.endTime),
	index("user_test_idx").on(table.userId, table.testId),
	index("test_id_idx").on(table.testId),
	index("user_id_idx").on(table.userId),
]);

export const topicRevisions = sqliteTable("topic_revisions", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => mppscUsers.id, { onDelete: "cascade" } ),
	topicId: text("topic_id").notNull(),
	unitId: text("unit_id").notNull(),
	revisionCount: integer("revision_count").default(0),
	lastRevisedAt: integer("last_revised_at").default(sql`(strftime('%s', 'now'))`),
});

export const payments = sqliteTable("payments", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").references(() => mppscUsers.id, { onDelete: "set null" } ),
	orderId: text("order_id").notNull(),
	paymentId: text("payment_id"),
	signature: text(),
	amount: integer().notNull(),
	planTier: text("plan_tier"),
	status: text().default("created").notNull(),
	currency: text().default("INR").notNull(),
	receipt: text(),
	notes: text(),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	updatedAt: integer("updated_at").default(sql`(strftime('%s', 'now'))`),
	examType: text("exam_type").default("mppsc").notNull(),
},
(table) => [
	index("idx_payments_payment_id").on(table.paymentId),
	index("idx_payments_status").on(table.status),
	index("idx_payments_user_id").on(table.userId),
	index("idx_payments_order_id").on(table.orderId),
	uniqueIndex("payments_payment_id_unique").on(table.paymentId),
]);

export const pyqTopics = sqliteTable("pyq_topics", {
	id: text().primaryKey().notNull(),
	subject: text().notNull(),
	topicSlug: text("topic_slug").notNull(),
	topicTitle: text("topic_title").notNull(),
	topicTitleEn: text("topic_title_en"),
	description: text(),
	isActive: integer("is_active").default(true),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	updatedAt: integer("updated_at").default(sql`(strftime('%s', 'now'))`),
	aiContent: text("ai_content"),
},
(table) => [
	index("idx_pyq_topics_subject").on(table.subject, table.isActive),
	uniqueIndex("pyq_topics_topic_slug_unique").on(table.topicSlug),
]);

export const pyqContentImportJobs = sqliteTable("pyq_content_import_jobs", {
	id: text().primaryKey().notNull(),
	uploadedBy: text("uploaded_by"),
	inputHash: text("input_hash").notNull(),
	totalRecords: integer("total_records"),
	successCount: integer("success_count"),
	failureCount: integer("failure_count"),
	status: text().default("pending"),
	errorReport: text("error_report"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
},
(table) => [
	index("idx_pyq_jobs_status_created").on(table.status, table.createdAt),
]);

export const pyqQuestionTopics = sqliteTable("pyq_question_topics", {
	id: text().primaryKey().notNull(),
	questionId: text("question_id").notNull().references(() => questions.id, { onDelete: "cascade" } ),
	topicId: text("topic_id").notNull().references(() => pyqTopics.id, { onDelete: "cascade" } ),
	confidence: real().default(1),
	isPrimary: integer("is_primary").default(false),
	source: text().default("manual"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
},
(table) => [
	index("idx_pyq_qt_primary").on(table.topicId, table.isPrimary),
	index("idx_pyq_qt_question").on(table.questionId),
	index("idx_pyq_qt_topic").on(table.topicId),
	uniqueIndex("pyq_qt_question_topic_unique").on(table.questionId, table.topicId),
]);

export const pyqFactBank = sqliteTable("pyq_fact_bank", {
	id: text().primaryKey().notNull(),
	topicId: text("topic_id").notNull().references(() => pyqTopics.id, { onDelete: "cascade" } ),
	subject: text().notNull(),
	factText: text("fact_text").notNull(),
	factTextEn: text("fact_text_en"),
	memoryTip: text("memory_tip"),
	memoryTipEn: text("memory_tip_en"),
	scamAlert: text("scam_alert"),
	scamAlertEn: text("scam_alert_en"),
	difficulty: text().default("medium"),
	frequencyScore: real("frequency_score"),
	importanceScore: real("importance_score"),
	pyqRefs: text("pyq_refs").default("[]").notNull(),
	tags: text().default("[]"),
	status: text().default("draft"),
	source: text().default("manual"),
	createdBy: text("created_by"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	updatedAt: integer("updated_at").default(sql`(strftime('%s', 'now'))`),
},
(table) => [
	index("idx_fact_importance").on(table.status, table.importanceScore),
	index("idx_fact_subject_status").on(table.subject, table.status),
	index("idx_fact_topic_status").on(table.topicId, table.status),
]);

export const pyqTopicTrends = sqliteTable("pyq_topic_trends", {
	id: text().primaryKey().notNull(),
	topicId: text("topic_id").notNull().references(() => pyqTopics.id, { onDelete: "cascade" } ),
	subject: text().notNull(),
	year: integer().notNull(),
	questionCount: integer("question_count").default(0).notNull(),
	weightPercent: real("weight_percent").notNull(),
	trendDelta: real("trend_delta"),
	computedAt: integer("computed_at").default(sql`(strftime('%s', 'now'))`),
},
(table) => [
	index("idx_trends_topic_year").on(table.topicId, table.year),
	index("idx_trends_subject_year").on(table.subject, table.year),
	uniqueIndex("pyq_trends_topic_year_unique").on(table.topicId, table.year),
]);

export const freeQuizAttempts = sqliteTable("free_quiz_attempts", {
	id: text().primaryKey().notNull(),
	testId: text("test_id").notNull().references(() => tests.id, { onDelete: "cascade" } ),
	guestId: text("guest_id"),
	score: real(),
	totalQuestions: integer("total_questions"),
	percentage: real(),
	timeTakenSeconds: integer("time_taken_seconds"),
	completedAt: integer("completed_at").default(sql`(strftime('%s', 'now'))`),
	examType: text("exam_type").default("mppsc").notNull(),
},
(table) => [
	index("idx_free_attempts_guest").on(table.guestId),
	index("idx_free_attempts_test").on(table.testId),
]);

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

export const pyqRepeatedCache = sqliteTable("pyq_repeated_cache", {
	id: text().primaryKey().notNull(),
	questionId: text("question_id").notNull().references(() => questions.id, { onDelete: "cascade" } ),
	clusterId: text("cluster_id").notNull(),
	unitId: text("unit_id"),
	unitTitle: text("unit_title"),
	repeatCount: integer("repeat_count").default(1).notNull(),
	years: text().notNull(),
	occurrences: text().notNull(),
	relatedQuestionIds: text("related_question_ids").notNull(),
	computedAt: integer("computed_at").default(sql`(strftime('%s', 'now'))`),
},
(table) => [
	index("idx_pyq_repeated_count").on(table.repeatCount),
	index("idx_pyq_repeated_unit").on(table.unitId),
	index("idx_pyq_repeated_cluster").on(table.clusterId),
]);

export const pyqUnitCache = sqliteTable("pyq_unit_cache", {
	id: text().primaryKey().notNull(),
	year: integer().notNull(),
	unitId: text("unit_id").notNull(),
	unitTitle: text("unit_title").notNull(),
	questionCount: integer("question_count").default(0).notNull(),
	questionIds: text("question_ids").notNull(),
	computedAt: integer("computed_at").default(sql`(strftime('%s', 'now'))`),
},
(table) => [
	index("idx_pyq_unit_cache_year").on(table.year),
	uniqueIndex("pyq_unit_cache_year_unit_unique").on(table.year, table.unitId),
]);

export const testFeedback = sqliteTable("test_feedback", {
	id: text().primaryKey().notNull(),
	testId: text("test_id").notNull(),
	userId: text("user_id"),
	testType: text("test_type").notNull(),
	overallRating: integer("overall_rating").notNull(),
	difficultyLevel: text("difficulty_level").notNull(),
	questionQuality: text("question_quality").notNull(),
	wouldRecommend: text("would_recommend").notNull(),
	comments: text(),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	updatedAt: integer("updated_at").default(sql`(strftime('%s', 'now'))`),
	userName: text("user_name"),
	userEmail: text("user_email"),
	testName: text("test_name"),
	examType: text("exam_type").default("mppsc").notNull(),
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

export const pricingConfig = sqliteTable("pricing_config", {
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

export const intelligenceFeedback = sqliteTable("intelligence_feedback", {
	id: text().primaryKey().notNull(),
	guestId: text("guest_id").references(() => guests.id),
	questionId: text("question_id").notNull(),
	testId: text("test_id"),
	reaction: text().notNull(),
	message: text(),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	examType: text("exam_type").default("mppsc").notNull(),
	questionText: text("question_text"),
},
(table) => [
	index("idx_intel_feedback_reaction").on(table.reaction),
	index("idx_intel_feedback_question").on(table.questionId),
	index("idx_intel_feedback_guest").on(table.guestId),
]);

