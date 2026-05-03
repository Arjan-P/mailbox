import type { RedisOptions } from 'ioredis';

export const redisOptions: RedisOptions = {
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
};
