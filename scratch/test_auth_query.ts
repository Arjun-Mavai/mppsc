import { db } from './src/db';
import { mppscUsers } from './src/db/schema';
import { eq, isNull, and } from 'drizzle-orm';

async function testAuthQuery() {
  try {
    console.log('Running auth query test...');
    const users = await db
      .select()
      .from(mppscUsers)
      .where(
        and(
          eq(mppscUsers.id, 'test-id'), // Just a test ID
          isNull(mppscUsers.deletedAt),
          eq(mppscUsers.isActive, true)
        )
      )
      .limit(1);
    console.log('✅ Query successful! Result count:', users.length);
  } catch (error) {
    console.error('❌ Query failed:', error);
  } finally {
    process.exit(0);
  }
}

testAuthQuery();
