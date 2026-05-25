package pipes

import (
	"context"
	"encoding/json"
	"math"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	notifyrepo "github.com/kinsittr/kinsittr-api/repositories/notifications"
	paymentrepo "github.com/kinsittr/kinsittr-api/repositories/payments"
	"github.com/kinsittr/kinsittr-api/repositories/profile"
	shared "github.com/kinsittr/kinsittr-api/shared"
	stripeapi "github.com/kinsittr/kinsittr-api/shared/stripe"
)

type PaymentsPipe struct {
	repo            paymentrepo.PaymentsRepository
	profileRepo     profile.ProfileRepository
	stripe          *stripeapi.Client
	notifyRepo      notifyrepo.NotificationsRepository
	webhookSecret   string
	platformFeeRate float64
	refreshURL      string
	returnURL       string
}

type StripeConnectData struct {
	AccountID string `json:"account_id"`
	URL       string `json:"url"`
	Onboarded bool   `json:"onboarded"`
}

type StripeStatusData struct {
	AccountID string `json:"account_id,omitempty"`
	Onboarded bool   `json:"onboarded"`
}

type SetupIntentData struct {
	CustomerID   string `json:"customer_id"`
	ClientSecret string `json:"client_secret"`
}

type PaymentMethodData struct {
	ID        string `json:"id"`
	Brand     string `json:"brand"`
	Last4     string `json:"last4"`
	ExpMonth  int    `json:"exp_month"`
	ExpYear   int    `json:"exp_year"`
	IsDefault bool   `json:"is_default"`
}

type PaymentMethodListData struct {
	Items []PaymentMethodData `json:"items"`
}

func NewPaymentsPipe(repo paymentrepo.PaymentsRepository, profileRepo profile.ProfileRepository, stripeClient *stripeapi.Client, platformFeeRate float64, webhookSecret, refreshURL, returnURL string, notifyRepo ...notifyrepo.NotificationsRepository) *PaymentsPipe {
	var notifications notifyrepo.NotificationsRepository
	if len(notifyRepo) > 0 {
		notifications = notifyRepo[0]
	}
	return &PaymentsPipe{
		repo:            repo,
		profileRepo:     profileRepo,
		stripe:          stripeClient,
		notifyRepo:      notifications,
		webhookSecret:   webhookSecret,
		platformFeeRate: platformFeeRate,
		refreshURL:      refreshURL,
		returnURL:       returnURL,
	}
}

func paymentNotificationData(values map[string]string) []byte {
	data, err := json.Marshal(values)
	if err != nil {
		return []byte("{}")
	}
	return data
}

func (p *PaymentsPipe) notifyParentProfile(ctx context.Context, parentProfileID uuid.UUID, notification models.Notification) {
	if p.notifyRepo == nil || parentProfileID == uuid.Nil {
		return
	}
	_, _ = p.notifyRepo.CreateForParentProfileID(ctx, parentProfileID, notification)
}

func (p *PaymentsPipe) notifyNannyProfile(ctx context.Context, nannyProfileID uuid.UUID, notification models.Notification) {
	if p.notifyRepo == nil || nannyProfileID == uuid.Nil {
		return
	}
	_, _ = p.notifyRepo.CreateForNannyProfileID(ctx, nannyProfileID, notification)
}

func failedPayment(ctx paymentrepo.PaymentContext, reason string, feeRate float64) paymentrepo.CreatePaymentParams {
	return paymentrepo.CreatePaymentParams{
		BookingID:       ctx.BookingID,
		ParentProfileID: ctx.ParentProfileID,
		NannyProfileID:  ctx.NannyProfileID,
		Amount:          ctx.Amount,
		PlatformFee:     math.Round(ctx.Amount*feeRate*100) / 100,
		Currency:        ctx.Currency,
		Status:          models.PaymentFailed,
		FailureMessage:  reason,
	}
}

func cents(value float64) int64 {
	return int64(math.Round(value * 100))
}

func normalizePaymentStatus(status models.PaymentStatus) models.PaymentStatus {
	if status == "canceled" {
		return models.PaymentCancelled
	}
	switch status {
	case models.PaymentRequiresPaymentMethod, models.PaymentRequiresConfirmation, models.PaymentRequiresAction,
		models.PaymentProcessing, models.PaymentSucceeded, models.PaymentCancelled, models.PaymentRefunded:
		return status
	default:
		return models.PaymentFailed
	}
}

func pipeError[T any](message string) *shared.PipeRes[T] {
	return &shared.PipeRes[T]{Success: false, Message: shared.CreatePipeMessage(message)}
}

func pipeSuccess[T any](message string, data *T) *shared.PipeRes[T] {
	return &shared.PipeRes[T]{Success: true, Message: shared.CreatePipeMessage(message), Data: data}
}
