package pipes

import (
	"context"
	"slices"
	"strings"
	"unicode/utf8"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/nanny/dtos"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

const specialtiesTotalCharacterLimit = 25

func (p *NannyPipe) UpdateOwnProfile(ctx context.Context, userID uuid.UUID, dto dtos.UpdateNannyProfileDTO) *shared.PipeRes[models.NannyProfile] {
	specialties := make([]string, 0, len(dto.Specialties))
	for _, specialty := range dto.Specialties {
		normalized := normalizeSpecialty(specialty)
		if normalized == "" || slices.Contains(specialties, normalized) {
			continue
		}
		specialties = append(specialties, normalized)
	}
	if specialtiesCharacterCount(specialties) > specialtiesTotalCharacterLimit {
		return &shared.PipeRes[models.NannyProfile]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Invalid_Nanny_Profile),
		}
	}

	profile, err := p.profileRepo.UpdateNannyProfile(ctx, models.NannyProfile{
		UserID:      userID,
		Phone:       strings.TrimSpace(dto.Phone),
		Bio:         strings.TrimSpace(dto.Bio),
		Specialties: specialties,
		RatePerHour: dto.RatePerHour,
		City:        normalizeLocationField(dto.City),
		Province:    normalizeLocationField(dto.Province),
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

func normalizeLocationField(value string) string {
	return strings.Join(strings.Fields(value), " ")
}

func specialtiesCharacterCount(values []string) int {
	total := 0
	for _, value := range values {
		total += utf8.RuneCountInString(strings.TrimSpace(value))
	}
	return total
}

