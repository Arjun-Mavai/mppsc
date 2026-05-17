ALTER TABLE `mppsc_mains_users` ADD `session_version` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `mppsc_users` ADD `session_version` integer DEFAULT 1;