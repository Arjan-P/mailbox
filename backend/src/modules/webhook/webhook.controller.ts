import type { FastifyRequest } from 'fastify';
import { handleWebhook } from './webhook.service.js';
import type { WebhookServiceType } from './webhook.schema.js';
import { ok } from '../../utils/response.js';

export async function webhookPost(
  req: FastifyRequest<{ Params: WebhookServiceType }>,
) {
  const { service } = req.params;

  await handleWebhook(req, service);

  return ok({ received: true as const });
}
