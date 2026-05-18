package admin

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinsittr/kinsittr-api/models"
)

type pgRepository struct {
	db *pgxpool.Pool
}

func newPgRepository(db *pgxpool.Pool) *pgRepository {
	return &pgRepository{db: db}
}

func normalizePageLimit(page, limit, defaultLimit, maxLimit int) (int, int) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = defaultLimit
	}
	if limit > maxLimit {
		limit = maxLimit
	}
	return page, limit
}

func buildNanniesWhere(filter ListNanniesFilter) (string, []any) {
	clauses := []string{"u.role = 'nanny'"}
	args := []any{}
	if filter.Status != "" {
		args = append(args, filter.Status)
		clauses = append(clauses, fmt.Sprintf("np.verification_status = $%d", len(args)))
	}
	if strings.TrimSpace(filter.City) != "" {
		args = append(args, strings.TrimSpace(filter.City))
		clauses = append(clauses, fmt.Sprintf("LOWER(np.city) = LOWER($%d)", len(args)))
	}
	if strings.TrimSpace(filter.Search) != "" {
		args = append(args, "%"+strings.ToLower(strings.TrimSpace(filter.Search))+"%")
		clauses = append(clauses, fmt.Sprintf(`(
			LOWER(np.display_name) LIKE $%d
			OR LOWER(np.city) LIKE $%d
			OR LOWER(np.province) LIKE $%d
			OR LOWER(u.email) LIKE $%d
		)`, len(args), len(args), len(args), len(args)))
	}
	return strings.Join(clauses, " AND "), args
}

func scanNannyRecord(row pgx.Row) (NannyRecord, error) {
	var record NannyRecord
	err := row.Scan(
		&record.ID,
		&record.UserID,
		&record.DisplayName,
		&record.Bio,
		&record.Specialties,
		&record.RatePerHour,
		&record.ServiceType,
		&record.Currency,
		&record.VerificationStatus,
		&record.VerifiedAt,
		&record.StripeAccountID,
		&record.StripeOnboarded,
		&record.RatingAvg,
		&record.RatingCount,
		&record.City,
		&record.Province,
		&record.CreatedAt,
		&record.UpdatedAt,
		&record.UserEmail,
		&record.UserFirstname,
		&record.UserLastname,
		&record.UserIsActive,
		&record.DocsReviewed,
		&record.ReferencesChecked,
		&record.InterviewDone,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return NannyRecord{}, nil
	}
	return record, err
}

const nannyRecordSelect = `
	SELECT np.id, np.user_id, np.display_name, np.bio, COALESCE(np.specialties, '{}'::text[]),
	       np.rate_per_hour, np.service_type, np.currency, np.verification_status, np.verified_at,
	       np.stripe_account_id, np.stripe_onboarded, np.rating_avg, np.rating_count,
	       np.city, np.province, np.created_at, np.updated_at,
	       u.email, u.firstname, u.lastname, u.is_active,
	       COALESCE(nss.docs_reviewed, false),
	       COALESCE(nss.references_checked, false),
	       COALESCE(nss.interview_done, false)
	FROM nanny_profiles np
	INNER JOIN users u ON u.id = np.user_id
	LEFT JOIN nanny_screening_steps nss ON nss.nanny_profile_id = np.id
`

