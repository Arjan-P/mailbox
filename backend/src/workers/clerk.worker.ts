import type { WebhookEvent } from '@clerk/fastify';
import { Worker } from 'bullmq';

import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import { redisOptions } from '../config/redis.js';

import {
  context,
  propagation,
  trace,
  SpanStatusCode,
} from '@opentelemetry/api';

export const clerkWorker = new Worker(
  'Clerk-Webhook-Queue',
  async (job) => {
    const { _otelCarrier, ...event } = job.data as WebhookEvent & {
      _otelCarrier?: Record<string, string>;
    };

    const parentCtx = _otelCarrier
      ? propagation.extract(context.active(), _otelCarrier)
      : context.active();

    const tracer = trace.getTracer('clerk-worker');

    return context.with(parentCtx, async () => {
      const span = tracer.startSpan(`clerk.${event.type}`);

      try {
        logger.info(
          { jobId: job.id, type: event.type },
          'Processing Clerk Webhook',
        );

        switch (event.type) {
          case 'user.created':
          case 'user.updated': {
            const user = event.data;

            const primaryEmail = user.email_addresses.find(
              (e) => e.id === user.primary_email_address_id,
            );

            await prisma.user.upsert({
              where: { id: user.id },
              update: {
                emailAddress: primaryEmail?.email_address ?? '',
                firstName: user.first_name,
                lastName: user.last_name,
                imageUrl: user.image_url,
              },
              create: {
                id: user.id,
                emailAddress: primaryEmail?.email_address ?? '',
                firstName: user.first_name,
                lastName: user.last_name,
                imageUrl: user.image_url,
              },
            });

            break;
          }

          default:
            logger.warn({ type: event.type }, 'Unhandled event');
        }

        span.setStatus({ code: SpanStatusCode.OK });
      } catch (err) {
        span.recordException(err as Error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
        });

        throw err;
      } finally {
        span.end();
      }
    });
  },
  {
    connection: redisOptions,
  },
);

clerkWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Job completed');
});

clerkWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Job failed');
});
