package reviews

import (
	"context"
	"errors"
	"fmt"
	"strings"

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

const reviewRecordSelect = `
	SELECT r.id, r.booking_id, r.nanny_profile_id, r.parent_profile_id, r.rating, r.comment,
	       r.is_visible, r.flagged_at, r.flagged_by, r.flag_reason, r.reviewed_by_admin,
	       r.created_at, r.updated_at,
	       'nanny'::text AS target,
	       np.display_name, np.city, np.province,
	       pp.display_name, pp.city, pp.province,
	       u.email,
	       b.date, b.start_time, b.status
	FROM nanny_reviews r
	INNER JOIN bookings b ON b.id = r.booking_id
	INNER JOIN nanny_profiles np ON np.id = r.nanny_profile_id
	INNER JOIN parent_profiles pp ON pp.id = r.parent_profile_id
	INNER JOIN users u ON u.id = pp.user_id
`

const parentReviewRecordSelect = `
	SELECT r.id, r.booking_id, r.nanny_profile_id, r.parent_profile_id, r.rating, r.comment,
	       r.is_visible, r.flagged_at, r.flagged_by, r.flag_reason, r.reviewed_by_admin,
	       r.created_at, r.updated_at,
	       'parent'::text AS target,
	       np.display_name, np.city, np.province,
	       pp.display_name, pp.city, pp.province,
	       u.email,
	       b.date, b.start_time, b.status
	FROM parent_reviews r
	INNER JOIN bookings b ON b.id = r.booking_id
	INNER JOIN nanny_profiles np ON np.id = r.nanny_profile_id
	INNER JOIN parent_profiles pp ON pp.id = r.parent_profile_id
	INNER JOIN users u ON u.id = pp.user_id
`

func scanReviewRecord(row pgx.Row) (ReviewRecord, error) {
	var record ReviewRecord
	err := row.Scan(
		&record.ID,
		&record.BookingID,
		&record.NannyProfileID,
		&record.ParentProfileID,
		&record.Rating,
		&record.Comment,
		&record.IsVisible,
		&record.FlaggedAt,
		&record.FlaggedBy,
		&record.FlagReason,
		&record.ReviewedByAdmin,
		&record.CreatedAt,
		&record.UpdatedAt,
		&record.Target,
		&record.NannyDisplayName,
		&record.NannyCity,
		&record.NannyProvince,
		&record.ParentDisplayName,
		&record.ParentCity,
		&record.ParentProvince,
		&record.ParentEmail,
		&record.BookingDate,
		&record.BookingStartTime,
		&record.BookingStatus,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return ReviewRecord{}, nil
	}
	return record, err
}

func (r *pgRepository) CreateReview(ctx context.Context, params CreateReviewParams) (ReviewRecord, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return ReviewRecord{}, err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `
		INSERT INTO nanny_reviews (id, booking_id, nanny_profile_id, parent_profile_id, rating, comment)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, params.ID, params.BookingID, params.NannyProfileID, params.ParentProfileID, params.Rating, params.Comment)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return ReviewRecord{}, ErrReviewAlreadyExists
		}
		return ReviewRecord{}, err
	}
	if err := refreshNannyRating(ctx, tx, params.NannyProfileID); err != nil {
		return ReviewRecord{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return ReviewRecord{}, err
	}
	return r.GetReviewByID(ctx, params.ID, true)
}

func (r *pgRepository) CreateParentReview(ctx context.Context, params CreateReviewParams) (ReviewRecord, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return ReviewRecord{}, err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `
		INSERT INTO parent_reviews (id, booking_id, parent_profile_id, nanny_profile_id, rating, comment)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, params.ID, params.BookingID, params.ParentProfileID, params.NannyProfileID, params.Rating, params.Comment)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return ReviewRecord{}, ErrReviewAlreadyExists
		}
		return ReviewRecord{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return ReviewRecord{}, err
	}
	return r.GetParentReviewByID(ctx, params.ID, true)
}

