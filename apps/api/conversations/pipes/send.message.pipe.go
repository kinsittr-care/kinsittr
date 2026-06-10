package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/conversations/dtos"
	conversation_messages "github.com/kinsittr/kinsittr-api/conversations/messages"
	"github.com/kinsittr/kinsittr-api/models"
	messages_repo "github.com/kinsittr/kinsittr-api/repositories/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *ConversationsPipe) SendMessage(ctx context.Context, userID uuid.UUID, role models.UserRole, conversationID uuid.UUID, dto dtos.SendMessageDTO) *shared.PipeRes[MessageData] {
	body := trimmedBody(dto.Body)
	if body == "" {
		logConversationEvent("send_message", conversationID, userID, role, "empty_body", nil)
		return pipeError[MessageData](conversation_messages.Invalid_Message_Request)
	}

	var record messages_repo.ConversationRecord
	var err error

	switch role {
	case models.ParentUserRole:
		parentProfile, profileErr := p.profileRepo.GetParentProfileByUserID(ctx, userID)
		if profileErr != nil {
			logConversationEvent("send_message", conversationID, userID, role, "parent_profile_lookup_failed", profileErr)
			return pipeError[MessageData](conversation_messages.Invalid_Message_Request)
		}
		if parentProfile.ID == uuid.Nil {
			logConversationEvent("send_message", conversationID, userID, role, "conversation_not_found", nil)
			return conversationNotFound[MessageData]()
		}
		record, err = p.repo.GetParentConversationByID(ctx, conversationID, parentProfile.ID, userID)
	case models.NannyUserRole:
		nannyProfile, profileErr := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
		if profileErr != nil {
			logConversationEvent("send_message", conversationID, userID, role, "nanny_profile_lookup_failed", profileErr)
			return pipeError[MessageData](conversation_messages.Invalid_Message_Request)
		}
		if nannyProfile.ID == uuid.Nil {
			logConversationEvent("send_message", conversationID, userID, role, "conversation_not_found", nil)
			return conversationNotFound[MessageData]()
		}
		record, err = p.repo.GetNannyConversationByID(ctx, conversationID, nannyProfile.ID, userID)
	default:
		logConversationEvent("send_message", conversationID, userID, role, "forbidden_role", nil)
		return pipeError[MessageData](conversation_messages.Forbidden_Conversation_Access)
	}
	if err != nil {
		logConversationEvent("send_message", conversationID, userID, role, "conversation_lookup_failed", err)
		return pipeError[MessageData](conversation_messages.Invalid_Message_Request)
	}
	if record.ID == uuid.Nil {
		logConversationEvent("send_message", conversationID, userID, role, "conversation_not_found", nil)
		return conversationNotFound[MessageData]()
	}
	if record.LockedAt != nil {
		logConversationEvent("send_message", conversationID, userID, role, "conversation_locked", nil)
		return pipeError[MessageData](conversation_messages.Forbidden_Conversation_Access)
	}

	message, err := p.repo.CreateMessage(ctx, models.Message{
		ID:             uuid.New(),
		ConversationID: conversationID,
		SenderUserID:   userID,
		SenderRole:     role,
		Body:           body,
	})
	if err != nil {
		logConversationEvent("send_message", conversationID, userID, role, "create_failed", err)
		return pipeError[MessageData](conversation_messages.Invalid_Message_Request)
	}
	if _, err := p.repo.MarkConversationRead(ctx, conversationID, userID); err != nil {
		logConversationEvent("send_message", conversationID, userID, role, "mark_read_failed", err)
		return pipeError[MessageData](conversation_messages.Invalid_Message_Request)
	}

	data := toMessageData(message)
	if role == models.ParentUserRole {
		p.notifyNannyProfile(ctx, record.NannyProfileID, models.Notification{
			Type:  models.MessageReceivedNotificationType,
			Title: "New message",
			Body:  "A parent sent you a message.",
			Data:  notificationData(map[string]string{"conversation_id": conversationID.String(), "message_id": message.ID.String()}),
		})
	} else {
		p.notifyParentProfile(ctx, record.ParentProfileID, models.Notification{
			Type:  models.MessageReceivedNotificationType,
			Title: "New message",
			Body:  "A nanny sent you a message.",
			Data:  notificationData(map[string]string{"conversation_id": conversationID.String(), "message_id": message.ID.String()}),
		})
	}
	logConversationEvent("send_message", conversationID, userID, role, "success", nil)
	return pipeSuccess(conversation_messages.Message_Sent, &data)
}
