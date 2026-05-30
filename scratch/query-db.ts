import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;

async function run() {
  if (!url) {
    console.error('No TURSO_DATABASE_URL found');
    return;
  }
  console.log('Connecting to:', url);
  const client = createClient({ url, authToken: token });
  try {
    const result = await client.execute({
      sql: "SELECT id, title, content, ai_content FROM syllabus_topics WHERE title = 'षड्दर्शन' OR title_en = 'Shaddarshan'",
      args: []
    });
    console.log('Rows found:', result.rows.length);
    for (const row of result.rows) {
      console.log('TITLE:', row.title);
      console.log('CONTENT:', row.content);
      console.log('AI_CONTENT:', row.ai_content);
    }
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    client.close();
  }
}

run();
