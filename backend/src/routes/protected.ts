import { FastifyPluginAsync } from 'fastify';
import { clerkPlugin } from '@clerk/fastify';
import { env } from '../config/env/env.js';
import gmailRoutes from '../modules/gmail/gmail.route.js';

const protectedRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(clerkPlugin, {
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
    secretKey: env.CLERK_SECRET_KEY,
  });

  fastify.register(gmailRoutes, { prefix: '/api/gmail' });
};

export default protectedRoutes;
