package pipes

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/bookings/messages"
	"github.com/kinsittr/kinsittr-api/models"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *BookingsPipe) Complete(ctx context.Context, userID, bookingID uuid.UUID) *shared.PipeRes[BookingData] {
	nannyProfile, err := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
	if err != nil {
		return pipeError[BookingData](messages.Invalid_Booking_Request)
	}
	if nannyProfile.ID == uuid.Nil {
		return pipeError[BookingData](messages.Nanny_Profile_Not_Found)
	}

	currentBooking, err := p.repo.GetNannyBookingByID(ctx, nannyProfile.ID, bookingID)
	if err != nil {
		return pipeError[BookingData](messages.Cannot_Complete_Booking)
	}
	if currentBooking.ID == uuid.Nil {
		return pipeError[BookingData](messages.Booking_Not_Found)
	}
	if currentBooking.Status != models.ApprovedBookingStatus {
		return pipeError[BookingData](messages.Cannot_Complete_Booking)
	}
	if currentBooking.StartTime.Add(time.Duration(currentBooking.Duration) * time.Hour).After(time.Now().UTC()) {
		return pipeError[BookingData](messages.Cannot_Complete_Booking)
	}
	if p.payments != nil {
		if err := p.payments.ChargeCompletedBooking(ctx, nannyProfile.ID, bookingID); err != nil {
			if err.Error() == messages.Booking_Payment_Setup_Missing {
				return pipeError[BookingData](messages.Booking_Payment_Setup_Missing)
			}
			return pipeError[BookingData](messages.Booking_Payment_Failed)
		}
	}

	booking, err := p.repo.CompleteNannyBooking(ctx, nannyProfile.ID, bookingID)
	if err != nil || booking.ID == uuid.Nil {
		return pipeError[BookingData](messages.Cannot_Complete_Booking)
	}

	data := toBookingRecordData(booking)
	p.notifyParentProfile(ctx, booking.ParentProfileID, models.Notification{
		Type:  models.BookingCompletedNotificationType,
		Title: "Booking completed",
		Body:  "Your nanny marked the booking as completed.",
		Data:  notificationData(map[string]string{"booking_id": booking.ID.String()}),
	})
	return pipeSuccess(messages.Booking_Completed, &data)
}
