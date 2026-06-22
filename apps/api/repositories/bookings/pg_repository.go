package bookings

import (
	"context"
	"errors"
	"fmt"
	"strings"
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

func mapBookingWriteError(err error) error {
	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) {
		return err
	}

	switch pgErr.Code {
	case "23P01":
		switch pgErr.ConstraintName {
		case "bookings_parent_nanny_slot_excl":
			return ErrBookingAlreadyExists
		case "bookings_nanny_approved_slot_excl":
			return ErrNannyTimeUnavailable
		default:
			return err
		}
	case "23505":
		if pgErr.ConstraintName == "idx_booking_change_requests_one_pending" {
			return ErrPendingChangeRequestExists
		}
	}

	return err
}

func (r *pgRepository) HasParentActiveBookingWithNanny(ctx context.Context, parentProfileID, nannyProfileID uuid.UUID, startTime time.Time, duration int) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx, `
		SELECT EXISTS(
			SELECT 1
			FROM bookings
			WHERE parent_profile_id = $1
			  AND nanny_profile_id = $2
			  AND status IN ('pending', 'approved')
			  AND start_time < ($3::timestamp + ($4::int * INTERVAL '1 hour'))
			  AND (start_time + (duration * INTERVAL '1 hour')) > $3::timestamp
		)
	`, parentProfileID, nannyProfileID, startTime, duration).Scan(&exists)
	return exists, err
}

func (r *pgRepository) HasNannyApprovedBookingConflict(ctx context.Context, nannyProfileID uuid.UUID, startTime time.Time, duration int) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx, `
		SELECT EXISTS(
			SELECT 1
			FROM bookings
			WHERE nanny_profile_id = $1
			  AND status = 'approved'
			  AND start_time < ($2::timestamp + ($3::int * INTERVAL '1 hour'))
			  AND (start_time + (duration * INTERVAL '1 hour')) > $2::timestamp
		)
	`, nannyProfileID, startTime, duration).Scan(&exists)
	return exists, err
}

func (r *pgRepository) HasNannyApprovedBookingConflictExcluding(ctx context.Context, nannyProfileID uuid.UUID, startTime time.Time, duration int, excludeBookingID uuid.UUID) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx, `
		SELECT EXISTS(
			SELECT 1
			FROM bookings
			WHERE nanny_profile_id = $1
			  AND id <> $4
			  AND status = 'approved'
			  AND start_time < ($2::timestamp + ($3::int * INTERVAL '1 hour'))
			  AND (start_time + (duration * INTERVAL '1 hour')) > $2::timestamp
		)
	`, nannyProfileID, startTime, duration, excludeBookingID).Scan(&exists)
	return exists, err
}

func (r *pgRepository) CreateBooking(ctx context.Context, booking models.Booking) (models.Booking, error) {
	var created models.Booking
	err := r.db.QueryRow(ctx, `
		INSERT INTO bookings (id, parent_profile_id, nanny_profile_id, date, start_time, duration, total_amount, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, parent_profile_id, nanny_profile_id, date, start_time, duration, total_amount, status, created_at, updated_at
	`,
		booking.ID, booking.ParentProfileID, booking.NannyProfileID, booking.Date, booking.StartTime, booking.Duration, booking.TotalAmount, booking.Status,
	).Scan(
		&created.ID, &created.ParentProfileID, &created.NannyProfileID, &created.Date, &created.StartTime,
		&created.Duration, &created.TotalAmount, &created.Status, &created.CreatedAt, &created.UpdatedAt,
	)
	return created, mapBookingWriteError(err)
}

func buildListBookingsWhere(baseColumn string, filter ListBookingsFilter, args []any) (string, []any) {
	clauses := []string{fmt.Sprintf("b.%s = $1", baseColumn)}

	if filter.Status != "" {
		args = append(args, filter.Status)
		clauses = append(clauses, fmt.Sprintf("b.status = $%d", len(args)))
	}
	if filter.DateFrom != nil {
		args = append(args, *filter.DateFrom)
		clauses = append(clauses, fmt.Sprintf("b.date >= $%d", len(args)))
	}
	if filter.DateTo != nil {
		args = append(args, *filter.DateTo)
		clauses = append(clauses, fmt.Sprintf("b.date <= $%d", len(args)))
	}

	return strings.Join(clauses, " AND "), args
}

