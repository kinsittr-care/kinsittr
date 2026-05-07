package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/bookings/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *BookingsPipe) GetByID(ctx context.Context, userID, bookingID uuid.UUID) *shared.PipeRes[BookingData] {
	parentProfile, err := p.profileRepo.GetParentProfileByUserID(ctx, userID)
	if err != nil {
		return pipeError[BookingData](messages.Invalid_Booking_Request)
	}
	if parentProfile.ID == uuid.Nil {
		return pipeError[BookingData](messages.Parent_Profile_Not_Found)
	}

	booking, err := p.repo.GetParentBookingByID(ctx, parentProfile.ID, bookingID)
	if err != nil {
		return pipeError[BookingData](messages.Invalid_Booking_Request)
	}
	if booking.ID == uuid.Nil {
		return pipeError[BookingData](messages.Booking_Not_Found)
	}

	data := toBookingRecordData(booking)
	return pipeSuccess(messages.Booking_Found, &data)
}
