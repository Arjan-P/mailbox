import { FastifyBaseLogger } from 'fastify';
import { prisma } from '../../config/prisma.js';
import { redis } from '../../config/redis.js';
import {
  PROFILE_CACHE_TTL,
  profileCacheKey,
  MESSAGES_CACHE_TTL,
  messagesCacheKey,
} from '../../utils/redis.js';
import { createGmailClient } from './gmail.client.js';
import {
  GmailMessageDetail,
  GmailMessages,
  GmailMessagesQuery,
  GmailProfile,
} from './gmail.schema.js';
import { extractMessageBody } from './gmail.utils.js';

async function connectGoogleAccount(
  userId: string,
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expiryDate?: Date | null;
  },
) {
  // TODO: Throw (or at minimum warn) when refreshToken is absent on first connect.
  // Google only issues a refresh token on the first authorization — storing an empty
  // string silently will cause failures when the access token expires.
  // Ensure the OAuth flow uses access_type: 'offline' and prompt: 'consent'.

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

  const messageIds = list.data.messages ?? [];

  // TODO: This is an N+1 problem — up to 100 individual Gmail API calls are made in
  // parallel when maxResults is at its maximum. Use Gmail's batch request API or chunk
  // the Promise.all into groups (e.g. 10 at a time) to avoid rate-limit errors (429s).
  // See: https://developers.google.com/gmail/api/guides/batch

  const messages = await Promise.all(
    messageIds.map(async (message) => {
      const full = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject'],
        // internalDate and labelIds aren't in the metadata payload headers,
        // they're top-level fields — include them explicitly
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
          : new Date().toISOString(),
        unread: full.data.labelIds?.includes('UNREAD') ?? false,
        labels: full.data.labelIds ?? [],
      };
    }),
  );

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

  return {
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
}

export const GmailService = {
  connectGoogleAccount,
  getProfile,
  listMessages,
  getMessage,
};
