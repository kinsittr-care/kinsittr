package pipes

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
	"github.com/kinsittr/kinsittr-api/models"
	repository "github.com/kinsittr/kinsittr-api/repositories/admin"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *AdminPipe) ListBookings(ctx context.Context, dto dtos.ListAdminBookingsQueryDTO) *shared.PipeRes[AdminBookingListData] {
	page, limit := normalizePageLimit(dto.Page, dto.Limit)
	status, ok := parseBookingStatus(dto.Status)
	if !ok {
		return pipeError[AdminBookingListData](messages.Invalid_Admin_Request)
	}
	dateFrom, err := parseDate(dto.DateFrom, false)
	if err != nil {
		return pipeError[AdminBookingListData](messages.Invalid_Admin_Request)
	}
	dateTo, err := parseDate(dto.DateTo, true)
	if err != nil {
		return pipeError[AdminBookingListData](messages.Invalid_Admin_Request)
	}
	if dateFrom != nil && dateTo != nil && dateFrom.After(*dateTo) {
		return pipeError[AdminBookingListData](messages.Invalid_Admin_Request)
	}

	itemsRaw, total, err := p.repo.ListBookings(ctx, repository.ListBookingsFilter{
		Page:     page,
		Limit:    limit,
		Search:   strings.TrimSpace(dto.Search),
		Status:   status,
		DateFrom: dateFrom,
		DateTo:   dateTo,
	})
	if err != nil {
		return pipeError[AdminBookingListData](messages.Invalid_Admin_Request)
	}

	items := make([]AdminBookingData, 0, len(itemsRaw))
	for _, item := range itemsRaw {
		items = append(items, toAdminBookingData(item))
	}
	data := AdminBookingListData{Items: items, Page: page, Limit: limit, Total: total}
	return pipeSuccess(messages.Admin_Bookings_Listed, &data)
}

