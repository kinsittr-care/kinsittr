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
		logBookingEvent("approve", bookingID, userID, models.NannyUserRole, "nanny_profile_lookup_failed", err)
		return pipeError[BookingData](messages.Invalid_Booking_Request)
	}
	if nannyProfile.ID == uuid.Nil {
		logBookingEvent("approve", bookingID, userID, models.NannyUserRole, "nanny_profile_not_found", nil)
		return pipeError[BookingData](messages.Nanny_Profile_Not_Found)
	}

	if p.payments != nil {
		if err := p.payments.EnsureBookingPaymentReady(ctx, nannyProfile.ID, bookingID); err != nil {
			if err.Error() == messages.Booking_Payment_Setup_Missing {
				logBookingEvent("approve", bookingID, userID, models.NannyUserRole, "payment_setup_missing", err)
				return pipeError[BookingData](messages.Booking_Payment_Setup_Missing)
			}
			logBookingEvent("approve", bookingID, userID, models.NannyUserRole, "payment_readiness_failed", err)
			return pipeError[BookingData](messages.Cannot_Approve_Booking)
		}
	}

	booking, err := p.repo.ApproveNannyBookingWithConversation(ctx, nannyProfile.ID, bookingID)
	if err != nil {
		if errors.Is(err, bookings.ErrNannyTimeUnavailable) {
			logBookingEvent("approve", bookingID, userID, models.NannyUserRole, "nanny_time_unavailable", err)
			return pipeError[BookingData](messages.Nanny_Time_Unavailable)
		}
		logBookingEvent("approve", bookingID, userID, models.NannyUserRole, "failed", err)
		return pipeError[BookingData](messages.Cannot_Approve_Booking)
	}
	if booking.ID == uuid.Nil {
		logBookingEvent("approve", bookingID, userID, models.NannyUserRole, "not_found", nil)
		return pipeError[BookingData](messages.Booking_Not_Found)
	}

	data := toBookingRecordData(booking)
	p.notifyParentProfile(ctx, booking.ParentProfileID, models.Notification{
		Type:  models.BookingApprovedNotificationType,
		Title: "Booking approved",
		Body:  "Your booking request was approved.",
		Data:  notificationData(map[string]string{"booking_id": booking.ID.String()}),
	})
	logBookingEvent("approve", booking.ID, userID, models.NannyUserRole, "success_conversation_opened", nil)
	return pipeSuccess(messages.Booking_Approved, &data)
}
