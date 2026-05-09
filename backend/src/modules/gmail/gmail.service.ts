import { prisma } from '../../config/prisma.js';
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

async function getProfile(userId: string): Promise<GmailProfile> {
  const gmail = await createGmailClient(userId);

  const profile = await gmail.users.getProfile({
    userId: 'me',
    fields: 'emailAddress,messagesTotal,threadsTotal,historyId',
  });

  return {
    emailAddress: profile.data.emailAddress ?? '',

    messagesTotal: profile.data.messagesTotal ?? 0,

    threadsTotal: profile.data.threadsTotal ?? 0,

    historyId: profile.data.historyId ?? '',
  };
}

async function listMessages(
  userId: string,
  query: GmailMessagesQuery,
): Promise<GmailMessages> {
  const gmail = await createGmailClient(userId);

  const list = await gmail.users.messages.list({
    userId: 'me',

    maxResults: query.maxResults ?? 20,

    pageToken: query.pageToken,

    fields: 'messages(id,threadId),nextPageToken,resultSizeEstimate',
  });

  const messageIds = list.data.messages ?? [];

  const messages = await Promise.all(
    messageIds.map(async (message) => {
      const full = await gmail.users.messages.get({
        userId: 'me',

        id: message.id!,

        format: 'metadata',

        metadataHeaders: ['From', 'Subject'],
      });

      const headers = full.data.payload?.headers ?? [];

      const getHeader = (name: string) =>
        headers.find(
          (header) => header.name?.toLowerCase() === name.toLowerCase(),
        )?.value ?? '';

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

  return {
    messages,

    nextPageToken: list.data.nextPageToken ?? undefined,

    resultSizeEstimate: list.data.resultSizeEstimate ?? undefined,
  };
}

async function getMessage(
  userId: string,
  id: string,
): Promise<GmailMessageDetail> {
  const gmail = await createGmailClient(userId);

  const message = await gmail.users.messages.get({
    userId: 'me',
    id,
    format: 'full',
  });

  const payload = message.data.payload;

  const headers = payload?.headers ?? [];

  const getHeader = (name: string) =>
    headers.find((header) => header.name?.toLowerCase() === name.toLowerCase())
      ?.value ?? '';

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
