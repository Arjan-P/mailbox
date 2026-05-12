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

  FRONTEND_URL: z.string(),

  DATABASE_URL: z.string(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z
    .string()
    .transform(Number)
    .refine((val) => !isNaN(val), { message: 'PORT must be a number' }),

  OTEL_EXPORTER_OTLP_ENDPOINT: z.string(),

  COOKIE_SECRET: z.string(),

  CLERK_PUBLISHABLE_KEY: z.string(),

  CLERK_SECRET_KEY: z.string(),

  CLERK_WEBHOOK_SECRET: z.string(),

  GOOGLE_CLIENT_ID: z.string(),

  GOOGLE_CLIENT_SECRET: z.string(),

  GOOGLE_CALLBACK_URL: z.string(),

  // SESSION_SECRET: z.string()
});
