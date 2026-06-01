package nanny

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

type ListVerifiedNanniesFilter struct {
	Page        int
	Limit       int
	City        string
	Province    string
	Specialties []string
	MinRate     float64
	MaxRate     float64
	ServiceType models.ServiceType
	Sort        string
}

func (r *pgRepository) ListVerifiedNannies(ctx context.Context, filter ListVerifiedNanniesFilter) ([]models.NannyProfile, int, error) {
	offset := (filter.Page - 1) * filter.Limit
	whereClause, whereArgs := buildVerifiedNanniesWhere(filter)

	var total int
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM nanny_profiles
		WHERE %s
	`, whereClause)
	if err := r.db.QueryRow(ctx, countQuery, whereArgs...).Scan(&total); err != nil {
		return nil, 0, err
	}

	orderBy := buildVerifiedNanniesOrder(filter.NormalizedSort())
	listArgs := append(append([]any{}, whereArgs...), filter.Limit, offset)
	query := fmt.Sprintf(`
		SELECT id, user_id, display_name, bio, COALESCE(specialties, '{}'::text[]),
		       rate_per_hour, service_type, currency, verification_status, verified_at,
		       stripe_account_id, stripe_onboarded, rating_avg, rating_count, COALESCE(avatar_url, ''), city, province, created_at, updated_at
		FROM nanny_profiles
		WHERE %s
		ORDER BY %s
		LIMIT $%d OFFSET $%d
	`, whereClause, orderBy, len(whereArgs)+1, len(whereArgs)+2)
	rows, err := r.db.Query(ctx, query, listArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	nannies := make([]models.NannyProfile, 0, filter.Limit)
	for rows.Next() {
		var nanny models.NannyProfile
		if err := rows.Scan(
			&nanny.ID,
			&nanny.UserID,
			&nanny.DisplayName,
			&nanny.Bio,
			&nanny.Specialties,
			&nanny.RatePerHour,
			&nanny.ServiceType,
			&nanny.Currency,
			&nanny.VerificationStatus,
			&nanny.VerifiedAt,
			&nanny.StripeAccountID,
			&nanny.StripeOnboarded,
			&nanny.RatingAvg,
			&nanny.RatingCount,
			&nanny.AvatarURL,
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
		SELECT id, user_id, display_name, bio, COALESCE(specialties, '{}'::text[]),
		       rate_per_hour, service_type, currency, verification_status, verified_at,
		       stripe_account_id, stripe_onboarded, rating_avg, rating_count, COALESCE(avatar_url, ''), city, province, created_at, updated_at
		FROM nanny_profiles
		WHERE id = $1 AND verification_status = $2
	`, nannyID, models.VerifiedVerificationStatus).Scan(
		&nanny.ID,
		&nanny.UserID,
		&nanny.DisplayName,
		&nanny.Bio,
		&nanny.Specialties,
		&nanny.RatePerHour,
		&nanny.ServiceType,
		&nanny.Currency,
		&nanny.VerificationStatus,
		&nanny.VerifiedAt,
		&nanny.StripeAccountID,
		&nanny.StripeOnboarded,
		&nanny.RatingAvg,
		&nanny.RatingCount,
		&nanny.AvatarURL,
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

func (f ListVerifiedNanniesFilter) NormalizedSort() string {
	sort := strings.TrimSpace(strings.ToLower(f.Sort))
	if sort == "" {
		return "newest"
	}
	return sort
}

func buildVerifiedNanniesWhere(filter ListVerifiedNanniesFilter) (string, []any) {
	clauses := []string{"verification_status = $1"}
	args := []any{models.VerifiedVerificationStatus}

	if filter.City != "" {
		args = append(args, strings.TrimSpace(filter.City))
		clauses = append(clauses, fmt.Sprintf("LOWER(city) = LOWER($%d)", len(args)))
	}
	if filter.Province != "" {
		args = append(args, strings.TrimSpace(filter.Province))
		clauses = append(clauses, fmt.Sprintf("LOWER(province) = LOWER($%d)", len(args)))
	}
	if len(filter.Specialties) > 0 {
		args = append(args, filter.Specialties)
		clauses = append(clauses, fmt.Sprintf("COALESCE(specialties, '{}'::text[]) && $%d::text[]", len(args)))
	}
	if filter.MinRate > 0 {
		args = append(args, filter.MinRate)
		clauses = append(clauses, fmt.Sprintf("rate_per_hour >= $%d", len(args)))
	}
	if filter.MaxRate > 0 {
		args = append(args, filter.MaxRate)
		clauses = append(clauses, fmt.Sprintf("rate_per_hour <= $%d", len(args)))
	}
	if filter.ServiceType != "" {
		args = append(args, filter.ServiceType)
		clauses = append(clauses, fmt.Sprintf("service_type = $%d", len(args)))
	}

	return strings.Join(clauses, " AND "), args
}

func buildVerifiedNanniesOrder(sort string) string {
	switch sort {
	case "oldest":
		return "created_at ASC"
	case "rate_asc":
		return "rate_per_hour ASC, created_at DESC"
	case "rate_desc":
		return "rate_per_hour DESC, created_at DESC"
	case "rating_desc":
		return "rating_avg DESC, rating_count DESC, created_at DESC"
	default:
		return "verified_at DESC NULLS LAST, created_at DESC"
	}
}
