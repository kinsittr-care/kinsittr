package nanny

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinsittr/kinsittr-api/models"
)

type NannyRepository interface {
	ListVerifiedNannies(ctx context.Context, page, limit int) ([]models.NannyProfile, int, error)
	GetVerifiedNannyByID(ctx context.Context, nannyID uuid.UUID) (models.NannyProfile, error)
}

var NannyRepo NannyRepository

func InitNannyRepo(db *pgxpool.Pool) {
	NannyRepo = newPgRepository(db)
}
