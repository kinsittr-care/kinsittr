package pipes

import (
	"context"

	"github.com/google/uuid"
	convmessages "github.com/kinsittr/kinsittr-api/conversations/messages"
	"github.com/kinsittr/kinsittr-api/models"
	messagesrepo "github.com/kinsittr/kinsittr-api/repositories/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *ConversationsPipe) GetByID(ctx context.Context, userID uuid.UUID, role models.UserRole, conversationID uuid.UUID) *shared.PipeRes[ConversationData] {
	var (
		record messagesrepo.ConversationRecord
		err    error
	)

	switch role {
	case models.ParentUserRole:
		parentProfile, profileErr := p.profileRepo.GetParentProfileByUserID(ctx, userID)
		if profileErr != nil {
			return pipeError[ConversationData](convmessages.Invalid_Message_Request)
		}
		if parentProfile.ID == uuid.Nil {
			return conversationNotFound[ConversationData]()
		}
		record, err = p.repo.GetParentConversationByID(ctx, conversationID, parentProfile.ID)
	case models.NannyUserRole:
		nannyProfile, profileErr := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
		if profileErr != nil {
			return pipeError[ConversationData](convmessages.Invalid_Message_Request)
		}
		if nannyProfile.ID == uuid.Nil {
			return conversationNotFound[ConversationData]()
		}
		record, err = p.repo.GetNannyConversationByID(ctx, conversationID, nannyProfile.ID)
	default:
		return pipeError[ConversationData](convmessages.Forbidden_Conversation_Access)
	}
	if err != nil {
		return pipeError[ConversationData](convmessages.Invalid_Message_Request)
	}
	if record.ID == uuid.Nil {
		return conversationNotFound[ConversationData]()
	}

	data := toConversationData(record)
	return pipeSuccess(convmessages.Conversation_Found, &data)
}
