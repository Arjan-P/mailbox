import { z } from 'zod';

export const ERROR_CODES = [
  // Auth
  'AUTHENTICATION_ERROR', // Clerk session not found / invalid
  'GOOGLE_AUTH_REQUIRED', // No Google account connected
  'GOOGLE_AUTH_EXPIRED', // Token expired, refresh failed

  // Google API
  'GOOGLE_FORBIDDEN', // 403 from Google
  'GOOGLE_RATE_LIMITED', // 429 from Google
  'GOOGLE_API_ERROR', // Other Google API failure

  // Generic
  'NOT_FOUND',
  'VALIDATION_ERROR',
  'INTERNAL_SERVER_ERROR',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

/**
 * Generic success response
 */
export const successResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z
      .object({
        message: z.string().optional(),
      })
      .optional(),
  });

/**
 * Generic error response
 */
export const errorResponse = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.enum(ERROR_CODES),
    message: z.string(),
    // TODO: strip details behind an isDev flag
    details: z.any().optional(),
  }),
});

export type ErrorResponse = z.infer<typeof errorResponse>;
