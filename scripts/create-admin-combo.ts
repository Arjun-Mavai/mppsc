import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function createAdminComboUser() {
  const email = 'arjun.admin@mppsc.in';
  const password = 'AdminCombo@2026';
  
  try {
    console.log('🚀 Creating Admin Combo user...');
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    
    // Check if user exists
    const existing = await db.query.mppscUsers.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });
    
    if (!existing) {
      await db.insert(mppscUsers).values({
        id: userId,
        email: email,
        password: hashedPassword,
        name: 'Arjun Admin',
        role: 'admin',
        planTier: 'pro',
        isSubscribed: true,
        accessGrants: '["mppsc_pre","mppsc_mains"]',
        examType: 'mppsc',
        isActive: true,
        accessExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        category: 'UR',
        gender: 'M',
      });
      console.log(`✅ Admin user created successfully: ${email}`);
    } else {
      // Update existing user to admin + combo
      await db.update(mppscUsers)
        .set({
          role: 'admin',
          planTier: 'pro',
          isSubscribed: true,
          accessGrants: '["mppsc_pre","mppsc_mains"]',
          isActive: true
        })
        .where((u, { eq }) => eq(u.email, email));
      console.log(`✅ Existing user updated to Admin + Combo: ${email}`);
    }
    
    console.log('\n🔐 CREDENTIALS:');
    console.log('----------------------------');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('Role:     admin');
    console.log('Grants:   Pre + Mains (Combo)');
    console.log('----------------------------\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createAdminComboUser();
