import { getAuth } from '@clerk/fastify';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ok } from '../../utils/response.js';
import { AuthenticationError } from '../../errors/AuthenticationError.js';
import { GmailService } from './gmail.service.js';
import { GmailMessagesQuery } from './gmail.schema.js';
import { env } from '../../config/env/env.js';

async function startAuth(req: FastifyRequest, reply: FastifyReply) {
  const { isAuthenticated } = getAuth(req);

  if (!isAuthenticated) {
    throw new AuthenticationError();
  }

  return req.server.googleOAuth2.generateAuthorizationUri(req, reply);
}

async function handleCallback(req: FastifyRequest, reply: FastifyReply) {
  const token =
    await req.server.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
      req,
      reply,
    );

  const accessToken = token.token.access_token;

  if (!accessToken) {
    throw new AuthenticationError('Missing access token');
  }

  const { isAuthenticated, userId } = getAuth(req);

  if (!isAuthenticated) {
    throw new AuthenticationError();
  }

  await GmailService.connectGoogleAccount(
    userId,
    {
      accessToken,
      refreshToken: token.token.refresh_token,
      expiryDate: token.token.expires_at,
    },
    req.log,
  );

  return reply.redirect(`${env.FRONTEND_URL}/dashboard?gmail=connected`);
}

async function getProfile(req: FastifyRequest) {
  const { userId, isAuthenticated } = getAuth(req);

  if (!isAuthenticated) {
    throw new AuthenticationError();
  }

  const profile = await GmailService.getProfile(userId, req.log);

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

  const messages = await GmailService.listMessages(userId, req.query, req.log);

  return ok(messages);
}

async function getMessage(
  req: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
) {
  const { userId, isAuthenticated } = getAuth(req);

  if (!isAuthenticated) {
    throw new AuthenticationError();
  }

  const message = await GmailService.getMessage(userId, req.params.id, req.log);

  return ok(message);
}

export const GmailController = {
  startAuth,
  handleCallback,
  getProfile,
  getMessages,
  getMessage,
};
