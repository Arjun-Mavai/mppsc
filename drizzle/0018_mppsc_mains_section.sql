CREATE TABLE IF NOT EXISTS `mains_papers` (
	`id` text PRIMARY KEY NOT NULL,
	`paper_number` integer NOT NULL,
	`title_hi` text NOT NULL,
	`title_en` text NOT NULL,
	`total_marks` integer NOT NULL,
	`duration_minutes` integer NOT NULL,
	`display_order` integer DEFAULT 0,
	`description` text,
	`exam_type` text DEFAULT 'mppsc_mains' NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `mains_units` (
	`id` text PRIMARY KEY NOT NULL,
	`paper_id` text REFERENCES `mains_papers`(`id`) ON DELETE CASCADE,
	`part` text DEFAULT 'NONE',
	`unit_number` integer NOT NULL,
	`title_hi` text NOT NULL,
	`title_en` text NOT NULL,
	`display_order` integer DEFAULT 0,
	`exam_type` text DEFAULT 'mppsc_mains' NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `mains_topics` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text REFERENCES `mains_units`(`id`) ON DELETE CASCADE,
	`title_hi` text NOT NULL,
	`title_en` text NOT NULL,
	`display_order` integer DEFAULT 0,
	`status` text DEFAULT 'draft',
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`exam_type` text DEFAULT 'mppsc_mains' NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `mppsc_mains_users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`email` text NOT NULL UNIQUE,
	`password` text NOT NULL,
	`name` text,
	`phone` text,
	`is_subscribed` integer DEFAULT 0,
	`plan_tier` text DEFAULT 'free',
	`access_expires_at` integer,
	`is_active` integer DEFAULT 1,
	`metadata` text,
	`deleted_at` integer
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_mains_users_email` ON `mppsc_mains_users` (`email`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `mains_content` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text UNIQUE REFERENCES `mains_topics`(`id`) ON DELETE CASCADE,
	`concept_hi` text NOT NULL,
	`concept_en` text NOT NULL,
	`expert_strategy_hi` text,
	`expert_strategy_en` text,
	`model_answers` text NOT NULL,
	`key_terms_hi` text,
	`key_terms_en` text,
	`practice_questions` text,
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	`exam_type` text DEFAULT 'mppsc_mains' NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `mains_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text REFERENCES `mppsc_mains_users`(`id`) ON DELETE CASCADE,
	`topic_id` text REFERENCES `mains_topics`(`id`) ON DELETE CASCADE,
	`status` text DEFAULT 'unseen',
	`last_reviewed_at` integer
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `idx_mains_progress_user_topic` ON `mains_progress` (`user_id`, `topic_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `mains_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text REFERENCES `mppsc_mains_users`(`id`) ON DELETE CASCADE,
	`topic_id` text REFERENCES `mains_topics`(`id`) ON DELETE CASCADE,
	`type` text NOT NULL,
	`message` text,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
