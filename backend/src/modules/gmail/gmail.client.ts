import { google } from 'googleapis';

import { prisma } from '../../config/prisma.js';
import { env } from '../../config/env/env.js';
import { AuthenticationError } from '../../errors/AuthenticationError.js';
import { FastifyBaseLogger } from 'fastify';

export async function createGmailClient(
  userId: string,
  log: FastifyBaseLogger,
) {
  const account = await prisma.googleAccount.findUnique({
    where: {
      userId,
    },
  });

  if (!account) {
    throw new AuthenticationError(
      'Google account not connected',
      'GOOGLE_AUTH_REQUIRED',
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_CALLBACK_URL,
  );

  oauth2Client.setCredentials({
    access_token: account.accessToken,
    refresh_token: account.refreshToken,
    expiry_date: account.expiryDate?.getTime() ?? undefined,
  });

  // Proactively refresh if token is expired or expires within 5 minutes
  const expiryDate = account.expiryDate?.getTime();
  const isExpiredOrStale =
    !expiryDate || expiryDate < Date.now() + 5 * 60 * 1000;

  if (isExpiredOrStale) {
    if (!account.refreshToken) {
      throw new AuthenticationError(
        'Google token expired and no refresh token available, please reconnect',
        'GOOGLE_AUTH_EXPIRED',
      );
    }
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);

      // Await the DB write before proceeding — if this fails, throw rather
      // than continuing with an in-memory token that won't survive a restart
      await prisma.googleAccount.update({
        where: { userId },
        data: {
          accessToken: credentials.access_token ?? account.accessToken,
          ...(credentials.refresh_token && {
            refreshToken: credentials.refresh_token,
          }),
          ...(credentials.expiry_date && {
            expiryDate: new Date(credentials.expiry_date),
          }),
        },
      });
    } catch (err) {
      // Refresh token itself is invalid/revoked — user must re-auth
      throw new AuthenticationError(
        'Google session expired, please reconnect your account',
        'GOOGLE_AUTH_EXPIRED',
        err,
      );
    }
  }

  oauth2Client.on('tokens', (tokens) => {
    prisma.googleAccount
      .update({
        where: { userId },
        data: {
          ...(tokens.access_token && { accessToken: tokens.access_token }),
          ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
          ...(tokens.expiry_date && {
            expiryDate: new Date(tokens.expiry_date),
          }),
        },
      })
      .catch((err) => {
        // Log but don't throw — the request can still succeed this time,
        // but ops should know persistence is broken
        log.error({ userId, err }, '[gmail] Failed to persist refreshed token');
      });
  });
  return google.gmail({
    version: 'v1',
    auth: oauth2Client,
  });
}
