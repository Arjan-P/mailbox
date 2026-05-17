import { api } from "@/lib/axios";
import type { SuccessResponse } from "@/types/api";
import type {
  GmailSentMessage,
  GmailMessageDetail,
  GmailMessages,
  GmailMessagesQuery,
  GmailProfile,
  GmailSendMessage,
  GmailReplyMessage,
  GmailModifyMessage,
  GmailModifiedMessage,
  GmailMessageAction,
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

export async function sendMessage(payload: GmailSendMessage) {
  const res = await api.post<SuccessResponse<GmailSentMessage>>(
    "/api/gmail/send",
    payload,
  );

  return res.data.data;
}

export async function replyMessage(id: string, payload: GmailReplyMessage) {
  const res = await api.post<SuccessResponse<GmailSentMessage>>(
    `/api/gmail/messages/${id}/reply`,
    payload,
  );

  return res.data.data;
}

export async function modifyMessage(id: string, payload: GmailModifyMessage) {
  const res = await api.post<SuccessResponse<GmailModifiedMessage>>(
    `/api/gmail/messages/${id}/modify`,
    payload,
  );

  return res.data.data;
}

export async function trashMessage(id: string) {
  const res = await api.post<SuccessResponse<GmailMessageAction>>(
    `/api/gmail/messages/${id}/trash`,
  );

  return res.data.data;
}

export async function deleteMessage(id: string) {
  const res = await api.delete<SuccessResponse<GmailMessageAction>>(
    `/api/gmail/messages/${id}`,
  );

  return res.data.data;
}
