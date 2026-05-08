import { FastifyPluginAsync } from 'fastify';
import gmailRoutes from '../modules/gmail/gmail.route.js';

const route: FastifyPluginAsync = async (fastify) => {
  fastify.register(gmailRoutes, { prefix: '/api/gmail' });
};

export default route;
