import { ErrorCode } from '../modules/common/response.schema.js';
import { AppError } from './AppError.js';

export class AuthenticationError extends AppError {
  constructor(
    message = 'Authentication Error',
    code: ErrorCode = 'AUTHENTICATION_ERROR',
    details?: unknown,
  ) {
    super(message, 401, code, details);
  }
}
