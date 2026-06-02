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
	apilogging "github.com/kinsittr/kinsittr-api/shared/logging"
)

func (p *AdminAuthPipe) Login(ctx context.Context, dto dtos.LoginDTO) *shared.PipeRes[AdminAuthTokenPair] {
	email := strings.ToLower(strings.TrimSpace(dto.Email))
	emailHash, emailDomain := apilogging.EmailLogFields(email)

	user, err := p.repo.GetUserByEmail(ctx, email)
	if err != nil || user.ID == uuid.Nil || user.Role != models.AdminUserRole {
		log.Printf("admin_auth_login_failed email_hash=%s email_domain=%s reason=invalid_credentials", emailHash, emailDomain)
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Credentials)
	}
	if !user.IsActive {
		log.Printf("admin_auth_login_failed admin_id=%s email_hash=%s email_domain=%s reason=account_disabled", user.ID, emailHash, emailDomain)
		return pipeError[AdminAuthTokenPair](messages.Admin_Account_Disabled)
	}
	if !auth_services.CheckPassword(user.Password, dto.Password) {
		log.Printf("admin_auth_login_failed admin_id=%s email_hash=%s email_domain=%s reason=invalid_credentials", user.ID, emailHash, emailDomain)
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Credentials)
	}

	access, refresh, err := p.generateTokenPair(ctx, user.ID, user.Role)
	if err != nil {
		log.Printf("admin_auth_login_failed admin_id=%s email_hash=%s email_domain=%s reason=token_generation err=%v", user.ID, emailHash, emailDomain, err)
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Credentials)
	}

	log.Printf("admin_auth_login_success admin_id=%s email_hash=%s email_domain=%s", user.ID, emailHash, emailDomain)
	return pipeSuccess(messages.Admin_Logged_In, &AdminAuthTokenPair{
		AccessToken:  access,
		RefreshToken: refresh,
		User:         user,
	})
}
