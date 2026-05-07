package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/bookings/dtos"
	"github.com/kinsittr/kinsittr-api/bookings/messages"
	"github.com/kinsittr/kinsittr-api/repositories/bookings"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *BookingsPipe) List(ctx context.Context, userID uuid.UUID, dto dtos.ListBookingsQueryDTO) *shared.PipeRes[BookingListData] {
	parentProfile, err := p.profileRepo.GetParentProfileByUserID(ctx, userID)
	if err != nil {
		return pipeError[BookingListData](messages.Invalid_Booking_Request)
	}
	if parentProfile.ID == uuid.Nil {
		return pipeError[BookingListData](messages.Parent_Profile_Not_Found)
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

	filter := bookings.ListBookingsFilter{
		Page:     dto.Page,
		Limit:    dto.Limit,
		Status:   status,
		DateFrom: dateFrom,
		DateTo:   dateTo,
	}

	itemsRaw, total, err := p.repo.ListParentBookings(ctx, parentProfile.ID, filter)
	if err != nil {
		return pipeError[BookingListData](messages.Invalid_Booking_Request)
	}

	items := make([]BookingData, 0, len(itemsRaw))
	for _, booking := range itemsRaw {
		items = append(items, toBookingRecordData(booking))
	}

	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 20
	}
	if filter.Limit > 100 {
		filter.Limit = 100
	}

	data := BookingListData{
		Items: items,
		Page:  filter.Page,
		Limit: filter.Limit,
		Total: total,
	}

	return pipeSuccess(messages.Booking_Listed, &data)
}
