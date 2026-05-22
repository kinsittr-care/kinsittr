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
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, uuid.New(), targetUserID, params.ProfileID, models.NannyUserRole, params.AdminUserID, string(models.AdminSuspendAccountAction), params.Reason); err != nil {
		return NannyRecord{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return NannyRecord{}, err
	}
	return r.GetNannyByID(ctx, params.ProfileID)
}

func (r *pgRepository) ReactivateNannyAccount(ctx context.Context, params AdminAccountActionParams) (NannyRecord, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return NannyRecord{}, err
	}
	defer tx.Rollback(ctx)

	var targetUserID uuid.UUID
	err = tx.QueryRow(ctx, `
		UPDATE users u
		SET is_active = TRUE, updated_at = NOW()
		FROM nanny_profiles np
		WHERE np.user_id = u.id
		  AND np.id = $1
		  AND u.is_active = FALSE
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

	if _, err := tx.Exec(ctx, `
		INSERT INTO admin_account_actions (id, target_user_id, target_profile_id, target_role, admin_user_id, action, reason)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, uuid.New(), targetUserID, params.ProfileID, models.NannyUserRole, params.AdminUserID, string(models.AdminReactivateAccountAction), params.Reason); err != nil {
		return NannyRecord{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return NannyRecord{}, err
	}
	return r.GetNannyByID(ctx, params.ProfileID)
}
