ALTER TABLE `intelligence_feedback` ADD `admin_reply` text;--> statement-breakpoint
ALTER TABLE `intelligence_feedback` ADD `replied_at` integer;--> statement-breakpoint
ALTER TABLE `intelligence_feedback` ADD `replied_by` text;--> statement-breakpoint
CREATE INDEX `idx_intel_feedback_user` ON `intelligence_feedback` (`user_id`);