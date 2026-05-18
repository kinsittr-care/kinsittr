package pipes

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
	repository "github.com/kinsittr/kinsittr-api/repositories/admin"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *AdminPipe) ListParents(ctx context.Context, dto dtos.ListAdminParentsQueryDTO) *shared.PipeRes[AdminParentListData] {
	page, limit := normalizePageLimit(dto.Page, dto.Limit)

	itemsRaw, total, err := p.repo.ListParents(ctx, repository.ListParentsFilter{
		Page:   page,
		Limit:  limit,
		Search: strings.TrimSpace(dto.Search),
		City:   strings.TrimSpace(dto.City),
	})
	if err != nil {
		return pipeError[AdminParentListData](messages.Invalid_Admin_Request)
	}

	items := make([]AdminParentData, 0, len(itemsRaw))
	for _, item := range itemsRaw {
		items = append(items, toAdminParentData(item))
	}

	data := AdminParentListData{Items: items, Page: page, Limit: limit, Total: total}
	return pipeSuccess(messages.Admin_Parents_Listed, &data)
}

func (p *AdminPipe) GetParent(ctx context.Context, parentProfileID uuid.UUID, dto dtos.ListAdminBookingsQueryDTO) *shared.PipeRes[AdminParentDetailData] {
	parent, err := p.repo.GetParentByID(ctx, parentProfileID)
	if err != nil {
		return pipeError[AdminParentDetailData](messages.Invalid_Admin_Request)
	}
	if parent.ID == uuid.Nil {
		return notFoundParent[AdminParentDetailData]()
	}

	page, limit := normalizePageLimit(dto.Page, dto.Limit)
	status, ok := parseBookingStatus(dto.Status)
	if !ok {
		return pipeError[AdminParentDetailData](messages.Invalid_Admin_Request)
	}
	dateFrom, err := parseDate(dto.DateFrom, false)
	if err != nil {
		return pipeError[AdminParentDetailData](messages.Invalid_Admin_Request)
	}
	dateTo, err := parseDate(dto.DateTo, true)
	if err != nil {
		return pipeError[AdminParentDetailData](messages.Invalid_Admin_Request)
	}
	if dateFrom != nil && dateTo != nil && dateFrom.After(*dateTo) {
		return pipeError[AdminParentDetailData](messages.Invalid_Admin_Request)
	}

	bookingsRaw, total, err := p.repo.ListParentBookingHistory(ctx, parentProfileID, repository.ListBookingsFilter{
		Page:     page,
		Limit:    limit,
		Status:   status,
		DateFrom: dateFrom,
		DateTo:   dateTo,
	})
	if err != nil {
		return pipeError[AdminParentDetailData](messages.Invalid_Admin_Request)
	}

	bookings := make([]AdminBookingData, 0, len(bookingsRaw))
	for _, item := range bookingsRaw {
		bookings = append(bookings, toAdminBookingData(item))
	}

	data := AdminParentDetailData{
		Parent: toAdminParentData(parent),
		Bookings: AdminBookingListData{
			Items: bookings,
			Page:  page,
			Limit: limit,
			Total: total,
		},
	}
	return pipeSuccess(messages.Admin_Parent_Fetched, &data)
}