func (r *pgRepository) ListNannies(ctx context.Context, filter ListNanniesFilter) ([]NannyRecord, int, error) {
	filter.Page, filter.Limit = normalizePageLimit(filter.Page, filter.Limit, 20, 100)
	where, args := buildNanniesWhere(filter)

	var total int
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM nanny_profiles np
		INNER JOIN users u ON u.id = np.user_id
		WHERE %s
	`, where)
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	args = append(args, filter.Limit, (filter.Page-1)*filter.Limit)
	query := fmt.Sprintf(`
		%s
		WHERE %s
		ORDER BY
			CASE np.verification_status
				WHEN 'pending' THEN 1
				WHEN 'under_review' THEN 2
				WHEN 'rejected' THEN 3
				WHEN 'verified' THEN 4
				ELSE 5
			END,
			np.created_at DESC
		LIMIT $%d OFFSET $%d
	`, nannyRecordSelect, where, len(args)-1, len(args))
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	records := make([]NannyRecord, 0, filter.Limit)
	for rows.Next() {
		record, err := scanNannyRecord(rows)
		if err != nil {
			return nil, 0, err
		}
		records = append(records, record)
	}
	return records, total, rows.Err()
}

func (r *pgRepository) GetNannyByID(ctx context.Context, nannyProfileID uuid.UUID) (NannyRecord, error) {
	return scanNannyRecord(r.db.QueryRow(ctx, nannyRecordSelect+` WHERE np.id = $1`, nannyProfileID))
}

func (r *pgRepository) UpdateScreeningSteps(ctx context.Context, nannyProfileID uuid.UUID, params UpdateScreeningStepsParams) (NannyRecord, error) {
	current, err := r.GetNannyByID(ctx, nannyProfileID)
	if err != nil || current.ID == uuid.Nil {
		return current, err
	}
	docsReviewed := current.DocsReviewed
	referencesChecked := current.ReferencesChecked
	interviewDone := current.InterviewDone
	if params.DocsReviewed != nil {
		docsReviewed = *params.DocsReviewed
	}
	if params.ReferencesChecked != nil {
		referencesChecked = *params.ReferencesChecked
	}
	if params.InterviewDone != nil {
		interviewDone = *params.InterviewDone
	}

	if _, err := r.db.Exec(ctx, `
		INSERT INTO nanny_screening_steps (nanny_profile_id, docs_reviewed, references_checked, interview_done)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (nanny_profile_id) DO UPDATE
		SET docs_reviewed = EXCLUDED.docs_reviewed,
		    references_checked = EXCLUDED.references_checked,
		    interview_done = EXCLUDED.interview_done,
		    updated_at = NOW()
	`, nannyProfileID, docsReviewed, referencesChecked, interviewDone); err != nil {
		return NannyRecord{}, err
	}
	if current.VerificationStatus == models.PendingVerificationStatus {
		if _, err := r.db.Exec(ctx, `
			UPDATE nanny_profiles
			SET verification_status = $1, updated_at = NOW()
			WHERE id = $2
		`, models.UnderReviewVerificationStatus, nannyProfileID); err != nil {
			return NannyRecord{}, err
		}
	}
	return r.GetNannyByID(ctx, nannyProfileID)
}

func (r *pgRepository) UpdateNannyVerificationStatus(ctx context.Context, nannyProfileID uuid.UUID, status models.VerificationStatus) (NannyRecord, error) {
	verifiedAtSQL := "NULL"
	if status == models.VerifiedVerificationStatus {
		verifiedAtSQL = "COALESCE(verified_at, NOW())"
	}
	query := fmt.Sprintf(`
		UPDATE nanny_profiles
		SET verification_status = $1, verified_at = %s, updated_at = NOW()
		WHERE id = $2
	`, verifiedAtSQL)
	if _, err := r.db.Exec(ctx, query, status, nannyProfileID); err != nil {
		return NannyRecord{}, err
	}
	return r.GetNannyByID(ctx, nannyProfileID)
}

func (r *pgRepository) UpdateNannyVerificationStatusWithAction(ctx context.Context, params AdminNannyActionParams) (NannyRecord, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return NannyRecord{}, err
	}
	defer tx.Rollback(ctx)

	verifiedAtSQL := "NULL"
	if params.ToStatus == models.VerifiedVerificationStatus {
		verifiedAtSQL = "COALESCE(verified_at, NOW())"
	}

	var previousStatus models.VerificationStatus
	err = tx.QueryRow(ctx, fmt.Sprintf(`
		WITH target AS (
			SELECT id, verification_status
			FROM nanny_profiles
			WHERE id = $2 AND verification_status = ANY($3)
			FOR UPDATE
		), updated AS (
			UPDATE nanny_profiles np
			SET verification_status = $1, verified_at = %s, updated_at = NOW()
			FROM target
			WHERE np.id = target.id
			RETURNING target.verification_status
		)
		SELECT verification_status FROM updated
	`, verifiedAtSQL), params.ToStatus, params.NannyProfileID, params.FromStatuses).Scan(&previousStatus)
	if errors.Is(err, pgx.ErrNoRows) {
		if err := tx.Commit(ctx); err != nil {
			return NannyRecord{}, err
		}
		return NannyRecord{}, nil
	}
	if err != nil {
		return NannyRecord{}, err
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO admin_nanny_actions (id, nanny_profile_id, admin_user_id, action, previous_status, new_status, reason)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, uuid.New(), params.NannyProfileID, params.AdminUserID, string(params.Action), previousStatus, params.ToStatus, params.Reason); err != nil {
		return NannyRecord{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return NannyRecord{}, err
	}
	return r.GetNannyByID(ctx, params.NannyProfileID)
}

func (r *pgRepository) ResetNannyScreening(ctx context.Context, nannyProfileID uuid.UUID) (NannyRecord, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return NannyRecord{}, err
	}
	defer tx.Rollback(ctx)

	tag, err := tx.Exec(ctx, `
		UPDATE nanny_profiles
		SET verification_status = $1, verified_at = NULL, updated_at = NOW()
		WHERE id = $2 AND verification_status = $3
	`, models.PendingVerificationStatus, nannyProfileID, models.RejectedVerificationStatus)
	if err != nil {
		return NannyRecord{}, err
	}
	if tag.RowsAffected() == 0 {
		if err := tx.Commit(ctx); err != nil {
			return NannyRecord{}, err
		}
		return NannyRecord{}, nil
	}

	if _, err := tx.Exec(ctx, `
		DELETE FROM nanny_screening_steps
		WHERE nanny_profile_id = $1
	`, nannyProfileID); err != nil {
		return NannyRecord{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return NannyRecord{}, err
	}
	return r.GetNannyByID(ctx, nannyProfileID)
}

func (r *pgRepository) ResetNannyScreeningWithAction(ctx context.Context, params AdminNannyActionParams) (NannyRecord, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return NannyRecord{}, err
	}
	defer tx.Rollback(ctx)

	var previousStatus models.VerificationStatus
	err = tx.QueryRow(ctx, `
		WITH target AS (
			SELECT id, verification_status
			FROM nanny_profiles
			WHERE id = $2 AND verification_status = ANY($3)
			FOR UPDATE
		), updated AS (
			UPDATE nanny_profiles np
			SET verification_status = $1, verified_at = NULL, updated_at = NOW()
			FROM target
			WHERE np.id = target.id
			RETURNING target.verification_status
		)
		SELECT verification_status FROM updated
	`, params.ToStatus, params.NannyProfileID, params.FromStatuses).Scan(&previousStatus)
	if errors.Is(err, pgx.ErrNoRows) {
		if err := tx.Commit(ctx); err != nil {
			return NannyRecord{}, err
		}
		return NannyRecord{}, nil
	}
	if err != nil {
		return NannyRecord{}, err
	}

	if _, err := tx.Exec(ctx, `DELETE FROM nanny_screening_steps WHERE nanny_profile_id = $1`, params.NannyProfileID); err != nil {
		return NannyRecord{}, err
	}
	if _, err := tx.Exec(ctx, `
		INSERT INTO admin_nanny_actions (id, nanny_profile_id, admin_user_id, action, previous_status, new_status, reason)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, uuid.New(), params.NannyProfileID, params.AdminUserID, string(params.Action), previousStatus, params.ToStatus, params.Reason); err != nil {
		return NannyRecord{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return NannyRecord{}, err
	}
	return r.GetNannyByID(ctx, params.NannyProfileID)
}

