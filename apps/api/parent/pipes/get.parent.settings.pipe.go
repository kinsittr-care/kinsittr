package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/parent/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *ParentPipe) GetOwnSettings(ctx context.Context, userID uuid.UUID) *shared.PipeRes[models.ParentSettings] {
	settings, err := p.profileRepo.GetOrCreateParentSettings(ctx, userID)
	if err != nil || settings.ID == uuid.Nil {
		return pipeError[models.ParentSettings](messages.Invalid_Parent_Request)
	}

	return pipeSuccess(messages.Parent_Settings_Fetched, &settings)
}
