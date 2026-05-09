import { google } from 'googleapis';

import { prisma } from '../../config/prisma.js';
import { env } from '../../config/env/env.js';

export async function createGmailClient(userId: string) {
  const account = await prisma.googleAccount.findUnique({
    where: {
      userId,
    },
  });

  if (!account) {
    throw new Error('Google account not connected');
  }

  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_CALLBACK_URL,
  );

  oauth2Client.setCredentials({
    access_token: account.accessToken,
    refresh_token: account.refreshToken,
  });

  oauth2Client.on('tokens', (tokens) => {
    void prisma.googleAccount.update({
      where: {
        userId,
      },

      data: {
        ...(tokens.access_token && {
          accessToken: tokens.access_token,
        }),

        ...(tokens.refresh_token && {
          refreshToken: tokens.refresh_token,
        }),

        ...(tokens.expiry_date && {
          expiryDate: new Date(tokens.expiry_date),
        }),
      },
    });
  });

  return google.gmail({
    version: 'v1',
    auth: oauth2Client,
  });
}
