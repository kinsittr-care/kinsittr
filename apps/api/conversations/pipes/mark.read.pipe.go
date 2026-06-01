package pipes

import (
	"context"

	"github.com/google/uuid"
	conversation_messages "github.com/kinsittr/kinsittr-api/conversations/messages"
	"github.com/kinsittr/kinsittr-api/models"
	messages_repo "github.com/kinsittr/kinsittr-api/repositories/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *ConversationsPipe) MarkRead(ctx context.Context, userID uuid.UUID, role models.UserRole, conversationID uuid.UUID) *shared.PipeRes[ConversationData] {
	var (
		record messages_repo.ConversationRecord
		err    error
	)

	switch role {
	case models.ParentUserRole:
		parentProfile, profileErr := p.profileRepo.GetParentProfileByUserID(ctx, userID)
		if profileErr != nil {
			return pipeError[ConversationData](conversation_messages.Invalid_Message_Request)
		}
		if parentProfile.ID == uuid.Nil {
			return conversationNotFound[ConversationData]()
		}
		record, err = p.repo.GetParentConversationByID(ctx, conversationID, parentProfile.ID, userID)
	case models.NannyUserRole:
		nannyProfile, profileErr := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
		if profileErr != nil {
			return pipeError[ConversationData](conversation_messages.Invalid_Message_Request)
		}
		if nannyProfile.ID == uuid.Nil {
			return conversationNotFound[ConversationData]()
		}
		record, err = p.repo.GetNannyConversationByID(ctx, conversationID, nannyProfile.ID, userID)
	default:
		return pipeError[ConversationData](conversation_messages.Forbidden_Conversation_Access)
	}
	if err != nil {
		return pipeError[ConversationData](conversation_messages.Invalid_Message_Request)
	}
	if record.ID == uuid.Nil {
		return conversationNotFound[ConversationData]()
	}

	read, err := p.repo.MarkConversationRead(ctx, conversationID, userID)
	if err != nil {
		return pipeError[ConversationData](conversation_messages.Invalid_Message_Request)
	}

	record.UnreadCount = 0
	record.LastReadAt = &read.LastReadAt
	data := toConversationData(record)
	return pipeSuccess(conversation_messages.Conversation_Read, &data)
}
