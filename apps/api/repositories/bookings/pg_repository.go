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

	if pgErr.Code != "23P01" {
		return err
	}

	switch pgErr.ConstraintName {
	case "bookings_parent_nanny_slot_excl":
		return ErrBookingAlreadyExists
	case "bookings_nanny_approved_slot_excl":
		return ErrNannyTimeUnavailable
	default:
		return err
	}
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
			  AND start_time < ($3 + ($4 * INTERVAL '1 hour'))
			  AND (start_time + (duration * INTERVAL '1 hour')) > $3
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
			  AND start_time < ($2 + ($3 * INTERVAL '1 hour'))
			  AND (start_time + (duration * INTERVAL '1 hour')) > $2
		)
	`, nannyProfileID, startTime, duration).Scan(&exists)
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

func scanBookingRows(rows pgx.Rows) ([]BookingRecord, error) {
	var bookings []BookingRecord
	for rows.Next() {
		var booking BookingRecord
		if err := rows.Scan(
			&booking.ID, &booking.ParentProfileID, &booking.NannyProfileID, &booking.Date, &booking.StartTime,
			&booking.Duration, &booking.TotalAmount, &booking.Status, &booking.CreatedAt, &booking.UpdatedAt,
			&booking.NannyDisplayName, &booking.NannyCity, &booking.NannyProvince,
			&booking.ParentDisplayName, &booking.ParentCity, &booking.ParentProvince,
		); err != nil {
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
		SELECT b.id, b.parent_profile_id, b.nanny_profile_id, b.date, b.start_time, b.duration, b.total_amount, b.status, b.created_at, b.updated_at,
		       np.display_name, np.city, np.province,
		       pp.display_name, pp.city, pp.province
		FROM bookings b
		INNER JOIN nanny_profiles np ON np.id = b.nanny_profile_id
		INNER JOIN parent_profiles pp ON pp.id = b.parent_profile_id
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
		SELECT b.id, b.parent_profile_id, b.nanny_profile_id, b.date, b.start_time, b.duration, b.total_amount, b.status, b.created_at, b.updated_at,
		       np.display_name, np.city, np.province,
		       pp.display_name, pp.city, pp.province
		FROM bookings b
		INNER JOIN nanny_profiles np ON np.id = b.nanny_profile_id
		INNER JOIN parent_profiles pp ON pp.id = b.parent_profile_id
		WHERE b.parent_profile_id = $1 AND b.id = $2
	`, parentProfileID, bookingID).Scan(
		&booking.ID, &booking.ParentProfileID, &booking.NannyProfileID, &booking.Date, &booking.StartTime,
		&booking.Duration, &booking.TotalAmount, &booking.Status, &booking.CreatedAt, &booking.UpdatedAt,
		&booking.NannyDisplayName, &booking.NannyCity, &booking.NannyProvince,
		&booking.ParentDisplayName, &booking.ParentCity, &booking.ParentProvince,
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
		RETURNING b.id, b.parent_profile_id, b.nanny_profile_id, b.date, b.start_time, b.duration, b.total_amount, b.status, b.created_at, b.updated_at,
		          np.display_name, np.city, np.province,
		          pp.display_name, pp.city, pp.province
	`, models.CancelledBookingStatus, parentProfileID, bookingID, models.PendingBookingStatus).Scan(
		&booking.ID, &booking.ParentProfileID, &booking.NannyProfileID, &booking.Date, &booking.StartTime,
		&booking.Duration, &booking.TotalAmount, &booking.Status, &booking.CreatedAt, &booking.UpdatedAt,
		&booking.NannyDisplayName, &booking.NannyCity, &booking.NannyProvince,
		&booking.ParentDisplayName, &booking.ParentCity, &booking.ParentProvince,
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
		SELECT b.id, b.parent_profile_id, b.nanny_profile_id, b.date, b.start_time, b.duration, b.total_amount, b.status, b.created_at, b.updated_at,
		       np.display_name, np.city, np.province,
		       pp.display_name, pp.city, pp.province
		FROM bookings b
		INNER JOIN nanny_profiles np ON np.id = b.nanny_profile_id
		INNER JOIN parent_profiles pp ON pp.id = b.parent_profile_id
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
		SELECT b.id, b.parent_profile_id, b.nanny_profile_id, b.date, b.start_time, b.duration, b.total_amount, b.status, b.created_at, b.updated_at,
		       np.display_name, np.city, np.province,
		       pp.display_name, pp.city, pp.province
		FROM bookings b
		INNER JOIN nanny_profiles np ON np.id = b.nanny_profile_id
		INNER JOIN parent_profiles pp ON pp.id = b.parent_profile_id
		WHERE b.nanny_profile_id = $1 AND b.id = $2
	`, nannyProfileID, bookingID).Scan(
		&booking.ID, &booking.ParentProfileID, &booking.NannyProfileID, &booking.Date, &booking.StartTime,
		&booking.Duration, &booking.TotalAmount, &booking.Status, &booking.CreatedAt, &booking.UpdatedAt,
		&booking.NannyDisplayName, &booking.NannyCity, &booking.NannyProvince,
		&booking.ParentDisplayName, &booking.ParentCity, &booking.ParentProvince,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return BookingRecord{}, nil
	}
	return booking, err
}

func (r *pgRepository) ApproveNannyBooking(ctx context.Context, nannyProfileID, bookingID uuid.UUID) (BookingRecord, error) {
	return r.updateNannyBookingStatus(ctx, nannyProfileID, bookingID, models.ApprovedBookingStatus)
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
		RETURNING b.id, b.parent_profile_id, b.nanny_profile_id, b.date, b.start_time, b.duration, b.total_amount, b.status, b.created_at, b.updated_at,
		          np.display_name, np.city, np.province,
		          pp.display_name, pp.city, pp.province
	`, status, nannyProfileID, bookingID, models.PendingBookingStatus).Scan(
		&booking.ID, &booking.ParentProfileID, &booking.NannyProfileID, &booking.Date, &booking.StartTime,
		&booking.Duration, &booking.TotalAmount, &booking.Status, &booking.CreatedAt, &booking.UpdatedAt,
		&booking.NannyDisplayName, &booking.NannyCity, &booking.NannyProvince,
		&booking.ParentDisplayName, &booking.ParentCity, &booking.ParentProvince,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return BookingRecord{}, nil
	}
	return booking, mapBookingWriteError(err)
}
