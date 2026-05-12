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

  // TODO: This is fire-and-forget — if the process restarts between a token refresh
  // and the DB write, the new token is lost and future requests will fail with 401.
  // Wrap in try/catch and await, or use a token-refresh middleware that persists
  // before the downstream API call proceeds.

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
