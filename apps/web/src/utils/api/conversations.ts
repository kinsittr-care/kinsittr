import type {
  Conversation,
  ConversationListData,
  ListConversationsParams,
  ListMessagesParams,
  Message,
  MessageListData,
  SendMessagePayload,
} from "@/src/types/api/api";
import { apiRequest } from "@/src/utils/api/api";

function buildListQuery(params?: ListConversationsParams | ListMessagesParams) {
  const query = new URLSearchParams();

  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export function conversationsQueryKey(params: ListConversationsParams) {
  return ["conversations", params] as const;
}

export function conversationQueryKey(id: string) {
  return ["conversation", id] as const;
}

export function conversationMessagesQueryKey(
  id: string,
  params: ListMessagesParams,
) {
  return ["conversation-messages", id, params] as const;
}

export async function listConversations(params: ListConversationsParams) {
  const queryString = buildListQuery(params);

  return apiRequest<ConversationListData>(
    `/api/v1/conversations${queryString}`,
    undefined,
    {
      requiresAuth: true,
    },
  );
}

export async function getConversationById(id: string) {
  return apiRequest<Conversation>(`/api/v1/conversations/${id}`, undefined, {
    requiresAuth: true,
  });
}

export async function listConversationMessages(
  id: string,
  params: ListMessagesParams,
) {
  const queryString = buildListQuery(params);

  return apiRequest<MessageListData>(
    `/api/v1/conversations/${id}/messages${queryString}`,
    undefined,
    {
      requiresAuth: true,
    },
  );
}

export async function sendConversationMessage(
  id: string,
  payload: SendMessagePayload,
) {
  return apiRequest<Message>(
    `/api/v1/conversations/${id}/messages`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    {
      requiresAuth: true,
    },
  );
}
