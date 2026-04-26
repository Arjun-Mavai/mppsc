ALTER TABLE `guests` ADD `lead_source` text;
CREATE INDEX `idx_guests_lead_source` ON `guests` (`lead_source`);
