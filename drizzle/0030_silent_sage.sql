CREATE TABLE `support_conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`platform` text NOT NULL,
	`guest_id` text,
	`guest_name` text,
	`guest_phone` text,
	`language` text DEFAULT 'PENDING',
	`status` text DEFAULT 'open',
	`unread_count` integer DEFAULT 0,
	`last_message_at` integer DEFAULT (strftime('%s', 'now')),
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `support_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`sender` text NOT NULL,
	`text` text NOT NULL,
	`message_type` text DEFAULT 'text',
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`conversation_id`) REFERENCES `support_conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `whatsapp_campaign_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`guest_id` text NOT NULL,
	`message_id` text NOT NULL,
	`status` text DEFAULT 'SENT' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pricing_config` (
	`exam_type` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	`lite_price` integer DEFAULT 99,
	`lite_original_price` integer DEFAULT 299,
	`lite_validity_text` text DEFAULT 'Valid till Exam',
	`lite_months` integer DEFAULT 8,
	`pro_price` integer DEFAULT 299,
	`pro_original_price` integer DEFAULT 999,
	`pro_validity_text` text DEFAULT 'Valid for 1 Year',
	`pro_months` integer DEFAULT 12,
	`upgrade_price` integer DEFAULT 199,
	`upgrade_original_price` integer DEFAULT 299,
	`mains_price` integer DEFAULT 1499,
	`mains_original_price` integer DEFAULT 2499,
	`mains_validity_text` text DEFAULT 'Valid till MPPSC 2026 Mains',
	`mains_months` integer DEFAULT 12,
	`combo_price` integer DEFAULT 2499,
	`combo_original_price` integer DEFAULT 3999,
	`combo_validity_text` text DEFAULT 'Pre + Mains — full access',
	`combo_months` integer DEFAULT 12,
	`mppsc_product_copy_json` text,
	`urgency_text` text DEFAULT 'Special Offer',
	`urgency_text_hi` text DEFAULT 'विशेष ऑफर',
	`students_bought` integer DEFAULT 23,
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
INSERT INTO `__new_pricing_config`("exam_type", "lite_price", "lite_original_price", "lite_validity_text", "lite_months", "pro_price", "pro_original_price", "pro_validity_text", "pro_months", "upgrade_price", "upgrade_original_price", "mains_price", "mains_original_price", "mains_validity_text", "mains_months", "combo_price", "combo_original_price", "combo_validity_text", "combo_months", "mppsc_product_copy_json", "urgency_text", "urgency_text_hi", "students_bought", "updated_at") SELECT "exam_type", "lite_price", "lite_original_price", "lite_validity_text", "lite_months", "pro_price", "pro_original_price", "pro_validity_text", "pro_months", "upgrade_price", "upgrade_original_price", "mains_price", "mains_original_price", "mains_validity_text", "mains_months", "combo_price", "combo_original_price", "combo_validity_text", "combo_months", "mppsc_product_copy_json", "urgency_text", "urgency_text_hi", "students_bought", "updated_at" FROM `pricing_config`;--> statement-breakpoint
DROP TABLE `pricing_config`;--> statement-breakpoint
ALTER TABLE `__new_pricing_config` RENAME TO `pricing_config`;--> statement-breakpoint
PRAGMA foreign_keys=ON;