func normalizeListFilter(filter ListBookingsFilter) ListBookingsFilter {
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 20
	}
	if filter.Limit > 100 {
		filter.Limit = 100
	}
	return filter
}

const bookingPaymentColumns = `
	COALESCE(bp.status, ''),
	COALESCE(bp.failure_message, ''),
	COALESCE(bp.stripe_payment_intent_id, ''),
	COALESCE(bp.stripe_charge_id, ''),
	COALESCE(bp.stripe_refund_id, '')
`

const bookingPaymentReturningColumns = `
	COALESCE((SELECT bp.status FROM booking_payments bp WHERE bp.booking_id = b.id), ''),
	COALESCE((SELECT bp.failure_message FROM booking_payments bp WHERE bp.booking_id = b.id), ''),
	COALESCE((SELECT bp.stripe_payment_intent_id FROM booking_payments bp WHERE bp.booking_id = b.id), ''),
	COALESCE((SELECT bp.stripe_charge_id FROM booking_payments bp WHERE bp.booking_id = b.id), ''),
	COALESCE((SELECT bp.stripe_refund_id FROM booking_payments bp WHERE bp.booking_id = b.id), '')
`

const bookingConversationColumn = `COALESCE((SELECT c.id::text FROM conversations c WHERE c.booking_id = b.id), '')`

type bookingScanner interface {
	Scan(dest ...any) error
}

func scanBookingRecord(scanner bookingScanner) (BookingRecord, error) {
	var booking BookingRecord
	err := scanner.Scan(
		&booking.ID, &booking.ConversationID, &booking.ParentProfileID, &booking.NannyProfileID, &booking.Date, &booking.StartTime,
		&booking.Duration, &booking.TotalAmount, &booking.Status, &booking.CreatedAt, &booking.UpdatedAt,
		&booking.NannyDisplayName, &booking.NannyCity, &booking.NannyProvince,
		&booking.ParentDisplayName, &booking.ParentCity, &booking.ParentProvince,
		&booking.PaymentStatus, &booking.PaymentFailureMessage, &booking.StripePaymentIntentID,
		&booking.StripeChargeID, &booking.StripeRefundID,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return BookingRecord{}, nil
	}
	return booking, err
}

func scanBookingRows(rows pgx.Rows) ([]BookingRecord, error) {
	var bookings []BookingRecord
	for rows.Next() {
		booking, err := scanBookingRecord(rows)
		if err != nil {
			return nil, err
		}
		bookings = append(bookings, booking)
	}

	return bookings, rows.Err()
}

func (r *pgRepository) ListParentBookings(ctx context.Context, parentProfileID uuid.UUID, filter ListBookingsFilter) ([]BookingRecord, int, error) {
	filter = normalizeListFilter(filter)
	args := []any{parentProfileID}
	whereClause, args := buildListBookingsWhere("parent_profile_id", filter, args)

	var total int
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM bookings b WHERE %s`, whereClause)
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	args = append(args, filter.Limit, (filter.Page-1)*filter.Limit)
	query := fmt.Sprintf(`
		SELECT b.id, `+bookingConversationColumn+`, b.parent_profile_id, b.nanny_profile_id, b.date, b.start_time, b.duration, b.total_amount, b.status, b.created_at, b.updated_at,
		       np.display_name, np.city, np.province,
		       pp.display_name, pp.city, pp.province,
		       `+bookingPaymentColumns+`
		FROM bookings b
		INNER JOIN nanny_profiles np ON np.id = b.nanny_profile_id
		INNER JOIN parent_profiles pp ON pp.id = b.parent_profile_id
		LEFT JOIN booking_payments bp ON bp.booking_id = b.id
		WHERE %s
		ORDER BY b.date DESC, b.start_time DESC, b.created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, len(args)-1, len(args))

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	bookings, err := scanBookingRows(rows)
	return bookings, total, err
}

