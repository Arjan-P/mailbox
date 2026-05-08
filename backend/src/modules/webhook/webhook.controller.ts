import type { FastifyRequest } from 'fastify';
import { WebhookService } from './webhook.service.js';
import type { WebhookServiceType } from './webhook.schema.js';
import { ok } from '../../utils/response.js';

async function webhookPost(
  req: FastifyRequest<{ Params: WebhookServiceType }>,
) {
  const { service } = req.params;

  await WebhookService.handleWebhook(req, service);

  return ok({ received: true as const });
}

export const WebhookController = {
  webhookPost,
};
