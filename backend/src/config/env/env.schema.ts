import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z
    .string()
    .transform(Number)
    .refine((val) => !isNaN(val), { message: 'PORT must be a number' }),

  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),

  CLERK_PUBLISHABLE_KEY: z.string(),

  CLERK_SECRET_KEY: z.string(),

  CLERK_WEBHOOK_SECRET: z.string(),

  // SESSION_SECRET: z.string()
});