func (r *pgRepository) GetParentBookingByID(ctx context.Context, parentProfileID, bookingID uuid.UUID) (BookingRecord, error) {
	var booking BookingRecord
	err := r.db.QueryRow(ctx, `
		SELECT b.id, `+bookingConversationColumn+`, b.parent_profile_id, b.nanny_profile_id, b.date, b.start_time, b.duration, b.total_amount, b.status, b.created_at, b.updated_at,
		       np.display_name, np.city, np.province,
		       pp.display_name, pp.city, pp.province,
		       `+bookingPaymentColumns+`
		FROM bookings b
		INNER JOIN nanny_profiles np ON np.id = b.nanny_profile_id
		INNER JOIN parent_profiles pp ON pp.id = b.parent_profile_id
		LEFT JOIN booking_payments bp ON bp.booking_id = b.id
		WHERE b.parent_profile_id = $1 AND b.id = $2
	`, parentProfileID, bookingID).Scan(
		&booking.ID, &booking.ConversationID, &booking.ParentProfileID, &booking.NannyProfileID, &booking.Date, &booking.StartTime,
		&booking.Duration, &booking.TotalAmount, &booking.Status, &booking.CreatedAt, &booking.UpdatedAt,
		&booking.NannyDisplayName, &booking.NannyCity, &booking.NannyProvince,
		&booking.ParentDisplayName, &booking.ParentCity, &booking.ParentProvince,
		&booking.PaymentStatus, &booking.PaymentFailureMessage, &booking.StripePaymentIntentID,
		&booking.StripeChargeID, &booking.StripeRefundID,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return BookingRecord{}, nil
	}
	return booking, err
}

func (r *pgRepository) CancelParentBooking(ctx context.Context, parentProfileID, bookingID uuid.UUID) (BookingRecord, error) {
	var booking BookingRecord
	err := r.db.QueryRow(ctx, `
		UPDATE bookings b
		SET status = $1, updated_at = NOW()
		FROM nanny_profiles np, parent_profiles pp
		WHERE b.nanny_profile_id = np.id
		  AND b.parent_profile_id = pp.id
		  AND b.parent_profile_id = $2
		  AND b.id = $3
		  AND b.status = $4
		RETURNING b.id, `+bookingConversationColumn+`, b.parent_profile_id, b.nanny_profile_id, b.date, b.start_time, b.duration, b.total_amount, b.status, b.created_at, b.updated_at,
		          np.display_name, np.city, np.province,
		          pp.display_name, pp.city, pp.province,
		          `+bookingPaymentReturningColumns+`
	`, models.CancelledBookingStatus, parentProfileID, bookingID, models.PendingBookingStatus).Scan(
		&booking.ID, &booking.ConversationID, &booking.ParentProfileID, &booking.NannyProfileID, &booking.Date, &booking.StartTime,
		&booking.Duration, &booking.TotalAmount, &booking.Status, &booking.CreatedAt, &booking.UpdatedAt,
		&booking.NannyDisplayName, &booking.NannyCity, &booking.NannyProvince,
		&booking.ParentDisplayName, &booking.ParentCity, &booking.ParentProvince,
		&booking.PaymentStatus, &booking.PaymentFailureMessage, &booking.StripePaymentIntentID,
		&booking.StripeChargeID, &booking.StripeRefundID,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return BookingRecord{}, nil
	}
	return booking, err
}

func (r *pgRepository) ListNannyBookings(ctx context.Context, nannyProfileID uuid.UUID, filter ListBookingsFilter) ([]BookingRecord, int, error) {
	filter = normalizeListFilter(filter)
	args := []any{nannyProfileID}
	whereClause, args := buildListBookingsWhere("nanny_profile_id", filter, args)

	var total int
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM bookings b WHERE %s`, whereClause)
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	args = append(args, filter.Limit, (filter.Page-1)*filter.Limit)
	query := fmt.Sprintf(`
		SELECT b.id, `+bookingConversationColumn+`, b.parent_profile_id, b.nanny_profile_id, b.date, b.start_time, b.duration, b.total_amount, b.status, b.created_at, b.updated_at,
		       np.display_name, np.city, np.province,
		       pp.display_name, pp.city, pp.province,
		       `+bookingPaymentColumns+`
		FROM bookings b
		INNER JOIN nanny_profiles np ON np.id = b.nanny_profile_id
		INNER JOIN parent_profiles pp ON pp.id = b.parent_profile_id
		LEFT JOIN booking_payments bp ON bp.booking_id = b.id
		WHERE %s
		ORDER BY b.date DESC, b.start_time DESC, b.created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, len(args)-1, len(args))

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	bookings, err := scanBookingRows(rows)
	return bookings, total, err
}

