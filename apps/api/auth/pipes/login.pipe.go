package pipes

import (
	"context"
	"log"
	"strings"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/auth/dtos"
	"github.com/kinsittr/kinsittr-api/auth/messages"
	"github.com/kinsittr/kinsittr-api/auth/services"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *AuthPipe) Login(ctx context.Context, dto dtos.LoginDTO) *shared.PipeRes[AuthTokenPair] {
	email := strings.ToLower(strings.TrimSpace(dto.Email))

	user, err := p.repo.GetUserByEmail(ctx, email)
	if err != nil || user.ID == uuid.Nil {
		log.Printf("auth_login_failed email=%s reason=invalid_credentials", email)
		return &shared.PipeRes[AuthTokenPair]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Invalid_Email_Or_Password),
		}
	}

	if !user.IsActive {
		log.Printf("auth_login_failed user_id=%s email=%s reason=account_disabled", user.ID, email)
		return &shared.PipeRes[AuthTokenPair]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Account_Disabled),
		}
	}

	if !services.CheckPassword(user.Password, dto.Password) {
		log.Printf("auth_login_failed user_id=%s email=%s reason=invalid_credentials", user.ID, email)
		return &shared.PipeRes[AuthTokenPair]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Invalid_Email_Or_Password),
		}
	}

	access, refresh, err := p.generateTokenPair(ctx, user.ID, user.Role)
	if err != nil {
		log.Printf("auth_login_failed user_id=%s email=%s reason=token_generation err=%v", user.ID, email, err)
		return &shared.PipeRes[AuthTokenPair]{Success: false, Message: shared.CreatePipeMessage(messages.Invalid_Email_Or_Password)}
	}

	log.Printf("auth_login_success user_id=%s email=%s role=%s", user.ID, email, user.Role)
	return &shared.PipeRes[AuthTokenPair]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Logged_In_Successfully),
		Data:    &AuthTokenPair{AccessToken: access, RefreshToken: refresh, User: user},
	}
}
