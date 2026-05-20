package pipes

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/auth/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
	authservices "github.com/kinsittr/kinsittr-api/auth/services"
	"github.com/kinsittr/kinsittr-api/models"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *AdminAuthPipe) Login(ctx context.Context, dto dtos.LoginDTO) *shared.PipeRes[AdminAuthTokenPair] {
	email := strings.ToLower(strings.TrimSpace(dto.Email))

	user, err := p.repo.GetUserByEmail(ctx, email)
	if err != nil || user.ID == uuid.Nil || user.Role != models.AdminUserRole {
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Credentials)
	}
	if !user.IsActive {
		return pipeError[AdminAuthTokenPair](messages.Admin_Account_Disabled)
	}
	if !authservices.CheckPassword(user.Password, dto.Password) {
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Credentials)
	}

	access, refresh, err := p.generateTokenPair(ctx, user.ID, user.Role)
	if err != nil {
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Credentials)
	}

	return pipeSuccess(messages.Admin_Logged_In, &AdminAuthTokenPair{
		AccessToken:  access,
		RefreshToken: refresh,
		User:         user,
	})
}
