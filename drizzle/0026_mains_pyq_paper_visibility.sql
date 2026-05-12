-- Admin: hide papers from student PYQ library & prompt pools without deleting stems.
ALTER TABLE `mains_pyq_papers` ADD COLUMN `is_hidden` integer DEFAULT 0 NOT NULL;
