package pipes

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/bookings/dtos"
	"github.com/kinsittr/kinsittr-api/bookings/messages"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/repositories/bookings"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *BookingsPipe) CreateChangeRequest(ctx context.Context, userID uuid.UUID, role models.UserRole, bookingID uuid.UUID, dto dtos.CreateBookingChangeRequestDTO) *shared.PipeRes[BookingChangeRequestData] {
	booking, errMessage := p.getOwnedBookingByRole(ctx, userID, role, bookingID)
	if errMessage != "" {
		return pipeError[BookingChangeRequestData](errMessage)
	}

	reason := strings.TrimSpace(dto.Reason)
	if reason == "" {
		return pipeError[BookingChangeRequestData](messages.Invalid_Booking_Request)
	}

	request := models.BookingChangeRequest{
		ID:                uuid.New(),
		BookingID:         booking.ID,
		RequestedByUserID: userID,
		RequestedByRole:   role,
		Type:              models.BookingChangeRequestType(dto.Type),
		Status:            models.PendingBookingChangeRequestStatus,
		Reason:            reason,
	}

	switch request.Type {
	case models.CancelBookingChangeRequestType:
		if booking.Status != models.ApprovedBookingStatus {
			return pipeError[BookingChangeRequestData](messages.Cannot_Create_Booking_Change_Request)
		}
	case models.RescheduleBookingChangeRequestType:
		if booking.Status != models.PendingBookingStatus && booking.Status != models.ApprovedBookingStatus {
			return pipeError[BookingChangeRequestData](messages.Cannot_Create_Booking_Change_Request)
		}
		if dto.Date == "" || dto.StartTime == "" || dto.Duration == 0 {
			return pipeError[BookingChangeRequestData](messages.Invalid_Booking_Request)
		}
		date, startTime, err := parseBookingDateTime(dto.Date, dto.StartTime, dto.TimezoneOffsetMinutes)
		if err != nil {
			return pipeError[BookingChangeRequestData](messages.Invalid_Booking_Request)
		}
		if !startTime.After(time.Now().UTC()) {
			return pipeError[BookingChangeRequestData](messages.Booking_Start_In_Past)
		}
		conflict, err := p.repo.HasNannyApprovedBookingConflictExcluding(ctx, booking.NannyProfileID, startTime, dto.Duration, booking.ID)
		if err != nil {
			return pipeError[BookingChangeRequestData](messages.Cannot_Create_Booking_Change_Request)
		}
		if conflict {
			return pipeError[BookingChangeRequestData](messages.Nanny_Time_Unavailable)
		}
		request.ProposedDate = &date
		request.ProposedStartTime = &startTime
		request.ProposedDuration = &dto.Duration
	default:
		return pipeError[BookingChangeRequestData](messages.Invalid_Booking_Request)
	}

	created, err := p.repo.CreateBookingChangeRequest(ctx, request)
	if err != nil {
		if errors.Is(err, bookings.ErrPendingChangeRequestExists) {
			return pipeError[BookingChangeRequestData](messages.Booking_Change_Request_Already_Pending)
		}
		return pipeError[BookingChangeRequestData](messages.Cannot_Create_Booking_Change_Request)
	}

	data := toBookingChangeRequestData(created)
	if role == models.ParentUserRole {
		p.notifyNannyProfile(ctx, booking.NannyProfileID, models.Notification{
			Type:  models.BookingChangeRequestedNotificationType,
			Title: "Booking change requested",
			Body:  "A parent requested a booking change.",
			Data:  notificationData(map[string]string{"booking_id": booking.ID.String(), "change_request_id": created.ID.String()}),
		})
	} else {
		p.notifyParentProfile(ctx, booking.ParentProfileID, models.Notification{
			Type:  models.BookingChangeRequestedNotificationType,
			Title: "Booking change requested",
			Body:  "A nanny requested a booking change.",
			Data:  notificationData(map[string]string{"booking_id": booking.ID.String(), "change_request_id": created.ID.String()}),
		})
	}
	return pipeSuccess(messages.Booking_Change_Request_Created, &data)
}

