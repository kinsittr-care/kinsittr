package pipes

import (
	"context"
	"log"
	"strings"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/auth/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
	auth_services "github.com/kinsittr/kinsittr-api/auth/services"
	"github.com/kinsittr/kinsittr-api/models"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *AdminAuthPipe) Login(ctx context.Context, dto dtos.LoginDTO) *shared.PipeRes[AdminAuthTokenPair] {
	email := strings.ToLower(strings.TrimSpace(dto.Email))

	user, err := p.repo.GetUserByEmail(ctx, email)
	if err != nil || user.ID == uuid.Nil || user.Role != models.AdminUserRole {
		log.Printf("admin_auth_login_failed email=%s reason=invalid_credentials", email)
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Credentials)
	}
	if !user.IsActive {
		log.Printf("admin_auth_login_failed admin_id=%s email=%s reason=account_disabled", user.ID, email)
		return pipeError[AdminAuthTokenPair](messages.Admin_Account_Disabled)
	}
	if !auth_services.CheckPassword(user.Password, dto.Password) {
		log.Printf("admin_auth_login_failed admin_id=%s email=%s reason=invalid_credentials", user.ID, email)
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Credentials)
	}

	access, refresh, err := p.generateTokenPair(ctx, user.ID, user.Role)
	if err != nil {
		log.Printf("admin_auth_login_failed admin_id=%s email=%s reason=token_generation err=%v", user.ID, email, err)
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Credentials)
	}

	log.Printf("admin_auth_login_success admin_id=%s email=%s", user.ID, email)
	return pipeSuccess(messages.Admin_Logged_In, &AdminAuthTokenPair{
		AccessToken:  access,
		RefreshToken: refresh,
		User:         user,
	})
}
