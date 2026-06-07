package models

import (
	"time"

	"github.com/google/uuid"
)

type NannyDocument struct {
	ID             uuid.UUID `json:"id"`
	NannyProfileID uuid.UUID `json:"nanny_profile_id"`
	FileName       string    `json:"file_name"`
	FileURL        string    `json:"file_url"`
	PublicID       string    `json:"public_id"`
	ResourceType   string    `json:"resource_type"`
	MimeType       string    `json:"mime_type"`
	SizeBytes      int64     `json:"size_bytes"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
