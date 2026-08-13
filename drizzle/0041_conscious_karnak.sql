ALTER TABLE `mppsc_users` ADD `last_renewed_at` integer;--> statement-breakpoint
ALTER TABLE `mppsc_users` ADD `renewal_count` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `payments` ADD `payment_type` text DEFAULT 'new';