func (r *pgRepository) GetReviewByID(ctx context.Context, reviewID uuid.UUID, adminScope bool) (ReviewRecord, error) {
	where := "WHERE r.id = $1"
	if !adminScope {
		where += " AND r.is_visible = TRUE"
	}
	return scanReviewRecord(r.db.QueryRow(ctx, reviewRecordSelect+" "+where, reviewID))
}

func (r *pgRepository) GetParentReviewByID(ctx context.Context, reviewID uuid.UUID, adminScope bool) (ReviewRecord, error) {
	where := "WHERE r.id = $1"
	if !adminScope {
		where += " AND r.is_visible = TRUE"
	}
	return scanReviewRecord(r.db.QueryRow(ctx, parentReviewRecordSelect+" "+where, reviewID))
}

func (r *pgRepository) ListReviews(ctx context.Context, filter ListReviewsFilter) ([]ReviewRecord, int, error) {
	filter.Page, filter.Limit = normalizePageLimit(filter.Page, filter.Limit)
	where, args := buildReviewsWhere(filter)

	var total int
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM nanny_reviews r
		INNER JOIN bookings b ON b.id = r.booking_id
		INNER JOIN nanny_profiles np ON np.id = r.nanny_profile_id
		INNER JOIN parent_profiles pp ON pp.id = r.parent_profile_id
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
		ORDER BY r.created_at DESC
		LIMIT $%d OFFSET $%d
	`, reviewRecordSelect, where, len(args)-1, len(args))
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	records := make([]ReviewRecord, 0, filter.Limit)
	for rows.Next() {
		record, err := scanReviewRecord(rows)
		if err != nil {
			return nil, 0, err
		}
		records = append(records, record)
	}
	return records, total, rows.Err()
}

func (r *pgRepository) ListParentReviews(ctx context.Context, filter ListReviewsFilter) ([]ReviewRecord, int, error) {
	return r.listFromSelect(ctx, filter, parentReviewRecordSelect, "parent_reviews")
}

func (r *pgRepository) ListPublicNannyReviews(ctx context.Context, nannyProfileID uuid.UUID, page, limit int) ([]ReviewRecord, int, error) {
	page, limit = normalizePageLimit(page, limit)
	args := []any{nannyProfileID}
	where := "r.nanny_profile_id = $1 AND r.is_visible = TRUE AND np.verification_status = 'verified' AND u_nanny.is_active = TRUE"

	var total int
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM nanny_reviews r
		INNER JOIN nanny_profiles np ON np.id = r.nanny_profile_id
		INNER JOIN users u_nanny ON u_nanny.id = np.user_id
		WHERE %s
	`, where)
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	args = append(args, limit, (page-1)*limit)
	query := fmt.Sprintf(`
		%s
		INNER JOIN users u_nanny ON u_nanny.id = np.user_id
		WHERE %s
		ORDER BY r.created_at DESC
		LIMIT $2 OFFSET $3
	`, reviewRecordSelect, where)
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	records, err := scanReviewRows(rows, limit)
	return records, total, err
}

