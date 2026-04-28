package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *NannyPipe) GetPublicByID(ctx context.Context, nannyID uuid.UUID) *shared.PipeRes[PublicNannyProfile] {
	nanny, err := p.repo.GetVerifiedNannyByID(ctx, nannyID)
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
				DisplayName: nanny.DisplayName,
				Bio:         nanny.Bio,
				RatePerHour: nanny.RatePerHour,
				ServiceType: nanny.ServiceType,
				Currency:    nanny.Currency,
				RatingAvg:   nanny.RatingAvg,
				RatingCount: nanny.RatingCount,
				City:        nanny.City,
				Province:    nanny.Province,
			},
			VerificationStatus: nanny.VerificationStatus,
			VerifiedAt:         verifiedAt,
		},
	}
}
