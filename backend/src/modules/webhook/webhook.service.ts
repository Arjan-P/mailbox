import type { FastifyRequest } from 'fastify';
import { getQueue } from '../../queue/queue.factory.js';
import { webhookRegistry } from './webhook.registry.js';
import type { Service } from './webhook.types.js';

async function handleWebhook<S extends Service>(
  req: FastifyRequest,
  service: S,
) {
  const adapter = webhookRegistry[service];

  const event = await adapter.verify(req);

  const queue = getQueue(adapter.queueName);

  await queue.add(adapter.queueName, event);
}

export const WebhookService = {
  handleWebhook,
};
