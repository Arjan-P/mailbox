import Fastify from 'fastify';

import app from './app.js';

import { env } from './config/env/env.js';

import { loggerConfig } from './config/logger.js';

const server = Fastify({
  logger: loggerConfig,
});

await server.register(app);

try {
  await server.listen({
    port: env.PORT,
    host: '0.0.0.0',
  });
} catch (error) {
  server.log.error(error);

  process.exit(1);
}
