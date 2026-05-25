package models

import (
	"time"

	"github.com/google/uuid"
)

type StripeWebhookEvent struct {
	ID            uuid.UUID `json:"id"`
	StripeEventID string    `json:"stripe_event_id"`
	EventType     string    `json:"event_type"`
	ProcessedAt   time.Time `json:"processed_at"`
	CreatedAt     time.Time `json:"created_at"`
}
