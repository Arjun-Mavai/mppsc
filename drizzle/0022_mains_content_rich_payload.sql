-- Optional JSON blob for Paper-I "History Rich" / extended mains payloads (bilingual structured notes).
ALTER TABLE `mains_content` ADD COLUMN `rich_payload` text;
