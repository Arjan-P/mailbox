import { getAuth } from '@clerk/fastify';
import { FastifyRequest } from 'fastify';
import { ok } from '../../utils/response.js';
import { AuthenticationError } from '../../errors/AuthenticationError.js';
import { GmailService } from './gmail.service.js';

async function handleCallback(req: FastifyRequest) {
  const token =
    await req.server.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);

  const accessToken = token.token.access_token;

  if (!accessToken) {
    throw new Error('Missing access token');
  }

  //Use `getAuth()` to access `isAuthenticated` and the user's ID
  const { isAuthenticated, userId } = getAuth(req);

  if (!isAuthenticated) {
    throw new AuthenticationError();
  }

  await GmailService.connectGoogleAccount(userId, {
    accessToken,
    refreshToken: token.token.refresh_token,
    expiryDate: token.token.expires_at,
  });

  return ok({ received: true as const });
}

export const GmailController = {
  handleCallback,
};
