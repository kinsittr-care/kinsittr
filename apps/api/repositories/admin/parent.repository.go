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
