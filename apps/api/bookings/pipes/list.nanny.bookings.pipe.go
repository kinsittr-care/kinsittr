package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/bookings/dtos"
	"github.com/kinsittr/kinsittr-api/bookings/messages"
	"github.com/kinsittr/kinsittr-api/repositories/bookings"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *BookingsPipe) ListForNanny(ctx context.Context, userID uuid.UUID, dto dtos.ListBookingsQueryDTO) *shared.PipeRes[BookingListData] {
	nannyProfile, err := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
	if err != nil {
		return pipeError[BookingListData](messages.Invalid_Booking_Request)
	}
	if nannyProfile.ID == uuid.Nil {
		return pipeError[BookingListData](messages.Nanny_Profile_Not_Found)
	}

	status, ok := parseBookingListStatus(dto.Status)
	if !ok {
		return pipeError[BookingListData](messages.Invalid_Booking_Request)
	}
	dateFrom, err := parseDateBoundary(dto.DateFrom, false)
	if err != nil {
		return pipeError[BookingListData](messages.Invalid_Booking_Request)
	}
	dateTo, err := parseDateBoundary(dto.DateTo, true)
	if err != nil {
		return pipeError[BookingListData](messages.Invalid_Booking_Request)
	}
	if dateFrom != nil && dateTo != nil && dateFrom.After(*dateTo) {
		return pipeError[BookingListData](messages.Invalid_Booking_Request)
	}

	page := dto.Page
	if page < 1 {
		page = 1
	}
	limit := dto.Limit
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	filter := bookings.ListBookingsFilter{
		Page:     page,
		Limit:    limit,
		Status:   status,
		DateFrom: dateFrom,
		DateTo:   dateTo,
	}

	itemsRaw, total, err := p.repo.ListNannyBookings(ctx, nannyProfile.ID, filter)
	if err != nil {
		return pipeError[BookingListData](messages.Invalid_Booking_Request)
	}

	items := make([]BookingData, 0, len(itemsRaw))
	for _, booking := range itemsRaw {
		items = append(items, toBookingRecordData(booking))
	}

	data := BookingListData{
		Items: items,
		Page:  filter.Page,
		Limit: filter.Limit,
		Total: total,
	}

	return pipeSuccess(messages.Booking_Listed, &data)
}
