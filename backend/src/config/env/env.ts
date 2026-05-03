import dotenv from 'dotenv';
import pino from 'pino';
import { z } from 'zod';

import { envSchema } from './env.schema.js';

const bootstrapLogger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
});

dotenv.config();

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  bootstrapLogger.error('Invalid environment variables');
  bootstrapLogger.error(`Error: ${z.prettifyError(parsed.error)}`);
  process.exit(1);
}

export const env = parsed.data;
