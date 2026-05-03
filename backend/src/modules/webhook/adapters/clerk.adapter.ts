import { verifyWebhook } from '@clerk/backend/webhooks';
import type { WebhookEvent } from '@clerk/fastify/webhooks';

import type { WebhookAdapter } from '../webhook.types.js';
import { env } from '../../../config/env/env.js';
import { createWebhookRequest } from '../../../utils/webhookRequest.js';

export const clerkAdapter: WebhookAdapter<WebhookEvent> = {
  async verify(req) {
    const request = createWebhookRequest(req);
    return verifyWebhook(request, {
      signingSecret: env.CLERK_WEBHOOK_SECRET,
    });
  },
  queueName: 'Clerk-Webhook-Queue',
};
