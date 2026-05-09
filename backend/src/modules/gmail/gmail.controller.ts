import { getAuth } from '@clerk/fastify';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ok } from '../../utils/response.js';
import { AuthenticationError } from '../../errors/AuthenticationError.js';
import { GmailService } from './gmail.service.js';
import { GmailMessagesQuery } from './gmail.schema.js';
import { env } from '../../config/env/env.js';

async function handleCallback(req: FastifyRequest, reply: FastifyReply) {
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

  return reply.redirect(`${env.FRONTEND_URL}/dashboard?gmail=connected`);
  return ok({ received: true as const });
}

async function getProfile(req: FastifyRequest) {
  const { userId, isAuthenticated } = getAuth(req);

  if (!isAuthenticated) {
    throw new AuthenticationError();
  }

  const profile = await GmailService.getProfile(userId);

  return ok(profile);
}

async function getMessages(
  req: FastifyRequest<{
    Querystring: GmailMessagesQuery;
  }>,
) {
  const { userId, isAuthenticated } = getAuth(req);

  if (!isAuthenticated) {
    throw new AuthenticationError();
  }

  const messages = await GmailService.listMessages(userId, req.query);

  return ok(messages);
}

export const GmailController = {
  handleCallback,
  getProfile,
  getMessages,
};
