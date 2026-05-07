package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/bookings/messages"
	"github.com/kinsittr/kinsittr-api/repositories/bookings"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *BookingsPipe) ListForNanny(ctx context.Context, userID uuid.UUID) *shared.PipeRes[[]BookingData] {
	nannyProfile, err := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
	if err != nil {
		return pipeError[[]BookingData](messages.Invalid_Booking_Request)
	}
	if nannyProfile.ID == uuid.Nil {
		return pipeError[[]BookingData](messages.Nanny_Profile_Not_Found)
	}

	filter := bookings.ListBookingsFilter{
		Page:  1,
		Limit: 20,
	}

	bookings, _, err := p.repo.ListNannyBookings(ctx, nannyProfile.ID, filter)
	if err != nil {
		return pipeError[[]BookingData](messages.Invalid_Booking_Request)
	}

	items := make([]BookingData, 0, len(bookings))
	for _, booking := range bookings {
		items = append(items, toBookingRecordData(booking))
	}

	return pipeSuccess(messages.Booking_Listed, &items)
}
