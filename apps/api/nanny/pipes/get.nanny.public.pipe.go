package pipes

import (
	"context"
	"slices"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *NannyPipe) GetPublicByID(ctx context.Context, nannyID uuid.UUID) *shared.PipeRes[PublicNannyProfile] {
	nanny, err := p.repo.GetVerifiedNannyByID(ctx, nannyID)
	return p.publicProfileResponse(nanny, err)
}

func (p *NannyPipe) GetPublicBySlug(ctx context.Context, slug string) *shared.PipeRes[PublicNannyProfile] {
	nanny, err := p.repo.GetVerifiedNannyByPublicSlug(ctx, slug)
	return p.publicProfileResponse(nanny, err)
}

func (p *NannyPipe) publicProfileResponse(nanny models.NannyProfile, err error) *shared.PipeRes[PublicNannyProfile] {
	if err != nil || nanny.ID == uuid.Nil {
		return &shared.PipeRes[PublicNannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Nanny_Not_Found),
		}
	}

	verifiedAt := ""
	if nanny.VerifiedAt != nil && !nanny.VerifiedAt.IsZero() {
		verifiedAt = nanny.VerifiedAt.Format("2006-01-02T15:04:05Z07:00")
	}

	return &shared.PipeRes[PublicNannyProfile]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Nanny_Profile_Fetched),
		Data: &PublicNannyProfile{
			PublicNannyCard: PublicNannyCard{
				ID:          nanny.ID.String(),
				PublicSlug:  nanny.PublicSlug,
				DisplayName: nanny.DisplayName,
				Bio:         nanny.Bio,
				Specialties: slices.Clone(nanny.Specialties),
				RatePerHour: nanny.RatePerHour,
				ServiceType: nanny.ServiceType,
				Currency:    nanny.Currency,
				RatingAvg:   nanny.RatingAvg,
				RatingCount: nanny.RatingCount,
				AvatarURL:   nanny.AvatarURL,
				City:        nanny.City,
				Province:    nanny.Province,
			},
			VerificationStatus: nanny.VerificationStatus,
			VerifiedAt:         verifiedAt,
		},
	}
}
