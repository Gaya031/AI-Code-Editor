import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url(),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid backend environment configuration');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

