package models

import (
	"time"

	"github.com/google/uuid"
)

type ParentProfile struct {
	ID               uuid.UUID `json:"id"`
	UserID           uuid.UUID `json:"user_id"`
	DisplayName      string    `json:"display_name"`
	NumChildren      int       `json:"num_children"`
	ChildrenAges     []int     `json:"children_ages"`
	City             string    `json:"city"`
	Province         string    `json:"province"`
	StripeCustomerID string    `json:"stripe_customer_id"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}
