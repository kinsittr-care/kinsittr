package pipes

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/bookings/dtos"
	"github.com/kinsittr/kinsittr-api/bookings/messages"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/repositories/bookings"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *BookingsPipe) Create(ctx context.Context, userID uuid.UUID, dto dtos.CreateBookingDTO) *shared.PipeRes[BookingData] {
	parentProfile, err := p.profileRepo.GetParentProfileByUserID(ctx, userID)
	if err != nil {
		logBookingEvent("create", uuid.Nil, userID, models.ParentUserRole, "parent_profile_lookup_failed", err)
		return pipeError[BookingData](messages.Invalid_Booking_Request)
	}
	if parentProfile.ID == uuid.Nil {
		logBookingEvent("create", uuid.Nil, userID, models.ParentUserRole, "parent_profile_not_found", nil)
		return pipeError[BookingData](messages.Parent_Profile_Not_Found)
	}

	nannyID, err := parseUUID(dto.NannyID)
	if err != nil {
		logBookingEvent("create", uuid.Nil, userID, models.ParentUserRole, "invalid_nanny_id", err)
		return pipeError[BookingData](messages.Invalid_Booking_Request)
	}

	nannyProfile, err := p.nannyRepo.GetVerifiedNannyByID(ctx, nannyID)
	if err != nil {
		logBookingEvent("create", uuid.Nil, userID, models.ParentUserRole, "nanny_lookup_failed", err)
		return pipeError[BookingData](messages.Invalid_Booking_Request)
	}
	if nannyProfile.ID == uuid.Nil {
		logBookingEvent("create", uuid.Nil, userID, models.ParentUserRole, "nanny_profile_not_found", nil)
		return pipeError[BookingData](messages.Nanny_Profile_Not_Found)
	}

	dateOnly, startDateTime, err := parseBookingDateTime(dto.Date, dto.StartTime, dto.TimezoneOffsetMinutes)
	if err != nil {
		logBookingEvent("create", uuid.Nil, userID, models.ParentUserRole, "invalid_datetime", err)
		return pipeError[BookingData](messages.Invalid_Booking_Request)
	}
	if !startDateTime.After(time.Now().UTC()) {
		logBookingEvent("create", uuid.Nil, userID, models.ParentUserRole, "start_in_past", nil)
		return pipeError[BookingData](messages.Booking_Start_In_Past)
	}

	hasExistingBooking, err := p.repo.HasParentActiveBookingWithNanny(
		ctx,
		parentProfile.ID,
		nannyProfile.ID,
		startDateTime,
		dto.Duration,
	)
	if err != nil {
		logBookingEvent("create", uuid.Nil, userID, models.ParentUserRole, "parent_conflict_check_failed", err)
		return pipeError[BookingData](messages.Invalid_Booking_Request)
	}
	if hasExistingBooking {
		logBookingEvent("create", uuid.Nil, userID, models.ParentUserRole, "parent_existing_booking", nil)
		return pipeError[BookingData](messages.Booking_Already_Exists)
	}

	hasApprovedConflict, err := p.repo.HasNannyApprovedBookingConflict(
		ctx,
		nannyProfile.ID,
		startDateTime,
		dto.Duration,
	)
	if err != nil {
		logBookingEvent("create", uuid.Nil, userID, models.ParentUserRole, "nanny_conflict_check_failed", err)
		return pipeError[BookingData](messages.Invalid_Booking_Request)
	}
	if hasApprovedConflict {
		logBookingEvent("create", uuid.Nil, userID, models.ParentUserRole, "nanny_time_unavailable", nil)
		return pipeError[BookingData](messages.Nanny_Time_Unavailable)
	}

	booking, err := p.repo.CreateBooking(ctx, models.Booking{
		ID:              uuid.New(),
		ParentProfileID: parentProfile.ID,
		NannyProfileID:  nannyProfile.ID,
		Date:            dateOnly,
		StartTime:       startDateTime,
		Duration:        dto.Duration,
		TotalAmount:     nannyProfile.RatePerHour * float64(dto.Duration),
		Status:          models.PendingBookingStatus,
	})
	if err != nil {
		switch {
		case errors.Is(err, bookings.ErrBookingAlreadyExists):
			logBookingEvent("create", uuid.Nil, userID, models.ParentUserRole, "parent_existing_booking", err)
			return pipeError[BookingData](messages.Booking_Already_Exists)
		case errors.Is(err, bookings.ErrNannyTimeUnavailable):
			logBookingEvent("create", uuid.Nil, userID, models.ParentUserRole, "nanny_time_unavailable", err)
			return pipeError[BookingData](messages.Nanny_Time_Unavailable)
		}
		logBookingEvent("create", uuid.Nil, userID, models.ParentUserRole, "failed", err)
		return pipeError[BookingData](messages.Invalid_Booking_Request)
	}

	data := toBookingData(booking)
	data.NannyDisplayName = nannyProfile.DisplayName
	data.NannyCity = nannyProfile.City
	data.NannyProvince = nannyProfile.Province

	p.notifyNannyProfile(ctx, nannyProfile.ID, models.Notification{
		Type:  models.BookingRequestedNotificationType,
		Title: "New booking request",
		Body:  "A parent sent you a booking request.",
		Data:  notificationData(map[string]string{"booking_id": booking.ID.String()}),
	})

	logBookingEvent("create", booking.ID, userID, models.ParentUserRole, "success", nil)
	return pipeSuccess(messages.Booking_Created, &data)
}
