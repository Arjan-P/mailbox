import { FastifyBaseLogger } from 'fastify';
import { prisma } from '../../config/prisma.js';
import { redis } from '../../config/redis.js';
import {
  PROFILE_CACHE_TTL,
  profileCacheKey,
  MESSAGES_CACHE_TTL,
  messagesCacheKey,
  MESSAGE_CACHE_TTL,
  messageCacheKey,
} from '../../utils/redis.js';
import { createGmailClient } from './gmail.client.js';
import {
  GmailMessageDetail,
  GmailMessages,
  GmailMessagesQuery,
  GmailProfile,
} from './gmail.schema.js';
import { extractMessageBody } from './gmail.utils.js';
import { chunk } from '../../utils/chunk.js';

// TODO: add manual instrumentation for cache hit/miss, listMessages

async function connectGoogleAccount(
  userId: string,
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expiryDate?: Date | null;
  },
  log: FastifyBaseLogger,
) {
  if (!tokens.refreshToken) {
    log.warn(
      { userId },
      '[gmail] No refresh token on connect — user will need to re-auth when access token expires',
    );
  }
  await prisma.googleAccount.upsert({
    where: {
      userId,
    },

    update: {
      accessToken: tokens.accessToken,

      ...(tokens.refreshToken && {
        refreshToken: tokens.refreshToken,
      }),

      expiryDate: tokens.expiryDate ?? null,
    },

    create: {
      userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? '',
      expiryDate: tokens.expiryDate ?? null,
    },
  });
  await redis.del(profileCacheKey(userId));
}

async function getProfile(
  userId: string,
  log: FastifyBaseLogger,
): Promise<GmailProfile> {
  const cacheKey = profileCacheKey(userId);
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as GmailProfile;

  const gmail = await createGmailClient(userId, log);

  const profile = await gmail.users.getProfile({
    userId: 'me',
    fields: 'emailAddress,messagesTotal,threadsTotal,historyId',
  });

  const result: GmailProfile = {
    emailAddress: profile.data.emailAddress ?? '',

    messagesTotal: profile.data.messagesTotal ?? 0,

    threadsTotal: profile.data.threadsTotal ?? 0,

    historyId: profile.data.historyId ?? '',
  };

  await redis.set(cacheKey, JSON.stringify(result), 'EX', PROFILE_CACHE_TTL);

  return result;
}

async function listMessages(
  userId: string,
  query: GmailMessagesQuery,
  log: FastifyBaseLogger,
): Promise<GmailMessages> {
  const cacheKey = messagesCacheKey(userId, query);
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as GmailMessages;

  const gmail = await createGmailClient(userId, log);

  const list = await gmail.users.messages.list({
    userId: 'me',
    maxResults: query.maxResults ?? 20,
    pageToken: query.pageToken,
    // threadId is never used by the client — drop it
    fields: 'messages(id),nextPageToken,resultSizeEstimate',
  });

  const messageIds = (list.data.messages ?? []).filter((m) => m.id != null);

  const CHUNK_SIZE = 10;
  const messages: GmailMessages['messages'] = [];

  for (const batch of chunk(messageIds, CHUNK_SIZE)) {
    const results = await Promise.all(
      batch.map(async (message) => {
        const full = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject'],
          fields: 'id,threadId,snippet,internalDate,labelIds,payload/headers',
        });

        const headers = full.data.payload?.headers ?? [];
        const getHeader = (name: string) =>
          headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
            ?.value ?? '';

        return {
          id: full.data.id ?? '',
          threadId: full.data.threadId ?? '',
          subject: getHeader('Subject'),
          from: getHeader('From'),
          snippet: full.data.snippet ?? '',
          date: full.data.internalDate
            ? new Date(Number(full.data.internalDate)).toISOString()
            : null,
          unread: full.data.labelIds?.includes('UNREAD') ?? false,
          labels: full.data.labelIds ?? [],
        };
      }),
    );
    messages.push(...results);
  }

  const result: GmailMessages = {
    messages,
    nextPageToken: list.data.nextPageToken ?? undefined,
    resultSizeEstimate: list.data.resultSizeEstimate ?? undefined,
  };

  await redis.set(cacheKey, JSON.stringify(result), 'EX', MESSAGES_CACHE_TTL);

  return result;
}

async function getMessage(
  userId: string,
  id: string,
  log: FastifyBaseLogger,
): Promise<GmailMessageDetail> {
  const cacheKey = messageCacheKey(userId, id);
  const cached = await redis.get(cacheKey);

  if (cached) return JSON.parse(cached) as GmailMessageDetail;
  const gmail = await createGmailClient(userId, log);

  const message = await gmail.users.messages.get({
    userId: 'me',
    id,
    format: 'full',
    fields:
      'id,threadId,snippet,internalDate,labelIds,payload(headers,body,parts)',
  });

  const payload = message.data.payload;
  const headers = payload?.headers ?? [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ??
    '';

  const result: GmailMessageDetail = {
    id: message.data.id ?? '',
    threadId: message.data.threadId ?? '',
    subject: getHeader('Subject'),
    from: getHeader('From'),
    to: getHeader('To')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean),
    cc: getHeader('Cc')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean),
    snippet: message.data.snippet ?? '',
    body: extractMessageBody(payload),
    date: message.data.internalDate
      ? new Date(Number(message.data.internalDate)).toISOString()
      : new Date().toISOString(),
    unread: message.data.labelIds?.includes('UNREAD') ?? false,
    labels: message.data.labelIds ?? [],
  };

  await redis.set(cacheKey, JSON.stringify(result), 'EX', MESSAGE_CACHE_TTL);

  return result;
}

export const GmailService = {
  connectGoogleAccount,
  getProfile,
  listMessages,
  getMessage,
};
