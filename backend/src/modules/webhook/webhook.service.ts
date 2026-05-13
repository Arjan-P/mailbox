import type { FastifyRequest } from 'fastify';
import { getQueue } from '../../queue/queue.factory.js';
import { webhookRegistry } from './webhook.registry.js';
import type { Service } from './webhook.types.js';
import { context, propagation } from '@opentelemetry/api';

async function handleWebhook<S extends Service>(
  req: FastifyRequest,
  service: S,
) {
  const adapter = webhookRegistry[service];

  const event = await adapter.verify(req);

  const queue = getQueue(adapter.queueName);

  // inject current trace into job data
  const carrier: Record<string, string> = {};
  propagation.inject(context.active(), carrier);

  await queue.add(adapter.queueName, { ...event, _otelCarrier: carrier });
}

export const WebhookService = {
  handleWebhook,
};
