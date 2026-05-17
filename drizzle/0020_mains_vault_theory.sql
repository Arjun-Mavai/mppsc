-- Structured topic theory (AI JSON → row per topic, fast read; optional alongside mains_content)
CREATE TABLE IF NOT EXISTS `mains_topic_theory_structured` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL UNIQUE,
	`payload` text NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	`exam_type` text DEFAULT 'mppsc_mains' NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `mains_topics`(`id`) ON DELETE CASCADE
);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS `idx_mains_theory_topic` ON `mains_topic_theory_structured` (`topic_id`);--> statement-breakpoint

-- Two ready-to-write variants per official PYQ stem (Question Vault)
CREATE TABLE IF NOT EXISTS `mains_pyq_prepared_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`pyq_question_id` text NOT NULL,
	`variant_slot` integer NOT NULL,
	`style_label` text,
	`structure_breakdown` text,
	`answer_hi` text NOT NULL,
	`answer_en` text,
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`pyq_question_id`) REFERENCES `mains_pyq_questions`(`id`) ON DELETE CASCADE
);--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS `idx_mains_pyq_prep_unique` ON `mains_pyq_prepared_variants` (`pyq_question_id`,`variant_slot`);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS `idx_mains_pyq_prep_q` ON `mains_pyq_prepared_variants` (`pyq_question_id`);--> statement-breakpoint

-- Expected / demo questions per syllabus topic (no official PYQ stem)
CREATE TABLE IF NOT EXISTS `mains_topic_expected_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL,
	`marks` integer NOT NULL,
	`word_limit_hint` integer,
	`question_hi` text NOT NULL,
	`question_en` text,
	`sort_order` integer DEFAULT 0,
	`source_label` text DEFAULT 'expected',
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`exam_type` text DEFAULT 'mppsc_mains' NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `mains_topics`(`id`) ON DELETE CASCADE
);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS `idx_mains_expected_topic` ON `mains_topic_expected_questions` (`topic_id`);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS `idx_mains_expected_marks` ON `mains_topic_expected_questions` (`topic_id`,`marks`);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `mains_topic_expected_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`expected_question_id` text NOT NULL,
	`variant_slot` integer NOT NULL,
	`style_label` text,
	`structure_breakdown` text,
	`answer_hi` text NOT NULL,
	`answer_en` text,
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`expected_question_id`) REFERENCES `mains_topic_expected_questions`(`id`) ON DELETE CASCADE
);--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS `idx_mains_expected_var_unique` ON `mains_topic_expected_variants` (`expected_question_id`,`variant_slot`);--> statement-breakpoint

-- Optional fine link: which PYQ stems are "closest" to which topic (badges / UX)
CREATE TABLE IF NOT EXISTS `mains_topic_pyq_links` (
	`topic_id` text NOT NULL,
	`pyq_question_id` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	PRIMARY KEY (`topic_id`, `pyq_question_id`),
	FOREIGN KEY (`topic_id`) REFERENCES `mains_topics`(`id`) ON DELETE CASCADE,
	FOREIGN KEY (`pyq_question_id`) REFERENCES `mains_pyq_questions`(`id`) ON DELETE CASCADE
);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS `idx_mains_topic_pyq_q` ON `mains_topic_pyq_links` (`pyq_question_id`);--> statement-breakpoint
