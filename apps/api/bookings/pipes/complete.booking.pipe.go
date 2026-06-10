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
	return p.completeApprovedBooking(ctx, userID, bookingID, messages.Booking_Completed)
}

func (p *BookingsPipe) RetryPayment(ctx context.Context, userID, bookingID uuid.UUID) *shared.PipeRes[BookingData] {
	return p.completeApprovedBooking(ctx, userID, bookingID, messages.Booking_Payment_Retried)
}

func (p *BookingsPipe) completeApprovedBooking(ctx context.Context, userID, bookingID uuid.UUID, successMessage string) *shared.PipeRes[BookingData] {
	action := "complete"
	if successMessage == messages.Booking_Payment_Retried {
		action = "payment_retry"
	}
	nannyProfile, err := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
	if err != nil {
		logBookingEvent(action, bookingID, userID, models.NannyUserRole, "nanny_profile_lookup_failed", err)
		return pipeError[BookingData](messages.Invalid_Booking_Request)
	}
	if nannyProfile.ID == uuid.Nil {
		logBookingEvent(action, bookingID, userID, models.NannyUserRole, "nanny_profile_not_found", nil)
		return pipeError[BookingData](messages.Nanny_Profile_Not_Found)
	}

	currentBooking, err := p.repo.GetNannyBookingByID(ctx, nannyProfile.ID, bookingID)
	if err != nil {
		logBookingEvent(action, bookingID, userID, models.NannyUserRole, "lookup_failed", err)
		return pipeError[BookingData](messages.Cannot_Complete_Booking)
	}
	if currentBooking.ID == uuid.Nil {
		logBookingEvent(action, bookingID, userID, models.NannyUserRole, "not_found", nil)
		return pipeError[BookingData](messages.Booking_Not_Found)
	}
	if currentBooking.Status != models.ApprovedBookingStatus {
		logBookingEvent(action, bookingID, userID, models.NannyUserRole, "blocked_status", nil)
		return pipeError[BookingData](messages.Cannot_Complete_Booking)
	}
	if currentBooking.StartTime.Add(time.Duration(currentBooking.Duration) * time.Hour).After(time.Now().UTC()) {
		logBookingEvent(action, bookingID, userID, models.NannyUserRole, "blocked_before_end_time", nil)
		return pipeError[BookingData](messages.Cannot_Complete_Booking)
	}
	if p.payments != nil {
		logBookingEvent(action, bookingID, userID, models.NannyUserRole, "payment_triggered", nil)
		if err := p.payments.ChargeCompletedBooking(ctx, nannyProfile.ID, bookingID); err != nil {
			if err.Error() == messages.Booking_Payment_Setup_Missing {
				logBookingEvent(action, bookingID, userID, models.NannyUserRole, "payment_setup_missing", err)
				return pipeError[BookingData](messages.Booking_Payment_Setup_Missing)
			}
			logBookingEvent(action, bookingID, userID, models.NannyUserRole, "payment_failed", err)
			return pipeError[BookingData](messages.Booking_Payment_Failed)
		}
	}

	booking, err := p.repo.CompleteNannyBooking(ctx, nannyProfile.ID, bookingID)
	if err != nil || booking.ID == uuid.Nil {
		logBookingEvent(action, bookingID, userID, models.NannyUserRole, "failed", err)
		return pipeError[BookingData](messages.Cannot_Complete_Booking)
	}

	data := toBookingRecordData(booking)
	p.notifyParentProfile(ctx, booking.ParentProfileID, models.Notification{
		Type:  models.BookingCompletedNotificationType,
		Title: "Booking completed",
		Body:  "Your nanny marked the booking as completed.",
		Data:  notificationData(map[string]string{"booking_id": booking.ID.String()}),
	})
	logBookingEvent(action, booking.ID, userID, models.NannyUserRole, "success", nil)
	return pipeSuccess(successMessage, &data)
}
