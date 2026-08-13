ALTER TABLE `support_conversations` ADD `human_active` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `support_messages` ADD `media_url` text;--> statement-breakpoint
ALTER TABLE `tests` ADD `is_instant_mode` integer DEFAULT false;