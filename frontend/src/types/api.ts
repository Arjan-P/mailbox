import { z } from "zod";

export const errorResponse = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
});

export type SuccessResponse<T> = {
  success: true;
  data: T;
  meta?: {
    message?: string;
  };
};
export type ErrorResponse = z.infer<typeof errorResponse>;
