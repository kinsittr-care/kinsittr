package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/parent/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *ParentPipe) GetOwnSettings(ctx context.Context, userID uuid.UUID) *shared.PipeRes[ParentSettingsData] {
	settings, err := p.profileRepo.GetOrCreateParentSettings(ctx, userID)
	if err != nil || settings.ID == uuid.Nil {
		return pipeError[ParentSettingsData](messages.Invalid_Parent_Request)
	}

	data := parentSettingsData(settings)
	return pipeSuccess(messages.Parent_Settings_Fetched, &data)
}
