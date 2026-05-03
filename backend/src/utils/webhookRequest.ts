import type { FastifyRequest } from 'fastify';

export function createWebhookRequest(req: FastifyRequest) {
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      headers.set(key, Array.isArray(value) ? value.join(',') : value);
    }
  }

  const host = req.headers.host ?? 'localhost';

  return new Request(`http://${host}${req.url}`, {
    method: req.method,
    headers,
    body: req.rawBody,
  });
}
