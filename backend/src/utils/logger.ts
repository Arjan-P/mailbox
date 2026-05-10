import pino from 'pino';
import { loggerConfig } from '../config/logger.js';

export const logger = pino(loggerConfig);