func (r *pgRepository) GetNannyBookingByID(ctx context.Context, nannyProfileID, bookingID uuid.UUID) (BookingRecord, error) {
	var booking BookingRecord
	err := r.db.QueryRow(ctx, `
		SELECT b.id, `+bookingConversationColumn+`, b.parent_profile_id, b.nanny_profile_id, b.date, b.start_time, b.duration, b.total_amount, b.status, b.created_at, b.updated_at,
		       np.display_name, np.city, np.province,
		       pp.display_name, pp.city, pp.province,
		       `+bookingPaymentColumns+`
		FROM bookings b
		INNER JOIN nanny_profiles np ON np.id = b.nanny_profile_id
		INNER JOIN parent_profiles pp ON pp.id = b.parent_profile_id
		LEFT JOIN booking_payments bp ON bp.booking_id = b.id
		WHERE b.nanny_profile_id = $1 AND b.id = $2
	`, nannyProfileID, bookingID).Scan(
		&booking.ID, &booking.ConversationID, &booking.ParentProfileID, &booking.NannyProfileID, &booking.Date, &booking.StartTime,
		&booking.Duration, &booking.TotalAmount, &booking.Status, &booking.CreatedAt, &booking.UpdatedAt,
		&booking.NannyDisplayName, &booking.NannyCity, &booking.NannyProvince,
		&booking.ParentDisplayName, &booking.ParentCity, &booking.ParentProvince,
		&booking.PaymentStatus, &booking.PaymentFailureMessage, &booking.StripePaymentIntentID,
		&booking.StripeChargeID, &booking.StripeRefundID,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return BookingRecord{}, nil
	}
	return booking, err
}

func (r *pgRepository) ApproveNannyBooking(ctx context.Context, nannyProfileID, bookingID uuid.UUID) (BookingRecord, error) {
	return r.updateNannyBookingStatus(ctx, nannyProfileID, bookingID, models.ApprovedBookingStatus)
}

func (r *pgRepository) ApproveNannyBookingWithConversation(ctx context.Context, nannyProfileID, bookingID uuid.UUID) (BookingRecord, error) {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return BookingRecord{}, err
	}
	defer tx.Rollback(ctx)

	var booking BookingRecord
	err = tx.QueryRow(ctx, `
		UPDATE bookings b
		SET status = $1, updated_at = NOW()
		FROM nanny_profiles np, parent_profiles pp
		WHERE b.nanny_profile_id = np.id
		  AND b.parent_profile_id = pp.id
		  AND b.nanny_profile_id = $2
		  AND b.id = $3
		  AND b.status = $4
		RETURNING b.id, `+bookingConversationColumn+`, b.parent_profile_id, b.nanny_profile_id, b.date, b.start_time, b.duration, b.total_amount, b.status, b.created_at, b.updated_at,
		          np.display_name, np.city, np.province,
		          pp.display_name, pp.city, pp.province,
		          `+bookingPaymentReturningColumns+`
	`, models.ApprovedBookingStatus, nannyProfileID, bookingID, models.PendingBookingStatus).Scan(
		&booking.ID, &booking.ConversationID, &booking.ParentProfileID, &booking.NannyProfileID, &booking.Date, &booking.StartTime,
		&booking.Duration, &booking.TotalAmount, &booking.Status, &booking.CreatedAt, &booking.UpdatedAt,
		&booking.NannyDisplayName, &booking.NannyCity, &booking.NannyProvince,
		&booking.ParentDisplayName, &booking.ParentCity, &booking.ParentProvince,
		&booking.PaymentStatus, &booking.PaymentFailureMessage, &booking.StripePaymentIntentID,
		&booking.StripeChargeID, &booking.StripeRefundID,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return BookingRecord{}, nil
	}
	if err != nil {
		return BookingRecord{}, mapBookingWriteError(err)
	}

	conversationID := uuid.New()
	_, err = tx.Exec(ctx, `
		INSERT INTO conversations (id, booking_id, parent_profile_id, nanny_profile_id)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (booking_id) DO NOTHING
	`, conversationID, booking.ID, booking.ParentProfileID, booking.NannyProfileID)
	if err != nil {
		return BookingRecord{}, err
	}
	if err := tx.QueryRow(ctx, `
		SELECT COALESCE((SELECT c.id::text FROM conversations c WHERE c.booking_id = $1), '')
	`, booking.ID).Scan(&booking.ConversationID); err != nil {
		return BookingRecord{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return BookingRecord{}, err
	}
	return booking, nil
}

