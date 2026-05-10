import fp from 'fastify-plugin';
import metricsPlugin from 'fastify-metrics';

export default fp(async (fastify) => {
  await fastify.register(metricsPlugin.default, {
    endpoint: '/metrics', // Prometheus scrapes this URL

    defaultMetrics: {
      enabled: true, // Node.js process metrics (heap, GC, event loop lag, etc.)
    },

    routeMetrics: {
      enabled: true, // Per-route http_request_duration_seconds histogram + summary

      routeBlacklist: ['/metrics'], // Don't track the metrics endpoint itself

      overrides: {
        histogram: {
          name: 'http_request_duration_seconds',
          buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
        },
        summary: {
          percentiles: [0.5, 0.9, 0.95, 0.99],
        },
      },
    },
  });
});
