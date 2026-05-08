import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from '@fastify/type-provider-zod';
import { GmailController } from './gmail.controller.js';
import { errorResponse, successResponse } from '../common/response.schema.js';
import { z } from 'zod';

const gmailRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.get(
    '/callback',
    {
      schema: {
        response: {
          200: successResponse(z.object({ received: z.literal(true) })),
          401: errorResponse,
          500: errorResponse,
        },
      },
    },
    GmailController.handleCallback,
  );
};

export default gmailRoutes;
