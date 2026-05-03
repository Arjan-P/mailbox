import type { FastifyRequest } from 'fastify';
import { webhookRegistry } from './webhook.registry.js';

export interface WebhookAdapter<TEvent> {
  verify(req: FastifyRequest): Promise<TEvent>;
  queueName: string;
}

export type WebhookRegistry = typeof webhookRegistry;
export type Service = keyof WebhookRegistry;
