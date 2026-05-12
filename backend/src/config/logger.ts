import pino from 'pino';
import { trace } from '@opentelemetry/api';
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
    // Inject traceId + spanId into every log line
    log(obj) {
      const span = trace.getActiveSpan();
      if (!span) return obj;
      const { traceId, spanId } = span.spanContext();
      return { ...obj, traceId, spanId };
    },
  },

  redact: ['req.headers.authorization', 'SESSION_SECRET'],
};
