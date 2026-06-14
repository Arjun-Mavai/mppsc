import { z } from 'zod';

const envSchema = z.object({
  TURSO_DATABASE_URL: z.string().url(),
  TURSO_AUTH_TOKEN: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  USE_PROD_DB: z.string().optional().default('false'),
  WHATSAPP_ACCESS_TOKEN: z.string().min(1),
  WHATSAPP_PHONE_ID: z.string().min(1),
  WHATSAPP_VERIFY_TOKEN: z.string().min(1),
  WHATSAPP_APP_SECRET: z.string().min(1),
  NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER: z.string().default('917489388350'),
  NEXT_PUBLIC_SUPPORT_TELEGRAM_BOT_USERNAME: z.string().default('mppsc_conversation_bot'),
  TELEGRAM_HUMAN_REQUEST_BOT_TOKEN: z.string().optional(),
  TELEGRAM_HUMAN_REQUEST_CHAT_ID: z.string().optional(),
});

// "Bhai, agar env variables nahi mile toh yahi fat jayega"
// This ensures type safety and runtime validation for our environment variables
export const env = envSchema.parse(process.env);
