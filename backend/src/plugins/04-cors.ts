import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import { env } from '../config/env/env.js';

export default fp(async (fastify) => {
  await fastify.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true,
  });
});
