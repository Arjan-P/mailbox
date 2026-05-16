import { FastifyBaseLogger } from 'fastify';
import { prisma } from '../../config/prisma.js';
// import { redis } from '../../config/redis.js';
// import {
//   PROFILE_CACHE_TTL,
//   profileCacheKey,
//   MESSAGES_CACHE_TTL,
//   messagesCacheKey,
//   MESSAGE_CACHE_TTL,
//   messageCacheKey,
//   invalidateMessagesCache,
// } from '../../utils/redis.js';
import { createGmailClient } from './gmail.client.js';
import {
  GmailMessageDetail,
  GmailMessages,
  GmailMessagesQuery,
  GmailProfile,
  GmailSendMessage,
  GmailSentMessage,
} from './gmail.schema.js';
import { extractMessageBody } from './gmail.utils.js';
import { chunk } from '../../utils/chunk.js';
import { AppError } from '../../errors/AppError.js';
import {
  buildReferencesHeader,
  buildRfc2822Message,
  extractMessageId,
} from './gmail.rfc2822.js';

// TODO: redo caching, invalidation
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
}

async function getProfile(
  userId: string,
  log: FastifyBaseLogger,
): Promise<GmailProfile> {
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

  return result;
}

async function listMessages(
  userId: string,
  query: GmailMessagesQuery,
  log: FastifyBaseLogger,
): Promise<GmailMessages> {
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

  return result;
}

async function sendMessage(
  userId: string,
  payLoad: GmailSendMessage,
  log: FastifyBaseLogger,
): Promise<GmailSentMessage> {
  const gmail = await createGmailClient(userId, log);

  const profile = await gmail.users.getProfile({
    userId: 'me',
    fields: 'emailAddress',
  });

  const from = profile.data.emailAddress;

  if (!from) {
    throw new AppError(
      'Could not resolve sender email address',
      500,
      'INTERNAL_SERVER_ERROR',
    );
  }

  const raw = buildRfc2822Message({
    from,
    to: payLoad.to,
    subject: payLoad.subject,
    body: payLoad.body,
    cc: payLoad.cc,
  });

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });

  log.info({ userId, messageId: res.data.id }, '[gmail] Message sent');

  // A new sent message doesn't invalidate the inbox list, but we do
  // invalidate the messages cache in case the user is viewing Sent.

  return {
    id: res.data.id ?? '',
    threadId: res.data.threadId ?? '',
    labelIds: res.data.labelIds ?? [],
  };
}

async function replyToMessage(
  userId: string,
  messageId: string,
  body: string,
  log: FastifyBaseLogger,
): Promise<GmailSentMessage> {
  const gmail = await createGmailClient(userId, log);

  const original = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'metadata',
    metadataHeaders: ['From', 'To', 'Subject', 'Message-ID', 'References'],
    fields: 'id,threadId,payload/headers',
  });

  const headers = original.data.payload?.headers ?? [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ??
    '';

  const originalFrom = getHeader('From');
  const originalSubject = getHeader('Subject');
  const originalMessageId = extractMessageId(headers);
  const threadId = original.data.threadId;

  if (!originalFrom) {
    throw new AppError(
      'Original message is missing From header — cannot reply',
      500,
      'INTERNAL_SERVER_ERROR',
    );
  }

  if (!originalMessageId) {
    throw new AppError(
      'Original message is missing Message-ID header — cannot thread reply correctly',
      500,
      'INTERNAL_SERVER_ERROR',
    );
  }

  // Resolve the sender's email address
  const profile = await gmail.users.getProfile({
    userId: 'me',
    fields: 'emailAddress',
  });

  const from = profile.data.emailAddress;

  if (!from) {
    throw new AppError(
      'Could not resolve sender email address',
      500,
      'INTERNAL_SERVER_ERROR',
    );
  }

  const reSubject = /^re:/i.test(originalSubject)
    ? originalSubject
    : `Re: ${originalSubject}`;

  const raw = buildRfc2822Message({
    from,
    to: [originalFrom],
    subject: reSubject,
    body,
    inReplyTo: originalMessageId,
    references: buildReferencesHeader(headers, originalMessageId),
  });

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw,
      threadId: threadId ?? undefined,
    },
  });

  log.info({ userId, messageId: res.data.id, threadId }, '[gmail] Reply sent');

  // Invalidate the individual message cache so the reply appears immediately
  // if the user refreshes, and invalidate the messages list cache.

  return {
    id: res.data.id ?? '',
    threadId: res.data.threadId ?? '',
    labelIds: res.data.labelIds ?? [],
  };
}

export const GmailService = {
  connectGoogleAccount,
  getProfile,
  listMessages,
  getMessage,
  sendMessage,
  replyToMessage,
};
