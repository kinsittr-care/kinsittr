package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/bookings/messages"
	"github.com/kinsittr/kinsittr-api/models"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *BookingsPipe) Decline(ctx context.Context, userID, bookingID uuid.UUID) *shared.PipeRes[BookingData] {
	nannyProfile, err := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
	if err != nil {
		logBookingEvent("decline", bookingID, userID, models.NannyUserRole, "nanny_profile_lookup_failed", err)
		return pipeError[BookingData](messages.Invalid_Booking_Request)
	}
	if nannyProfile.ID == uuid.Nil {
		logBookingEvent("decline", bookingID, userID, models.NannyUserRole, "nanny_profile_not_found", nil)
		return pipeError[BookingData](messages.Nanny_Profile_Not_Found)
	}

	booking, err := p.repo.DeclineNannyBooking(ctx, nannyProfile.ID, bookingID)
	if err != nil {
		logBookingEvent("decline", bookingID, userID, models.NannyUserRole, "failed", err)
		return pipeError[BookingData](messages.Cannot_Decline_Booking)
	}
	if booking.ID == uuid.Nil {
		logBookingEvent("decline", bookingID, userID, models.NannyUserRole, "not_found", nil)
		return pipeError[BookingData](messages.Booking_Not_Found)
	}

	data := toBookingRecordData(booking)
	p.notifyParentProfile(ctx, booking.ParentProfileID, models.Notification{
		Type:  models.BookingDeclinedNotificationType,
		Title: "Booking declined",
		Body:  "Your booking request was declined.",
		Data:  notificationData(map[string]string{"booking_id": booking.ID.String()}),
	})
	logBookingEvent("decline", booking.ID, userID, models.NannyUserRole, "success", nil)
	return pipeSuccess(messages.Booking_Declined, &data)
}
