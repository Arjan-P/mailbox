import { FastifyPluginAsync } from 'fastify';
import webhookRoutes from '../modules/webhook/webhook.route.js';

const route: FastifyPluginAsync = async (fastify) => {
  fastify.register(webhookRoutes, { prefix: '/webhook' });
};

export default route;
