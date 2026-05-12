import { FastifyPluginAsync } from 'fastify';
import { clerkPlugin } from '@clerk/fastify';
import { env } from '../config/env/env.js';
import gmailRoutes from '../modules/gmail/gmail.route.js';

const protectedRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(clerkPlugin, {
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
    secretKey: env.CLERK_SECRET_KEY,
  });

  // clerkPlugin intentionally does not block unauthenticated requests.
  // It just attaches the auth state to req and lets you decide what to
  // do with it per route. This is by design — it lets you have mixed routes
  // (some public, some protected) within the same scope, and lets you
  // make authorization decisions (not just authentication) per route, e.g.
  // checking roles or org membership alongside isAuthenticated.
  fastify.register(gmailRoutes, { prefix: '/api/gmail' });
};

export default protectedRoutes;
