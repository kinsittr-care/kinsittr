import type {
  AdminConversation,
  AdminConversationActionPayload,
  AdminConversationListData,
  AdminMessage,
  AdminMessageListData,
  ListAdminConversationsParams,
  ListAdminMessagesParams,
} from "@/src/types/api/admin";
import { adminApiRequest } from "./client";

export const adminConversationsQueryKey = (params: ListAdminConversationsParams = {}) => [
  "admin",
  "conversations",
  params,
];

export const adminConversationMessagesQueryKey = (
  conversationId: string,
  params: ListAdminMessagesParams = {},
) => ["admin", "conversation-messages", conversationId, params];

function buildConversationQuery(params: ListAdminConversationsParams | ListAdminMessagesParams) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if ("search" in params && params.search) query.set("search", params.search);
  if ("status" in params && params.status) query.set("status", params.status);

  const value = query.toString();
  return value ? `?${value}` : "";
}

export async function listAdminConversations(params: ListAdminConversationsParams = {}) {
  return adminApiRequest<AdminConversationListData>(
    `/api/v1/admin/conversations${buildConversationQuery(params)}`,
  );
}

export async function listAdminConversationMessages(
  conversationId: string,
  params: ListAdminMessagesParams = {},
) {
  return adminApiRequest<AdminMessageListData>(
    `/api/v1/admin/conversations/${conversationId}/messages${buildConversationQuery(params)}`,
  );
}

export async function lockAdminConversation(
  conversationId: string,
  payload: AdminConversationActionPayload,
) {
  return adminApiRequest<AdminConversation>(`/api/v1/admin/conversations/${conversationId}/lock`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function unlockAdminConversation(
  conversationId: string,
  payload: AdminConversationActionPayload,
) {
  return adminApiRequest<AdminConversation>(`/api/v1/admin/conversations/${conversationId}/unlock`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function hideAdminConversationMessage(
  conversationId: string,
  messageId: string,
  payload: AdminConversationActionPayload,
) {
  return adminApiRequest<AdminMessage>(
    `/api/v1/admin/conversations/${conversationId}/messages/${messageId}/hide`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}
