package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/bookings/messages"
	"github.com/kinsittr/kinsittr-api/models"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *BookingsPipe) Cancel(ctx context.Context, userID, bookingID uuid.UUID) *shared.PipeRes[BookingData] {
	parentProfile, err := p.profileRepo.GetParentProfileByUserID(ctx, userID)
	if err != nil {
		return pipeError[BookingData](messages.Invalid_Booking_Request)
	}
	if parentProfile.ID == uuid.Nil {
		return pipeError[BookingData](messages.Parent_Profile_Not_Found)
	}

	currentBooking, err := p.repo.GetParentBookingByID(ctx, parentProfile.ID, bookingID)
	if err != nil {
		return pipeError[BookingData](messages.Cannot_Cancel_Booking)
	}
	if currentBooking.ID == uuid.Nil {
		return pipeError[BookingData](messages.Booking_Not_Found)
	}
	if currentBooking.Status == models.ApprovedBookingStatus {
		return pipeError[BookingData](messages.Booking_Already_Approved)
	}
	if currentBooking.Status != models.PendingBookingStatus {
		return pipeError[BookingData](messages.Cannot_Cancel_Booking)
	}

	booking, err := p.repo.CancelParentBooking(ctx, parentProfile.ID, bookingID)
	if err != nil {
		return pipeError[BookingData](messages.Cannot_Cancel_Booking)
	}
	if booking.ID == uuid.Nil {
		return pipeError[BookingData](messages.Cannot_Cancel_Booking)
	}

	data := toBookingRecordData(booking)
	return pipeSuccess(messages.Booking_Cancelled, &data)
}
