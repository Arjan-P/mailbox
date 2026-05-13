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
 * Mail list item
 */
export const gmailMailItemSchema = z.object({
  id: z.string(),

  threadId: z.string(),

  subject: z.string(),

  from: z.string(),

  snippet: z.string(),

  date: z.string().nullable(),

  unread: z.boolean(),

  labels: z.array(z.string()),
});

export type GmailMailItem = z.infer<typeof gmailMailItemSchema>;

/**
 * Gmail messages list
 */
export const gmailMessagesSchema = z.object({
  messages: z.array(gmailMailItemSchema),

  nextPageToken: z.string().optional(),

  resultSizeEstimate: z.number().optional(),
});

export type GmailMessages = z.infer<typeof gmailMessagesSchema>;

/**
 * Gmail message detail
 */
export const gmailMessageDetailSchema = z.object({
  id: z.string(),

  threadId: z.string(),

  subject: z.string(),

  from: z.string(),

  to: z.array(z.string()),

  cc: z.array(z.string()),

  snippet: z.string(),

  body: z.string(),

  date: z.string().nullable(),

  unread: z.boolean(),

  labels: z.array(z.string()),
});

export type GmailMessageDetail = z.infer<typeof gmailMessageDetailSchema>;

/**
 * Query params
 */
export const gmailMessagesQuerySchema = z.object({
  maxResults: z.coerce.number().min(1).max(100).optional(),

  pageToken: z.string().optional(),
});

export type GmailMessagesQuery = z.infer<typeof gmailMessagesQuerySchema>;
