package documents

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

func (r *pgRepository) CreateNannyDocument(ctx context.Context, d models.NannyDocument) (models.NannyDocument, error) {
	var created models.NannyDocument
	err := r.db.QueryRow(ctx, `
		INSERT INTO nanny_documents (id, nanny_profile_id, file_name, file_url, public_id, resource_type, mime_type, size_bytes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, nanny_profile_id, file_name, file_url, public_id, resource_type, mime_type, size_bytes, created_at, updated_at
	`, d.ID, d.NannyProfileID, d.FileName, d.FileURL, d.PublicID, d.ResourceType, d.MimeType, d.SizeBytes).Scan(
		&created.ID, &created.NannyProfileID, &created.FileName, &created.FileURL, &created.PublicID,
		&created.ResourceType, &created.MimeType, &created.SizeBytes, &created.CreatedAt, &created.UpdatedAt,
	)
	return created, err
}

func (r *pgRepository) ListNannyDocuments(ctx context.Context, nannyProfileID uuid.UUID) ([]models.NannyDocument, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, nanny_profile_id, file_name, file_url, public_id, resource_type, mime_type, size_bytes, created_at, updated_at
		FROM nanny_documents
		WHERE nanny_profile_id = $1
		ORDER BY created_at DESC
	`, nannyProfileID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	documents := make([]models.NannyDocument, 0)
	for rows.Next() {
		var d models.NannyDocument
		if err := rows.Scan(
			&d.ID, &d.NannyProfileID, &d.FileName, &d.FileURL, &d.PublicID,
			&d.ResourceType, &d.MimeType, &d.SizeBytes, &d.CreatedAt, &d.UpdatedAt,
		); err != nil {
			return nil, err
		}
		documents = append(documents, d)
	}
	return documents, rows.Err()
}

func (r *pgRepository) GetNannyDocument(ctx context.Context, documentID uuid.UUID, nannyProfileID uuid.UUID) (models.NannyDocument, error) {
	var d models.NannyDocument
	err := r.db.QueryRow(ctx, `
		SELECT id, nanny_profile_id, file_name, file_url, public_id, resource_type, mime_type, size_bytes, created_at, updated_at
		FROM nanny_documents
		WHERE id = $1 AND nanny_profile_id = $2
	`, documentID, nannyProfileID).Scan(
		&d.ID, &d.NannyProfileID, &d.FileName, &d.FileURL, &d.PublicID,
		&d.ResourceType, &d.MimeType, &d.SizeBytes, &d.CreatedAt, &d.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.NannyDocument{}, nil
	}
	return d, err
}

func (r *pgRepository) DeleteNannyDocument(ctx context.Context, documentID uuid.UUID, nannyProfileID uuid.UUID) error {
	tag, err := r.db.Exec(ctx, `
		DELETE FROM nanny_documents
		WHERE id = $1 AND nanny_profile_id = $2
	`, documentID, nannyProfileID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}
