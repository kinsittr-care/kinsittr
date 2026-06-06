package pipes

import (
	"context"
	"encoding/json"
	"log"
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
	AccountID                 string   `json:"account_id,omitempty"`
	Onboarded                 bool     `json:"onboarded"`
	ChargesEnabled            bool     `json:"charges_enabled"`
	PayoutsEnabled            bool     `json:"payouts_enabled"`
	DetailsSubmitted          bool     `json:"details_submitted"`
	RequirementsCurrentlyDue  []string `json:"requirements_currently_due"`
	RequirementsEventuallyDue []string `json:"requirements_eventually_due"`
	DisabledReason            string   `json:"disabled_reason,omitempty"`
}

type StripeBalanceAmountData struct {
	Amount   float64 `json:"amount"`
	Currency string  `json:"currency"`
}

type StripeBalanceData struct {
	Available []StripeBalanceAmountData `json:"available"`
	Pending   []StripeBalanceAmountData `json:"pending"`
}

type StripePayoutData struct {
	ID          string  `json:"id"`
	Amount      float64 `json:"amount"`
	Currency    string  `json:"currency"`
	Status      string  `json:"status"`
	ArrivalDate string  `json:"arrival_date"`
	CreatedAt   string  `json:"created_at"`
}

type StripePayoutListData struct {
	Items []StripePayoutData `json:"items"`
}

type NannyPayoutSettingsData struct {
	Schedule string `json:"schedule"`
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

func logPaymentEvent(action string, bookingID uuid.UUID, parentProfileID uuid.UUID, nannyProfileID uuid.UUID, result string, err error) {
	if err != nil {
		log.Printf("payment_%s booking_id=%s parent_profile_id=%s nanny_profile_id=%s result=%s err=%v", action, bookingID, parentProfileID, nannyProfileID, result, err)
		return
	}
	log.Printf("payment_%s booking_id=%s parent_profile_id=%s nanny_profile_id=%s result=%s", action, bookingID, parentProfileID, nannyProfileID, result)
}

func logStripeWebhookEvent(eventID, eventType, result string, err error) {
	if err != nil {
		log.Printf("stripe_webhook event_id=%s event_type=%s result=%s err=%v", eventID, eventType, result, err)
		return
	}
	log.Printf("stripe_webhook event_id=%s event_type=%s result=%s", eventID, eventType, result)
}