func (p *BookingsPipe) ListChangeRequests(ctx context.Context, userID uuid.UUID, role models.UserRole, bookingID uuid.UUID) *shared.PipeRes[BookingChangeRequestListData] {
	booking, errMessage := p.getOwnedBookingByRole(ctx, userID, role, bookingID)
	if errMessage != "" {
		return pipeError[BookingChangeRequestListData](errMessage)
	}

	requests, err := p.repo.ListBookingChangeRequests(ctx, booking.ID)
	if err != nil {
		return pipeError[BookingChangeRequestListData](messages.Invalid_Booking_Request)
	}

	items := make([]BookingChangeRequestData, 0, len(requests))
	for _, request := range requests {
		items = append(items, toBookingChangeRequestData(request))
	}
	data := BookingChangeRequestListData{Items: items}
	return pipeSuccess(messages.Booking_Change_Request_Listed, &data)
}

func (p *BookingsPipe) AcceptChangeRequest(ctx context.Context, userID uuid.UUID, role models.UserRole, bookingID, requestID uuid.UUID, dto dtos.ResolveBookingChangeRequestDTO) *shared.PipeRes[BookingChangeRequestResolutionData] {
	booking, errMessage := p.getOwnedBookingByRole(ctx, userID, role, bookingID)
	if errMessage != "" {
		return pipeError[BookingChangeRequestResolutionData](errMessage)
	}

	request, errMessage := p.getResolvableChangeRequest(ctx, userID, booking.ID, requestID)
	if errMessage != "" {
		return pipeError[BookingChangeRequestResolutionData](errMessage)
	}

	if request.Type == models.CancelBookingChangeRequestType && booking.Status != models.ApprovedBookingStatus {
		return pipeError[BookingChangeRequestResolutionData](messages.Cannot_Resolve_Booking_Change_Request)
	}
	if request.Type == models.RescheduleBookingChangeRequestType {
		if booking.Status != models.PendingBookingStatus && booking.Status != models.ApprovedBookingStatus {
			return pipeError[BookingChangeRequestResolutionData](messages.Cannot_Resolve_Booking_Change_Request)
		}
		if request.ProposedStartTime == nil || request.ProposedDuration == nil {
			return pipeError[BookingChangeRequestResolutionData](messages.Cannot_Resolve_Booking_Change_Request)
		}
		if !request.ProposedStartTime.After(time.Now().UTC()) {
			return pipeError[BookingChangeRequestResolutionData](messages.Booking_Start_In_Past)
		}
		conflict, err := p.repo.HasNannyApprovedBookingConflictExcluding(ctx, booking.NannyProfileID, *request.ProposedStartTime, *request.ProposedDuration, booking.ID)
		if err != nil {
			return pipeError[BookingChangeRequestResolutionData](messages.Cannot_Resolve_Booking_Change_Request)
		}
		if conflict {
			return pipeError[BookingChangeRequestResolutionData](messages.Nanny_Time_Unavailable)
		}
	}

	updatedBooking, accepted, err := p.repo.AcceptBookingChangeRequest(ctx, request.BookingID, request.ID, strings.TrimSpace(dto.ResponseNote))
	if err != nil || updatedBooking.ID == uuid.Nil || accepted.ID == uuid.Nil {
		return pipeError[BookingChangeRequestResolutionData](messages.Cannot_Resolve_Booking_Change_Request)
	}

	data := BookingChangeRequestResolutionData{
		Booking: toBookingRecordData(updatedBooking),
		Request: toBookingChangeRequestData(accepted),
	}
	p.notifyUser(ctx, models.Notification{
		UserID: request.RequestedByUserID,
		Role:   request.RequestedByRole,
		Type:   models.BookingChangeAcceptedNotificationType,
		Title:  "Booking change accepted",
		Body:   "Your booking change request was accepted.",
		Data:   notificationData(map[string]string{"booking_id": booking.ID.String(), "change_request_id": accepted.ID.String()}),
	})
	return pipeSuccess(messages.Booking_Change_Request_Accepted, &data)
}

