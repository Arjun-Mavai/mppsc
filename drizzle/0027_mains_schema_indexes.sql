CREATE INDEX `idx_mains_units_paper` ON `mains_units` (`paper_id`);--> statement-breakpoint
CREATE INDEX `idx_mains_units_order` ON `mains_units` (`paper_id`, `part`, `unit_number`);--> statement-breakpoint
CREATE INDEX `idx_mains_topics_unit` ON `mains_topics` (`unit_id`);
