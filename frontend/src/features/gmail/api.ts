import { api } from "@/lib/axios";
import type { SuccessResponse } from "@/types/api";
import type {
  GmailMessageDetail,
  GmailMessages,
  GmailMessagesQuery,
  GmailProfile,
} from "./types";

export async function getProfile() {
  const res =
    await api.get<SuccessResponse<GmailProfile>>("/api/gmail/profile");

  return res.data.data;
}

export async function getMessages(query?: GmailMessagesQuery) {
  const res = await api.get<SuccessResponse<GmailMessages>>(
    "/api/gmail/messages",
    {
      params: query,
    },
  );

  return res.data.data;
}

export async function getMessage(id: string) {
  const res = await api.get<SuccessResponse<GmailMessageDetail>>(
    `/api/gmail/messages/${id}`,
  );

  return res.data.data;
}
