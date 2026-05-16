package models

import (
	"time"

	"github.com/google/uuid"
)

type ConversationRead struct {
	ConversationID uuid.UUID `json:"conversation_id"`
	UserID         uuid.UUID `json:"user_id"`
	LastReadAt     time.Time `json:"last_read_at"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
