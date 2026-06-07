package payments

import (
	"context"
	"errors"
	"time"

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

func (r *pgRepository) GetNannyPayoutSettings(ctx context.Context, userID uuid.UUID) (NannyPayoutSettings, error) {
	var settings NannyPayoutSettings
	err := r.db.QueryRow(ctx, `
		INSERT INTO nanny_payout_settings (nanny_profile_id)
		SELECT np.id FROM nanny_profiles np WHERE np.user_id = $1
		ON CONFLICT (nanny_profile_id) DO NOTHING
		RETURNING nanny_profile_id, schedule
	`, userID).Scan(&settings.NannyProfileID, &settings.Schedule)
	if errors.Is(err, pgx.ErrNoRows) {
		err = r.db.QueryRow(ctx, `
			SELECT nps.nanny_profile_id, nps.schedule
			FROM nanny_payout_settings nps
			INNER JOIN nanny_profiles np ON np.id = nps.nanny_profile_id
			WHERE np.user_id = $1
		`, userID).Scan(&settings.NannyProfileID, &settings.Schedule)
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return NannyPayoutSettings{}, nil
	}
	return settings, err
}

func (r *pgRepository) GetNannyPayoutSettingsByAccountID(ctx context.Context, accountID string) (NannyPayoutSettings, error) {
	var settings NannyPayoutSettings
	err := r.db.QueryRow(ctx, `
		INSERT INTO nanny_payout_settings (nanny_profile_id)
		SELECT np.id FROM nanny_profiles np WHERE np.stripe_account_id = $1
		ON CONFLICT (nanny_profile_id) DO NOTHING
		RETURNING nanny_profile_id, schedule
	`, accountID).Scan(&settings.NannyProfileID, &settings.Schedule)
	if errors.Is(err, pgx.ErrNoRows) {
		err = r.db.QueryRow(ctx, `
			SELECT nps.nanny_profile_id, nps.schedule
			FROM nanny_payout_settings nps
			INNER JOIN nanny_profiles np ON np.id = nps.nanny_profile_id
			WHERE np.stripe_account_id = $1
		`, accountID).Scan(&settings.NannyProfileID, &settings.Schedule)
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return NannyPayoutSettings{}, nil
	}
	return settings, err
}

func (r *pgRepository) UpdateNannyPayoutSettings(ctx context.Context, userID uuid.UUID, schedule string) (NannyPayoutSettings, error) {
	var settings NannyPayoutSettings
	err := r.db.QueryRow(ctx, `
		INSERT INTO nanny_payout_settings (nanny_profile_id, schedule)
		SELECT np.id, $2 FROM nanny_profiles np WHERE np.user_id = $1
		ON CONFLICT (nanny_profile_id) DO UPDATE
		SET schedule = EXCLUDED.schedule,
		    updated_at = NOW()
		RETURNING nanny_profile_id, schedule
	`, userID, schedule).Scan(&settings.NannyProfileID, &settings.Schedule)
	if errors.Is(err, pgx.ErrNoRows) {
		return NannyPayoutSettings{}, nil
	}
	return settings, err
}

func (r *pgRepository) GetNannyEarningsSummary(ctx context.Context, userID uuid.UUID) (NannyEarningsSummary, error) {
	location, err := time.LoadLocation("America/Toronto")
	if err != nil {
		location = time.UTC
	}
	now := time.Now().In(location)
	thisMonthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, location)
	nextMonthStart := thisMonthStart.AddDate(0, 1, 0)
	lastMonthStart := thisMonthStart.AddDate(0, -1, 0)

	var summary NannyEarningsSummary
	queryErr := r.db.QueryRow(ctx, `
		SELECT
			COALESCE(SUM(CASE WHEN b.date >= $2 AND b.date < $3 THEN bp.amount - bp.platform_fee ELSE 0 END), 0),
			COUNT(bp.id) FILTER (WHERE b.date >= $2 AND b.date < $3),
			COALESCE(SUM(CASE WHEN b.date >= $4 AND b.date < $2 THEN bp.amount - bp.platform_fee ELSE 0 END), 0),
			COUNT(bp.id) FILTER (WHERE b.date >= $4 AND b.date < $2),
			COALESCE(SUM(CASE WHEN b.id IS NOT NULL THEN bp.amount - bp.platform_fee ELSE 0 END), 0),
			COUNT(b.id)
		FROM nanny_profiles np
		LEFT JOIN booking_payments bp ON bp.nanny_profile_id = np.id AND bp.status = $5
		LEFT JOIN bookings b ON b.id = bp.booking_id AND b.status = $6
		WHERE np.user_id = $1
	`, userID, thisMonthStart.Format(time.DateOnly), nextMonthStart.Format(time.DateOnly), lastMonthStart.Format(time.DateOnly), models.PaymentSucceeded, models.CompletedBookingStatus).Scan(
		&summary.ThisMonthEarnings,
		&summary.ThisMonthBookings,
		&summary.LastMonthEarnings,
		&summary.LastMonthBookings,
		&summary.AllTimeEarnings,
		&summary.AllTimeBookings,
	)
	return summary, queryErr
}

