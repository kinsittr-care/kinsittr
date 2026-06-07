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
		          stripe_account_id, stripe_onboarded, rating_avg, rating_count, COALESCE(avatar_url, ''), COALESCE(avatar_public_id, ''), city, province, created_at, updated_at
	`,
		p.ID, p.UserID, p.DisplayName, p.Bio, p.Specialties, p.RatePerHour, p.ServiceType, p.Currency, p.City, p.Province,
	).Scan(
		&created.ID, &created.UserID, &created.DisplayName, &created.Bio, &created.Specialties,
		&created.RatePerHour, &created.ServiceType, &created.Currency, &created.VerificationStatus,
		&created.VerifiedAt, &created.StripeAccountID, &created.StripeOnboarded, &created.RatingAvg, &created.RatingCount,
		&created.AvatarURL, &created.AvatarPublicID, &created.City, &created.Province, &created.CreatedAt, &created.UpdatedAt,
	)
	created.Phone = p.Phone
	return created, err
}

func (r *pgRepository) CreateParentProfile(ctx context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	var created models.ParentProfile
	err := r.db.QueryRow(ctx, `
		INSERT INTO parent_profiles (id, user_id, display_name, num_children, children_ages, city, province)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, user_id, display_name, num_children, children_ages, city, province, COALESCE(stripe_customer_id, ''), COALESCE(stripe_default_payment_method_id, ''), created_at, updated_at
	`,
		p.ID, p.UserID, p.DisplayName, p.NumChildren, p.ChildrenAges, p.City, p.Province,
	).Scan(
		&created.ID, &created.UserID, &created.DisplayName,
		&created.NumChildren, &created.ChildrenAges,
		&created.City, &created.Province, &created.StripeCustomerID, &created.StripeDefaultPaymentMethodID,
		&created.CreatedAt, &created.UpdatedAt,
	)
	created.Phone = p.Phone
	return created, err
}

func (r *pgRepository) GetNannyProfileByUserID(ctx context.Context, userID uuid.UUID) (models.NannyProfile, error) {
	var p models.NannyProfile
	err := r.db.QueryRow(ctx, `
		SELECT p.id, p.user_id, p.display_name, COALESCE(u.phone, ''), p.bio, COALESCE(p.specialties, '{}'::text[]), p.rate_per_hour, p.service_type, p.currency, p.verification_status, p.verified_at,
		       p.stripe_account_id, p.stripe_onboarded, p.rating_avg, p.rating_count, COALESCE(p.avatar_url, ''), COALESCE(p.avatar_public_id, ''), p.city, p.province, p.created_at, p.updated_at
		FROM nanny_profiles p
		JOIN users u ON u.id = p.user_id
		WHERE p.user_id = $1
	`, userID).Scan(
		&p.ID, &p.UserID, &p.DisplayName, &p.Phone, &p.Bio, &p.Specialties,
		&p.RatePerHour, &p.ServiceType, &p.Currency, &p.VerificationStatus,
		&p.VerifiedAt, &p.StripeAccountID, &p.StripeOnboarded, &p.RatingAvg, &p.RatingCount,
		&p.AvatarURL, &p.AvatarPublicID, &p.City, &p.Province, &p.CreatedAt, &p.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.NannyProfile{}, nil
	}
	return p, err
}

func (r *pgRepository) GetParentProfileByUserID(ctx context.Context, userID uuid.UUID) (models.ParentProfile, error) {
	var p models.ParentProfile
	err := r.db.QueryRow(ctx, `
		SELECT p.id, p.user_id, p.display_name, COALESCE(u.phone, ''), p.num_children, p.children_ages, p.city, p.province, COALESCE(p.stripe_customer_id, ''), COALESCE(p.stripe_default_payment_method_id, ''), p.created_at, p.updated_at
		FROM parent_profiles p
		JOIN users u ON u.id = p.user_id
		WHERE p.user_id = $1
	`, userID).Scan(
		&p.ID, &p.UserID, &p.DisplayName, &p.Phone,
		&p.NumChildren, &p.ChildrenAges,
		&p.City, &p.Province, &p.StripeCustomerID, &p.StripeDefaultPaymentMethodID,
		&p.CreatedAt, &p.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.ParentProfile{}, nil
	}
	return p, err
}

func (r *pgRepository) UpdateNannyProfile(ctx context.Context, p models.NannyProfile) (models.NannyProfile, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return models.NannyProfile{}, err
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `
		UPDATE users SET phone = $1, updated_at = NOW() WHERE id = $2
	`, p.Phone, p.UserID); err != nil {
		return models.NannyProfile{}, err
	}

	var updated models.NannyProfile
	err = tx.QueryRow(ctx, `
		UPDATE nanny_profiles
		SET bio = $1, specialties = $2, rate_per_hour = $3, city = $4, province = $5, updated_at = NOW()
		WHERE user_id = $6
		RETURNING id, user_id, display_name, bio, COALESCE(specialties, '{}'::text[]), rate_per_hour, service_type, currency, verification_status, verified_at,
		          stripe_account_id, stripe_onboarded, rating_avg, rating_count, COALESCE(avatar_url, ''), COALESCE(avatar_public_id, ''), city, province, created_at, updated_at
	`,
		p.Bio, p.Specialties, p.RatePerHour, p.City, p.Province, p.UserID,
	).Scan(
		&updated.ID, &updated.UserID, &updated.DisplayName, &updated.Bio, &updated.Specialties,
		&updated.RatePerHour, &updated.ServiceType, &updated.Currency, &updated.VerificationStatus,
		&updated.VerifiedAt, &updated.StripeAccountID, &updated.StripeOnboarded, &updated.RatingAvg, &updated.RatingCount,
		&updated.AvatarURL, &updated.AvatarPublicID, &updated.City, &updated.Province, &updated.CreatedAt, &updated.UpdatedAt,
	)
	if err != nil {
		return models.NannyProfile{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return models.NannyProfile{}, err
	}
	updated.Phone = p.Phone
	return updated, nil
}

func (r *pgRepository) UpdateNannyAvatar(ctx context.Context, userID uuid.UUID, avatarURL string, avatarPublicID string) (models.NannyProfile, error) {
	var updated models.NannyProfile
	err := r.db.QueryRow(ctx, `
		UPDATE nanny_profiles p
		SET avatar_url = $1, avatar_public_id = $2, updated_at = NOW()
		FROM users u
		WHERE p.user_id = $3 AND u.id = p.user_id
		RETURNING p.id, p.user_id, p.display_name, COALESCE(u.phone, ''), p.bio, COALESCE(p.specialties, '{}'::text[]), p.rate_per_hour, p.service_type, p.currency, p.verification_status, p.verified_at,
		          p.stripe_account_id, p.stripe_onboarded, p.rating_avg, p.rating_count, COALESCE(p.avatar_url, ''), COALESCE(p.avatar_public_id, ''), p.city, p.province, p.created_at, p.updated_at
	`, avatarURL, avatarPublicID, userID).Scan(
		&updated.ID, &updated.UserID, &updated.DisplayName, &updated.Phone, &updated.Bio, &updated.Specialties,
		&updated.RatePerHour, &updated.ServiceType, &updated.Currency, &updated.VerificationStatus,
		&updated.VerifiedAt, &updated.StripeAccountID, &updated.StripeOnboarded, &updated.RatingAvg, &updated.RatingCount,
		&updated.AvatarURL, &updated.AvatarPublicID, &updated.City, &updated.Province, &updated.CreatedAt, &updated.UpdatedAt,
	)
	return updated, err
}

func (r *pgRepository) UpdateParentProfile(ctx context.Context, p models.ParentProfile) (models.ParentProfile, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return models.ParentProfile{}, err
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `
		UPDATE users SET phone = $1, updated_at = NOW() WHERE id = $2
	`, p.Phone, p.UserID); err != nil {
		return models.ParentProfile{}, err
	}

	var updated models.ParentProfile
	err = tx.QueryRow(ctx, `
		UPDATE parent_profiles
		SET display_name = $1, num_children = $2, children_ages = $3, city = $4, province = $5, updated_at = NOW()
		WHERE user_id = $6
		RETURNING id, user_id, display_name, num_children, children_ages, city, province, COALESCE(stripe_customer_id, ''), COALESCE(stripe_default_payment_method_id, ''), created_at, updated_at
	`,
		p.DisplayName, p.NumChildren, p.ChildrenAges, p.City, p.Province, p.UserID,
	).Scan(
		&updated.ID, &updated.UserID, &updated.DisplayName,
		&updated.NumChildren, &updated.ChildrenAges,
		&updated.City, &updated.Province, &updated.StripeCustomerID, &updated.StripeDefaultPaymentMethodID,
		&updated.CreatedAt, &updated.UpdatedAt,
	)
	if err != nil {
		return models.ParentProfile{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return models.ParentProfile{}, err
	}
	updated.Phone = p.Phone
	return updated, nil
}

func scanParentSettings(row pgx.Row) (models.ParentSettings, error) {
	var settings models.ParentSettings
	err := row.Scan(
		&settings.ID,
		&settings.UserID,
		&settings.NotifyMessages,
		&settings.NotifyBookings,
		&settings.NotifyReminders,
		&settings.NotifyWeeklyDigest,
		&settings.ShowProfile,
		&settings.ShareReviews,
		&settings.Analytics,
		&settings.Language,
		&settings.Currency,
		&settings.Timezone,
		&settings.CreatedAt,
		&settings.UpdatedAt,
	)
	return settings, err
}

func (r *pgRepository) GetOrCreateParentSettings(ctx context.Context, userID uuid.UUID) (models.ParentSettings, error) {
	settings, err := scanParentSettings(r.db.QueryRow(ctx, `
		INSERT INTO parent_settings (id, user_id)
		VALUES ($1, $2)
		ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
		RETURNING id, user_id, notify_messages, notify_bookings, notify_reminders, notify_weekly_digest,
		          show_profile, share_reviews, analytics, language, currency, timezone, created_at, updated_at
	`, uuid.New(), userID))
	if errors.Is(err, pgx.ErrNoRows) {
		return models.ParentSettings{}, nil
	}
	return settings, err
}

func (r *pgRepository) UpdateParentSettings(ctx context.Context, settings models.ParentSettings) (models.ParentSettings, error) {
	updated, err := scanParentSettings(r.db.QueryRow(ctx, `
		UPDATE parent_settings
		SET notify_messages = $1,
		    notify_bookings = $2,
		    notify_reminders = $3,
		    notify_weekly_digest = $4,
		    show_profile = $5,
		    share_reviews = $6,
		    analytics = $7,
		    language = $8,
		    currency = $9,
		    timezone = $10,
		    updated_at = NOW()
		WHERE user_id = $11
		RETURNING id, user_id, notify_messages, notify_bookings, notify_reminders, notify_weekly_digest,
		          show_profile, share_reviews, analytics, language, currency, timezone, created_at, updated_at
	`,
		settings.NotifyMessages,
		settings.NotifyBookings,
		settings.NotifyReminders,
		settings.NotifyWeeklyDigest,
		settings.ShowProfile,
		settings.ShareReviews,
		settings.Analytics,
		settings.Language,
		settings.Currency,
		settings.Timezone,
		settings.UserID,
	))
	if errors.Is(err, pgx.ErrNoRows) {
		return models.ParentSettings{}, nil
	}
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
