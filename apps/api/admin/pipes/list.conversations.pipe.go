package pipes

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
	"github.com/kinsittr/kinsittr-api/models"
	repository "github.com/kinsittr/kinsittr-api/repositories/admin"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *AdminPipe) ListConversations(ctx context.Context, dto dtos.ListAdminConversationsQueryDTO) *shared.PipeRes[AdminConversationListData] {
	page, limit := normalizePageLimit(dto.Page, dto.Limit)
	status, ok := parseBookingStatus(dto.Status)
	if !ok {
		return pipeError[AdminConversationListData](messages.Invalid_Admin_Request)
	}

	itemsRaw, total, err := p.repo.ListConversations(ctx, repository.ListConversationsFilter{
		Page:   page,
		Limit:  limit,
		Search: strings.TrimSpace(dto.Search),
		Status: status,
	})
	if err != nil {
		return pipeError[AdminConversationListData](messages.Invalid_Admin_Request)
	}

	items := make([]AdminConversationData, 0, len(itemsRaw))
	for _, item := range itemsRaw {
		items = append(items, toAdminConversationData(item))
	}
	data := AdminConversationListData{Items: items, Page: page, Limit: limit, Total: total}
	return pipeSuccess(messages.Admin_Conversations_Listed, &data)
}

func (p *AdminPipe) ListConversationMessages(ctx context.Context, conversationID uuid.UUID, dto dtos.ListAdminMessagesQueryDTO) *shared.PipeRes[AdminMessageListData] {
	page, limit := normalizePageLimit(dto.Page, dto.Limit)
	conversation, err := p.repo.GetConversationByID(ctx, conversationID)
	if err != nil {
		return pipeError[AdminMessageListData](messages.Invalid_Admin_Request)
	}
	if conversation.ID == uuid.Nil {
		return pipeError[AdminMessageListData](messages.Admin_Conversation_Not_Found)
	}

	itemsRaw, total, err := p.repo.ListConversationMessages(ctx, conversationID, page, limit)
	if err != nil {
		return pipeError[AdminMessageListData](messages.Invalid_Admin_Request)
	}

	items := make([]AdminMessageData, 0, len(itemsRaw))
	for _, item := range itemsRaw {
		items = append(items, toAdminMessageData(item))
	}
	data := AdminMessageListData{
		Conversation: toAdminConversationData(conversation),
		Items:        items,
		Page:         page,
		Limit:        limit,
		Total:        total,
	}
	return pipeSuccess(messages.Admin_Messages_Listed, &data)
}

func (p *AdminPipe) LockConversation(ctx context.Context, adminUserID, conversationID uuid.UUID, dto dtos.AdminConversationActionDTO) *shared.PipeRes[AdminConversationData] {
	action := string(models.AdminLockConversationAction)
	reason := strings.TrimSpace(dto.Reason)
	if reason == "" || len(reason) > 500 {
		logAdminActionResult(action, adminUserID, "conversation", conversationID, "invalid_request", nil)
		return pipeError[AdminConversationData](messages.Invalid_Admin_Request)
	}
	current, err := p.repo.GetConversationByID(ctx, conversationID)
	if err != nil {
		logAdminActionResult(action, adminUserID, "conversation", conversationID, "failed", err)
		return pipeError[AdminConversationData](messages.Invalid_Admin_Request)
	}
	if current.ID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "conversation", conversationID, "not_found", nil)
		return pipeError[AdminConversationData](messages.Admin_Conversation_Not_Found)
	}
	record, err := p.repo.LockConversation(ctx, repository.AdminConversationActionParams{
		ConversationID: conversationID,
		AdminUserID:    adminUserID,
		Action:         models.AdminLockConversationAction,
		Reason:         reason,
	})
	if err != nil {
		logAdminActionResult(action, adminUserID, "conversation", conversationID, "failed", err)
		return pipeError[AdminConversationData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "conversation", conversationID, "not_found", nil)
		return pipeError[AdminConversationData](messages.Admin_Conversation_Not_Found)
	}
	data := toAdminConversationData(record)
	logAdminActionResult(action, adminUserID, "conversation", conversationID, "success", nil)
	return pipeSuccess(messages.Admin_Conversation_Locked, &data)
}

func (p *AdminPipe) UnlockConversation(ctx context.Context, adminUserID, conversationID uuid.UUID, dto dtos.AdminConversationActionDTO) *shared.PipeRes[AdminConversationData] {
	action := string(models.AdminUnlockConversationAction)
	reason := strings.TrimSpace(dto.Reason)
	if reason == "" || len(reason) > 500 {
		logAdminActionResult(action, adminUserID, "conversation", conversationID, "invalid_request", nil)
		return pipeError[AdminConversationData](messages.Invalid_Admin_Request)
	}
	current, err := p.repo.GetConversationByID(ctx, conversationID)
	if err != nil {
		logAdminActionResult(action, adminUserID, "conversation", conversationID, "failed", err)
		return pipeError[AdminConversationData](messages.Invalid_Admin_Request)
	}
	if current.ID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "conversation", conversationID, "not_found", nil)
		return pipeError[AdminConversationData](messages.Admin_Conversation_Not_Found)
	}
	record, err := p.repo.UnlockConversation(ctx, repository.AdminConversationActionParams{
		ConversationID: conversationID,
		AdminUserID:    adminUserID,
		Action:         models.AdminUnlockConversationAction,
		Reason:         reason,
	})
	if err != nil {
		logAdminActionResult(action, adminUserID, "conversation", conversationID, "failed", err)
		return pipeError[AdminConversationData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "conversation", conversationID, "not_found", nil)
		return pipeError[AdminConversationData](messages.Admin_Conversation_Not_Found)
	}
	data := toAdminConversationData(record)
	logAdminActionResult(action, adminUserID, "conversation", conversationID, "success", nil)
	return pipeSuccess(messages.Admin_Conversation_Unlocked, &data)
}

func (p *AdminPipe) HideMessage(ctx context.Context, adminUserID, conversationID, messageID uuid.UUID, dto dtos.AdminConversationActionDTO) *shared.PipeRes[AdminMessageData] {
	action := string(models.AdminHideMessageAction)
	reason := strings.TrimSpace(dto.Reason)
	if reason == "" || len(reason) > 500 {
		logAdminActionResult(action, adminUserID, "message", messageID, "invalid_request", nil)
		return pipeError[AdminMessageData](messages.Invalid_Admin_Request)
	}
	conversation, err := p.repo.GetConversationByID(ctx, conversationID)
	if err != nil {
		logAdminActionResult(action, adminUserID, "message", messageID, "failed", err)
		return pipeError[AdminMessageData](messages.Invalid_Admin_Request)
	}
	if conversation.ID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "message", messageID, "conversation_not_found", nil)
		return pipeError[AdminMessageData](messages.Admin_Conversation_Not_Found)
	}
	record, err := p.repo.HideMessage(ctx, repository.AdminConversationActionParams{
		ConversationID: conversationID,
		MessageID:      messageID,
		AdminUserID:    adminUserID,
		Action:         models.AdminHideMessageAction,
		Reason:         reason,
	})
	if err != nil {
		logAdminActionResult(action, adminUserID, "message", messageID, "failed", err)
		return pipeError[AdminMessageData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		logAdminActionResult(action, adminUserID, "message", messageID, "not_found", nil)
		return pipeError[AdminMessageData](messages.Admin_Message_Not_Found)
	}
	data := toAdminMessageData(record)
	logAdminActionResult(action, adminUserID, "message", messageID, "success", nil)
	return pipeSuccess(messages.Admin_Message_Hidden, &data)
}
