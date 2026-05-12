import { AppError } from './AppError.js';

export class AuthenticationError extends AppError {
  constructor(
    message = 'Authentication Error',
    code = 'AUTHENTICATION_ERROR',
    details?: unknown,
  ) {
    super(message, 401, code, details);
  }
}
