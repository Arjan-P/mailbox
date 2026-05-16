import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from '@fastify/type-provider-zod';
import { GmailController } from './gmail.controller.js';
import { errorResponse, successResponse } from '../common/response.schema.js';
import {
  gmailMessageDetailSchema,
  gmailMessagesQuerySchema,
  gmailMessagesSchema,
  gmailProfileSchema,
  gmailReplyMessageSchema,
  gmailSendMessageSchema,
  gmailSentMessageSchema,
} from './gmail.schema.js';
import { z } from 'zod';

const gmailRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/auth',
    {
      schema: {
        response: {
          302: z.any(),
          401: errorResponse,
        },
      },
    },
    GmailController.startAuth,
  );

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

  app.get(
    '/profile',
    {
      schema: {
        response: {
          200: successResponse(gmailProfileSchema),
          401: errorResponse,
          500: errorResponse,
        },
      },
    },
    GmailController.getProfile,
  );

  app.get(
    '/messages',
    {
      schema: {
        querystring: gmailMessagesQuerySchema,
        response: {
          200: successResponse(gmailMessagesSchema),
          401: errorResponse,
          500: errorResponse,
        },
      },
    },
    GmailController.getMessages,
  );

  app.get(
    '/messages/:id',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),

        response: {
          200: successResponse(gmailMessageDetailSchema),
          401: errorResponse,
          500: errorResponse,
        },
      },
    },
    GmailController.getMessage,
  );

  app.post(
    '/send',
    {
      schema: {
        body: gmailSendMessageSchema,
        response: {
          200: successResponse(gmailSentMessageSchema),
          400: errorResponse,
          401: errorResponse,
          500: errorResponse,
        },
      },
    },
    GmailController.sendMessage,
  );

  app.post(
    '/messages/:id/reply',
    {
      schema: {
        params: z.object({ id: z.string() }),
        body: gmailReplyMessageSchema,
        response: {
          200: successResponse(gmailSentMessageSchema),
          400: errorResponse,
          401: errorResponse,
          500: errorResponse,
        },
      },
    },
    GmailController.replyToMessage,
  );
};

export default gmailRoutes;