func (r *pgRepository) listFromSelect(ctx context.Context, filter ListReviewsFilter, selectSQL, tableName string) ([]ReviewRecord, int, error) {
	filter.Page, filter.Limit = normalizePageLimit(filter.Page, filter.Limit)
	where, args := buildReviewsWhere(filter)

	var total int
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM %s r
		INNER JOIN bookings b ON b.id = r.booking_id
		INNER JOIN nanny_profiles np ON np.id = r.nanny_profile_id
		INNER JOIN parent_profiles pp ON pp.id = r.parent_profile_id
		INNER JOIN users u ON u.id = pp.user_id
		WHERE %s
	`, tableName, where)
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	args = append(args, filter.Limit, (filter.Page-1)*filter.Limit)
	query := fmt.Sprintf(`
		%s
		WHERE %s
		ORDER BY r.created_at DESC
		LIMIT $%d OFFSET $%d
	`, selectSQL, where, len(args)-1, len(args))
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	records, err := scanReviewRows(rows, filter.Limit)
	return records, total, err
}

func scanReviewRows(rows pgx.Rows, limit int) ([]ReviewRecord, error) {
	records := make([]ReviewRecord, 0, limit)
	for rows.Next() {
		record, err := scanReviewRecord(rows)
		if err != nil {
			return nil, err
		}
		records = append(records, record)
	}
	return records, rows.Err()
}

func buildReviewsWhere(filter ListReviewsFilter) (string, []any) {
	clauses := []string{"1=1"}
	args := []any{}
	if !filter.AdminScope {
		clauses = append(clauses, "r.is_visible = TRUE")
	}
	if filter.ParentID != uuid.Nil {
		args = append(args, filter.ParentID)
		clauses = append(clauses, fmt.Sprintf("r.parent_profile_id = $%d", len(args)))
	}
	if filter.NannyID != uuid.Nil {
		args = append(args, filter.NannyID)
		clauses = append(clauses, fmt.Sprintf("r.nanny_profile_id = $%d", len(args)))
	}
	if filter.Rating > 0 {
		args = append(args, filter.Rating)
		clauses = append(clauses, fmt.Sprintf("r.rating = $%d", len(args)))
	}
	if filter.Flagged != nil {
		if *filter.Flagged {
			clauses = append(clauses, "r.flagged_at IS NOT NULL")
		} else {
			clauses = append(clauses, "r.flagged_at IS NULL")
		}
	}
	if filter.Visible != nil {
		args = append(args, *filter.Visible)
		clauses = append(clauses, fmt.Sprintf("r.is_visible = $%d", len(args)))
	}
	if filter.DateFrom != nil {
		args = append(args, *filter.DateFrom)
		clauses = append(clauses, fmt.Sprintf("r.created_at >= $%d", len(args)))
	}
	if filter.DateTo != nil {
		args = append(args, *filter.DateTo)
		clauses = append(clauses, fmt.Sprintf("r.created_at < $%d", len(args)))
	}
	if strings.TrimSpace(filter.Search) != "" {
		args = append(args, "%"+strings.ToLower(strings.TrimSpace(filter.Search))+"%")
		clauses = append(clauses, fmt.Sprintf(`(
			LOWER(r.comment) LIKE $%d
			OR LOWER(np.display_name) LIKE $%d
			OR LOWER(pp.display_name) LIKE $%d
			OR LOWER(u.email) LIKE $%d
		)`, len(args), len(args), len(args), len(args)))
	}
	return strings.Join(clauses, " AND "), args
}

func (r *pgRepository) FlagReview(ctx context.Context, params AdminReviewActionParams) (ReviewRecord, error) {
	return r.updateReviewModeration(ctx, params, models.AdminFlagReviewAction, reviewRecordSelect, "nanny_reviews", "admin_review_actions")
}

func (r *pgRepository) UnflagReview(ctx context.Context, params AdminReviewActionParams) (ReviewRecord, error) {
	return r.updateReviewModeration(ctx, params, models.AdminUnflagReviewAction, reviewRecordSelect, "nanny_reviews", "admin_review_actions")
}

func (r *pgRepository) FlagParentReview(ctx context.Context, params AdminReviewActionParams) (ReviewRecord, error) {
	return r.updateReviewModeration(ctx, params, models.AdminFlagReviewAction, parentReviewRecordSelect, "parent_reviews", "admin_parent_review_actions")
}

func (r *pgRepository) UnflagParentReview(ctx context.Context, params AdminReviewActionParams) (ReviewRecord, error) {
	return r.updateReviewModeration(ctx, params, models.AdminUnflagReviewAction, parentReviewRecordSelect, "parent_reviews", "admin_parent_review_actions")
}

func (r *pgRepository) updateReviewModeration(ctx context.Context, params AdminReviewActionParams, action models.AdminReviewActionType, selectSQL, tableName, actionTable string) (ReviewRecord, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return ReviewRecord{}, err
	}
	defer tx.Rollback(ctx)

	var nannyProfileID uuid.UUID
	if action == models.AdminFlagReviewAction {
		err = tx.QueryRow(ctx, fmt.Sprintf(`
			UPDATE %s
			SET is_visible = FALSE, flagged_at = NOW(), flagged_by = $2, flag_reason = $3, reviewed_by_admin = TRUE, updated_at = NOW()
			WHERE id = $1 AND is_visible = TRUE
			RETURNING nanny_profile_id
		`, tableName), params.ReviewID, params.AdminUserID, params.Reason).Scan(&nannyProfileID)
	} else {
		err = tx.QueryRow(ctx, fmt.Sprintf(`
			UPDATE %s
			SET is_visible = TRUE, flagged_at = NULL, flagged_by = NULL, flag_reason = NULL, reviewed_by_admin = TRUE, updated_at = NOW()
			WHERE id = $1 AND is_visible = FALSE
			RETURNING nanny_profile_id
		`, tableName), params.ReviewID).Scan(&nannyProfileID)
	}
	if errors.Is(err, pgx.ErrNoRows) {
		if err := tx.Commit(ctx); err != nil {
			return ReviewRecord{}, err
		}
		return ReviewRecord{}, nil
	}
	if err != nil {
		return ReviewRecord{}, err
	}

	if _, err := tx.Exec(ctx, fmt.Sprintf(`
		INSERT INTO %s (id, review_id, admin_user_id, action, reason)
		VALUES ($1, $2, $3, $4, $5)
	`, actionTable), uuid.New(), params.ReviewID, params.AdminUserID, string(action), params.Reason); err != nil {
		return ReviewRecord{}, err
	}
	if tableName == "nanny_reviews" {
		if err := refreshNannyRating(ctx, tx, nannyProfileID); err != nil {
			return ReviewRecord{}, err
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return ReviewRecord{}, err
	}
	return scanReviewRecord(r.db.QueryRow(ctx, selectSQL+" WHERE r.id = $1", params.ReviewID))
}

func (r *pgRepository) ListReviewActions(ctx context.Context, reviewID uuid.UUID, page, limit int) ([]AdminReviewActionRecord, int, error) {
	return r.listReviewActions(ctx, reviewID, page, limit, "admin_review_actions")
}

func (r *pgRepository) ListParentReviewActions(ctx context.Context, reviewID uuid.UUID, page, limit int) ([]AdminReviewActionRecord, int, error) {
	return r.listReviewActions(ctx, reviewID, page, limit, "admin_parent_review_actions")
}

func (r *pgRepository) listReviewActions(ctx context.Context, reviewID uuid.UUID, page, limit int, tableName string) ([]AdminReviewActionRecord, int, error) {
	page, limit = normalizePageLimit(page, limit)
	var total int
	if err := r.db.QueryRow(ctx, fmt.Sprintf(`SELECT COUNT(*) FROM %s WHERE review_id = $1`, tableName), reviewID).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT ara.id, ara.review_id, ara.admin_user_id, ara.action, ara.reason, ara.created_at, u.email
		FROM %s ara
		LEFT JOIN users u ON u.id = ara.admin_user_id
		WHERE ara.review_id = $1
		ORDER BY ara.created_at DESC
		LIMIT $2 OFFSET $3
	`, tableName), reviewID, limit, (page-1)*limit)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	records := make([]AdminReviewActionRecord, 0, limit)
	for rows.Next() {
		var record AdminReviewActionRecord
		if err := rows.Scan(
			&record.ID,
			&record.ReviewID,
			&record.AdminUserID,
			&record.Action,
			&record.Reason,
			&record.CreatedAt,
			&record.AdminEmail,
		); err != nil {
			return nil, 0, err
		}
		records = append(records, record)
	}
	return records, total, rows.Err()
}

func refreshNannyRating(ctx context.Context, tx pgx.Tx, nannyProfileID uuid.UUID) error {
	_, err := tx.Exec(ctx, `
		UPDATE nanny_profiles
		SET rating_avg = COALESCE((
		        SELECT ROUND(AVG(rating)::numeric, 2)::float8
		        FROM nanny_reviews
		        WHERE nanny_profile_id = $1 AND is_visible = TRUE
		    ), 0),
		    rating_count = (
		        SELECT COUNT(*)::int
		        FROM nanny_reviews
		        WHERE nanny_profile_id = $1 AND is_visible = TRUE
		    ),
		    updated_at = NOW()
		WHERE id = $1
	`, nannyProfileID)
	return err
}
