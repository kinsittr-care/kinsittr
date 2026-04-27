package pipes

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/auth/dtos"
	"github.com/kinsittr/kinsittr-api/auth/messages"
	"github.com/kinsittr/kinsittr-api/auth/services"
	"github.com/kinsittr/kinsittr-api/models"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *AuthPipe) RegisterNanny(ctx context.Context, dto dtos.RegisterNannyDTO) *shared.PipeRes[AuthTokenPair] {
	dto.Email = strings.ToLower(strings.TrimSpace(dto.Email))

	exists, err := p.repo.UserExistsByEmail(ctx, dto.Email)
	if err != nil || exists {
		return &shared.PipeRes[AuthTokenPair]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Email_Already_In_Use),
		}
	}

	hash, err := services.HashPassword(dto.Password)
	if err != nil {
		return &shared.PipeRes[AuthTokenPair]{Success: false, Message: shared.CreatePipeMessage(messages.Registration_Failed)}
	}

	user, err := p.repo.CreateNannyAccount(ctx, models.User{
		ID:          uuid.New(),
		Firstname:   strings.TrimSpace(dto.Firstname),
		Lastname:    strings.TrimSpace(dto.Lastname),
		Email:       dto.Email,
		Password:    hash,
		Role:        models.NannyUserRole,
		Phone:       strings.TrimSpace(dto.Phone),
		CountryCode: "CA",
	}, models.NannyProfile{
		ID:          uuid.New(),
		UserID:      uuid.Nil,
		DisplayName: strings.TrimSpace(dto.DisplayName),
		Bio:         strings.TrimSpace(dto.Bio),
		RatePerHour: dto.RatePerHour,
		Currency:    models.CAD,
		City:        strings.TrimSpace(dto.City),
		Province:    strings.TrimSpace(dto.Province),
	})
	if err != nil {
		return &shared.PipeRes[AuthTokenPair]{Success: false, Message: shared.CreatePipeMessage(messages.Registration_Failed)}
	}

	access, refresh, err := p.generateTokenPair(ctx, user.ID, user.Role)
	if err != nil {
		return &shared.PipeRes[AuthTokenPair]{Success: false, Message: shared.CreatePipeMessage(messages.Registration_Failed)}
	}

	return &shared.PipeRes[AuthTokenPair]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Registered_Successfully),
		Data:    &AuthTokenPair{AccessToken: access, RefreshToken: refresh, User: user},
	}
}
