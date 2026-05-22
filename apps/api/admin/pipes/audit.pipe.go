package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *AdminPipe) ListNannyActions(ctx context.Context, nannyProfileID uuid.UUID, dto dtos.ListAdminMessagesQueryDTO) *shared.PipeRes[AdminAuditActionListData] {
	page, limit := normalizePageLimit(dto.Page, dto.Limit)
	nanny, err := p.repo.GetNannyByID(ctx, nannyProfileID)
	if err != nil {
		return pipeError[AdminAuditActionListData](messages.Invalid_Admin_Request)
	}
	if nanny.ID == uuid.Nil {
		return notFoundNanny[AdminAuditActionListData]()
	}
	itemsRaw, total, err := p.repo.ListNannyActions(ctx, nannyProfileID, page, limit)
	if err != nil {
		return pipeError[AdminAuditActionListData](messages.Invalid_Admin_Request)
	}
	return pipeSuccess(messages.Admin_Actions_Listed, toAdminAuditActionListData(itemsRaw, page, limit, total))
}

func (p *AdminPipe) ListParentActions(ctx context.Context, parentProfileID uuid.UUID, dto dtos.ListAdminMessagesQueryDTO) *shared.PipeRes[AdminAuditActionListData] {
	page, limit := normalizePageLimit(dto.Page, dto.Limit)
	parent, err := p.repo.GetParentByID(ctx, parentProfileID)
	if err != nil {
		return pipeError[AdminAuditActionListData](messages.Invalid_Admin_Request)
	}
	if parent.ID == uuid.Nil {
		return notFoundParent[AdminAuditActionListData]()
	}
	itemsRaw, total, err := p.repo.ListParentActions(ctx, parentProfileID, page, limit)
	if err != nil {
		return pipeError[AdminAuditActionListData](messages.Invalid_Admin_Request)
	}
	return pipeSuccess(messages.Admin_Actions_Listed, toAdminAuditActionListData(itemsRaw, page, limit, total))
}

func (p *AdminPipe) ListConversationActions(ctx context.Context, conversationID uuid.UUID, dto dtos.ListAdminMessagesQueryDTO) *shared.PipeRes[AdminAuditActionListData] {
	page, limit := normalizePageLimit(dto.Page, dto.Limit)
	conversation, err := p.repo.GetConversationByID(ctx, conversationID)
	if err != nil {
		return pipeError[AdminAuditActionListData](messages.Invalid_Admin_Request)
	}
	if conversation.ID == uuid.Nil {
		return pipeError[AdminAuditActionListData](messages.Admin_Conversation_Not_Found)
	}
	itemsRaw, total, err := p.repo.ListConversationActions(ctx, conversationID, page, limit)
	if err != nil {
		return pipeError[AdminAuditActionListData](messages.Invalid_Admin_Request)
	}
	return pipeSuccess(messages.Admin_Actions_Listed, toAdminAuditActionListData(itemsRaw, page, limit, total))
}
