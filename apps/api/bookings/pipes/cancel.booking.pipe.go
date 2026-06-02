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
		logBookingEvent("cancel", bookingID, userID, models.ParentUserRole, "parent_profile_lookup_failed", err)
		return pipeError[BookingData](messages.Invalid_Booking_Request)
	}
	if parentProfile.ID == uuid.Nil {
		logBookingEvent("cancel", bookingID, userID, models.ParentUserRole, "parent_profile_not_found", nil)
		return pipeError[BookingData](messages.Parent_Profile_Not_Found)
	}

	currentBooking, err := p.repo.GetParentBookingByID(ctx, parentProfile.ID, bookingID)
	if err != nil {
		logBookingEvent("cancel", bookingID, userID, models.ParentUserRole, "lookup_failed", err)
		return pipeError[BookingData](messages.Cannot_Cancel_Booking)
	}
	if currentBooking.ID == uuid.Nil {
		logBookingEvent("cancel", bookingID, userID, models.ParentUserRole, "not_found", nil)
		return pipeError[BookingData](messages.Booking_Not_Found)
	}
	if currentBooking.Status == models.ApprovedBookingStatus {
		logBookingEvent("cancel", bookingID, userID, models.ParentUserRole, "already_approved", nil)
		return pipeError[BookingData](messages.Booking_Already_Approved)
	}
	if currentBooking.Status != models.PendingBookingStatus {
		logBookingEvent("cancel", bookingID, userID, models.ParentUserRole, "blocked", nil)
		return pipeError[BookingData](messages.Cannot_Cancel_Booking)
	}

	booking, err := p.repo.CancelParentBooking(ctx, parentProfile.ID, bookingID)
	if err != nil {
		logBookingEvent("cancel", bookingID, userID, models.ParentUserRole, "failed", err)
		return pipeError[BookingData](messages.Cannot_Cancel_Booking)
	}
	if booking.ID == uuid.Nil {
		logBookingEvent("cancel", bookingID, userID, models.ParentUserRole, "blocked", nil)
		return pipeError[BookingData](messages.Cannot_Cancel_Booking)
	}

	data := toBookingRecordData(booking)
	p.notifyNannyProfile(ctx, booking.NannyProfileID, models.Notification{
		Type:  models.BookingCancelledNotificationType,
		Title: "Booking cancelled",
		Body:  "A parent cancelled a pending booking.",
		Data:  notificationData(map[string]string{"booking_id": booking.ID.String()}),
	})
	logBookingEvent("cancel", booking.ID, userID, models.ParentUserRole, "success", nil)
	return pipeSuccess(messages.Booking_Cancelled, &data)
}
