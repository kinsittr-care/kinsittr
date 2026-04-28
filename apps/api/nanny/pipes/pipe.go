package pipes

import (
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/repositories/nanny"
	"github.com/kinsittr/kinsittr-api/repositories/profile"
)

type PublicNannyCard struct {
	ID          string             `json:"id"`
	DisplayName string             `json:"display_name"`
	Bio         string             `json:"bio"`
	RatePerHour float64            `json:"rate_per_hour"`
	ServiceType models.ServiceType `json:"service_type"`
	Currency    models.Currency    `json:"currency"`
	RatingAvg   float64            `json:"rating_avg"`
	RatingCount int                `json:"rating_count"`
	City        string             `json:"city"`
	Province    string             `json:"province"`
}

type PublicNannyProfile struct {
	PublicNannyCard
	VerificationStatus models.VerificationStatus `json:"verification_status"`
	VerifiedAt         string                    `json:"verified_at,omitempty"`
}

type PublicNannyListData struct {
	Items []PublicNannyCard `json:"items"`
	Page  int               `json:"page"`
	Limit int               `json:"limit"`
	Total int               `json:"total"`
}

type NannyPipe struct {
	repo        nanny.NannyRepository
	profileRepo profile.ProfileRepository
}

func NewNannyPipe(repo nanny.NannyRepository, profileRepo profile.ProfileRepository) *NannyPipe {
	return &NannyPipe{
		repo:        repo,
		profileRepo: profileRepo,
	}
}