func (p *BookingsPipe) DeclineChangeRequest(ctx context.Context, userID uuid.UUID, role models.UserRole, bookingID, requestID uuid.UUID, dto dtos.ResolveBookingChangeRequestDTO) *shared.PipeRes[BookingChangeRequestData] {
	booking, errMessage := p.getOwnedBookingByRole(ctx, userID, role, bookingID)
	if errMessage != "" {
		return pipeError[BookingChangeRequestData](errMessage)
	}

	request, errMessage := p.getResolvableChangeRequest(ctx, userID, booking.ID, requestID)
	if errMessage != "" {
		return pipeError[BookingChangeRequestData](errMessage)
	}

	declined, err := p.repo.DeclineBookingChangeRequest(ctx, request.BookingID, request.ID, strings.TrimSpace(dto.ResponseNote))
	if err != nil || declined.ID == uuid.Nil {
		return pipeError[BookingChangeRequestData](messages.Cannot_Resolve_Booking_Change_Request)
	}

	data := toBookingChangeRequestData(declined)
	p.notifyUser(ctx, models.Notification{
		UserID: request.RequestedByUserID,
		Role:   request.RequestedByRole,
		Type:   models.BookingChangeDeclinedNotificationType,
		Title:  "Booking change declined",
		Body:   "Your booking change request was declined.",
		Data:   notificationData(map[string]string{"booking_id": booking.ID.String(), "change_request_id": declined.ID.String()}),
	})
	return pipeSuccess(messages.Booking_Change_Request_Declined, &data)
}

func (p *BookingsPipe) getResolvableChangeRequest(ctx context.Context, userID, bookingID, requestID uuid.UUID) (models.BookingChangeRequest, string) {
	request, err := p.repo.GetBookingChangeRequestByID(ctx, bookingID, requestID)
	if err != nil {
		return models.BookingChangeRequest{}, messages.Cannot_Resolve_Booking_Change_Request
	}
	if request.ID == uuid.Nil {
		return models.BookingChangeRequest{}, messages.Booking_Change_Request_Not_Found
	}
	if request.Status != models.PendingBookingChangeRequestStatus {
		return models.BookingChangeRequest{}, messages.Cannot_Resolve_Booking_Change_Request
	}
	if request.RequestedByUserID == userID {
		return models.BookingChangeRequest{}, messages.Cannot_Resolve_Own_Change_Request
	}
	return request, ""
}

func (p *BookingsPipe) getOwnedBookingByRole(ctx context.Context, userID uuid.UUID, role models.UserRole, bookingID uuid.UUID) (bookings.BookingRecord, string) {
	switch role {
	case models.ParentUserRole:
		parentProfile, err := p.profileRepo.GetParentProfileByUserID(ctx, userID)
		if err != nil {
			return bookings.BookingRecord{}, messages.Invalid_Booking_Request
		}
		if parentProfile.ID == uuid.Nil {
			return bookings.BookingRecord{}, messages.Parent_Profile_Not_Found
		}
		booking, err := p.repo.GetParentBookingByID(ctx, parentProfile.ID, bookingID)
		if err != nil {
			return bookings.BookingRecord{}, messages.Invalid_Booking_Request
		}
		if booking.ID == uuid.Nil {
			return bookings.BookingRecord{}, messages.Booking_Not_Found
		}
		return booking, ""
	case models.NannyUserRole:
		nannyProfile, err := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
		if err != nil {
			return bookings.BookingRecord{}, messages.Invalid_Booking_Request
		}
		if nannyProfile.ID == uuid.Nil {
			return bookings.BookingRecord{}, messages.Nanny_Profile_Not_Found
		}
		booking, err := p.repo.GetNannyBookingByID(ctx, nannyProfile.ID, bookingID)
		if err != nil {
			return bookings.BookingRecord{}, messages.Invalid_Booking_Request
		}
		if booking.ID == uuid.Nil {
			return bookings.BookingRecord{}, messages.Booking_Not_Found
		}
		return booking, ""
	default:
		return bookings.BookingRecord{}, messages.Forbidden_Booking_Access
	}
}
