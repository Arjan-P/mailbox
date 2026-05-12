import type { GmailMessagesQuery } from '../modules/gmail/gmail.schema.js';

export const MESSAGES_CACHE_TTL = 60;
export const PROFILE_CACHE_TTL = 30;

// TODO: Add MESSAGE_CACHE_TTL and messageCacheKey for individual message caching
// in gmail.service.ts getMessage(). Suggested TTL: 300 seconds (5 minutes).

export function messagesCacheKey(userId: string, query: GmailMessagesQuery) {
  return `gmail_messages:${userId}:${query.maxResults ?? 20}:${query.pageToken ?? ''}`;
}

export function profileCacheKey(userId: string) {
  return `gmail_profile:${userId}`;
}