func (r *pgRepository) DeclineNannyBooking(ctx context.Context, nannyProfileID, bookingID uuid.UUID) (BookingRecord, error) {
	return r.updateNannyBookingStatus(ctx, nannyProfileID, bookingID, models.DeclinedBookingStatus)
}

func (r *pgRepository) updateNannyBookingStatus(ctx context.Context, nannyProfileID, bookingID uuid.UUID, status models.BookingStatus) (BookingRecord, error) {
	var booking BookingRecord
	err := r.db.QueryRow(ctx, `
		UPDATE bookings b
		SET status = $1, updated_at = NOW()
		FROM nanny_profiles np, parent_profiles pp
		WHERE b.nanny_profile_id = np.id
		  AND b.parent_profile_id = pp.id
		  AND b.nanny_profile_id = $2
		  AND b.id = $3
		  AND b.status = $4
		RETURNING b.id, `+bookingConversationColumn+`, b.parent_profile_id, b.nanny_profile_id, b.date, b.start_time, b.duration, b.total_amount, b.status, b.created_at, b.updated_at,
		          np.display_name, np.city, np.province,
		          pp.display_name, pp.city, pp.province,
		          `+bookingPaymentReturningColumns+`
	`, status, nannyProfileID, bookingID, models.PendingBookingStatus).Scan(
		&booking.ID, &booking.ConversationID, &booking.ParentProfileID, &booking.NannyProfileID, &booking.Date, &booking.StartTime,
		&booking.Duration, &booking.TotalAmount, &booking.Status, &booking.CreatedAt, &booking.UpdatedAt,
		&booking.NannyDisplayName, &booking.NannyCity, &booking.NannyProvince,
		&booking.ParentDisplayName, &booking.ParentCity, &booking.ParentProvince,
		&booking.PaymentStatus, &booking.PaymentFailureMessage, &booking.StripePaymentIntentID,
		&booking.StripeChargeID, &booking.StripeRefundID,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return BookingRecord{}, nil
	}
	return booking, mapBookingWriteError(err)
}

func scanBookingChangeRequest(row pgx.Row) (models.BookingChangeRequest, error) {
	var request models.BookingChangeRequest
	err := row.Scan(
		&request.ID,
		&request.BookingID,
		&request.RequestedByUserID,
		&request.RequestedByRole,
		&request.Type,
		&request.Status,
		&request.ProposedDate,
		&request.ProposedStartTime,
		&request.ProposedDuration,
		&request.Reason,
		&request.ResponseNote,
		&request.CreatedAt,
		&request.UpdatedAt,
		&request.ResolvedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.BookingChangeRequest{}, nil
	}
	return request, err
}

func (r *pgRepository) CreateBookingChangeRequest(ctx context.Context, request models.BookingChangeRequest) (models.BookingChangeRequest, error) {
	created, err := scanBookingChangeRequest(r.db.QueryRow(ctx, `
		INSERT INTO booking_change_requests (
			id, booking_id, requested_by_user_id, requested_by_role, type, status,
			proposed_date, proposed_start_time, proposed_duration, reason
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, booking_id, requested_by_user_id, requested_by_role, type, status,
		          proposed_date, proposed_start_time, proposed_duration, reason, COALESCE(response_note, ''),
		          created_at, updated_at, resolved_at
	`,
		request.ID,
		request.BookingID,
		request.RequestedByUserID,
		request.RequestedByRole,
		request.Type,
		request.Status,
		request.ProposedDate,
		request.ProposedStartTime,
		request.ProposedDuration,
		request.Reason,
	))
	return created, mapBookingWriteError(err)
}

