ALTER TABLE `chat_sessions` ADD `is_banned` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `chat_sessions` ADD `ban_expires_at` integer;