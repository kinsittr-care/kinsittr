package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/auth/messages"
	"github.com/kinsittr/kinsittr-api/models"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *AuthPipe) Me(ctx context.Context, userID uuid.UUID) *shared.PipeRes[CurrentSessionData] {
	user, err := p.repo.GetUserByID(ctx, userID)
	if err != nil || user.ID == uuid.Nil || !user.IsActive {
		return &shared.PipeRes[CurrentSessionData]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Invalid_Or_Expired_Token),
		}
	}

	data := CurrentSessionData{
		User: user,
	}

	switch user.Role {
	case models.ParentUserRole:
		profile, err := p.profileRepo.GetParentProfileByUserID(ctx, user.ID)
		if err == nil && profile.ID != uuid.Nil {
			data.ParentProfile = &profile
		}
	case models.NannyUserRole:
		profile, err := p.profileRepo.GetNannyProfileByUserID(ctx, user.ID)
		if err == nil && profile.ID != uuid.Nil {
			data.NannyProfile = &profile
		}
	}

	return &shared.PipeRes[CurrentSessionData]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Current_User_Fetched),
		Data:    &data,
	}
}