func (r *pgRepository) ListBookingChangeRequests(ctx context.Context, bookingID uuid.UUID) ([]models.BookingChangeRequest, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, booking_id, requested_by_user_id, requested_by_role, type, status,
		       proposed_date, proposed_start_time, proposed_duration, reason, COALESCE(response_note, ''),
		       created_at, updated_at, resolved_at
		FROM booking_change_requests
		WHERE booking_id = $1
		ORDER BY created_at DESC
	`, bookingID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []models.BookingChangeRequest
	for rows.Next() {
		request, err := scanBookingChangeRequest(rows)
		if err != nil {
			return nil, err
		}
		requests = append(requests, request)
	}
	return requests, rows.Err()
}

func (r *pgRepository) GetBookingChangeRequestByID(ctx context.Context, bookingID, requestID uuid.UUID) (models.BookingChangeRequest, error) {
	return scanBookingChangeRequest(r.db.QueryRow(ctx, `
		SELECT id, booking_id, requested_by_user_id, requested_by_role, type, status,
		       proposed_date, proposed_start_time, proposed_duration, reason, COALESCE(response_note, ''),
		       created_at, updated_at, resolved_at
		FROM booking_change_requests
		WHERE booking_id = $1 AND id = $2
	`, bookingID, requestID))
}

func (r *pgRepository) AcceptBookingChangeRequest(ctx context.Context, bookingID, requestID uuid.UUID, responseNote string) (BookingRecord, models.BookingChangeRequest, error) {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return BookingRecord{}, models.BookingChangeRequest{}, err
	}
	defer tx.Rollback(ctx)

	request, err := scanBookingChangeRequest(tx.QueryRow(ctx, `
		UPDATE booking_change_requests
		SET status = $1, response_note = NULLIF($2, ''), resolved_at = NOW(), updated_at = NOW()
		WHERE booking_id = $3 AND id = $4 AND status = $5
		RETURNING id, booking_id, requested_by_user_id, requested_by_role, type, status,
		          proposed_date, proposed_start_time, proposed_duration, reason, COALESCE(response_note, ''),
		          created_at, updated_at, resolved_at
	`, models.AcceptedBookingChangeRequestStatus, responseNote, bookingID, requestID, models.PendingBookingChangeRequestStatus))
	if err != nil {
		return BookingRecord{}, models.BookingChangeRequest{}, err
	}
	if request.ID == uuid.Nil {
		return BookingRecord{}, models.BookingChangeRequest{}, nil
	}

	var booking BookingRecord
	if request.Type == models.CancelBookingChangeRequestType {
		err = tx.QueryRow(ctx, `
			UPDATE bookings b
			SET status = $1, updated_at = NOW()
			FROM nanny_profiles np, parent_profiles pp
			WHERE b.nanny_profile_id = np.id
			  AND b.parent_profile_id = pp.id
			  AND b.id = $2
			  AND b.status = $3
			RETURNING b.id, `+bookingConversationColumn+`, b.parent_profile_id, b.nanny_profile_id, b.date, b.start_time, b.duration, b.total_amount, b.status, b.created_at, b.updated_at,
			          np.display_name, np.city, np.province,
			          pp.display_name, pp.city, pp.province,
			          `+bookingPaymentReturningColumns+`
		`, models.CancelledBookingStatus, bookingID, models.ApprovedBookingStatus).Scan(
			&booking.ID, &booking.ConversationID, &booking.ParentProfileID, &booking.NannyProfileID, &booking.Date, &booking.StartTime,
			&booking.Duration, &booking.TotalAmount, &booking.Status, &booking.CreatedAt, &booking.UpdatedAt,
			&booking.NannyDisplayName, &booking.NannyCity, &booking.NannyProvince,
			&booking.ParentDisplayName, &booking.ParentCity, &booking.ParentProvince,
			&booking.PaymentStatus, &booking.PaymentFailureMessage, &booking.StripePaymentIntentID,
			&booking.StripeChargeID, &booking.StripeRefundID,
		)
	} else {
		err = tx.QueryRow(ctx, `
			UPDATE bookings b
			SET date = $1,
			    start_time = $2,
			    duration = $3,
			    total_amount = np.rate_per_hour * $3,
			    updated_at = NOW()
			FROM nanny_profiles np, parent_profiles pp
			WHERE b.nanny_profile_id = np.id
			  AND b.parent_profile_id = pp.id
			  AND b.id = $4
			  AND b.status IN ($5, $6)
			RETURNING b.id, `+bookingConversationColumn+`, b.parent_profile_id, b.nanny_profile_id, b.date, b.start_time, b.duration, b.total_amount, b.status, b.created_at, b.updated_at,
			          np.display_name, np.city, np.province,
			          pp.display_name, pp.city, pp.province,
			          `+bookingPaymentReturningColumns+`
		`, *request.ProposedDate, *request.ProposedStartTime, *request.ProposedDuration, bookingID, models.PendingBookingStatus, models.ApprovedBookingStatus).Scan(
			&booking.ID, &booking.ConversationID, &booking.ParentProfileID, &booking.NannyProfileID, &booking.Date, &booking.StartTime,
			&booking.Duration, &booking.TotalAmount, &booking.Status, &booking.CreatedAt, &booking.UpdatedAt,
			&booking.NannyDisplayName, &booking.NannyCity, &booking.NannyProvince,
			&booking.ParentDisplayName, &booking.ParentCity, &booking.ParentProvince,
			&booking.PaymentStatus, &booking.PaymentFailureMessage, &booking.StripePaymentIntentID,
			&booking.StripeChargeID, &booking.StripeRefundID,
		)
	}
	if err != nil {
		return BookingRecord{}, models.BookingChangeRequest{}, mapBookingWriteError(err)
	}
	if err := tx.Commit(ctx); err != nil {
		return BookingRecord{}, models.BookingChangeRequest{}, err
	}
	return booking, request, nil
}

func (r *pgRepository) DeclineBookingChangeRequest(ctx context.Context, bookingID, requestID uuid.UUID, responseNote string) (models.BookingChangeRequest, error) {
	return scanBookingChangeRequest(r.db.QueryRow(ctx, `
		UPDATE booking_change_requests
		SET status = $1, response_note = NULLIF($2, ''), resolved_at = NOW(), updated_at = NOW()
		WHERE booking_id = $3 AND id = $4 AND status = $5
		RETURNING id, booking_id, requested_by_user_id, requested_by_role, type, status,
		          proposed_date, proposed_start_time, proposed_duration, reason, COALESCE(response_note, ''),
		          created_at, updated_at, resolved_at
	`, models.DeclinedBookingChangeRequestStatus, responseNote, bookingID, requestID, models.PendingBookingChangeRequestStatus))
}

func (r *pgRepository) CompleteNannyBooking(ctx context.Context, nannyProfileID, bookingID uuid.UUID) (BookingRecord, error) {
	var booking BookingRecord
	err := r.db.QueryRow(ctx, `
		UPDATE bookings b
		SET status = $1, updated_at = NOW()
		FROM nanny_profiles np, parent_profiles pp
		WHERE b.nanny_profile_id = np.id
		  AND b.parent_profile_id = pp.id
		  AND b.nanny_profile_id = $2
		  AND b.id = $3
		  AND b.status = $4
		RETURNING b.id, `+bookingConversationColumn+`, b.parent_profile_id, b.nanny_profile_id, b.date, b.start_time, b.duration, b.total_amount, b.status, b.created_at, b.updated_at,
		          np.display_name, np.city, np.province,
		          pp.display_name, pp.city, pp.province,
		          `+bookingPaymentReturningColumns+`
	`, models.CompletedBookingStatus, nannyProfileID, bookingID, models.ApprovedBookingStatus).Scan(
		&booking.ID, &booking.ConversationID, &booking.ParentProfileID, &booking.NannyProfileID, &booking.Date, &booking.StartTime,
		&booking.Duration, &booking.TotalAmount, &booking.Status, &booking.CreatedAt, &booking.UpdatedAt,
		&booking.NannyDisplayName, &booking.NannyCity, &booking.NannyProvince,
		&booking.ParentDisplayName, &booking.ParentCity, &booking.ParentProvince,
		&booking.PaymentStatus, &booking.PaymentFailureMessage, &booking.StripePaymentIntentID,
		&booking.StripeChargeID, &booking.StripeRefundID,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return BookingRecord{}, nil
	}
	return booking, err
}
