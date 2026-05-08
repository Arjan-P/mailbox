import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';
import { env } from '../config/env/env.js';

export default fp(async (fastify) => {
  await fastify.register(cookie, {
    secret: env.COOKIE_SECRET,
  });
});
