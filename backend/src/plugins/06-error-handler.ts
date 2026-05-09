import fp from 'fastify-plugin';
import { ZodError } from 'zod';
import { fail } from '../utils/response.js';
import { AppError } from '../errors/AppError.js';

export default fp(async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    // App error
    if (error instanceof AppError) {
      return reply
        .status(error.statusCode)
        .send(fail(error.code, error.message));
    }

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
