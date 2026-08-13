CREATE TABLE `user_bookmarks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`target_type` text DEFAULT 'mains_pyq' NOT NULL,
	`target_id` text NOT NULL,
	`paper_id` text,
	`exam_year` integer,
	`paper_number` integer,
	`part` text,
	`unit_number` integer,
	`marks` integer,
	`question_stem` text,
	`notes` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `mppsc_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_user_target_unique` ON `user_bookmarks` (`user_id`,`target_type`,`target_id`);--> statement-breakpoint
CREATE INDEX `idx_user_bookmarks_user_target` ON `user_bookmarks` (`user_id`,`target_type`);--> statement-breakpoint
CREATE INDEX `idx_user_bookmarks_year_paper` ON `user_bookmarks` (`user_id`,`exam_year`,`paper_number`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pricing_config` (
	`exam_type` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	`lite_price` integer DEFAULT 99,
	`lite_original_price` integer DEFAULT 299,
	`lite_validity_text` text DEFAULT 'Valid till Exam',
	`lite_months` integer DEFAULT 6,
	`pro_price` integer DEFAULT 299,
	`pro_original_price` integer DEFAULT 999,
	`pro_validity_text` text DEFAULT 'Valid for 6 Months',
	`pro_months` integer DEFAULT 6,
	`upgrade_price` integer DEFAULT 199,
	`upgrade_original_price` integer DEFAULT 299,
	`mains_price` integer DEFAULT 1499,
	`mains_original_price` integer DEFAULT 2499,
	`mains_validity_text` text DEFAULT 'Valid for 6 Months',
	`mains_months` integer DEFAULT 6,
	`combo_price` integer DEFAULT 2499,
	`combo_original_price` integer DEFAULT 3999,
	`combo_validity_text` text DEFAULT 'Pre + Mains — Valid for 6 Months',
	`combo_months` integer DEFAULT 6,
	`renewal_pro_price` integer DEFAULT 299,
	`renewal_pro_original_price` integer DEFAULT 999,
	`renewal_mains_price` integer DEFAULT 399,
	`renewal_mains_original_price` integer DEFAULT 1499,
	`renewal_combo_price` integer DEFAULT 499,
	`renewal_combo_original_price` integer DEFAULT 599,
	`mppsc_product_copy_json` text,
	`urgency_text` text DEFAULT 'Special Offer',
	`urgency_text_hi` text DEFAULT 'विशेष ऑफर',
	`students_bought` integer DEFAULT 23,
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
INSERT INTO `__new_pricing_config`("exam_type", "lite_price", "lite_original_price", "lite_validity_text", "lite_months", "pro_price", "pro_original_price", "pro_validity_text", "pro_months", "upgrade_price", "upgrade_original_price", "mains_price", "mains_original_price", "mains_validity_text", "mains_months", "combo_price", "combo_original_price", "combo_validity_text", "combo_months", "renewal_pro_price", "renewal_pro_original_price", "renewal_mains_price", "renewal_mains_original_price", "renewal_combo_price", "renewal_combo_original_price", "mppsc_product_copy_json", "urgency_text", "urgency_text_hi", "students_bought", "updated_at") SELECT "exam_type", "lite_price", "lite_original_price", "lite_validity_text", "lite_months", "pro_price", "pro_original_price", "pro_validity_text", "pro_months", "upgrade_price", "upgrade_original_price", "mains_price", "mains_original_price", "mains_validity_text", "mains_months", "combo_price", "combo_original_price", "combo_validity_text", "combo_months", "renewal_pro_price", "renewal_pro_original_price", "renewal_mains_price", "renewal_mains_original_price", "renewal_combo_price", "renewal_combo_original_price", "mppsc_product_copy_json", "urgency_text", "urgency_text_hi", "students_bought", "updated_at" FROM `pricing_config`;--> statement-breakpoint
DROP TABLE `pricing_config`;--> statement-breakpoint
ALTER TABLE `__new_pricing_config` RENAME TO `pricing_config`;--> statement-breakpoint
PRAGMA foreign_keys=ON;