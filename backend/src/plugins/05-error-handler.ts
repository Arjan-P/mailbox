import fp from 'fastify-plugin';
import { AppError } from '../errors/AppError.js';
import { ZodError } from 'zod';
import { GaxiosError } from 'gaxios';
import { fail } from '../utils/response.js';

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

    // GaxiosError
    if (error instanceof GaxiosError) {
      const status = error.response?.status;

      if (status === 401) {
        // Token missing, expired, or revoked — client should re-authenticate
        return reply
          .status(401)
          .send(
            fail(
              'GOOGLE_AUTH_EXPIRED',
              'Google authentication expired, please reconnect your account',
            ),
          );
      }
      if (status === 403) {
        return reply
          .status(403)
          .send(
            fail(
              'GOOGLE_FORBIDDEN',
              'Insufficient permissions for this Google resource',
            ),
          );
      }
      if (status === 429) {
        return reply
          .status(429)
          .send(fail('GOOGLE_RATE_LIMITED', 'Google API rate limit exceeded'));
      }

      return reply
        .status(502)
        .send(fail('GOOGLE_API_ERROR', 'Google API request failed'));
    }

    return reply
      .status(500)
      .send(fail('INTERNAL_SERVER_ERROR', 'Something went wrong'));
  });
});
