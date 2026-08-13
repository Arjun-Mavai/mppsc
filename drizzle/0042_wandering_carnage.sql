ALTER TABLE `pricing_config` ADD `renewal_pro_price` integer DEFAULT 299;--> statement-breakpoint
ALTER TABLE `pricing_config` ADD `renewal_pro_original_price` integer DEFAULT 999;--> statement-breakpoint
ALTER TABLE `pricing_config` ADD `renewal_mains_price` integer DEFAULT 499;--> statement-breakpoint
ALTER TABLE `pricing_config` ADD `renewal_mains_original_price` integer DEFAULT 1499;--> statement-breakpoint
ALTER TABLE `pricing_config` ADD `renewal_combo_price` integer DEFAULT 499;--> statement-breakpoint
ALTER TABLE `pricing_config` ADD `renewal_combo_original_price` integer DEFAULT 599;