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

func (p *ConversationsPipe) List(ctx context.Context, userID uuid.UUID, role models.UserRole, dto dtos.ListConversationsQueryDTO) *shared.PipeRes[ConversationListData] {
	page, limit := normalizePageLimit(dto.Page, dto.Limit, 20)

	var (
		itemsRaw []messages_repo.ConversationRecord
		total    int
		err      error
	)

	switch role {
	case models.ParentUserRole:
		parentProfile, profileErr := p.profileRepo.GetParentProfileByUserID(ctx, userID)
		if profileErr != nil {
			return pipeError[ConversationListData](conversation_messages.Invalid_Message_Request)
		}
		if parentProfile.ID == uuid.Nil {
			return conversationNotFound[ConversationListData]()
		}
		itemsRaw, total, err = p.repo.ListParentConversations(ctx, parentProfile.ID, messages_repo.ConversationListFilter{Page: page, Limit: limit, UserID: userID})
	case models.NannyUserRole:
		nannyProfile, profileErr := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
		if profileErr != nil {
			return pipeError[ConversationListData](conversation_messages.Invalid_Message_Request)
		}
		if nannyProfile.ID == uuid.Nil {
			return conversationNotFound[ConversationListData]()
		}
		itemsRaw, total, err = p.repo.ListNannyConversations(ctx, nannyProfile.ID, messages_repo.ConversationListFilter{Page: page, Limit: limit, UserID: userID})
	default:
		return pipeError[ConversationListData](conversation_messages.Forbidden_Conversation_Access)
	}
	if err != nil {
		return pipeError[ConversationListData](conversation_messages.Invalid_Message_Request)
	}

	items := make([]ConversationData, 0, len(itemsRaw))
	for _, item := range itemsRaw {
		items = append(items, toConversationData(item))
	}

	data := ConversationListData{Items: items, Page: page, Limit: limit, Total: total}
	return pipeSuccess(conversation_messages.Conversation_Listed, &data)
}