func (r *pgRepository) SuspendNannyAccount(ctx context.Context, params AdminAccountActionParams) (NannyRecord, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return NannyRecord{}, err
	}
	defer tx.Rollback(ctx)

	var targetUserID uuid.UUID
	err = tx.QueryRow(ctx, `
		UPDATE users u
		SET is_active = FALSE, updated_at = NOW()
		FROM nanny_profiles np
		WHERE np.user_id = u.id
		  AND np.id = $1
		  AND u.is_active = TRUE
		RETURNING u.id
	`, params.ProfileID).Scan(&targetUserID)
	if errors.Is(err, pgx.ErrNoRows) {
		if err := tx.Commit(ctx); err != nil {
			return NannyRecord{}, err
		}
		return NannyRecord{}, nil
	}
	if err != nil {
		return NannyRecord{}, err
	}

	if _, err := tx.Exec(ctx, `DELETE FROM refresh_sessions WHERE user_id = $1`, targetUserID); err != nil {
		return NannyRecord{}, err
	}
	if _, err := tx.Exec(ctx, `
		INSERT INTO admin_account_actions (id, target_user_id, target_profile_id, target_role, admin_user_id, action, reason)
		VALUES ($1, $2, $3, $4, $5, 'suspend', $6)
	`, uuid.New(), targetUserID, params.ProfileID, models.NannyUserRole, params.AdminUserID, string(models.AdminSuspendAccountAction), params.Reason); err != nil {
		return NannyRecord{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return NannyRecord{}, err
	}
	return r.GetNannyByID(ctx, params.ProfileID)
}

