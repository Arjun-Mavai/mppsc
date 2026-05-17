CREATE TABLE IF NOT EXISTS `mains_pyq_papers` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL UNIQUE,
	`exam_year` integer NOT NULL,
	`paper_number` integer NOT NULL,
	`exam_label` text,
	`title_hi` text,
	`title_en` text,
	`raw_json` text,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_mains_pyq_papers_year_paper` ON `mains_pyq_papers` (`exam_year`,`paper_number`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `mains_pyq_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`paper_id` text NOT NULL REFERENCES `mains_pyq_papers`(`id`) ON DELETE CASCADE,
	`part` text NOT NULL,
	`unit_number` integer NOT NULL,
	`unit_title_hi` text,
	`unit_title_en` text,
	`question_number` text NOT NULL,
	`marks` integer NOT NULL,
	`question_type` text NOT NULL,
	`question_hi` text NOT NULL,
	`question_en` text,
	`display_order` integer DEFAULT 0
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_mains_pyq_q_paper` ON `mains_pyq_questions` (`paper_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_mains_pyq_q_unit` ON `mains_pyq_questions` (`paper_id`,`part`,`unit_number`);
