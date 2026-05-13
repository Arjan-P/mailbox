import { useQuery } from "@tanstack/react-query";

import { getMessage, getMessages, getProfile } from "./api";
import { useAuth } from "@clerk/react";
import type {
  GmailProfile,
  GmailMessagesQuery,
  GmailMessages,
  GmailMessageDetail,
} from "./types";
import type { ErrorResponse } from "@/types/api";

export function useGmailProfile() {
  const { isSignedIn } = useAuth();

  return useQuery<GmailProfile, ErrorResponse["error"]>({
    queryKey: ["gmail-profile"],
    queryFn: getProfile,
    enabled: isSignedIn,
  });
}

export function useMessages(query?: GmailMessagesQuery) {
  const { isSignedIn } = useAuth();

  return useQuery<GmailMessages, ErrorResponse["error"]>({
    queryKey: ["gmail-messages", query],
    queryFn: () => getMessages(query),
    enabled: isSignedIn,
  });
}

export function useMessage(id: string | null) {
  return useQuery<GmailMessageDetail, ErrorResponse["error"]>({
    queryKey: ["gmail-message", id],

    queryFn: () => getMessage(id!),

    enabled: !!id,
  });
}
