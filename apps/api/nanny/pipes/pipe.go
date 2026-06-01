package pipes

import (
	"context"

	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/repositories/nanny"
	"github.com/kinsittr/kinsittr-api/repositories/profile"
	cloudinaryapi "github.com/kinsittr/kinsittr-api/shared/cloudinary"
)

type cloudinaryClient interface {
	Configured() bool
	UploadImage(ctx context.Context, data []byte, folder, publicID string) (cloudinaryapi.UploadResult, error)
	DeleteImage(ctx context.Context, publicID string) error
}

type PublicNannyCard struct {
	ID          string             `json:"id"`
	DisplayName string             `json:"display_name"`
	Bio         string             `json:"bio"`
	Specialties []string           `json:"specialties"`
	RatePerHour float64            `json:"rate_per_hour"`
	ServiceType models.ServiceType `json:"service_type"`
	Currency    models.Currency    `json:"currency"`
	RatingAvg   float64            `json:"rating_avg"`
	RatingCount int                `json:"rating_count"`
	AvatarURL   string             `json:"avatar_url"`
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
	cloudinary  cloudinaryClient
}

func NewNannyPipe(repo nanny.NannyRepository, profileRepo profile.ProfileRepository) *NannyPipe {
	return &NannyPipe{
		repo:        repo,
		profileRepo: profileRepo,
	}
}

func (p *NannyPipe) SetCloudinaryClient(c cloudinaryClient) {
	p.cloudinary = c
}
