import { createClient } from "@libsql/client";
import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

console.log("Applying WhatsApp & Telegram tables to production...");

await client.execute(`
CREATE TABLE IF NOT EXISTS \`whatsapp_campaign_logs\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`guest_id\` text NOT NULL,
	\`message_id\` text NOT NULL,
	\`status\` text DEFAULT 'SENT' NOT NULL,
	\`created_at\` integer DEFAULT (strftime('%s', 'now')),
	\`updated_at\` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (\`guest_id\`) REFERENCES \`guests\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
`);

await client.execute(`
CREATE TABLE IF NOT EXISTS \`support_conversations\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`platform\` text NOT NULL,
	\`guest_id\` text,
	\`guest_name\` text,
	\`guest_phone\` text,
	\`language\` text DEFAULT 'PENDING',
	\`status\` text DEFAULT 'open',
	\`unread_count\` integer DEFAULT 0,
	\`last_message_at\` integer DEFAULT (strftime('%s', 'now')),
	\`created_at\` integer DEFAULT (strftime('%s', 'now')),
	\`updated_at\` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (\`guest_id\`) REFERENCES \`guests\`(\`id\`) ON UPDATE no action ON DELETE no action
);
`);

await client.execute(`
CREATE TABLE IF NOT EXISTS \`support_messages\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`conversation_id\` text NOT NULL,
	\`sender\` text NOT NULL,
	\`text\` text NOT NULL,
	\`message_type\` text DEFAULT 'text',
	\`created_at\` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (\`conversation_id\`) REFERENCES \`support_conversations\`(\`id\`) ON UPDATE no action ON DELETE cascade
);
`);

console.log("Successfully deployed new tables to Turso!");
