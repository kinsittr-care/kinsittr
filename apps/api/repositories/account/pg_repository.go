package account

import (
	"context"
	"errors"
	"time"

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

func (r *pgRepository) UserExistsByEmail(ctx context.Context, email string) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`, email,
	).Scan(&exists)
	return exists, err
}

func (r *pgRepository) CreateUser(ctx context.Context, u models.User) (models.User, error) {
	var created models.User
	err := r.db.QueryRow(ctx, `
		INSERT INTO users (id, firstname, lastname, email, password_hash, role, phone, country_code, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
		RETURNING id, firstname, lastname, email, role, phone, is_active, country_code, created_at, updated_at
	`,
		u.ID, u.Firstname, u.Lastname, u.Email, u.Password,
		u.Role, u.Phone, u.CountryCode,
	).Scan(
		&created.ID, &created.Firstname, &created.Lastname, &created.Email,
		&created.Role, &created.Phone, &created.IsActive, &created.CountryCode,
		&created.CreatedAt, &created.UpdatedAt,
	)
	return created, err
}

func (r *pgRepository) GetUserByEmail(ctx context.Context, email string) (models.User, error) {
	var u models.User
	err := r.db.QueryRow(ctx, `
		SELECT id, firstname, lastname, email, password_hash, role, phone, is_active, country_code, created_at, updated_at
		FROM users WHERE email = $1
	`, email).Scan(
		&u.ID, &u.Firstname, &u.Lastname, &u.Email,
		&u.Password, &u.Role, &u.Phone, &u.IsActive,
		&u.CountryCode, &u.CreatedAt, &u.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.User{}, nil
	}
	return u, err
}

func (r *pgRepository) GetUserByID(ctx context.Context, userID uuid.UUID) (models.User, error) {
	var u models.User
	err := r.db.QueryRow(ctx, `
		SELECT id, firstname, lastname, email, password_hash, role, phone, is_active, country_code, created_at, updated_at
		FROM users WHERE id = $1
	`, userID).Scan(
		&u.ID, &u.Firstname, &u.Lastname, &u.Email,
		&u.Password, &u.Role, &u.Phone, &u.IsActive,
		&u.CountryCode, &u.CreatedAt, &u.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.User{}, nil
	}
	return u, err
}

func (r *pgRepository) CreateParentAccount(ctx context.Context, user models.User, profile models.ParentProfile) (models.User, error) {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return models.User{}, err
	}
	defer tx.Rollback(ctx)

	var created models.User
	err = tx.QueryRow(ctx, `
		INSERT INTO users (id, firstname, lastname, email, password_hash, role, phone, country_code, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
		RETURNING id, firstname, lastname, email, role, phone, is_active, country_code, created_at, updated_at
	`,
		user.ID, user.Firstname, user.Lastname, user.Email, user.Password,
		user.Role, user.Phone, user.CountryCode,
	).Scan(
		&created.ID, &created.Firstname, &created.Lastname, &created.Email,
		&created.Role, &created.Phone, &created.IsActive, &created.CountryCode,
		&created.CreatedAt, &created.UpdatedAt,
	)
	if err != nil {
		return models.User{}, err
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO parent_profiles (id, user_id, display_name, num_children, children_ages, city, province)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`,
		profile.ID, created.ID, profile.DisplayName, profile.NumChildren, profile.ChildrenAges, profile.City, profile.Province,
	)
	if err != nil {
		return models.User{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return models.User{}, err
	}
	return created, nil
}

func (r *pgRepository) CreateNannyAccount(ctx context.Context, user models.User, profile models.NannyProfile) (models.User, error) {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return models.User{}, err
	}
	defer tx.Rollback(ctx)

	var created models.User
	err = tx.QueryRow(ctx, `
		INSERT INTO users (id, firstname, lastname, email, password_hash, role, phone, country_code, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
		RETURNING id, firstname, lastname, email, role, phone, is_active, country_code, created_at, updated_at
	`,
		user.ID, user.Firstname, user.Lastname, user.Email, user.Password,
		user.Role, user.Phone, user.CountryCode,
	).Scan(
		&created.ID, &created.Firstname, &created.Lastname, &created.Email,
		&created.Role, &created.Phone, &created.IsActive, &created.CountryCode,
		&created.CreatedAt, &created.UpdatedAt,
	)
	if err != nil {
		return models.User{}, err
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO nanny_profiles (id, user_id, display_name, bio, rate_per_hour, service_type, currency, city, province, verification_status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
	`,
		profile.ID, created.ID, profile.DisplayName, profile.Bio, profile.RatePerHour, profile.ServiceType, profile.Currency, profile.City, profile.Province,
	)
	if err != nil {
		return models.User{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return models.User{}, err
	}
	return created, nil
}

func (r *pgRepository) UpdateUserPassword(ctx context.Context, userID uuid.UUID, passwordHash string) error {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	tag, err := tx.Exec(ctx, `
		UPDATE users
		SET password_hash = $1, updated_at = NOW()
		WHERE id = $2 AND is_active = TRUE
	`, passwordHash, userID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}

	if _, err := tx.Exec(ctx, `DELETE FROM refresh_sessions WHERE user_id = $1`, userID); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *pgRepository) DeactivateUser(ctx context.Context, userID uuid.UUID) error {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	tag, err := tx.Exec(ctx, `
		UPDATE users
		SET is_active = FALSE, updated_at = NOW()
		WHERE id = $1 AND is_active = TRUE
	`, userID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}

	if _, err := tx.Exec(ctx, `DELETE FROM refresh_sessions WHERE user_id = $1`, userID); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *pgRepository) CreateRefreshSession(ctx context.Context, session models.RefreshSession) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO refresh_sessions (id, user_id, expires_at)
		VALUES ($1, $2, $3)
	`, session.ID, session.UserID, session.ExpiresAt)
	return err
}

func (r *pgRepository) GetRefreshSessionByID(ctx context.Context, sessionID uuid.UUID) (models.RefreshSession, error) {
	var session models.RefreshSession
	err := r.db.QueryRow(ctx, `
		SELECT id, user_id, expires_at, created_at
		FROM refresh_sessions
		WHERE id = $1
	`, sessionID).Scan(
		&session.ID, &session.UserID, &session.ExpiresAt, &session.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.RefreshSession{}, nil
	}
	return session, err
}

func (r *pgRepository) RotateRefreshSession(ctx context.Context, oldSessionID uuid.UUID, newSession models.RefreshSession) error {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `DELETE FROM refresh_sessions WHERE id = $1`, oldSessionID); err != nil {
		return err
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO refresh_sessions (id, user_id, expires_at)
		VALUES ($1, $2, $3)
	`, newSession.ID, newSession.UserID, newSession.ExpiresAt); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *pgRepository) DeleteRefreshSession(ctx context.Context, sessionID uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM refresh_sessions WHERE id = $1`, sessionID)
	return err
}

func (r *pgRepository) DeleteRefreshSessionsByUserID(ctx context.Context, userID uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM refresh_sessions WHERE user_id = $1`, userID)
	return err
}

var _ = time.Now
