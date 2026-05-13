import { getAuth } from '@clerk/fastify';
declare module 'fastify' {
  interface FastifyRequest {
    auth?: ReturnType<typeof getAuth>;
  }
}
