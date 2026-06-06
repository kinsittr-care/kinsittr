package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/parent/dtos"
	"github.com/kinsittr/kinsittr-api/parent/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *ParentPipe) UpdateOwnSettings(ctx context.Context, userID uuid.UUID, dto dtos.UpdateParentSettingsDTO) *shared.PipeRes[ParentSettingsData] {
	profile, err := p.profileRepo.GetParentProfileByUserID(ctx, userID)
	if err != nil || profile.ID == uuid.Nil {
		return pipeError[ParentSettingsData](messages.Parent_Profile_Not_Found)
	}

	if _, err := p.profileRepo.GetOrCreateParentSettings(ctx, userID); err != nil {
		return pipeError[ParentSettingsData](messages.Invalid_Parent_Request)
	}

	settings, err := p.profileRepo.UpdateParentSettings(ctx, models.ParentSettings{
		UserID:             userID,
		NotifyMessages:     dto.NotifyMessages,
		NotifyBookings:     dto.NotifyBookings,
		NotifyReminders:    dto.NotifyReminders,
		NotifyWeeklyDigest: dto.NotifyWeeklyDigest,
		ShowProfile:        dto.ShowProfile,
		ShareReviews:       dto.ShareReviews,
		Analytics:          dto.Analytics,
		Language:           normalizeString(dto.Language),
		Currency:           normalizeString(dto.Currency),
		Timezone:           normalizeString(dto.Timezone),
	})
	if err != nil || settings.ID == uuid.Nil {
		return pipeError[ParentSettingsData](messages.Invalid_Parent_Request)
	}

	data := parentSettingsData(settings)
	return pipeSuccess(messages.Parent_Settings_Updated, &data)
}
