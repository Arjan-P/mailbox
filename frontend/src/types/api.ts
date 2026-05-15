import { z } from "zod";
import { ERROR_CODES } from "./errors";

export const errorResponse = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.enum(ERROR_CODES),
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
