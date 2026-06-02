package pipes

import (
	"context"
	"log"
	"strings"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/auth/dtos"
	"github.com/kinsittr/kinsittr-api/auth/messages"
	"github.com/kinsittr/kinsittr-api/auth/services"
	"github.com/kinsittr/kinsittr-api/models"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *AuthPipe) RegisterParent(ctx context.Context, dto dtos.RegisterParentDTO) *shared.PipeRes[AuthTokenPair] {
	dto.Email = strings.ToLower(strings.TrimSpace(dto.Email))

	exists, err := p.repo.UserExistsByEmail(ctx, dto.Email)
	if err != nil || exists {
		if err != nil {
			log.Printf("auth_parent_register_failed email=%s reason=email_check err=%v", dto.Email, err)
		} else {
			log.Printf("auth_parent_register_failed email=%s reason=email_exists", dto.Email)
		}
		return &shared.PipeRes[AuthTokenPair]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Email_Already_In_Use),
		}
	}

	hash, err := services.HashPassword(dto.Password)
	if err != nil {
		log.Printf("auth_parent_register_failed email=%s reason=password_hash err=%v", dto.Email, err)
		return &shared.PipeRes[AuthTokenPair]{Success: false, Message: shared.CreatePipeMessage(messages.Registration_Failed)}
	}

	user, err := p.repo.CreateParentAccount(ctx, models.User{
		ID:          uuid.New(),
		Firstname:   strings.TrimSpace(dto.Firstname),
		Lastname:    strings.TrimSpace(dto.Lastname),
		Email:       dto.Email,
		Password:    hash,
		Role:        models.ParentUserRole,
		Phone:       strings.TrimSpace(dto.Phone),
		CountryCode: "CA",
	}, models.ParentProfile{
		ID:           uuid.New(),
		UserID:       uuid.Nil,
		DisplayName:  strings.TrimSpace(dto.DisplayName),
		NumChildren:  dto.NumChildren,
		ChildrenAges: dto.ChildrenAges,
		City:         strings.TrimSpace(dto.City),
		Province:     strings.TrimSpace(dto.Province),
	})
	if err != nil {
		log.Printf("auth_parent_register_failed email=%s reason=create_account err=%v", dto.Email, err)
		return &shared.PipeRes[AuthTokenPair]{Success: false, Message: shared.CreatePipeMessage(messages.Registration_Failed)}
	}

	access, refresh, err := p.generateTokenPair(ctx, user.ID, user.Role)
	if err != nil {
		log.Printf("auth_parent_register_failed user_id=%s email=%s reason=token_generation err=%v", user.ID, dto.Email, err)
		return &shared.PipeRes[AuthTokenPair]{Success: false, Message: shared.CreatePipeMessage(messages.Registration_Failed)}
	}

	log.Printf("auth_parent_register_success user_id=%s email=%s", user.ID, dto.Email)
	return &shared.PipeRes[AuthTokenPair]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Registered_Successfully),
		Data:    &AuthTokenPair{AccessToken: access, RefreshToken: refresh, User: user},
	}
}
