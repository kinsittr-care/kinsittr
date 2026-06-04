package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/parent/dtos"
	"github.com/kinsittr/kinsittr-api/parent/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *ParentPipe) UpdateOwnProfile(ctx context.Context, userID uuid.UUID, dto dtos.UpdateParentProfileDTO) *shared.PipeRes[models.ParentProfile] {
	profile, err := p.profileRepo.UpdateParentProfile(ctx, models.ParentProfile{
		UserID:       userID,
		DisplayName:  normalizeString(dto.DisplayName),
		Phone:        normalizeString(dto.Phone),
		NumChildren:  dto.NumChildren,
		ChildrenAges: dto.ChildrenAges,
		City:         normalizeString(dto.City),
		Province:     normalizeString(dto.Province),
	})
	if err != nil || profile.ID == uuid.Nil {
		return pipeError[models.ParentProfile](messages.Parent_Profile_Not_Found)
	}

	return pipeSuccess(messages.Parent_Profile_Updated, &profile)
}
