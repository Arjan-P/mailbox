import fp from 'fastify-plugin';
import oauthPlugin from '@fastify/oauth2';

import { env } from '../config/env/env.js';

export default fp(async (fastify) => {
  await fastify.register(oauthPlugin, {
    name: 'googleOAuth2',

    scope: [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
    ],

    credentials: {
      client: {
        id: env.GOOGLE_CLIENT_ID,
        secret: env.GOOGLE_CLIENT_SECRET,
      },

      auth: {
        authorizeHost: 'https://accounts.google.com',
        authorizePath: '/o/oauth2/v2/auth',

        tokenHost: 'https://oauth2.googleapis.com',
        tokenPath: '/token',
      },
    },

    startRedirectPath: '/api/gmail/auth',

    callbackUri: env.GOOGLE_CALLBACK_URL,

    pkce: 'S256',

    cookie: {
      secure: false, // true in production HTTPS
      sameSite: 'lax',
    },
    redirectStateCookieName: 'google-oauth2-redirect-state',
    verifierCookieName: 'google-oauth2-code-verifier',
  });
});
