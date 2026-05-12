import type { GmailMessagesQuery } from '../modules/gmail/gmail.schema.js';

export const MESSAGES_CACHE_TTL = 60;
export const MESSAGE_CACHE_TTL = 300;
export const PROFILE_CACHE_TTL = 30;

export function messagesCacheKey(userId: string, query: GmailMessagesQuery) {
  return `gmail_messages:${userId}:${query.maxResults ?? 20}:${query.pageToken ?? ''}`;
}

// TODO:
// Invalidate the cache when:
// marking messages read/unread
// modifying labels
// deleting messages
// Compressing large message bodies before caching if emails can be huge.

export function messageCacheKey(userId: string, messageId: string) {
  return `gmail_message:${userId}:${messageId}`;
}

export function profileCacheKey(userId: string) {
  return `gmail_profile:${userId}`;
}
