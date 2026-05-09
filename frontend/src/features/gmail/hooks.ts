import { useQuery } from "@tanstack/react-query";

import { getMessage, getMessages, getProfile } from "./api";
import { useAuth } from "@clerk/react";
import type { GmailMessagesQuery } from "./types";

export function useGmailProfile() {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["gmail-profile"],
    queryFn: getProfile,
    enabled: isSignedIn,
  });
}

export function useMessages(query?: GmailMessagesQuery) {
  return useQuery({
    queryKey: ["gmail-messages", query],
    queryFn: () => getMessages(query),
  });
}

export function useMessage(id: string | null) {
  return useQuery({
    queryKey: ["gmail-message", id],

    queryFn: () => getMessage(id!),

    enabled: !!id,
  });
}