func buildParentsWhere(filter ListParentsFilter) (string, []any) {
	clauses := []string{"u.role = 'parent'"}
	args := []any{}
	if strings.TrimSpace(filter.City) != "" {
		args = append(args, strings.TrimSpace(filter.City))
		clauses = append(clauses, fmt.Sprintf("LOWER(pp.city) = LOWER($%d)", len(args)))
	}
	if strings.TrimSpace(filter.Search) != "" {
		args = append(args, "%"+strings.ToLower(strings.TrimSpace(filter.Search))+"%")
		clauses = append(clauses, fmt.Sprintf(`(
			LOWER(pp.display_name) LIKE $%d
			OR LOWER(pp.city) LIKE $%d
			OR LOWER(pp.province) LIKE $%d
			OR LOWER(u.email) LIKE $%d
			OR LOWER(u.firstname) LIKE $%d
			OR LOWER(u.lastname) LIKE $%d
		)`, len(args), len(args), len(args), len(args), len(args), len(args)))
	}
	return strings.Join(clauses, " AND "), args
}

func scanParentRecord(row pgx.Row) (ParentRecord, error) {
	var record ParentRecord
	err := row.Scan(
		&record.ID,
		&record.UserID,
		&record.DisplayName,
		&record.NumChildren,
		&record.ChildrenAges,
		&record.City,
		&record.Province,
		&record.StripeCustomerID,
		&record.CreatedAt,
		&record.UpdatedAt,
		&record.UserEmail,
		&record.UserFirstname,
		&record.UserLastname,
		&record.UserIsActive,
		&record.BookingCount,
		&record.TotalSpend,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return ParentRecord{}, nil
	}
	return record, err
}

const parentRecordSelect = `
	SELECT pp.id, pp.user_id, pp.display_name, pp.num_children, pp.children_ages,
	       pp.city, pp.province, COALESCE(pp.stripe_customer_id, ''),
	       pp.created_at, pp.updated_at,
	       u.email, u.firstname, u.lastname, u.is_active,
	       COUNT(b.id)::int AS booking_count,
	       COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_amount ELSE 0 END), 0) AS total_spend
	FROM parent_profiles pp
	INNER JOIN users u ON u.id = pp.user_id
	LEFT JOIN bookings b ON b.parent_profile_id = pp.id
`

const parentRecordGroupBy = `
	GROUP BY pp.id, pp.user_id, pp.display_name, pp.num_children, pp.children_ages,
	         pp.city, pp.province, pp.stripe_customer_id, pp.created_at, pp.updated_at,
	         u.email, u.firstname, u.lastname, u.is_active
`

