package pipes

import (
	"context"
	"slices"
	"strings"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/nanny/dtos"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *NannyPipe) UpdateOwnProfile(ctx context.Context, userID uuid.UUID, dto dtos.UpdateNannyProfileDTO) *shared.PipeRes[models.NannyProfile] {
	specialties := make([]string, 0, len(dto.Specialties))
	for _, specialty := range dto.Specialties {
		normalized := normalizeSpecialty(specialty)
		if normalized == "" || slices.Contains(specialties, normalized) {
			continue
		}
		specialties = append(specialties, normalized)
	}

	profile, err := p.profileRepo.UpdateNannyProfile(ctx, models.NannyProfile{
		UserID:      userID,
		DisplayName: strings.TrimSpace(dto.DisplayName),
		Phone:       strings.TrimSpace(dto.Phone),
		Bio:         strings.TrimSpace(dto.Bio),
		Specialties: specialties,
		RatePerHour: dto.RatePerHour,
		City:        strings.TrimSpace(dto.City),
		Province:    strings.TrimSpace(dto.Province),
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
