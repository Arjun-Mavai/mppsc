-- Expert-only coaching blocks per PYQ stem (bilingual), separate from model answer variants.
ALTER TABLE `mains_pyq_questions` ADD COLUMN `expert_insights_hi` text;
ALTER TABLE `mains_pyq_questions` ADD COLUMN `expert_insights_en` text;
