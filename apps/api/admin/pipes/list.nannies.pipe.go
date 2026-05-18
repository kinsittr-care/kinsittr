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

func (p *AdminPipe) ListNannies(ctx context.Context, dto dtos.ListAdminNanniesQueryDTO) *shared.PipeRes[AdminNannyListData] {
	page, limit := normalizePageLimit(dto.Page, dto.Limit)
	status, ok := parseVerificationStatus(dto.Status)
	if !ok {
		return pipeError[AdminNannyListData](messages.Invalid_Admin_Request)
	}

	itemsRaw, total, err := p.repo.ListNannies(ctx, repository.ListNanniesFilter{
		Page:   page,
		Limit:  limit,
		Search: strings.TrimSpace(dto.Search),
		Status: status,
		City:   strings.TrimSpace(dto.City),
	})
	if err != nil {
		return pipeError[AdminNannyListData](messages.Invalid_Admin_Request)
	}

	items := make([]AdminNannyData, 0, len(itemsRaw))
	for _, item := range itemsRaw {
		items = append(items, toAdminNannyData(item))
	}
	data := AdminNannyListData{Items: items, Page: page, Limit: limit, Total: total}
	return pipeSuccess(messages.Admin_Nannies_Listed, &data)
}

func (p *AdminPipe) ListScreeningNannies(ctx context.Context, dto dtos.ListAdminNanniesQueryDTO) *shared.PipeRes[AdminNannyListData] {
	if strings.TrimSpace(dto.Status) == "" {
		dto.Status = string(models.PendingVerificationStatus)
	}
	res := p.ListNannies(ctx, dto)
	if res.Success {
		res.Message = shared.CreatePipeMessage(messages.Admin_Screening_Listed)
	}
	return res
}

func (p *AdminPipe) GetNanny(ctx context.Context, nannyProfileID uuid.UUID) *shared.PipeRes[AdminNannyData] {
	record, err := p.repo.GetNannyByID(ctx, nannyProfileID)
	if err != nil {
		return pipeError[AdminNannyData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		return notFoundNanny[AdminNannyData]()
	}
	data := toAdminNannyData(record)
	return pipeSuccess(messages.Admin_Nanny_Fetched, &data)
}
