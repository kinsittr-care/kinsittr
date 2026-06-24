package models

import (
	"time"

	"github.com/google/uuid"
)

type Currency string

const (
	CAD Currency = "CAD"
	// NGN Currency = "NGN"
)

type VerificationStatus string

const (
	PendingVerificationStatus     VerificationStatus = "pending"
	UnderReviewVerificationStatus VerificationStatus = "under_review"
	VerifiedVerificationStatus    VerificationStatus = "verified"
	RejectedVerificationStatus    VerificationStatus = "rejected"
)

type NannyProfile struct {
	ID                 uuid.UUID          `json:"id"`
	PublicSlug         string             `json:"public_slug"`
	UserID             uuid.UUID          `json:"user_id"`
	DisplayName        string             `json:"display_name"`
	Phone              string             `json:"phone"`
	Bio                string             `json:"bio"`
	Specialties        []string           `json:"specialties"`
	RatePerHour        float64            `json:"rate_per_hour"`
	ServiceType        ServiceType        `json:"service_type"`
	Currency           Currency           `json:"currency"`
	VerificationStatus VerificationStatus `json:"verification_status"`
	VerifiedAt         *time.Time         `json:"verified_at,omitempty"`
	StripeAccountID    *string            `json:"stripe_account_id,omitempty"`
	StripeOnboarded    bool               `json:"stripe_onboarded"`
	RatingAvg          float64            `json:"rating_avg"`
	RatingCount        int                `json:"rating_count"`
	AvatarURL          string             `json:"avatar_url"`
	AvatarPublicID     string             `json:"avatar_public_id"`
	City               string             `json:"city"`
	Province           string             `json:"province"`
	CreatedAt          time.Time          `json:"created_at"`
	UpdatedAt          time.Time          `json:"updated_at"`
}