func (r *pgRepository) ListParents(ctx context.Context, filter ListParentsFilter) ([]ParentRecord, int, error) {
	filter.Page, filter.Limit = normalizePageLimit(filter.Page, filter.Limit, 20, 100)
	where, args := buildParentsWhere(filter)

	var total int
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM parent_profiles pp
		INNER JOIN users u ON u.id = pp.user_id
		WHERE %s
	`, where)
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	args = append(args, filter.Limit, (filter.Page-1)*filter.Limit)
	query := fmt.Sprintf(`
		%s
		WHERE %s
		%s
		ORDER BY pp.created_at DESC
		LIMIT $%d OFFSET $%d
	`, parentRecordSelect, where, parentRecordGroupBy, len(args)-1, len(args))
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	records := make([]ParentRecord, 0, filter.Limit)
	for rows.Next() {
		record, err := scanParentRecord(rows)
		if err != nil {
			return nil, 0, err
		}
		records = append(records, record)
	}
	return records, total, rows.Err()
}

func (r *pgRepository) GetParentByID(ctx context.Context, parentProfileID uuid.UUID) (ParentRecord, error) {
	return scanParentRecord(r.db.QueryRow(ctx, parentRecordSelect+` WHERE pp.id = $1 `+parentRecordGroupBy, parentProfileID))
}

func (r *pgRepository) SuspendParentAccount(ctx context.Context, params AdminAccountActionParams) (ParentRecord, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return ParentRecord{}, err
	}
	defer tx.Rollback(ctx)

	var targetUserID uuid.UUID
	err = tx.QueryRow(ctx, `
		UPDATE users u
		SET is_active = FALSE, updated_at = NOW()
		FROM parent_profiles pp
		WHERE pp.user_id = u.id
		  AND pp.id = $1
		  AND u.is_active = TRUE
		RETURNING u.id
	`, params.ProfileID).Scan(&targetUserID)
	if errors.Is(err, pgx.ErrNoRows) {
		if err := tx.Commit(ctx); err != nil {
			return ParentRecord{}, err
		}
		return ParentRecord{}, nil
	}
	if err != nil {
		return ParentRecord{}, err
	}

	if _, err := tx.Exec(ctx, `DELETE FROM refresh_sessions WHERE user_id = $1`, targetUserID); err != nil {
		return ParentRecord{}, err
	}
	if _, err := tx.Exec(ctx, `
		INSERT INTO admin_account_actions (id, target_user_id, target_profile_id, target_role, admin_user_id, action, reason)
		VALUES ($1, $2, $3, $4, $5, 'suspend', $6)
	`, uuid.New(), targetUserID, params.ProfileID, models.ParentUserRole, params.AdminUserID, string(models.AdminSuspendAccountAction), params.Reason); err != nil {
		return ParentRecord{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return ParentRecord{}, err
	}
	return r.GetParentByID(ctx, params.ProfileID)
}

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

func buildAnalyticsBookingsWhere(filter AnalyticsRangeFilter) (string, []any) {
	where := "1 = 1"
	args := []any{}
	if filter.DateFrom != nil {
		args = append(args, *filter.DateFrom)
		where += fmt.Sprintf(" AND b.date >= $%d", len(args))
	}
	if filter.DateTo != nil {
		args = append(args, *filter.DateTo)
		where += fmt.Sprintf(" AND b.date <= $%d", len(args))
	}
	return where, args
}

func buildAnalyticsUsersWhere(filter AnalyticsRangeFilter) (string, []any) {
	where := "1 = 1"
	args := []any{}
	if filter.DateFrom != nil {
		args = append(args, *filter.DateFrom)
		where += fmt.Sprintf(" AND u.created_at >= $%d", len(args))
	}
	if filter.DateTo != nil {
		args = append(args, *filter.DateTo)
		where += fmt.Sprintf(" AND u.created_at <= $%d", len(args))
	}
	return where, args
}

func (r *pgRepository) GetAnalyticsSummary(ctx context.Context, filter AnalyticsRangeFilter) (AnalyticsSummary, error) {
	if filter.CityLimit < 1 {
		filter.CityLimit = 10
	}
	if filter.TopNanniesLimit < 1 {
		filter.TopNanniesLimit = 10
	}

	where, args := buildAnalyticsBookingsWhere(filter)
	var summary AnalyticsSummary
	err := r.db.QueryRow(ctx, fmt.Sprintf(`
		SELECT
			COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_amount ELSE 0 END), 0),
			COUNT(*) FILTER (WHERE b.status IN ('pending', 'approved')),
			COUNT(*) FILTER (
				WHERE b.date >= date_trunc('week', CURRENT_DATE)::date
				  AND b.date < (date_trunc('week', CURRENT_DATE)::date + INTERVAL '7 days')
			),
			COALESCE(AVG(NULLIF(b.total_amount, 0)), 0)
		FROM bookings b
		WHERE %s
	`, where), args...).Scan(
		&summary.TotalRevenue,
		&summary.ActiveBookings,
		&summary.BookingsThisWeek,
		&summary.AverageBookingValue,
	)
	if err != nil {
		return AnalyticsSummary{}, err
	}

	if err := r.db.QueryRow(ctx, `
		SELECT
			COUNT(*) FILTER (WHERE verification_status = 'verified'),
			COUNT(*) FILTER (WHERE verification_status IN ('pending', 'under_review'))
		FROM nanny_profiles
	`).Scan(&summary.VerifiedNannies, &summary.PendingNannies); err != nil {
		return AnalyticsSummary{}, err
	}

	cityRows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT COALESCE(NULLIF(pp.city, ''), 'Unknown') AS city, COUNT(*)::int AS count
		FROM bookings b
		INNER JOIN parent_profiles pp ON pp.id = b.parent_profile_id
		WHERE %s
		GROUP BY city
		ORDER BY count DESC, city ASC
		LIMIT $%d
	`, where, len(args)+1), append(append([]any{}, args...), filter.CityLimit)...)
	if err != nil {
		return AnalyticsSummary{}, err
	}
	defer cityRows.Close()
	for cityRows.Next() {
		var metric CityBookingMetric
		if err := cityRows.Scan(&metric.City, &metric.Count); err != nil {
			return AnalyticsSummary{}, err
		}
		summary.BookingsByCity = append(summary.BookingsByCity, metric)
	}
	if err := cityRows.Err(); err != nil {
		return AnalyticsSummary{}, err
	}

	bucket := filter.Bucket
	timeRows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT date_trunc('%s', b.date::timestamp)::date AS period,
		       COUNT(*)::int AS bookings_count,
		       COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_amount ELSE 0 END), 0) AS revenue
		FROM bookings b
		WHERE %s
		GROUP BY period
		ORDER BY period ASC
	`, bucket, where), args...)
	if err != nil {
		return AnalyticsSummary{}, err
	}
	defer timeRows.Close()
	for timeRows.Next() {
		var metric AnalyticsTimeSeriesMetric
		if err := timeRows.Scan(&metric.Period, &metric.BookingsCount, &metric.Revenue); err != nil {
			return AnalyticsSummary{}, err
		}
		summary.TimeSeries = append(summary.TimeSeries, metric)
	}
	if err := timeRows.Err(); err != nil {
		return AnalyticsSummary{}, err
	}

	topArgs := append(append([]any{}, args...), filter.TopNanniesLimit)
	topRows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT np.id::text, np.display_name, np.city, np.province,
		       COUNT(*) FILTER (WHERE b.status = 'completed')::int AS completed_count,
		       COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_amount ELSE 0 END), 0) AS revenue,
		       np.rating_avg
		FROM bookings b
		INNER JOIN nanny_profiles np ON np.id = b.nanny_profile_id
		WHERE %s
		GROUP BY np.id, np.display_name, np.city, np.province, np.rating_avg
		HAVING COUNT(*) FILTER (WHERE b.status = 'completed') > 0
		ORDER BY revenue DESC, completed_count DESC, np.display_name ASC
		LIMIT $%d
	`, where, len(topArgs)), topArgs...)
	if err != nil {
		return AnalyticsSummary{}, err
	}
	defer topRows.Close()
	for topRows.Next() {
		var metric TopNannyMetric
		if err := topRows.Scan(
			&metric.NannyProfileID,
			&metric.DisplayName,
			&metric.City,
			&metric.Province,
			&metric.CompletedCount,
			&metric.Revenue,
			&metric.RatingAvg,
		); err != nil {
			return AnalyticsSummary{}, err
		}
		summary.TopNannies = append(summary.TopNannies, metric)
	}
	if err := topRows.Err(); err != nil {
		return AnalyticsSummary{}, err
	}

	userWhere, userArgs := buildAnalyticsUsersWhere(filter)
	regRows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT date_trunc('%s', u.created_at)::date AS period,
		       COUNT(*) FILTER (WHERE u.role = 'parent')::int AS parent_count,
		       COUNT(*) FILTER (WHERE u.role = 'nanny')::int AS nanny_count
		FROM users u
		WHERE %s AND u.role IN ('parent', 'nanny')
		GROUP BY period
		ORDER BY period ASC
	`, bucket, userWhere), userArgs...)
	if err != nil {
		return AnalyticsSummary{}, err
	}
	defer regRows.Close()
	for regRows.Next() {
		var metric RegistrationTrendMetric
		if err := regRows.Scan(&metric.Period, &metric.ParentCount, &metric.NannyCount); err != nil {
			return AnalyticsSummary{}, err
		}
		summary.RegistrationTrends = append(summary.RegistrationTrends, metric)
	}
	if err := regRows.Err(); err != nil {
		return AnalyticsSummary{}, err
	}

	return summary, nil
}
