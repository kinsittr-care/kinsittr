package payments

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinsittr/kinsittr-api/models"
)

type pgRepository struct {
	db *pgxpool.Pool
}

func newPgRepository(db *pgxpool.Pool) *pgRepository {
	return &pgRepository{db: db}
}

func (r *pgRepository) GetNannyPaymentContext(ctx context.Context, nannyProfileID, bookingID uuid.UUID) (PaymentContext, error) {
	var data PaymentContext
	err := r.db.QueryRow(ctx, `
		SELECT b.id, b.parent_profile_id, b.nanny_profile_id,
		       pu.id, nu.id,
		       pu.email, pp.display_name, COALESCE(pp.stripe_customer_id, ''), COALESCE(pp.stripe_default_payment_method_id, ''),
		       nu.email, np.display_name, COALESCE(np.stripe_account_id, ''), np.stripe_onboarded,
		       b.total_amount, np.currency
		FROM bookings b
		INNER JOIN parent_profiles pp ON pp.id = b.parent_profile_id
		INNER JOIN nanny_profiles np ON np.id = b.nanny_profile_id
		INNER JOIN users pu ON pu.id = pp.user_id
		INNER JOIN users nu ON nu.id = np.user_id
		WHERE b.id = $1 AND b.nanny_profile_id = $2
	`, bookingID, nannyProfileID).Scan(
		&data.BookingID, &data.ParentProfileID, &data.NannyProfileID,
		&data.ParentUserID, &data.NannyUserID,
		&data.ParentEmail, &data.ParentDisplayName, &data.StripeCustomerID, &data.StripeDefaultPaymentMethodID,
		&data.NannyEmail, &data.NannyDisplayName, &data.StripeAccountID, &data.StripeOnboarded,
		&data.Amount, &data.Currency,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return PaymentContext{}, nil
	}
	return data, err
}

func (r *pgRepository) GetParentBillingContext(ctx context.Context, userID uuid.UUID) (ParentBillingContext, error) {
	var data ParentBillingContext
	err := r.db.QueryRow(ctx, `
		SELECT pp.id, u.id, u.email, pp.display_name, COALESCE(pp.stripe_customer_id, ''), COALESCE(pp.stripe_default_payment_method_id, '')
		FROM parent_profiles pp
		INNER JOIN users u ON u.id = pp.user_id
		WHERE pp.user_id = $1
	`, userID).Scan(
		&data.ParentProfileID,
		&data.UserID,
		&data.Email,
		&data.DisplayName,
		&data.StripeCustomerID,
		&data.StripeDefaultPaymentMethodID,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return ParentBillingContext{}, nil
	}
	return data, err
}

func (r *pgRepository) GetNannyConnectContext(ctx context.Context, userID uuid.UUID) (NannyConnectContext, error) {
	var data NannyConnectContext
	err := r.db.QueryRow(ctx, `
		SELECT np.id, u.id, u.email, np.display_name, COALESCE(np.stripe_account_id, ''), np.stripe_onboarded
		FROM nanny_profiles np
		INNER JOIN users u ON u.id = np.user_id
		WHERE np.user_id = $1
	`, userID).Scan(
		&data.NannyProfileID,
		&data.UserID,
		&data.Email,
		&data.DisplayName,
		&data.StripeAccountID,
		&data.StripeOnboarded,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return NannyConnectContext{}, nil
	}
	return data, err
}

func (r *pgRepository) UpdateNannyStripeAccount(ctx context.Context, nannyProfileID uuid.UUID, accountID string, onboarded bool) error {
	_, err := r.db.Exec(ctx, `
		UPDATE nanny_profiles
		SET stripe_account_id = $1, stripe_onboarded = $2, updated_at = NOW()
		WHERE id = $3
	`, accountID, onboarded, nannyProfileID)
	return err
}

func (r *pgRepository) UpdateNannyStripeOnboardedByAccountID(ctx context.Context, accountID string, onboarded bool) error {
	_, err := r.db.Exec(ctx, `
		UPDATE nanny_profiles
		SET stripe_onboarded = $1, updated_at = NOW()
		WHERE stripe_account_id = $2
	`, onboarded, accountID)
	return err
}

func (r *pgRepository) UpdateParentStripeCustomer(ctx context.Context, parentProfileID uuid.UUID, customerID string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE parent_profiles
		SET stripe_customer_id = $1, updated_at = NOW()
		WHERE id = $2
	`, customerID, parentProfileID)
	return err
}

func (r *pgRepository) UpdateParentDefaultPaymentMethod(ctx context.Context, parentProfileID uuid.UUID, paymentMethodID string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE parent_profiles
		SET stripe_default_payment_method_id = $1, updated_at = NOW()
		WHERE id = $2
	`, paymentMethodID, parentProfileID)
	return err
}

