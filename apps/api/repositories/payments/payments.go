package payments

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinsittr/kinsittr-api/models"
)

type PaymentContext struct {
	BookingID         uuid.UUID
	ParentProfileID   uuid.UUID
	NannyProfileID    uuid.UUID
	ParentUserID      uuid.UUID
	NannyUserID       uuid.UUID
	ParentEmail       string
	ParentDisplayName string
	StripeCustomerID  string
	NannyEmail        string
	NannyDisplayName  string
	StripeAccountID   string
	StripeOnboarded   bool
	Amount            float64
	Currency          models.Currency
}

type CreatePaymentParams struct {
	BookingID             uuid.UUID
	ParentProfileID       uuid.UUID
	NannyProfileID        uuid.UUID
	StripePaymentIntentID string
	StripeChargeID        string
	Amount                float64
	PlatformFee           float64
	Currency              models.Currency
	Status                models.PaymentStatus
	FailureMessage        string
}

type PaymentsRepository interface {
	GetNannyPaymentContext(ctx context.Context, nannyProfileID, bookingID uuid.UUID) (PaymentContext, error)
	UpdateNannyStripeAccount(ctx context.Context, nannyProfileID uuid.UUID, accountID string, onboarded bool) error
	UpdateNannyStripeOnboardedByAccountID(ctx context.Context, accountID string, onboarded bool) error
	UpdateParentStripeCustomer(ctx context.Context, parentProfileID uuid.UUID, customerID string) error
	GetPaymentByBookingID(ctx context.Context, bookingID uuid.UUID) (models.BookingPayment, error)
	UpsertBookingPayment(ctx context.Context, params CreatePaymentParams) (models.BookingPayment, error)
	UpdatePaymentStatusByIntentID(ctx context.Context, paymentIntentID string, status models.PaymentStatus, chargeID, failureMessage string) error
	UpdatePaymentRefundedByChargeID(ctx context.Context, chargeID, refundID string) error
}

var PaymentsRepo PaymentsRepository

func InitPaymentsRepo(db *pgxpool.Pool) {
	PaymentsRepo = newPgRepository(db)
}
