import { db } from './src/db';
import { mppscUsers } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function checkUsers() {
  try {
    console.log('🔍 Checking for test users in Turso...\n');
    
    const testEmails = [
      'pre.only@test.mppsc.in',
      'mains.only@test.mppsc.in',
      'combo.student@test.mppsc.in'
    ];
    
    for (const email of testEmails) {
      const user = await db
        .select({
          id: mppscUsers.id,
          email: mppscUsers.email,
          name: mppscUsers.name,
          accessGrants: mppscUsers.accessGrants,
          planTier: mppscUsers.planTier,
          isSubscribed: mppscUsers.isSubscribed,
          accessExpiresAt: mppscUsers.accessExpiresAt,
        })
        .from(mppscUsers)
        .where(eq(mppscUsers.email, email))
        .limit(1);
      
      if (user.length > 0) {
        const u = user[0];
        console.log(`✅ FOUND: ${email}`);
        console.log(`   ID: ${u.id}`);
        console.log(`   Name: ${u.name}`);
        console.log(`   Access: ${u.accessGrants}`);
        console.log(`   Tier: ${u.planTier}`);
        console.log(`   Subscribed: ${u.isSubscribed}`);
        console.log(`   Expires: ${u.accessExpiresAt}\n`);
      } else {
        console.log(`❌ NOT FOUND: ${email}\n`);
      }
    }
    
    // Also check all users
    console.log('\n📊 Total Users in Database:\n');
    const allUsers = await db
      .select({
        email: mppscUsers.email,
        name: mppscUsers.name,
        accessGrants: mppscUsers.accessGrants,
        planTier: mppscUsers.planTier,
      })
      .from(mppscUsers)
      .limit(10);
    
    if (allUsers.length > 0) {
      allUsers.forEach(u => {
        console.log(`📧 ${u.email}`);
        console.log(`   Name: ${u.name}`);
        console.log(`   Access: ${u.accessGrants}`);
        console.log(`   Tier: ${u.planTier}\n`);
      });
    } else {
      console.log('No users found in database!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkUsers();
