package nanny

import (
	"context"
	"errors"

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

func (r *pgRepository) ListVerifiedNannies(ctx context.Context, page, limit int) ([]models.NannyProfile, int, error) {
	offset := (page - 1) * limit

	var total int
	if err := r.db.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM nanny_profiles
		WHERE verification_status = $1
	`, models.VerifiedVerificationStatus).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.Query(ctx, `
		SELECT id, user_id, display_name, bio, rate_per_hour, service_type, currency, verification_status, verified_at,
		       stripe_account_id, stripe_onboarded, rating_avg, rating_count, city, province, created_at, updated_at
		FROM nanny_profiles
		WHERE verification_status = $1
		ORDER BY verified_at DESC NULLS LAST, created_at DESC
		LIMIT $2 OFFSET $3
	`, models.VerifiedVerificationStatus, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	nannies := make([]models.NannyProfile, 0, limit)
	for rows.Next() {
		var nanny models.NannyProfile
		if err := rows.Scan(
			&nanny.ID,
			&nanny.UserID,
			&nanny.DisplayName,
			&nanny.Bio,
			&nanny.RatePerHour,
			&nanny.ServiceType,
			&nanny.Currency,
			&nanny.VerificationStatus,
			&nanny.VerifiedAt,
			&nanny.StripeAccountID,
			&nanny.StripeOnboarded,
			&nanny.RatingAvg,
			&nanny.RatingCount,
			&nanny.City,
			&nanny.Province,
			&nanny.CreatedAt,
			&nanny.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		nannies = append(nannies, nanny)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return nannies, total, nil
}

func (r *pgRepository) GetVerifiedNannyByID(ctx context.Context, nannyID uuid.UUID) (models.NannyProfile, error) {
	var nanny models.NannyProfile
	err := r.db.QueryRow(ctx, `
		SELECT id, user_id, display_name, bio, rate_per_hour, service_type, currency, verification_status, verified_at,
		       stripe_account_id, stripe_onboarded, rating_avg, rating_count, city, province, created_at, updated_at
		FROM nanny_profiles
		WHERE id = $1 AND verification_status = $2
	`, nannyID, models.VerifiedVerificationStatus).Scan(
		&nanny.ID,
		&nanny.UserID,
		&nanny.DisplayName,
		&nanny.Bio,
		&nanny.RatePerHour,
		&nanny.ServiceType,
		&nanny.Currency,
		&nanny.VerificationStatus,
		&nanny.VerifiedAt,
		&nanny.StripeAccountID,
		&nanny.StripeOnboarded,
		&nanny.RatingAvg,
		&nanny.RatingCount,
		&nanny.City,
		&nanny.Province,
		&nanny.CreatedAt,
		&nanny.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.NannyProfile{}, nil
	}
	return nanny, err
}
