import { clerkAdapter } from './adapters/clerk.adapter.js';

export const webhookRegistry = {
  clerk: clerkAdapter,
} as const;
