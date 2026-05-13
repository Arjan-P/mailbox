import { ErrorCode } from '../modules/common/response.schema.js';

export class AppError extends Error {
  statusCode: number;
  code: ErrorCode;
  details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code: ErrorCode = 'INTERNAL_SERVER_ERROR',
    details?: unknown,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
