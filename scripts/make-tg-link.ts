import { sendTelegramNotification } from '../src/lib/telegram';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const text = process.argv[2];
  const url = process.argv[3];

  if (!text || !url) {
    console.error('❌ Please provide both Text and URL.');
    console.log('Usage: npm run tg-link "Your Text" "https://your-link.com"');
    process.exit(1);
  }

  const message = `🔗 <b>Link Generator (MPPSC Admin)</b>\n\nCopy the text below:\n👉 <a href="${url}">${text}</a>`;

  await sendTelegramNotification(message);
  console.log(`✅ Link generated and sent to Telegram! Text: "${text}" | URL: "${url}"`);
}

run().catch(console.error);
