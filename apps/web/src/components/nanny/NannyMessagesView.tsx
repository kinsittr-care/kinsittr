"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { useIsMobile } from "@/src/components/guardian/dashboard/useIsMobile";
import NannyThreadList from "./messages/NannyThreadList";
import NannyChatHeader from "./messages/NannyChatHeader";
import NannyMessageList from "./messages/NannyMessageList";
import NannyComposer from "./messages/NannyComposer";
import NannyMessagesEmptyState from "./messages/NannyMessagesEmptyState";

const CONVERSATIONS_PAGE_SIZE = 50;
const MESSAGES_PAGE_SIZE = 100;
const EMPTY_CONVERSATIONS: Conversation[] = [];
const EMPTY_MESSAGES: Message[] = [];

export default function NannyMessagesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notifiedConversationID = searchParams.get("conversation_id");
  const isCompact = useIsMobile(1024);
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

  const conversations = useMemo(
    () => conversationsQuery.data?.data?.items ?? EMPTY_CONVERSATIONS,
    [conversationsQuery.data],
  );
  const totalConversations = conversationsQuery.data?.data?.total ?? 0;
  const requestedConversationId = selectedConversationId ?? notifiedConversationID;

  const activeConversationId = useMemo(() => {
    if (!conversations.length) return null;
    if (requestedConversationId && conversations.some((c) => c.id === requestedConversationId)) {
      return requestedConversationId;
    }
    return conversations[0]?.id ?? null;
  }, [conversations, requestedConversationId]);

  const selectedConversation =
    conversations.find((c) => c.id === activeConversationId) ?? null;
  const isConversationLocked = Boolean(selectedConversation?.locked_at);
  const effectiveMessageLimit =
    activeConversationId === selectedConversationId ? messageLimit : MESSAGES_PAGE_SIZE;

  const messagesQuery = useQuery({
    queryKey:
      activeConversationId === null
        ? ["nanny-conversation-messages-disabled"]
        : conversationMessagesQueryKey(activeConversationId, { page: 1, limit: effectiveMessageLimit }),
    queryFn: async () => {
      if (!activeConversationId) throw new ApiRequestError("No conversation selected.");
      return listConversationMessages(activeConversationId, { page: 1, limit: effectiveMessageLimit });
    },
    enabled: activeConversationId !== null,
  });

  const messages = messagesQuery.data?.data?.items ?? EMPTY_MESSAGES;
  const totalMessages = messagesQuery.data?.data?.total ?? 0;

  const markReadMutation = useMutation({
    mutationFn: markConversationRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: conversationsQueryKey({ page: 1, limit: conversationLimit }),
      });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversationId, messages]);

  useEffect(() => {
    if (
      !activeConversationId ||
      !messagesQuery.isSuccess ||
      !selectedConversation ||
      selectedConversation.unread_count < 1
    ) {
      return;
    }

    const markReadKey = `${activeConversationId}:${selectedConversation.last_message_at ?? "none"}:${selectedConversation.unread_count}`;
    if (lastMarkedReadKeyRef.current === markReadKey || markReadMutation.isPending) {
      return;
    }

    lastMarkedReadKeyRef.current = markReadKey;
    markReadMutation.mutate(activeConversationId);
  }, [
    activeConversationId,
    markReadMutation,
    messagesQuery.isSuccess,
    selectedConversation,
  ]);

  const sendMessageMutation = useMutation({
    mutationFn: async (body: string) => {
      if (!activeConversationId) throw new ApiRequestError("No conversation selected.");
      return sendConversationMessage(activeConversationId, { body });
    },
    onSuccess: async () => {
      setInput("");
      setSendError(null);
      if (!activeConversationId) return;
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: conversationMessagesQueryKey(activeConversationId, {
            page: 1,
            limit: effectiveMessageLimit,
          }),
        }),
        queryClient.invalidateQueries({
          queryKey: conversationsQueryKey({ page: 1, limit: conversationLimit }),
        }),
      ]);
    },
    onError: (error) => {
      setSendError(
        error instanceof Error ? error.message : "Something went wrong while sending your message.",
      );
    },
  });

  const send = () => {
    const body = input.trim();
    if (!body || isConversationLocked || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(body);
  };

  if (!conversationsQuery.isLoading && conversations.length === 0) {
    return <NannyMessagesEmptyState />;
  }

  const activeMobileView = conversations.length === 0 ? "list" : mobileView;
  const showThreadList = !isCompact || activeMobileView === "list";
  const showChat = !isCompact || (activeMobileView === "chat" && activeConversationId !== null);

  return (
    <div className="flex flex-1 overflow-hidden">
      {showThreadList && (
        <NannyThreadList
          conversations={conversations}
          totalConversations={totalConversations}
          isLoading={conversationsQuery.isLoading}
          isError={conversationsQuery.isError}
          errorMessage={
            conversationsQuery.error instanceof Error
              ? conversationsQuery.error.message
              : undefined
          }
          isMobile={isCompact}
          selectedConversationId={activeConversationId}
          onRetry={() => conversationsQuery.refetch()}
          onSelectConversation={(id) => {
            setSelectedConversationId(id);
            setMessageLimit(MESSAGES_PAGE_SIZE);
            if (isCompact) setMobileView("chat");
          }}
          onLoadMore={() => setConversationLimit((c) => c + CONVERSATIONS_PAGE_SIZE)}
        />
      )}

      {showChat && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <NannyChatHeader
            conversation={selectedConversation}
            isMobile={isCompact}
            onBack={() => setMobileView("list")}
            onViewBookingDetails={() => router.push("/nanny/requests")}
          />
          <NannyMessageList
            conversation={selectedConversation}
            messages={messages}
            totalMessages={totalMessages}
            isLoading={messagesQuery.isLoading}
            isError={messagesQuery.isError}
            errorMessage={
              messagesQuery.error instanceof Error ? messagesQuery.error.message : undefined
            }
            bottomRef={bottomRef}
            onRetry={() => messagesQuery.refetch()}
            onLoadOlder={() => setMessageLimit((m) => m + MESSAGES_PAGE_SIZE)}
          />
          <NannyComposer
            input={input}
            sendError={sendError}
            canSend={Boolean(selectedConversation && !isConversationLocked && input.trim() && !sendMessageMutation.isPending)}
            isSending={sendMessageMutation.isPending}
            isConversationSelected={selectedConversation !== null}
            isLocked={isConversationLocked}
            isMobile={isCompact}
            onInputChange={(value) => {
              setInput(value);
              if (sendError) setSendError(null);
            }}
            onSend={send}
          />
        </div>
      )}
    </div>
  );
}