func (r *pgRepository) ListNannyEarnings(ctx context.Context, userID uuid.UUID, page, limit int) ([]NannyEarningRecord, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	var total int
	if err := r.db.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM booking_payments bp
		INNER JOIN bookings b ON b.id = bp.booking_id
		INNER JOIN nanny_profiles np ON np.id = bp.nanny_profile_id
		WHERE np.user_id = $1 AND bp.status = $2 AND b.status = $3
	`, userID, models.PaymentSucceeded, models.CompletedBookingStatus).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.Query(ctx, `
		SELECT b.id, pp.display_name, b.date::date::text, to_char(b.start_time, 'HH24:MI'), b.duration,
		       bp.amount, bp.platform_fee, bp.amount - bp.platform_fee, bp.currency, bp.status
		FROM booking_payments bp
		INNER JOIN bookings b ON b.id = bp.booking_id
		INNER JOIN nanny_profiles np ON np.id = bp.nanny_profile_id
		INNER JOIN parent_profiles pp ON pp.id = bp.parent_profile_id
		WHERE np.user_id = $1 AND bp.status = $2 AND b.status = $3
		ORDER BY b.date DESC, b.start_time DESC
		LIMIT $4 OFFSET $5
	`, userID, models.PaymentSucceeded, models.CompletedBookingStatus, limit, (page-1)*limit)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	records := make([]NannyEarningRecord, 0, limit)
	for rows.Next() {
		var record NannyEarningRecord
		if err := rows.Scan(
			&record.BookingID,
			&record.ParentDisplayName,
			&record.Date,
			&record.StartTime,
			&record.Duration,
			&record.GrossAmount,
			&record.PlatformFee,
			&record.NetAmount,
			&record.Currency,
			&record.PaymentStatus,
		); err != nil {
			return nil, 0, err
		}
		records = append(records, record)
	}
	return records, total, rows.Err()
}

func (r *pgRepository) ListPaymentReconciliationIssues(ctx context.Context, page, limit int) ([]PaymentReconciliationIssue, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	baseQuery := `
		WITH issues AS (
			SELECT 'paid_booking_not_completed' AS issue_type,
			       b.id AS booking_id, b.parent_profile_id, b.nanny_profile_id, b.status AS booking_status,
			       bp.status AS payment_status, COALESCE(bp.stripe_payment_intent_id, '') AS stripe_payment_intent_id,
			       COALESCE(bp.stripe_charge_id, '') AS stripe_charge_id, COALESCE(bp.stripe_refund_id, '') AS stripe_refund_id,
			       bp.amount, bp.currency, bp.updated_at
			FROM booking_payments bp
			INNER JOIN bookings b ON b.id = bp.booking_id
			WHERE bp.status = 'succeeded' AND b.status <> 'completed'

			UNION ALL

			SELECT 'completed_booking_without_succeeded_payment' AS issue_type,
			       b.id AS booking_id, b.parent_profile_id, b.nanny_profile_id, b.status AS booking_status,
			       COALESCE(bp.status, '') AS payment_status, COALESCE(bp.stripe_payment_intent_id, '') AS stripe_payment_intent_id,
			       COALESCE(bp.stripe_charge_id, '') AS stripe_charge_id, COALESCE(bp.stripe_refund_id, '') AS stripe_refund_id,
			       COALESCE(bp.amount, b.total_amount) AS amount, COALESCE(bp.currency, np.currency) AS currency, b.updated_at
			FROM bookings b
			INNER JOIN nanny_profiles np ON np.id = b.nanny_profile_id
			LEFT JOIN booking_payments bp ON bp.booking_id = b.id
			WHERE b.status = 'completed' AND (bp.id IS NULL OR bp.status <> 'succeeded')

			UNION ALL

			SELECT 'cancelled_booking_unrefunded' AS issue_type,
			       b.id AS booking_id, b.parent_profile_id, b.nanny_profile_id, b.status AS booking_status,
			       bp.status AS payment_status, COALESCE(bp.stripe_payment_intent_id, '') AS stripe_payment_intent_id,
			       COALESCE(bp.stripe_charge_id, '') AS stripe_charge_id, COALESCE(bp.stripe_refund_id, '') AS stripe_refund_id,
			       bp.amount, bp.currency, bp.updated_at
			FROM booking_payments bp
			INNER JOIN bookings b ON b.id = bp.booking_id
			WHERE b.status = 'cancelled' AND bp.status IN ('succeeded', 'processing') AND COALESCE(bp.stripe_charge_id, '') <> ''

			UNION ALL

			SELECT 'refunded_payment_booking_not_cancelled' AS issue_type,
			       b.id AS booking_id, b.parent_profile_id, b.nanny_profile_id, b.status AS booking_status,
			       bp.status AS payment_status, COALESCE(bp.stripe_payment_intent_id, '') AS stripe_payment_intent_id,
			       COALESCE(bp.stripe_charge_id, '') AS stripe_charge_id, COALESCE(bp.stripe_refund_id, '') AS stripe_refund_id,
			       bp.amount, bp.currency, bp.updated_at
			FROM booking_payments bp
			INNER JOIN bookings b ON b.id = bp.booking_id
			WHERE bp.status = 'refunded' AND b.status <> 'cancelled'
		)
	`

	var total int
	if err := r.db.QueryRow(ctx, baseQuery+`SELECT COUNT(*) FROM issues`).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.Query(ctx, baseQuery+`
		SELECT issue_type, booking_id, parent_profile_id, nanny_profile_id, booking_status, payment_status,
		       stripe_payment_intent_id, stripe_charge_id, stripe_refund_id, amount, currency, updated_at::text
		FROM issues
		ORDER BY updated_at DESC
		LIMIT $1 OFFSET $2
	`, limit, (page-1)*limit)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	issues := make([]PaymentReconciliationIssue, 0, limit)
	for rows.Next() {
		var issue PaymentReconciliationIssue
		if err := rows.Scan(
			&issue.IssueType,
			&issue.BookingID,
			&issue.ParentProfileID,
			&issue.NannyProfileID,
			&issue.BookingStatus,
			&issue.PaymentStatus,
			&issue.StripePaymentIntentID,
			&issue.StripeChargeID,
			&issue.StripeRefundID,
			&issue.Amount,
			&issue.Currency,
			&issue.CreatedAt,
		); err != nil {
			return nil, 0, err
		}
		issues = append(issues, issue)
	}
	return issues, total, rows.Err()
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

func (r *pgRepository) HasParentApprovedBookings(ctx context.Context, parentProfileID uuid.UUID) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM bookings
			WHERE parent_profile_id = $1 AND status = $2
		)
	`, parentProfileID, models.ApprovedBookingStatus).Scan(&exists)
	return exists, err
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
		  AND status <> $5
	`, status, chargeID, failureMessage, paymentIntentID, models.PaymentRefunded)
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
