package pipes

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/bookings/messages"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/repositories/bookings"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *BookingsPipe) Approve(ctx context.Context, userID, bookingID uuid.UUID) *shared.PipeRes[BookingData] {
	nannyProfile, err := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
	if err != nil {
		return pipeError[BookingData](messages.Invalid_Booking_Request)
	}
	if nannyProfile.ID == uuid.Nil {
		return pipeError[BookingData](messages.Nanny_Profile_Not_Found)
	}

	booking, err := p.repo.ApproveNannyBookingWithConversation(ctx, nannyProfile.ID, bookingID)
	if err != nil {
		if errors.Is(err, bookings.ErrNannyTimeUnavailable) {
			return pipeError[BookingData](messages.Nanny_Time_Unavailable)
		}
		return pipeError[BookingData](messages.Cannot_Approve_Booking)
	}
	if booking.ID == uuid.Nil {
		return pipeError[BookingData](messages.Booking_Not_Found)
	}

	data := toBookingRecordData(booking)
	if p.payments != nil {
		_ = p.payments.ChargeApprovedBooking(ctx, nannyProfile.ID, booking.ID)
	}
	p.notifyParentProfile(ctx, booking.ParentProfileID, models.Notification{
		Type:  models.BookingApprovedNotificationType,
		Title: "Booking approved",
		Body:  "Your booking request was approved.",
		Data:  notificationData(map[string]string{"booking_id": booking.ID.String()}),
	})
	return pipeSuccess(messages.Booking_Approved, &data)
}
