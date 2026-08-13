CREATE TABLE `testimonials` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'Aspirant',
	`location` text,
	`comment` text NOT NULL,
	`image` text,
	`stars` integer DEFAULT 5,
	`is_active` integer DEFAULT true,
	`display_order` integer DEFAULT 0,
	`exam_type` text DEFAULT 'mppsc' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE INDEX `idx_testimonials_active` ON `testimonials` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_testimonials_order` ON `testimonials` (`display_order`);