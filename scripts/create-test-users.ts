import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const testUsers = [
  {
    email: 'pre.only@test.mppsc.in',
    password: 'PreTest@123456',
    name: 'Pre Student',
    planTier: 'pro' as const,
    isSubscribed: true,
    accessGrants: '["mppsc_pre"]',
    examType: 'mppsc' as const,
    description: 'User with PRE-only access (no mains)'
  },
  {
    email: 'mains.only@test.mppsc.in',
    password: 'MainsTest@123456',
    name: 'Mains Student',
    planTier: 'free' as const,
    isSubscribed: false,
    accessGrants: '["mppsc_mains"]',
    examType: 'mppsc' as const,
    description: 'User with MAINS-only access (no pre access)'
  },
  {
    email: 'combo.student@test.mppsc.in',
    password: 'ComboTest@123456',
    name: 'Combo Student',
    planTier: 'pro' as const,
    isSubscribed: true,
    accessGrants: '["mppsc_pre","mppsc_mains"]',
    examType: 'mppsc' as const,
    description: 'User with both PRE and MAINS access'
  }
];

async function createTestUsers() {
  try {
    console.log('🚀 Creating test users...\n');
    
    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const userId = uuidv4();
      
      // Check if user exists
      const existing = await db.query.mppscUsers.findFirst({
        where: (u) => u.email === user.email,
      });
      
      if (!existing) {
        await db.insert(mppscUsers).values({
          id: userId,
          email: user.email,
          password: hashedPassword,
          name: user.name,
          planTier: user.planTier,
          isSubscribed: user.isSubscribed,
          accessGrants: user.accessGrants,
          examType: user.examType,
          isActive: true,
          role: 'guest',
          accessExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          category: 'UR',
          gender: 'M',
        });
        console.log(`✅ Created: ${user.email}`);
      } else {
        console.log(`ℹ️  Exists: ${user.email}`);
      }
    }
    
    console.log('\n📋 TEST USERS CREATED - Use These Credentials:\n');
    console.log('═'.repeat(70));
    testUsers.forEach((u, i) => {
      console.log(`\n📌 Test User ${i + 1}: ${u.name}`);
      console.log(`   Email:    ${u.email}`);
      console.log(`   Password: ${u.password}`);
      console.log(`   Access:   ${u.accessGrants}`);
      console.log(`   Type:     ${u.description}`);
    });
    console.log('\n' + '═'.repeat(70));
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createTestUsers();
