import pino from 'pino';
import { PinoLoggerOptions } from 'fastify/types/logger.js';

import { env } from './env/env.js';
const isDev = env.NODE_ENV === 'development';

export const loggerConfig: PinoLoggerOptions = {
  level: env.LOG_LEVEL,

  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }),

  timestamp: pino.stdTimeFunctions.isoTime,

  formatters: {
    level(label) {
      return { level: label };
    },
  },

  redact: ['req.headers.authorization', 'SESSION_SECRET'],
};
