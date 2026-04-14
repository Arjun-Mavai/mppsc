
import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  TURSO_DATABASE_URL: z.string().url(),
  TURSO_AUTH_TOKEN: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  USE_PROD_DB: z.string().optional().default('false'),
});

try {
  console.log('Validating environment variables...');
  const env = envSchema.parse(process.env);
  console.log('Validation successful!');
  console.log('NODE_ENV:', env.NODE_ENV);
  console.log('USE_PROD_DB:', env.USE_PROD_DB);
} catch (error) {
  console.error('Validation failed!');
  console.error(error);
  process.exit(1);
}
