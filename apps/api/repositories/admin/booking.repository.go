package admin

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/kinsittr/kinsittr-api/models"
)

func buildBookingsWhere(filter ListBookingsFilter) (string, []any) {
	clauses := []string{"1 = 1"}
	args := []any{}
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
	if strings.TrimSpace(filter.Search) != "" {
		args = append(args, "%"+strings.ToLower(strings.TrimSpace(filter.Search))+"%")
		clauses = append(clauses, fmt.Sprintf(`(
			LOWER(np.display_name) LIKE $%d
			OR LOWER(pp.display_name) LIKE $%d
			OR LOWER(b.id::text) LIKE $%d
		)`, len(args), len(args), len(args)))
	}
	return strings.Join(clauses, " AND "), args
}

func buildParentBookingHistoryWhere(parentProfileID uuid.UUID, filter ListBookingsFilter) (string, []any) {
	args := []any{parentProfileID}
	clauses := []string{"b.parent_profile_id = $1"}
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

func buildNannyBookingHistoryWhere(nannyProfileID uuid.UUID, filter ListBookingsFilter) (string, []any) {
	args := []any{nannyProfileID}
	clauses := []string{"b.nanny_profile_id = $1"}
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

func scanBookingRecord(row pgx.Row) (BookingRecord, error) {
	var record BookingRecord
	err := row.Scan(
		&record.ID,
		&record.ParentProfileID,
		&record.NannyProfileID,
		&record.Date,
		&record.StartTime,
		&record.Duration,
		&record.TotalAmount,
		&record.Status,
		&record.CreatedAt,
		&record.UpdatedAt,
		&record.NannyDisplayName,
		&record.NannyCity,
		&record.NannyProvince,
		&record.ParentDisplayName,
		&record.ParentCity,
		&record.ParentProvince,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return BookingRecord{}, nil
	}
	return record, err
}

const bookingRecordSelect = `
	SELECT b.id, b.parent_profile_id, b.nanny_profile_id, b.date, b.start_time, b.duration, b.total_amount, b.status, b.created_at, b.updated_at,
	       np.display_name, np.city, np.province,
	       pp.display_name, pp.city, pp.province
	FROM bookings b
	INNER JOIN nanny_profiles np ON np.id = b.nanny_profile_id
	INNER JOIN parent_profiles pp ON pp.id = b.parent_profile_id
`

func (r *pgRepository) ListBookings(ctx context.Context, filter ListBookingsFilter) ([]BookingRecord, int, error) {
	filter.Page, filter.Limit = normalizePageLimit(filter.Page, filter.Limit, 20, 100)
	where, args := buildBookingsWhere(filter)

	var total int
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM bookings b
		INNER JOIN nanny_profiles np ON np.id = b.nanny_profile_id
		INNER JOIN parent_profiles pp ON pp.id = b.parent_profile_id
		WHERE %s
	`, where)
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	args = append(args, filter.Limit, (filter.Page-1)*filter.Limit)
	query := fmt.Sprintf(`
		%s
		WHERE %s
		ORDER BY b.date DESC, b.start_time DESC, b.created_at DESC
		LIMIT $%d OFFSET $%d
	`, bookingRecordSelect, where, len(args)-1, len(args))
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	records := make([]BookingRecord, 0, filter.Limit)
	for rows.Next() {
		record, err := scanBookingRecord(rows)
		if err != nil {
			return nil, 0, err
		}
		records = append(records, record)
	}
	return records, total, rows.Err()
}

func (r *pgRepository) ListParentBookingHistory(ctx context.Context, parentProfileID uuid.UUID, filter ListBookingsFilter) ([]BookingRecord, int, error) {
	filter.Page, filter.Limit = normalizePageLimit(filter.Page, filter.Limit, 10, 100)
	where, args := buildParentBookingHistoryWhere(parentProfileID, filter)

	var total int
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM bookings b WHERE %s`, where)
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	args = append(args, filter.Limit, (filter.Page-1)*filter.Limit)
	query := fmt.Sprintf(`
		%s
		WHERE %s
		ORDER BY b.date DESC, b.start_time DESC, b.created_at DESC
		LIMIT $%d OFFSET $%d
	`, bookingRecordSelect, where, len(args)-1, len(args))
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	records := make([]BookingRecord, 0, filter.Limit)
	for rows.Next() {
		record, err := scanBookingRecord(rows)
		if err != nil {
			return nil, 0, err
		}
		records = append(records, record)
	}
	return records, total, rows.Err()
}

func (r *pgRepository) ListNannyBookingHistory(ctx context.Context, nannyProfileID uuid.UUID, filter ListBookingsFilter) ([]BookingRecord, int, error) {
	filter.Page, filter.Limit = normalizePageLimit(filter.Page, filter.Limit, 10, 100)
	where, args := buildNannyBookingHistoryWhere(nannyProfileID, filter)

	var total int
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM bookings b WHERE %s`, where)
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	args = append(args, filter.Limit, (filter.Page-1)*filter.Limit)
	query := fmt.Sprintf(`
		%s
		WHERE %s
		ORDER BY b.date DESC, b.start_time DESC, b.created_at DESC
		LIMIT $%d OFFSET $%d
	`, bookingRecordSelect, where, len(args)-1, len(args))
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	records := make([]BookingRecord, 0, filter.Limit)
	for rows.Next() {
		record, err := scanBookingRecord(rows)
		if err != nil {
			return nil, 0, err
		}
		records = append(records, record)
	}
	return records, total, rows.Err()
}

func (r *pgRepository) GetNannyBookingSummary(ctx context.Context, nannyProfileID uuid.UUID) (NannyBookingSummary, error) {
	var summary NannyBookingSummary
	err := r.db.QueryRow(ctx, `
		SELECT COUNT(*) FILTER (WHERE status = 'completed')::int,
		       COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0)
		FROM bookings
		WHERE nanny_profile_id = $1
	`, nannyProfileID).Scan(&summary.CompletedCount, &summary.TotalEarnings)
	return summary, err
}

func (r *pgRepository) GetBookingByID(ctx context.Context, bookingID uuid.UUID) (BookingRecord, error) {
	return scanBookingRecord(r.db.QueryRow(ctx, bookingRecordSelect+` WHERE b.id = $1`, bookingID))
}

func (r *pgRepository) updateBookingWithAdminAction(ctx context.Context, params AdminBookingActionParams, action models.AdminBookingActionType, from []string, to models.BookingStatus) (BookingRecord, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return BookingRecord{}, err
	}
	defer tx.Rollback(ctx)

	var previousStatus models.BookingStatus
	err = tx.QueryRow(ctx, `
		WITH target AS (
			SELECT id, status
			FROM bookings
			WHERE id = $2 AND status = ANY($3)
			FOR UPDATE
		), updated AS (
			UPDATE bookings b
			SET status = $1, updated_at = NOW()
			FROM target
			WHERE b.id = target.id
			RETURNING target.status
		)
		SELECT status FROM updated
	`, to, params.BookingID, from).Scan(&previousStatus)
	if errors.Is(err, pgx.ErrNoRows) {
		if err := tx.Commit(ctx); err != nil {
			return BookingRecord{}, err
		}
		return BookingRecord{}, nil
	}
	if err != nil {
		return BookingRecord{}, err
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO admin_booking_actions (id, booking_id, admin_user_id, action, previous_status, new_status, reason)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, uuid.New(), params.BookingID, params.AdminUserID, string(action), previousStatus, to, params.Reason); err != nil {
		return BookingRecord{}, err
	}
	if _, err := tx.Exec(ctx, `
		UPDATE booking_change_requests
		SET status = 'declined',
		    response_note = $2,
		    resolved_at = NOW(),
		    updated_at = NOW()
		WHERE booking_id = $1 AND status = 'pending'
	`, params.BookingID, "Resolved by admin: "+params.Reason); err != nil {
		return BookingRecord{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return BookingRecord{}, err
	}
	return r.GetBookingByID(ctx, params.BookingID)
}

func (r *pgRepository) CancelBooking(ctx context.Context, params AdminBookingActionParams) (BookingRecord, error) {
	return r.updateBookingWithAdminAction(ctx, params, models.AdminCancelBookingAction, []string{
		string(models.PendingBookingStatus),
		string(models.ApprovedBookingStatus),
	}, models.CancelledBookingStatus)
}

func (r *pgRepository) CompleteBooking(ctx context.Context, params AdminBookingActionParams) (BookingRecord, error) {
	return r.updateBookingWithAdminAction(ctx, params, models.AdminCompleteBookingAction, []string{
		string(models.ApprovedBookingStatus),
	}, models.CompletedBookingStatus)
}

func (r *pgRepository) ListBookingActions(ctx context.Context, bookingID uuid.UUID, page, limit int) ([]AdminBookingActionRecord, int, error) {
	page, limit = normalizePageLimit(page, limit, 20, 100)

	var total int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM admin_booking_actions WHERE booking_id = $1`, bookingID).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.Query(ctx, `
		SELECT aba.id, aba.booking_id, aba.admin_user_id, u.email,
		       aba.action, aba.previous_status, aba.new_status, aba.reason, aba.created_at
		FROM admin_booking_actions aba
		LEFT JOIN users u ON u.id = aba.admin_user_id
		WHERE aba.booking_id = $1
		ORDER BY aba.created_at DESC
		LIMIT $2 OFFSET $3
	`, bookingID, limit, (page-1)*limit)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := make([]AdminBookingActionRecord, 0, limit)
	for rows.Next() {
		var item AdminBookingActionRecord
		if err := rows.Scan(
			&item.ID,
			&item.BookingID,
			&item.AdminUserID,
			&item.AdminEmail,
			&item.Action,
			&item.PreviousStatus,
			&item.NewStatus,
			&item.Reason,
			&item.CreatedAt,
		); err != nil {
			return nil, 0, err
		}
		items = append(items, item)
	}
	return items, total, rows.Err()
}
