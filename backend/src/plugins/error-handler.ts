import fp from 'fastify-plugin';
import { ZodError } from 'zod';
import { fail } from '../utils/response.js';

export default fp(async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    // Zod validation error
    if (error instanceof ZodError) {
      return reply
        .status(400)
        .send(fail('VALIDATION_ERROR', 'Invalid request', error.issues));
    }

    return reply
      .status(500)
      .send(fail('INTERNAL_SERVER_ERROR', 'Something went wrong'));
  });
});
