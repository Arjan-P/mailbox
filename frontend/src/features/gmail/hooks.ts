import { useQuery } from "@tanstack/react-query";

import { getMessages, getProfile } from "./api";
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
