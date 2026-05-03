import { Queue } from 'bullmq';

import { redisOptions } from '../config/redis.js';

const queues = new Map<string, Queue>();

export function getQueue(name: string) {
  if (!queues.has(name)) {
    queues.set(name, new Queue(name, { connection: redisOptions }));
  }
  return queues.get(name)!;
}
