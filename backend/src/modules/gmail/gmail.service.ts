import { prisma } from '../../config/prisma.js';
import { createGmailClient } from './gmail.client.js';

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

async function getProfile(userId: string) {
  const gmail = await createGmailClient(userId);

  const profile = await gmail.users.getProfile({
    userId: 'me',
  });

  return profile.data;
}

async function listMessages(userId: string) {
  const gmail = await createGmailClient(userId);

  const messages = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 10,
  });

  return messages.data;
}

export const GmailService = {
  connectGoogleAccount,
  getProfile,
  listMessages,
};
