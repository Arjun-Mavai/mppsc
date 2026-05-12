-- MPPSC mains/combo SKU columns + optional JSON for marketing/thank-you/email copy (scoped in app to mppsc row).
ALTER TABLE `pricing_config` ADD `mains_price` integer DEFAULT 1499;
ALTER TABLE `pricing_config` ADD `mains_original_price` integer DEFAULT 2499;
ALTER TABLE `pricing_config` ADD `mains_validity_text` text DEFAULT 'Valid till MPPSC 2026 Mains';
ALTER TABLE `pricing_config` ADD `mains_months` integer DEFAULT 12;
ALTER TABLE `pricing_config` ADD `combo_price` integer DEFAULT 2499;
ALTER TABLE `pricing_config` ADD `combo_original_price` integer DEFAULT 3999;
ALTER TABLE `pricing_config` ADD `combo_validity_text` text DEFAULT 'Pre + Mains — full access';
ALTER TABLE `pricing_config` ADD `combo_months` integer DEFAULT 12;
ALTER TABLE `pricing_config` ADD `mppsc_product_copy_json` text;
