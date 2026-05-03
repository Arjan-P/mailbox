import type { WebhookEvent } from '@clerk/fastify';
import { Worker } from 'bullmq';

import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import { redisOptions } from '../config/redis.js';

export const clerkWorker = new Worker(
  'Clerk-Webhook-Queue',
  async (job) => {
    const event = job.data as WebhookEvent;
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
