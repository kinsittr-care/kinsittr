package pipes

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

const (
	maxAvatarBytes     = 5 * 1024 * 1024 // 5 MB
	avatarFolder       = "nanny-avatars"
)

func (p *NannyPipe) UploadAvatar(ctx context.Context, userID uuid.UUID, data []byte, contentType string) *shared.PipeRes[models.NannyProfile] {
	if p.cloudinary == nil || !p.cloudinary.Configured() {
		return &shared.PipeRes[models.NannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Cloudinary_Not_Configured),
		}
	}

	if len(data) == 0 {
		return &shared.PipeRes[models.NannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Avatar_Invalid_File),
		}
	}
	if len(data) > maxAvatarBytes {
		return &shared.PipeRes[models.NannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Avatar_Too_Large),
		}
	}

	ct := strings.ToLower(strings.SplitN(contentType, ";", 2)[0])
	switch ct {
	case "image/jpeg", "image/png", "image/webp":
	default:
		return &shared.PipeRes[models.NannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Avatar_Invalid_Type),
		}
	}

	profile, err := p.profileRepo.GetNannyProfileByUserID(ctx, userID)
	if err != nil || profile.ID == uuid.Nil {
		return &shared.PipeRes[models.NannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Nanny_Not_Found),
		}
	}

	publicID := profile.ID.String()
	result, err := p.cloudinary.UploadImage(ctx, data, avatarFolder, publicID)
	if err != nil {
		return &shared.PipeRes[models.NannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Avatar_Upload_Failed),
		}
	}

	updated, err := p.profileRepo.UpdateNannyAvatarURL(ctx, userID, result.SecureURL)
	if err != nil || updated.ID == uuid.Nil {
		return &shared.PipeRes[models.NannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Avatar_Upload_Failed),
		}
	}

	return &shared.PipeRes[models.NannyProfile]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Avatar_Uploaded),
		Data:    &updated,
	}
}
