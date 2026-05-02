import { z } from 'zod';

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
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
});

export type ErrorResponse = z.infer<typeof errorResponse>;
