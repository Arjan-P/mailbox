import { redis } from '../config/redis.js';
import type { GmailMessagesQuery } from '../modules/gmail/gmail.schema.js';

export const MESSAGES_CACHE_TTL = 60;
export const MESSAGE_CACHE_TTL = 300;
export const PROFILE_CACHE_TTL = 30;

// TODO: invalidate cached message
export async function invalidateMessagesCache(userId: string): Promise<void> {
  const pattern = `gmail_messages:${userId}:*`;
  let cursor = '0';

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      100,
    );

    cursor = nextCursor;

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } while (cursor !== '0');
}

export function messagesCacheKey(userId: string, query: GmailMessagesQuery) {
  return `gmail_messages:${userId}:${query.maxResults ?? 20}:${query.pageToken ?? ''}`;
}

export function messageCacheKey(userId: string, messageId: string) {
  return `gmail_message:${userId}:${messageId}`;
}

export function profileCacheKey(userId: string) {
  return `gmail_profile:${userId}`;
}
