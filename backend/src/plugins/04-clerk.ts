import fp from 'fastify-plugin';
import { clerkPlugin } from '@clerk/fastify';
import { env } from '../config/env/env.js';

export default fp(async (fastify) => {
  await fastify.register(clerkPlugin, {
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
    secretKey: env.CLERK_SECRET_KEY,
  });
});
