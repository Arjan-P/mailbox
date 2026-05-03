import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from '@fastify/type-provider-zod';

import { webhookPost } from './webhook.controller.js';
import { webhookServiceSchema } from './webhook.schema.js';
import { successResponse, errorResponse } from '../common/response.schema.js';
import { z } from 'zod';
import rawBody from 'fastify-raw-body';

const webhookRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(rawBody, {
    global: false,
    encoding: false,
    runFirst: true,
  });
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.post(
    '/:service',
    {
      config: {
        rawBody: true,
      },
      schema: {
        params: webhookServiceSchema,
        response: {
          200: successResponse(z.object({ received: z.literal(true) })),
          400: errorResponse,
          500: errorResponse,
        },
      },
    },
    webhookPost,
  );
};

export default webhookRoutes;
