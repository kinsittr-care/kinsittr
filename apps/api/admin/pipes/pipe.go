package pipes

import (
	"context"
	"encoding/json"
	"log"
	"net/url"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/messages"
	adminservices "github.com/kinsittr/kinsittr-api/admin/services"
	"github.com/kinsittr/kinsittr-api/models"
	repository "github.com/kinsittr/kinsittr-api/repositories/admin"
	notifyrepo "github.com/kinsittr/kinsittr-api/repositories/notifications"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

type AdminPipe struct {
	repo            repository.AdminRepository
	platformFeeRate float64
	notifyRepo      notifyrepo.NotificationsRepository
	emailService    *adminservices.EmailService
	payments        AdminPaymentProcessor
	webOrigin       string
}

type AdminPaymentProcessor interface {
	ChargeCompletedBooking(ctx context.Context, nannyProfileID, bookingID uuid.UUID) error
	RefundBooking(ctx context.Context, bookingID uuid.UUID) error
}

func NewAdminPipe(repo repository.AdminRepository, platformFeeRate float64, notifyRepo ...notifyrepo.NotificationsRepository) *AdminPipe {
	rate := 0.10
	if platformFeeRate >= 0 {
		rate = platformFeeRate
	}
	var notifications notifyrepo.NotificationsRepository
	if len(notifyRepo) > 0 {
		notifications = notifyRepo[0]
	}
	return &AdminPipe{repo: repo, platformFeeRate: rate, notifyRepo: notifications}
}

func (p *AdminPipe) SetInviteEmailService(emailService *adminservices.EmailService, webOrigin string) {
	p.emailService = emailService
	p.webOrigin = strings.TrimRight(strings.TrimSpace(webOrigin), "/")
}

func (p *AdminPipe) SetPaymentProcessor(processor AdminPaymentProcessor) {
	p.payments = processor
}

func pipeError[T any](message string) *shared.PipeRes[T] {
	return &shared.PipeRes[T]{
		Success: false,
		Message: shared.CreatePipeMessage(message),
	}
}

func pipeSuccess[T any](message string, data *T) *shared.PipeRes[T] {
	return &shared.PipeRes[T]{
		Success: true,
		Message: shared.CreatePipeMessage(message),
		Data:    data,
	}
}

func logAdminActionResult(action string, actorID uuid.UUID, targetType string, targetID uuid.UUID, result string, err error) {
	if err != nil {
		log.Printf("admin_action action=%s actor_id=%s target_type=%s target_id=%s result=%s err=%v", action, actorID, targetType, targetID, result, err)
		return
	}
	log.Printf("admin_action action=%s actor_id=%s target_type=%s target_id=%s result=%s", action, actorID, targetType, targetID, result)
}

func normalizePageLimit(page, limit int) (int, int) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	return page, limit
}

func parseVerificationStatus(value string) (models.VerificationStatus, bool) {
	switch models.VerificationStatus(strings.TrimSpace(value)) {
	case "":
		return "", true
	case models.PendingVerificationStatus, models.UnderReviewVerificationStatus, models.VerifiedVerificationStatus, models.RejectedVerificationStatus:
		return models.VerificationStatus(value), true
	default:
		return "", false
	}
}

func parseBookingStatus(value string) (models.BookingStatus, bool) {
	switch models.BookingStatus(strings.TrimSpace(value)) {
	case "":
		return "", true
	case models.PendingBookingStatus, models.ApprovedBookingStatus, models.DeclinedBookingStatus, models.CancelledBookingStatus, models.CompletedBookingStatus:
		return models.BookingStatus(value), true
	default:
		return "", false
	}
}

func parseDate(value string, endOfDay bool) (*time.Time, error) {
	if strings.TrimSpace(value) == "" {
		return nil, nil
	}
	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		return nil, err
	}
	if endOfDay {
		parsed = time.Date(parsed.Year(), parsed.Month(), parsed.Day(), 23, 59, 59, 0, time.UTC)
	} else {
		parsed = time.Date(parsed.Year(), parsed.Month(), parsed.Day(), 0, 0, 0, 0, time.UTC)
	}
	return &parsed, nil
}

func notFoundNanny[T any]() *shared.PipeRes[T] {
	return pipeError[T](messages.Admin_Nanny_Not_Found)
}

func notFoundParent[T any]() *shared.PipeRes[T] {
	return pipeError[T](messages.Admin_Parent_Not_Found)
}

func adminNotificationData(values map[string]string) []byte {
	data, err := json.Marshal(values)
	if err != nil {
		return []byte("{}")
	}
	return data
}

func (p *AdminPipe) adminInviteLink(token string) string {
	origin := p.webOrigin
	if origin == "" {
		return token
	}
	return origin + "/auth/admin/accept-invite?token=" + url.QueryEscape(token)
}
