import { z } from 'zod';
import { webhookRegistry } from './webhook.registry.js';

export const webhookServiceSchema = z.object({
  service: z.enum(
    Object.keys(webhookRegistry) as [keyof typeof webhookRegistry],
  ),
});

export type WebhookServiceType = z.infer<typeof webhookServiceSchema>;
