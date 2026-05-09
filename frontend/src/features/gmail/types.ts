import { z } from "zod";

/**
 * Gmail profile
 */
export const gmailProfileSchema = z.object({
  emailAddress: z.email(),

  messagesTotal: z.number(),

  threadsTotal: z.number(),

  historyId: z.string(),
});

export type GmailProfile = z.infer<typeof gmailProfileSchema>;

/**
 * Gmail message summary
 */
export const gmailMessageSchema = z.object({
  id: z.string(),

  threadId: z.string(),
});

export type GmailMessage = z.infer<typeof gmailMessageSchema>;

/**
 * Gmail messages list
 */
export const gmailMessagesSchema = z.object({
  messages: z.array(gmailMessageSchema),

  nextPageToken: z.string().optional(),

  resultSizeEstimate: z.number().optional(),
});

export type GmailMessages = z.infer<typeof gmailMessagesSchema>;

/**
 * Query params
 */
export const gmailMessagesQuerySchema = z.object({
  maxResults: z.coerce.number().min(1).max(100).optional(),

  pageToken: z.string().optional(),
});

export type GmailMessagesQuery = z.infer<typeof gmailMessagesQuerySchema>;
