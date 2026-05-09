import { prisma } from '../../config/prisma.js';
import { createGmailClient } from './gmail.client.js';
import {
  GmailMessages,
  GmailMessagesQuery,
  GmailProfile,
} from './gmail.schema.js';

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

  const messages = await gmail.users.messages.list({
    userId: 'me',

    maxResults: query.maxResults ?? 10,

    pageToken: query.pageToken,

    fields: 'messages(id,threadId),nextPageToken,resultSizeEstimate',
  });

  return {
    messages:
      messages.data.messages?.map((message) => ({
        id: message.id ?? '',
        threadId: message.threadId ?? '',
      })) ?? [],

    nextPageToken: messages.data.nextPageToken ?? undefined,

    resultSizeEstimate: messages.data.resultSizeEstimate ?? undefined,
  };
}

export const GmailService = {
  connectGoogleAccount,
  getProfile,
  listMessages,
};
