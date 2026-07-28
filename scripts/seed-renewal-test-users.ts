// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧪 SEED RENEWAL TEST USERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Inserts 3 test accounts into local DB for testing renewal features:
// 1. expiring8@mppsc.test (8 days left -> triggers top warning banner)
// 2. expired@mppsc.test (expired 5 days ago -> triggers login redirect /renew)
// 3. combo.expiring@mppsc.test (5 days left -> combo plan early renewal)
// Password for all test users: password123
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local', override: true });

async function seedTestUsers() {
  const { db } = await import('../src/db');
  const { mppscUsers } = await import('../src/db/schema');
  const bcrypt = (await import('bcryptjs')).default;
  const { eq } = await import('drizzle-orm');
  const { v4: uuidv4 } = await import('uuid');

  console.log('🌱 Seeding Renewal Test Accounts into Database...');

  const hashedPassword = await bcrypt.hash('password123', 10);
  const now = Date.now();

  const testAccounts = [
    {
      id: uuidv4(),
      email: 'expiring8@mppsc.test',
      password: hashedPassword,
      name: 'Rohan Sharma (8 Days Left - Pro)',
      planTier: 'pro',
      isSubscribed: true,
      role: 'guest',
      category: 'UR',
      gender: 'M',
      accessExpiresAt: new Date(now + 8 * 24 * 60 * 60 * 1000), // 8 days in future
      accessGrants: JSON.stringify(['mppsc_pre', 'mppsc_mains']),
      renewalCount: 0,
    },
    {
      id: uuidv4(),
      email: 'expired@mppsc.test',
      password: hashedPassword,
      name: 'Priya Verma (Expired Pro Plan)',
      planTier: 'pro',
      isSubscribed: false,
      role: 'guest',
      category: 'OBC',
      gender: 'F',
      accessExpiresAt: new Date(now - 5 * 24 * 60 * 60 * 1000), // 5 days in past
      accessGrants: JSON.stringify(['mppsc_pre', 'mppsc_mains']),
      renewalCount: 0,
    },
    {
      id: uuidv4(),
      email: 'combo.expiring@mppsc.test',
      password: hashedPassword,
      name: 'Ankit Gupta (Combo Expiring - 5 Days)',
      planTier: 'pro',
      isSubscribed: true,
      role: 'guest',
      category: 'UR',
      gender: 'M',
      accessExpiresAt: new Date(now + 5 * 24 * 60 * 60 * 1000), // 5 days in future
      accessGrants: JSON.stringify(['mppsc_pre', 'mppsc_mains']),
      renewalCount: 0,
    },
  ];

  for (const account of testAccounts) {
    const existing = await db.query.mppscUsers.findFirst({
      where: eq(mppscUsers.email, account.email),
    });

    if (existing) {
      await db
        .update(mppscUsers)
        .set({
          password: account.password,
          name: account.name,
          planTier: account.planTier,
          isSubscribed: account.isSubscribed,
          accessExpiresAt: account.accessExpiresAt,
          accessGrants: account.accessGrants,
        })
        .where(eq(mppscUsers.id, existing.id));
      console.log(`✅ Updated existing test account: ${account.email}`);
    } else {
      await db.insert(mppscUsers).values(account);
      console.log(`✨ Created new test account: ${account.email}`);
    }
  }

  // Ensure DB pricing_config has renewal_mains_price = 399
  const { pricingConfig } = await import('../src/db/schema');
  await db
    .update(pricingConfig)
    .set({
      renewalMainsPrice: 399,
      renewalComboPrice: 499,
      renewalComboOriginalPrice: 599,
      renewalProPrice: 299,
    })
    .where(eq(pricingConfig.id, 'mppsc'));
  console.log('✅ Ensured pricing_config renewal_mains_price = 399 in database.');

  console.log('\n🎉 Test accounts ready! You can log in with password: password123');
}

seedTestUsers().catch((err) => {
  console.error('❌ Failed to seed test users:', err);
  process.exit(1);
});