func (p *AdminPipe) GetBooking(ctx context.Context, bookingID uuid.UUID) *shared.PipeRes[AdminBookingData] {
	record, err := p.repo.GetBookingByID(ctx, bookingID)
	if err != nil {
		return pipeError[AdminBookingData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		return pipeError[AdminBookingData](messages.Admin_Booking_Not_Found)
	}
	data := toAdminBookingData(record)
	return pipeSuccess(messages.Admin_Booking_Fetched, &data)
}

func (p *AdminPipe) CancelBooking(ctx context.Context, adminUserID, bookingID uuid.UUID, dto dtos.AdminBookingActionDTO) *shared.PipeRes[AdminBookingData] {
	reason := strings.TrimSpace(dto.Reason)
	if reason == "" || len(reason) > 500 {
		return pipeError[AdminBookingData](messages.Invalid_Admin_Request)
	}

	current, err := p.repo.GetBookingByID(ctx, bookingID)
	if err != nil {
		return pipeError[AdminBookingData](messages.Invalid_Admin_Request)
	}
	if current.ID == uuid.Nil {
		return pipeError[AdminBookingData](messages.Admin_Booking_Not_Found)
	}
	if current.Status != models.PendingBookingStatus && current.Status != models.ApprovedBookingStatus {
		return pipeError[AdminBookingData](messages.Admin_Booking_Action_Blocked)
	}

	record, err := p.repo.CancelBooking(ctx, repository.AdminBookingActionParams{
		BookingID:   bookingID,
		AdminUserID: adminUserID,
		Reason:      reason,
	})
	if err != nil {
		return pipeError[AdminBookingData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		return pipeError[AdminBookingData](messages.Admin_Booking_Action_Blocked)
	}
	data := toAdminBookingData(record)
	if p.payments != nil {
		_ = p.payments.RefundBooking(ctx, record.ID)
	}
	p.notifyBookingParticipants(ctx, record, "Booking cancelled by admin", "An admin cancelled this booking.", models.BookingCancelledNotificationType)
	return pipeSuccess(messages.Admin_Booking_Cancelled, &data)
}

func (p *AdminPipe) CompleteBooking(ctx context.Context, adminUserID, bookingID uuid.UUID, dto dtos.AdminBookingActionDTO) *shared.PipeRes[AdminBookingData] {
	reason := strings.TrimSpace(dto.Reason)
	if reason == "" || len(reason) > 500 {
		return pipeError[AdminBookingData](messages.Invalid_Admin_Request)
	}

	current, err := p.repo.GetBookingByID(ctx, bookingID)
	if err != nil {
		return pipeError[AdminBookingData](messages.Invalid_Admin_Request)
	}
	if current.ID == uuid.Nil {
		return pipeError[AdminBookingData](messages.Admin_Booking_Not_Found)
	}
	if current.Status != models.ApprovedBookingStatus {
		return pipeError[AdminBookingData](messages.Admin_Booking_Action_Blocked)
	}
	if current.StartTime.Add(time.Duration(current.Duration) * time.Hour).After(time.Now().UTC()) {
		return pipeError[AdminBookingData](messages.Admin_Booking_Action_Blocked)
	}
	if p.payments != nil {
		if err := p.payments.ChargeCompletedBooking(ctx, current.NannyProfileID, current.ID); err != nil {
			return pipeError[AdminBookingData](messages.Admin_Booking_Payment_Failed)
		}
	}

	record, err := p.repo.CompleteBooking(ctx, repository.AdminBookingActionParams{
		BookingID:   bookingID,
		AdminUserID: adminUserID,
		Reason:      reason,
	})
	if err != nil {
		return pipeError[AdminBookingData](messages.Invalid_Admin_Request)
	}
	if record.ID == uuid.Nil {
		return pipeError[AdminBookingData](messages.Admin_Booking_Action_Blocked)
	}
	data := toAdminBookingData(record)
	p.notifyBookingParticipants(ctx, record, "Booking completed by admin", "An admin marked this booking as completed.", models.BookingCompletedNotificationType)
	return pipeSuccess(messages.Admin_Booking_Completed, &data)
}

func (p *AdminPipe) ListBookingActions(ctx context.Context, bookingID uuid.UUID, dto dtos.ListAdminMessagesQueryDTO) *shared.PipeRes[AdminBookingActionListData] {
	page, limit := normalizePageLimit(dto.Page, dto.Limit)
	booking, err := p.repo.GetBookingByID(ctx, bookingID)
	if err != nil {
		return pipeError[AdminBookingActionListData](messages.Invalid_Admin_Request)
	}
	if booking.ID == uuid.Nil {
		return pipeError[AdminBookingActionListData](messages.Admin_Booking_Not_Found)
	}

	itemsRaw, total, err := p.repo.ListBookingActions(ctx, bookingID, page, limit)
	if err != nil {
		return pipeError[AdminBookingActionListData](messages.Invalid_Admin_Request)
	}
	items := make([]AdminBookingActionData, 0, len(itemsRaw))
	for _, item := range itemsRaw {
		items = append(items, toAdminBookingActionData(item))
	}
	data := AdminBookingActionListData{Items: items, Page: page, Limit: limit, Total: total}
	return pipeSuccess(messages.Admin_Booking_Actions_Listed, &data)
}

func (p *AdminPipe) notifyBookingParticipants(ctx context.Context, booking repository.BookingRecord, title, body string, notificationType models.NotificationType) {
	if p.notifyRepo == nil {
		return
	}
	payload := adminNotificationData(map[string]string{"booking_id": booking.ID.String()})
	_, _ = p.notifyRepo.CreateForParentProfileID(ctx, booking.ParentProfileID, models.Notification{
		Type:  notificationType,
		Title: title,
		Body:  body,
		Data:  payload,
	})
	_, _ = p.notifyRepo.CreateForNannyProfileID(ctx, booking.NannyProfileID, models.Notification{
		Type:  notificationType,
		Title: title,
		Body:  body,
		Data:  payload,
	})
}
