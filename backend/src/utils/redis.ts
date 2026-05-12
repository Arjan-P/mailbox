import type { GmailMessagesQuery } from '../modules/gmail/gmail.schema.js';

export const MESSAGES_CACHE_TTL = 60;
export const PROFILE_CACHE_TTL = 30;

export function messagesCacheKey(userId: string, query: GmailMessagesQuery) {
  return `gmail_messages:${userId}:${query.maxResults ?? 20}:${query.pageToken ?? ''}`;
}

export function profileCacheKey(userId: string) {
  return `gmail_profile:${userId}`;
}
