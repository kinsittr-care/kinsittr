package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *NannyPipe) GetOwnProfile(ctx context.Context, userID uuid.UUID) *shared.PipeRes[models.NannyProfile] {
	profile, err := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
	if err != nil || profile.ID == uuid.Nil {
		return &shared.PipeRes[models.NannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Nanny_Not_Found),
		}
	}

	return &shared.PipeRes[models.NannyProfile]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Nanny_Profile_Fetched),
		Data:    &profile,
	}
}
