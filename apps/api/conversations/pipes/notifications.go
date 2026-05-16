package pipes

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
)

func notificationData(values map[string]string) []byte {
	data, err := json.Marshal(values)
	if err != nil {
		return []byte("{}")
	}
	return data
}

func (p *ConversationsPipe) notifyParentProfile(ctx context.Context, parentProfileID uuid.UUID, notification models.Notification) {
	if p.notifyRepo == nil || parentProfileID == uuid.Nil {
		return
	}
	_, _ = p.notifyRepo.CreateForParentProfileID(ctx, parentProfileID, notification)
}

func (p *ConversationsPipe) notifyNannyProfile(ctx context.Context, nannyProfileID uuid.UUID, notification models.Notification) {
	if p.notifyRepo == nil || nannyProfileID == uuid.Nil {
		return
	}
	_, _ = p.notifyRepo.CreateForNannyProfileID(ctx, nannyProfileID, notification)
}
