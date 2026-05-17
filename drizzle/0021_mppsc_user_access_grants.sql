-- Product entitlements: JSON array e.g. ["mppsc_pre"] or ["mppsc_mains"] or both for combo.
-- Existing users: treat as Pre access (no behaviour change after backfill).
ALTER TABLE `mppsc_users` ADD COLUMN `access_grants` text;
UPDATE `mppsc_users` SET `access_grants` = '["mppsc_pre"]' WHERE `access_grants` IS NULL OR trim(`access_grants`) = '' OR trim(`access_grants`) = '[]';
