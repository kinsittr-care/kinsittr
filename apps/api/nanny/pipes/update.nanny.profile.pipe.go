package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/nanny/dtos"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *NannyPipe) UpdateOwnProfile(ctx context.Context, userID uuid.UUID, dto dtos.UpdateNannyProfileDTO) *shared.PipeRes[models.NannyProfile] {
	profile, err := p.profileRepo.UpdateNannyProfile(ctx, models.NannyProfile{
		UserID:      userID,
		DisplayName: dto.DisplayName,
		Bio:         dto.Bio,
		RatePerHour: dto.RatePerHour,
		City:        dto.City,
		Province:    dto.Province,
	})
	if err != nil || profile.ID == uuid.Nil {
		return &shared.PipeRes[models.NannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Nanny_Not_Found),
		}
	}

	return &shared.PipeRes[models.NannyProfile]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Nanny_Profile_Updated),
		Data:    &profile,
	}
}
