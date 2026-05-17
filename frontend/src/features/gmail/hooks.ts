import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteMessage,
  getMessage,
  getMessages,
  getProfile,
  modifyMessage,
  replyMessage,
  sendMessage,
  trashMessage,
} from "./api";
import { useAuth } from "@clerk/react";
import type {
  GmailProfile,
  GmailMessagesQuery,
  GmailMessages,
  GmailMessageDetail,
  GmailSendMessage,
  GmailReplyMessage,
  GmailModifyMessage,
} from "./types";
import type { ErrorResponse } from "@/types/api";
import { useGmailStore } from "./store";

export const gmailKeys = {
  profile: ["gmail-profile"] as const,
  messages: (query?: GmailMessagesQuery) => ["gmail-messages", query] as const,
  message: (id: string | null) => ["gmail-message", id] as const,
};

export function useGmailProfile() {
  const { isSignedIn } = useAuth();

  return useQuery<GmailProfile, ErrorResponse["error"]>({
    queryKey: gmailKeys.profile,
    queryFn: getProfile,
    enabled: isSignedIn,
  });
}

export function useMessages(query?: GmailMessagesQuery) {
  const { isSignedIn } = useAuth();

  return useQuery<GmailMessages, ErrorResponse["error"]>({
    queryKey: gmailKeys.messages(query),
    queryFn: () => getMessages(query),
    enabled: isSignedIn,
  });
}

export function useMessage(id: string | null) {
  return useQuery<GmailMessageDetail, ErrorResponse["error"]>({
    queryKey: gmailKeys.message(id),
    queryFn: () => getMessage(id!),
    enabled: !!id,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GmailSendMessage) => sendMessage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gmail-messages"] });
    },
  });
}

export function useReplyMessage(messageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GmailReplyMessage) =>
      replyMessage(messageId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gmailKeys.message(messageId) });
      queryClient.invalidateQueries({ queryKey: ["gmail-messages"] });
    },
  });
}

export function useModifyMessage(messagesQuery?: GmailMessagesQuery) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: GmailModifyMessage;
    }) => modifyMessage(id, payload),

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["gmail-messages"] });
      await queryClient.cancelQueries({ queryKey: gmailKeys.message(id) });

      const previousMessages = queryClient.getQueryData<GmailMessages>(
        gmailKeys.messages(messagesQuery),
      );
      const previousDetail = queryClient.getQueryData<GmailMessageDetail>(
        gmailKeys.message(id),
      );

      if (previousMessages) {
        queryClient.setQueryData<GmailMessages>(
          gmailKeys.messages(messagesQuery),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              messages: old.messages.map((m) => {
                if (m.id !== id) return m;

                const currentLabels = new Set(m.labels);

                payload.addLabelIds?.forEach((l) => currentLabels.add(l));
                payload.removeLabelIds?.forEach((l) => currentLabels.delete(l));

                const updatedLabels = Array.from(currentLabels);

                return {
                  ...m,
                  labels: updatedLabels,
                  unread: updatedLabels.includes("UNREAD"),
                };
              }),
            };
          },
        );
      }

      if (previousDetail && previousDetail.id === id) {
        queryClient.setQueryData<GmailMessageDetail>(
          gmailKeys.message(id),
          (old) => {
            if (!old) return old;

            const currentLabels = new Set(old.labels);

            payload.addLabelIds?.forEach((l) => currentLabels.add(l));
            payload.removeLabelIds?.forEach((l) => currentLabels.delete(l));

            const updatedLabels = Array.from(currentLabels);

            return {
              ...old,
              labels: updatedLabels,
              unread: updatedLabels.includes("UNREAD"),
            };
          },
        );
      }

      return { previousMessages, previousDetail };
    },

    onError: (_err, { id }, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          gmailKeys.messages(messagesQuery),
          context.previousMessages,
        );
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(gmailKeys.message(id), context.previousDetail);
      }
    },

    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["gmail-messages"] });
      queryClient.invalidateQueries({ queryKey: gmailKeys.message(id) });
    },
  });
}

export function useTrashMessage(messagesQuery?: GmailMessagesQuery) {
  const queryClient = useQueryClient();
  const { selectedMessageId, setSelectedMessageId } = useGmailStore();

  return useMutation({
    mutationFn: (id: string) => trashMessage(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["gmail-messages"] });

      const previousMessages = queryClient.getQueryData<GmailMessages>(
        gmailKeys.messages(messagesQuery),
      );

      if (previousMessages) {
        const messages = previousMessages.messages;
        const idx = messages.findIndex((m) => m.id === id);

        if (selectedMessageId === id) {
          const next = messages[idx + 1] ?? messages[idx - 1] ?? null;
          setSelectedMessageId(next?.id ?? null);
        }

        queryClient.setQueryData<GmailMessages>(
          gmailKeys.messages(messagesQuery),
          {
            ...previousMessages,
            messages: messages.filter((m) => m.id !== id),
          },
        );
      }

      return { previousMessages };
    },

    onError: (_err, _id, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          gmailKeys.messages(messagesQuery),
          context.previousMessages,
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["gmail-messages"] });
      queryClient.invalidateQueries({ queryKey: gmailKeys.profile });
    },
  });
}

export function useDeleteMessage(messagesQuery?: GmailMessagesQuery) {
  const queryClient = useQueryClient();
  const { selectedMessageId, setSelectedMessageId } = useGmailStore();

  return useMutation({
    mutationFn: (id: string) => deleteMessage(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["gmail-messages"] });

      const previousMessages = queryClient.getQueryData<GmailMessages>(
        gmailKeys.messages(messagesQuery),
      );

      if (previousMessages) {
        const messages = previousMessages.messages;
        const idx = messages.findIndex((m) => m.id === id);

        if (selectedMessageId === id) {
          const next = messages[idx + 1] ?? messages[idx - 1] ?? null;
          setSelectedMessageId(next?.id ?? null);
        }

        queryClient.setQueryData<GmailMessages>(
          gmailKeys.messages(messagesQuery),
          {
            ...previousMessages,
            messages: messages.filter((m) => m.id !== id),
          },
        );
      }

      return { previousMessages };
    },

    onError: (_err, _id, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          gmailKeys.messages(messagesQuery),
          context.previousMessages,
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["gmail-messages"] });
      queryClient.invalidateQueries({ queryKey: gmailKeys.profile });
    },
  });
}
