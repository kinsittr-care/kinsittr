package profile

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

func (r *pgRepository) CreateNannyProfile(ctx context.Context, p models.NannyProfile) (models.NannyProfile, error) {
	var created models.NannyProfile
	err := r.db.QueryRow(ctx, `
		INSERT INTO nanny_profiles (id, user_id, display_name, bio, specialties, rate_per_hour, service_type, currency, city, province, verification_status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
		RETURNING id, user_id, display_name, bio, COALESCE(specialties, '{}'::text[]), rate_per_hour, service_type, currency, verification_status, verified_at,
		          stripe_account_id, stripe_onboarded, rating_avg, rating_count, city, province, created_at, updated_at
	`,
		p.ID, p.UserID, p.DisplayName, p.Bio, p.Specialties, p.RatePerHour, p.ServiceType, p.Currency, p.City, p.Province,
	).Scan(
		&created.ID, &created.UserID, &created.DisplayName, &created.Bio, &created.Specialties,
		&created.RatePerHour, &created.ServiceType, &created.Currency, &created.VerificationStatus,
		&created.VerifiedAt, &created.StripeAccountID, &created.StripeOnboarded, &created.RatingAvg, &created.RatingCount,
		&created.City, &created.Province, &created.CreatedAt, &created.UpdatedAt,
	)
	return created, err
}

func (r *pgRepository) CreateParentProfile(ctx context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	var created models.ParentProfile
	err := r.db.QueryRow(ctx, `
		INSERT INTO parent_profiles (id, user_id, display_name, num_children, children_ages, city, province)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, user_id, display_name, num_children, children_ages, city, province, created_at, updated_at
	`,
		p.ID, p.UserID, p.DisplayName, p.NumChildren, p.ChildrenAges, p.City, p.Province,
	).Scan(
		&created.ID, &created.UserID, &created.DisplayName,
		&created.NumChildren, &created.ChildrenAges,
		&created.City, &created.Province,
		&created.CreatedAt, &created.UpdatedAt,
	)
	return created, err
}

func (r *pgRepository) GetNannyProfileByUserID(ctx context.Context, userID uuid.UUID) (models.NannyProfile, error) {
	var p models.NannyProfile
	err := r.db.QueryRow(ctx, `
		SELECT id, user_id, display_name, bio, COALESCE(specialties, '{}'::text[]), rate_per_hour, service_type, currency, verification_status, verified_at,
		       stripe_account_id, stripe_onboarded, rating_avg, rating_count, city, province, created_at, updated_at
		FROM nanny_profiles WHERE user_id = $1
	`, userID).Scan(
		&p.ID, &p.UserID, &p.DisplayName, &p.Bio, &p.Specialties,
		&p.RatePerHour, &p.ServiceType, &p.Currency, &p.VerificationStatus,
		&p.VerifiedAt, &p.StripeAccountID, &p.StripeOnboarded, &p.RatingAvg, &p.RatingCount,
		&p.City, &p.Province, &p.CreatedAt, &p.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.NannyProfile{}, nil
	}
	return p, err
}

func (r *pgRepository) GetParentProfileByUserID(ctx context.Context, userID uuid.UUID) (models.ParentProfile, error) {
	var p models.ParentProfile
	err := r.db.QueryRow(ctx, `
		SELECT id, user_id, display_name, num_children, children_ages, city, province, created_at, updated_at
		FROM parent_profiles WHERE user_id = $1
	`, userID).Scan(
		&p.ID, &p.UserID, &p.DisplayName,
		&p.NumChildren, &p.ChildrenAges,
		&p.City, &p.Province,
		&p.CreatedAt, &p.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.ParentProfile{}, nil
	}
	return p, err
}

func (r *pgRepository) UpdateNannyProfile(ctx context.Context, p models.NannyProfile) (models.NannyProfile, error) {
	var updated models.NannyProfile
	err := r.db.QueryRow(ctx, `
		UPDATE nanny_profiles
		SET display_name = $1, bio = $2, specialties = $3, rate_per_hour = $4, city = $5, province = $6, updated_at = NOW()
		WHERE user_id = $7
		RETURNING id, user_id, display_name, bio, COALESCE(specialties, '{}'::text[]), rate_per_hour, service_type, currency, verification_status, verified_at,
		          stripe_account_id, stripe_onboarded, rating_avg, rating_count, city, province, created_at, updated_at
	`,
		p.DisplayName, p.Bio, p.Specialties, p.RatePerHour, p.City, p.Province, p.UserID,
	).Scan(
		&updated.ID, &updated.UserID, &updated.DisplayName, &updated.Bio, &updated.Specialties,
		&updated.RatePerHour, &updated.ServiceType, &updated.Currency, &updated.VerificationStatus,
		&updated.VerifiedAt, &updated.StripeAccountID, &updated.StripeOnboarded, &updated.RatingAvg, &updated.RatingCount,
		&updated.City, &updated.Province, &updated.CreatedAt, &updated.UpdatedAt,
	)
	return updated, err
}

func (r *pgRepository) UpdateParentProfile(ctx context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	var updated models.ParentProfile
	err := r.db.QueryRow(ctx, `
		UPDATE parent_profiles
		SET display_name = $1, num_children = $2, children_ages = $3, city = $4, province = $5, updated_at = NOW()
		WHERE user_id = $6
		RETURNING id, user_id, display_name, num_children, children_ages, city, province, created_at, updated_at
	`,
		p.DisplayName, p.NumChildren, p.ChildrenAges, p.City, p.Province, p.UserID,
	).Scan(
		&updated.ID, &updated.UserID, &updated.DisplayName,
		&updated.NumChildren, &updated.ChildrenAges,
		&updated.City, &updated.Province,
		&updated.CreatedAt, &updated.UpdatedAt,
	)
	return updated, err
}

func (r *pgRepository) DeleteNannyProfile(ctx context.Context, userID uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM nanny_profiles WHERE user_id = $1`, userID)
	return err
}

func (r *pgRepository) DeleteParentProfile(ctx context.Context, userID uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM parent_profiles WHERE user_id = $1`, userID)
	return err
}
