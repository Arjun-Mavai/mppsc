import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migratePricing() {
  try {
    console.log('🚀 Starting safe pricing migration...');

    // 1. Clean up old backup table if it exists, then rename current table
    await client.execute(`DROP TABLE IF EXISTS pricing_config_old`);
    await client.execute(`ALTER TABLE pricing_config RENAME TO pricing_config_old`);
    console.log('✅ Prepared backup in pricing_config_old');

    // 2. Create new table with exam_type as primary key
    await client.execute(`
      CREATE TABLE pricing_config (
        exam_type TEXT PRIMARY KEY,
        lite_price INTEGER DEFAULT 99,
        lite_original_price INTEGER DEFAULT 299,
        lite_validity_text TEXT DEFAULT 'Valid till Exam',
        lite_months INTEGER DEFAULT 8,
        pro_price INTEGER DEFAULT 299,
        pro_original_price INTEGER DEFAULT 999,
        pro_validity_text TEXT DEFAULT 'Valid for 1 Year',
        pro_months INTEGER DEFAULT 12,
        upgrade_price INTEGER DEFAULT 199,
        upgrade_original_price INTEGER DEFAULT 299,
        urgency_text TEXT DEFAULT 'Special Offer',
        urgency_text_hi TEXT DEFAULT 'विशेष ऑफर',
        students_bought INTEGER DEFAULT 23,
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
    console.log('✅ Created new pricing_config table');

    // 3. Migrate data from old table to 'mppsc' entry
    await client.execute(`
      INSERT INTO pricing_config (
        exam_type, lite_price, lite_original_price, lite_validity_text, lite_months,
        pro_price, pro_original_price, pro_validity_text, pro_months,
        upgrade_price, upgrade_original_price, urgency_text, urgency_text_hi,
        students_bought
      )
      SELECT 
        'mppsc', lite_price, lite_original_price, lite_validity_text, lite_months,
        pro_price, pro_original_price, pro_validity_text, pro_months,
        upgrade_price, upgrade_original_price, urgency_text, urgency_text_hi,
        students_bought
      FROM pricing_config_old
      WHERE id = 'default'
      LIMIT 1
    `);
    console.log('✅ Migrated mppsc data from old table');

    // 4. Add default entries for upsc and mppolice
    await client.execute(`
      INSERT INTO pricing_config (exam_type, lite_price, pro_price)
      VALUES 
        ('upsc', 499, 999),
        ('mppolice', 49, 149)
      ON CONFLICT(exam_type) DO NOTHING
    `);
    console.log('✅ Added default entries for upsc and mppolice');

    console.log('🎉 Migration successful!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

migratePricing();
