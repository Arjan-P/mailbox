import { Redis } from 'ioredis';
import type { RedisOptions } from 'ioredis';
import { env } from './env/env.js';

export const redisOptions: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
};

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
});
