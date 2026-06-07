package documents

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinsittr/kinsittr-api/models"
)

type Repository interface {
	CreateNannyDocument(ctx context.Context, document models.NannyDocument) (models.NannyDocument, error)
	ListNannyDocuments(ctx context.Context, nannyProfileID uuid.UUID) ([]models.NannyDocument, error)
	GetNannyDocument(ctx context.Context, documentID uuid.UUID, nannyProfileID uuid.UUID) (models.NannyDocument, error)
	DeleteNannyDocument(ctx context.Context, documentID uuid.UUID, nannyProfileID uuid.UUID) error
}

var DocumentsRepo Repository

func InitDocumentsRepo(db *pgxpool.Pool) {
	DocumentsRepo = newPgRepository(db)
}
