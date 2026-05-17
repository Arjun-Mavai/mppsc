import { db } from './src/db';
import { verificationTokens } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const userId = '682c6cd2-3713-4871-9651-4279244bca47';
  const tokens = await db.query.verificationTokens.findMany({
    where: eq(verificationTokens.identifier, userId),
  });
  console.log("Tokens for combo user:", tokens);
}

main().catch(console.error);
