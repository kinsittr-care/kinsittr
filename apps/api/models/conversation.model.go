package models

import (
	"time"

	"github.com/google/uuid"
)

type Conversation struct {
	ID              uuid.UUID `json:"id"`
	BookingID       uuid.UUID `json:"booking_id"`
	ParentProfileID uuid.UUID `json:"parent_profile_id"`
	NannyProfileID  uuid.UUID `json:"nanny_profile_id"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}
