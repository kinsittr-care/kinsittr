package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/conversations/dtos"
	convmessages "github.com/kinsittr/kinsittr-api/conversations/messages"
	"github.com/kinsittr/kinsittr-api/models"
	messagesrepo "github.com/kinsittr/kinsittr-api/repositories/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *ConversationsPipe) ListMessages(ctx context.Context, userID uuid.UUID, role models.UserRole, conversationID uuid.UUID, dto dtos.ListMessagesQueryDTO) *shared.PipeRes[MessageListData] {
	page, limit := normalizePageLimit(dto.Page, dto.Limit, 50)

	var record messagesrepo.ConversationRecord
	var err error

	switch role {
	case models.ParentUserRole:
		parentProfile, profileErr := p.profileRepo.GetParentProfileByUserID(ctx, userID)
		if profileErr != nil {
			return pipeError[MessageListData](convmessages.Invalid_Message_Request)
		}
		if parentProfile.ID == uuid.Nil {
			return conversationNotFound[MessageListData]()
		}
		record, err = p.repo.GetParentConversationByID(ctx, conversationID, parentProfile.ID)
	case models.NannyUserRole:
		nannyProfile, profileErr := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
		if profileErr != nil {
			return pipeError[MessageListData](convmessages.Invalid_Message_Request)
		}
		if nannyProfile.ID == uuid.Nil {
			return conversationNotFound[MessageListData]()
		}
		record, err = p.repo.GetNannyConversationByID(ctx, conversationID, nannyProfile.ID)
	default:
		return pipeError[MessageListData](convmessages.Forbidden_Conversation_Access)
	}
	if err != nil {
		return pipeError[MessageListData](convmessages.Invalid_Message_Request)
	}
	if record.ID == uuid.Nil {
		return conversationNotFound[MessageListData]()
	}

	itemsRaw, total, err := p.repo.ListMessages(ctx, conversationID, messagesrepo.MessageListFilter{
		Page:  page,
		Limit: limit,
	})
	if err != nil {
		return pipeError[MessageListData](convmessages.Invalid_Message_Request)
	}

	items := make([]MessageData, 0, len(itemsRaw))
	for _, item := range itemsRaw {
		items = append(items, toMessageData(item))
	}

	data := MessageListData{Items: items, Page: page, Limit: limit, Total: total}
	return pipeSuccess(convmessages.Messages_Listed, &data)
}
