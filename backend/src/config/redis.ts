import type { RedisOptions } from 'ioredis';
import { env } from './env/env.js';

export const redisOptions: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
};
