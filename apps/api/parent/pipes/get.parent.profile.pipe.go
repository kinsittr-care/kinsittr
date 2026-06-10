package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/parent/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *ParentPipe) GetOwnProfile(ctx context.Context, userID uuid.UUID) *shared.PipeRes[ParentProfileData] {
	profile, err := p.profileRepo.GetParentProfileByUserID(ctx, userID)
	if err != nil || profile.ID == uuid.Nil {
		return pipeError[ParentProfileData](messages.Parent_Profile_Not_Found)
	}

	data := parentProfileData(profile)
	return pipeSuccess(messages.Parent_Profile_Fetched, &data)
}
