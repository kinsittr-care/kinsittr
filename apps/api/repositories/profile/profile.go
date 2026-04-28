package profile

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinsittr/kinsittr-api/models"
)

type ProfileRepository interface {
	CreateNannyProfile(ctx context.Context, profile models.NannyProfile) (models.NannyProfile, error)
	CreateParentProfile(ctx context.Context, profile models.ParentProfile) (models.ParentProfile, error)
	GetNannyProfileByUserID(ctx context.Context, userID uuid.UUID) (models.NannyProfile, error)
	GetParentProfileByUserID(ctx context.Context, userID uuid.UUID) (models.ParentProfile, error)
	UpdateNannyProfile(ctx context.Context, profile models.NannyProfile) (models.NannyProfile, error)
	UpdateParentProfile(ctx context.Context, profile models.ParentProfile) (models.ParentProfile, error)
	DeleteNannyProfile(ctx context.Context, userID uuid.UUID) error
	DeleteParentProfile(ctx context.Context, userID uuid.UUID) error
}

var ProfileRepo ProfileRepository

func InitProfileRepo(db *pgxpool.Pool) {
	ProfileRepo = newPgRepository(db)
}
