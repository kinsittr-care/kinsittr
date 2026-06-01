package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *NannyPipe) DeleteAvatar(ctx context.Context, userID uuid.UUID) *shared.PipeRes[models.NannyProfile] {
	if p.cloudinary == nil || !p.cloudinary.Configured() {
		return &shared.PipeRes[models.NannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Cloudinary_Not_Configured),
		}
	}

	profile, err := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
	if err != nil || profile.ID == uuid.Nil {
		return &shared.PipeRes[models.NannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Nanny_Not_Found),
		}
	}

	if profile.AvatarPublicID != "" {
		if err := p.cloudinary.DeleteImage(ctx, profile.AvatarPublicID); err != nil {
			return &shared.PipeRes[models.NannyProfile]{
				Success: false,
				Message: shared.CreatePipeMessage(messages.Avatar_Delete_Failed),
			}
		}
	}

	updated, err := p.profileRepo.UpdateNannyAvatar(ctx, userID, "", "")
	if err != nil || updated.ID == uuid.Nil {
		return &shared.PipeRes[models.NannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Avatar_Delete_Failed),
		}
	}

	return &shared.PipeRes[models.NannyProfile]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Avatar_Deleted),
		Data:    &updated,
	}
}
