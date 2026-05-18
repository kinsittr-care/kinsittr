package admin

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/kinsittr/kinsittr-api/models"
)

func scanAdminUser(row pgx.Row) (AdminUserRecord, error) {
	var record AdminUserRecord
	err := row.Scan(
		&record.ID,
		&record.Firstname,
		&record.Lastname,
		&record.Email,
		&record.Role,
		&record.Phone,
		&record.IsActive,
		&record.CountryCode,
		&record.CreatedAt,
		&record.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return AdminUserRecord{}, nil
	}
	return record, err
}

func (r *pgRepository) ListAdmins(ctx context.Context, page, limit int) ([]AdminUserRecord, int, error) {
	page, limit = normalizePageLimit(page, limit, 20, 100)

	var total int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM users WHERE role = $1`, models.AdminUserRole).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.Query(ctx, `
		SELECT id, firstname, lastname, email, role, phone, is_active, country_code, created_at, updated_at
		FROM users
		WHERE role = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`, models.AdminUserRole, limit, (page-1)*limit)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := make([]AdminUserRecord, 0, limit)
	for rows.Next() {
		item, err := scanAdminUser(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, item)
	}
	return items, total, rows.Err()
}

func (r *pgRepository) CreateAdmin(ctx context.Context, params InviteAdminParams) (AdminUserRecord, error) {
	if params.ID == uuid.Nil {
		params.ID = uuid.New()
	}
	return scanAdminUser(r.db.QueryRow(ctx, `
		INSERT INTO users (id, firstname, lastname, email, password_hash, role, phone, country_code, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, '', '', true)
		RETURNING id, firstname, lastname, email, role, phone, is_active, country_code, created_at, updated_at
	`, params.ID, params.Firstname, params.Lastname, params.Email, params.PasswordHash, models.AdminUserRole))
}

func (r *pgRepository) DisableAdmin(ctx context.Context, adminUserID uuid.UUID) (AdminUserRecord, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return AdminUserRecord{}, err
	}
	defer tx.Rollback(ctx)

	record, err := scanAdminUser(tx.QueryRow(ctx, `
		UPDATE users
		SET is_active = FALSE, updated_at = NOW()
		WHERE id = $1 AND role = $2
		RETURNING id, firstname, lastname, email, role, phone, is_active, country_code, created_at, updated_at
	`, adminUserID, models.AdminUserRole))
	if err != nil || record.ID == uuid.Nil {
		return record, err
	}
	if _, err := tx.Exec(ctx, `DELETE FROM refresh_sessions WHERE user_id = $1`, adminUserID); err != nil {
		return AdminUserRecord{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return AdminUserRecord{}, err
	}
	return record, nil
}
