import { z } from 'zod';

export const GMAIL_SYSTEM_LABELS = {
  INBOX: 'INBOX',
  UNREAD: 'UNREAD',
  STARRED: 'STARRED',
  IMPORTANT: 'IMPORTANT',
  SENT: 'SENT',
  TRASH: 'TRASH',
  SPAM: 'SPAM',
} as const;

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

/**
 * Send new message request
 */
export const gmailSendMessageSchema = z.object({
  to: z
    .array(z.email({ message: 'Each recipient must be a valid email' }))
    .min(1, { message: 'At least one recipient is required' }),

  subject: z.string().min(1, { message: 'Subject is required' }).max(998, {
    message: 'Subject exceeds RFC 2822 line length limit',
  }),

  body: z.string().min(1, { message: 'Body is required' }),

  cc: z
    .array(z.email({ message: 'Each CC address must be a valid email' }))
    .optional(),
});

export type GmailSendMessage = z.infer<typeof gmailSendMessageSchema>;

/**
 * Reply to message request
 */
export const gmailReplyMessageSchema = z.object({
  body: z.string().min(1, { message: 'Reply body is required' }),
});

export type GmailReplyMessage = z.infer<typeof gmailReplyMessageSchema>;

/**
 * Sent message response
 */
export const gmailSentMessageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  labelIds: z.array(z.string()),
});

export type GmailSentMessage = z.infer<typeof gmailSentMessageSchema>;

/**
 * Generic label modification.
 * At least one of addLabelIds or removeLabelIds must be non-empty.
 *
 * Intended frontend mappings:
 *   archive     → removeLabelIds: ['INBOX']
 *   mark unread → addLabelIds:    ['UNREAD']
 *   mark read   → removeLabelIds: ['UNREAD']
 *   star        → addLabelIds:    ['STARRED']
 *   unstar      → removeLabelIds: ['STARRED']
 */
export const gmailModifyMessageSchema = z
  .object({
    addLabelIds: z.array(z.string()).optional(),
    removeLabelIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) =>
      (data.addLabelIds && data.addLabelIds.length > 0) ||
      (data.removeLabelIds && data.removeLabelIds.length > 0),
    {
      message: 'At least one of addLabelIds or removeLabelIds must be provided',
    },
  );

export type GmailModifyMessage = z.infer<typeof gmailModifyMessageSchema>;

/**
 * Response after a modify — returns the updated label set so the client
 * can reconcile local state without a follow-up fetch.
 */
export const gmailModifiedMessageSchema = z.object({
  id: z.string(),
  labelIds: z.array(z.string()),
});

export type GmailModifiedMessage = z.infer<typeof gmailModifiedMessageSchema>;

/**
 * Shared response for trash / delete — just the id so the client
 * knows which message to remove from its local list.
 */
export const gmailMessageActionSchema = z.object({
  id: z.string(),
});

export type GmailMessageAction = z.infer<typeof gmailMessageActionSchema>;