func (r *pgRepository) GetPaymentByBookingID(ctx context.Context, bookingID uuid.UUID) (models.BookingPayment, error) {
	return scanPayment(r.db.QueryRow(ctx, `
		SELECT id, booking_id, parent_profile_id, nanny_profile_id, COALESCE(stripe_payment_intent_id, ''),
		       COALESCE(stripe_charge_id, ''), COALESCE(stripe_refund_id, ''), amount, platform_fee,
		       currency, status, failure_message, created_at, updated_at
		FROM booking_payments
		WHERE booking_id = $1
	`, bookingID))
}

func (r *pgRepository) UpsertBookingPayment(ctx context.Context, params CreatePaymentParams) (models.BookingPayment, error) {
	return scanPayment(r.db.QueryRow(ctx, `
		INSERT INTO booking_payments (
			id, booking_id, parent_profile_id, nanny_profile_id,
			stripe_payment_intent_id, stripe_charge_id, amount, platform_fee,
			currency, status, failure_message
		)
		VALUES ($1, $2, $3, $4, $5, NULLIF($6, ''), $7, $8, $9, $10, $11)
		ON CONFLICT (booking_id) DO UPDATE
		SET stripe_payment_intent_id = EXCLUDED.stripe_payment_intent_id,
		    stripe_charge_id = EXCLUDED.stripe_charge_id,
		    amount = EXCLUDED.amount,
		    platform_fee = EXCLUDED.platform_fee,
		    currency = EXCLUDED.currency,
		    status = EXCLUDED.status,
		    failure_message = EXCLUDED.failure_message,
		    updated_at = NOW()
		RETURNING id, booking_id, parent_profile_id, nanny_profile_id, COALESCE(stripe_payment_intent_id, ''),
		          COALESCE(stripe_charge_id, ''), COALESCE(stripe_refund_id, ''), amount, platform_fee,
		          currency, status, failure_message, created_at, updated_at
	`, uuid.New(), params.BookingID, params.ParentProfileID, params.NannyProfileID,
		params.StripePaymentIntentID, params.StripeChargeID, params.Amount, params.PlatformFee,
		params.Currency, params.Status, params.FailureMessage))
}

func (r *pgRepository) UpdatePaymentStatusByIntentID(ctx context.Context, paymentIntentID string, status models.PaymentStatus, chargeID, failureMessage string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE booking_payments
		SET status = $1,
		    stripe_charge_id = COALESCE(NULLIF($2, ''), stripe_charge_id),
		    failure_message = $3,
		    updated_at = NOW()
		WHERE stripe_payment_intent_id = $4
	`, status, chargeID, failureMessage, paymentIntentID)
	return err
}

func (r *pgRepository) UpdatePaymentRefundedByChargeID(ctx context.Context, chargeID, refundID string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE booking_payments
		SET status = $1,
		    stripe_refund_id = $2,
		    updated_at = NOW()
		WHERE stripe_charge_id = $3
	`, models.PaymentRefunded, refundID, chargeID)
	return err
}

func (r *pgRepository) HasProcessedStripeEvent(ctx context.Context, eventID string) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1 FROM stripe_webhook_events WHERE stripe_event_id = $1
		)
	`, eventID).Scan(&exists)
	return exists, err
}

func (r *pgRepository) RecordProcessedStripeEvent(ctx context.Context, eventID, eventType string) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO stripe_webhook_events (id, stripe_event_id, event_type)
		VALUES ($1, $2, $3)
	`, uuid.New(), eventID, eventType)
	if isUniqueViolation(err) {
		return nil
	}
	return err
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}

func scanPayment(row pgx.Row) (models.BookingPayment, error) {
	var payment models.BookingPayment
	err := row.Scan(
		&payment.ID,
		&payment.BookingID,
		&payment.ParentProfileID,
		&payment.NannyProfileID,
		&payment.StripePaymentIntentID,
		&payment.StripeChargeID,
		&payment.StripeRefundID,
		&payment.Amount,
		&payment.PlatformFee,
		&payment.Currency,
		&payment.Status,
		&payment.FailureMessage,
		&payment.CreatedAt,
		&payment.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.BookingPayment{}, nil
	}
	return payment, err
}
