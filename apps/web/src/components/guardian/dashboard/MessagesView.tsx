"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Conversation, Message } from "@/src/types/api/api";
import {
  conversationMessagesQueryKey,
  conversationsQueryKey,
  listConversationMessages,
  listConversations,
  markConversationRead,
  sendConversationMessage,
} from "@/src/utils/api/conversations";
import { ApiRequestError } from "@/src/utils/api/api";
import { useIsMobile } from "./useIsMobile";
import MessagesChatHeader from "./messages/MessagesChatHeader";
import MessagesComposer from "./messages/MessagesComposer";
import MessagesEmptyState from "./messages/MessagesEmptyState";
import MessagesMessageList from "./messages/MessagesMessageList";
import MessagesThreadList from "./messages/MessagesThreadList";
interface MessagesViewProps {
  hasMessages: boolean;
}

const CONVERSATIONS_PAGE_SIZE = 50;
const MESSAGES_PAGE_SIZE = 100;
const EMPTY_CONVERSATIONS: Conversation[] = [];
const EMPTY_MESSAGES: Message[] = [];

export default function MessagesView({ hasMessages }: MessagesViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notifiedConversationID = searchParams.get("conversation_id");
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [conversationLimit, setConversationLimit] = useState(CONVERSATIONS_PAGE_SIZE);
  const [messageLimit, setMessageLimit] = useState(MESSAGES_PAGE_SIZE);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">(
    notifiedConversationID ? "chat" : "list",
  );
  const [input, setInput] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMarkedReadKeyRef = useRef<string | null>(null);

  const conversationsQuery = useQuery({
    queryKey: conversationsQueryKey({ page: 1, limit: conversationLimit }),
    queryFn: async () => listConversations({ page: 1, limit: conversationLimit }),
  });

  const conversations = conversationsQuery.data?.data?.items ?? EMPTY_CONVERSATIONS;
  const totalConversations = conversationsQuery.data?.data?.total ?? 0;
  const requestedConversationId = selectedConversationId ?? notifiedConversationID;
  const resolvedSelectedConversationId =
    requestedConversationId !== null &&
    conversations.some((conversation) => conversation.id === requestedConversationId)
      ? requestedConversationId
      : (conversations[0]?.id ?? null);
  const effectiveMessageLimit =
    resolvedSelectedConversationId === selectedConversationId
      ? messageLimit
      : MESSAGES_PAGE_SIZE;
  const selectedConversation =
    conversations.find(
      (conversation) => conversation.id === resolvedSelectedConversationId,
    ) ?? null;
  const isConversationLocked = Boolean(selectedConversation?.locked_at);

  const messagesQuery = useQuery({
    queryKey:
      resolvedSelectedConversationId === null
        ? ["conversation-messages-disabled"]
        : conversationMessagesQueryKey(resolvedSelectedConversationId, {
            page: 1,
            limit: effectiveMessageLimit,
          }),
    queryFn: async () => {
      if (!resolvedSelectedConversationId) {
        throw new ApiRequestError("No conversation selected.");
      }
      return listConversationMessages(resolvedSelectedConversationId, {
        page: 1,
        limit: effectiveMessageLimit,
      });
    },
    enabled: resolvedSelectedConversationId !== null,
  });

  const messages = messagesQuery.data?.data?.items ?? EMPTY_MESSAGES;
  const totalMessages = messagesQuery.data?.data?.total ?? 0;

  const markReadMutation = useMutation({
    mutationFn: markConversationRead,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: conversationsQueryKey({ page: 1, limit: conversationLimit }),
        }),
        queryClient.invalidateQueries({
          queryKey: conversationsQueryKey({ page: 1, limit: 1 }),
        }),
      ]);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [resolvedSelectedConversationId, messages]);

  useEffect(() => {
    if (
      !resolvedSelectedConversationId ||
      !messagesQuery.isSuccess ||
      !selectedConversation ||
      selectedConversation.unread_count < 1
    ) {
      return;
    }

    const markReadKey = `${resolvedSelectedConversationId}:${selectedConversation.last_message_at ?? "none"}:${selectedConversation.unread_count}`;
    if (lastMarkedReadKeyRef.current === markReadKey || markReadMutation.isPending) {
      return;
    }

    lastMarkedReadKeyRef.current = markReadKey;
    markReadMutation.mutate(resolvedSelectedConversationId);
  }, [
    markReadMutation,
    messagesQuery.isSuccess,
    resolvedSelectedConversationId,
    selectedConversation,
  ]);

  const sendMessageMutation = useMutation({
    mutationFn: async (body: string) => {
      if (!resolvedSelectedConversationId) {
        throw new ApiRequestError("No conversation selected.");
      }

      return sendConversationMessage(resolvedSelectedConversationId, { body });
    },
    onSuccess: async (_, body) => {
      setInput("");
      setSendError(null);

      if (!resolvedSelectedConversationId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: conversationMessagesQueryKey(resolvedSelectedConversationId, {
            page: 1,
            limit: effectiveMessageLimit,
          }),
        }),
        queryClient.invalidateQueries({
          queryKey: conversationsQueryKey({ page: 1, limit: conversationLimit }),
        }),
        queryClient.invalidateQueries({
          queryKey: conversationsQueryKey({ page: 1, limit: 1 }),
        }),
      ]);

      if (body.trim() && isMobile) {
        setMobileView("chat");
      }
    },
    onError: (error) => {
      setSendError(
        error instanceof Error
          ? error.message
          : "Something went wrong while sending your message.",
      );
    },
  });

  const send = () => {
    const body = input.trim();
    if (!body || isConversationLocked || sendMessageMutation.isPending) {
      return;
    }

    sendMessageMutation.mutate(body);
  };

  if (!hasMessages && !conversationsQuery.isLoading) {
    return (
      <MessagesEmptyState onFindNanny={() => router.push("/parent")} />
    );
  }

  const showThreadList = !isMobile || mobileView === "list";
  const showChat =
    !isMobile || (mobileView === "chat" && resolvedSelectedConversationId !== null);

  return (
    <div className="flex h-full overflow-hidden flex-1">
      {showThreadList && (
        <MessagesThreadList
          conversations={conversations}
          totalConversations={totalConversations}
          isLoading={conversationsQuery.isLoading}
          isError={conversationsQuery.isError}
          errorMessage={
            conversationsQuery.error instanceof Error
              ? conversationsQuery.error.message
              : undefined
          }
          isMobile={isMobile}
          selectedConversationId={resolvedSelectedConversationId}
          onRetry={() => conversationsQuery.refetch()}
          onSelectConversation={(id) => {
            setSelectedConversationId(id);
            setMessageLimit(MESSAGES_PAGE_SIZE);
            if (isMobile) {
              setMobileView("chat");
            }
          }}
          onLoadMore={() =>
            setConversationLimit((current) => current + CONVERSATIONS_PAGE_SIZE)
          }
        />
      )}

      {showChat && (
        <div className="flex flex-col overflow-hidden flex-1">
          <MessagesChatHeader
            conversation={selectedConversation}
            isMobile={isMobile}
            onBack={() => setMobileView("list")}
            onViewProfile={() => router.push("/parent")}
            onViewBookingDetails={() => router.push("/parent/bookings")}
          />

          <MessagesMessageList
            conversation={selectedConversation}
            messages={messages}
            totalMessages={totalMessages}
            isLoading={messagesQuery.isLoading}
            isError={messagesQuery.isError}
            errorMessage={
              messagesQuery.error instanceof Error
                ? messagesQuery.error.message
                : undefined
            }
            bottomRef={bottomRef}
            onRetry={() => messagesQuery.refetch()}
            onLoadOlder={() =>
              setMessageLimit((current) => current + MESSAGES_PAGE_SIZE)
            }
          />

          <MessagesComposer
            input={input}
            sendError={sendError}
            canSend={Boolean(selectedConversation && !isConversationLocked && input.trim() && !sendMessageMutation.isPending)}
            isSending={sendMessageMutation.isPending}
            isConversationSelected={selectedConversation !== null}
            isLocked={isConversationLocked}
            isMobile={isMobile}
            onInputChange={(value) => {
              setInput(value);
              if (sendError) {
                setSendError(null);
              }
            }}
            onSend={send}
          />
        </div>
      )}
    </div>
  );
}
