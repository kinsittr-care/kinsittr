package pipes

import (
	"context"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/auth/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
	"github.com/kinsittr/kinsittr-api/models"
	shared "github.com/kinsittr/kinsittr-api/shared"
	"github.com/kinsittr/kinsittr-api/shared/token"
)

func (p *AdminAuthPipe) Refresh(ctx context.Context, dto dtos.RefreshDTO) *shared.PipeRes[AdminAuthTokenPair] {
	claims, err := token.ValidateToken(dto.RefreshToken, p.jwtRefreshSecret)
	if err != nil || claims.SessionID == uuid.Nil || claims.Role != models.AdminUserRole {
		log.Printf("admin_auth_refresh_failed reason=invalid_admin_session err=%v", err)
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Session)
	}

	session, err := p.repo.GetRefreshSessionByID(ctx, claims.SessionID)
	if err != nil || session.ID == uuid.Nil || session.UserID != claims.UserID || session.ExpiresAt.Before(time.Now()) {
		log.Printf("admin_auth_refresh_failed admin_id=%s session_id=%s reason=revoked_or_expired_session err=%v", claims.UserID, claims.SessionID, err)
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Session)
	}

	user, err := p.repo.GetUserByID(ctx, claims.UserID)
	if err != nil || user.ID == uuid.Nil || user.Role != models.AdminUserRole || !user.IsActive {
		log.Printf("admin_auth_refresh_failed admin_id=%s session_id=%s reason=invalid_or_disabled_admin err=%v", claims.UserID, claims.SessionID, err)
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Session)
	}

	access, err := token.GenerateAccessToken(user.ID, user.Role, p.jwtSecret)
	if err != nil {
		log.Printf("admin_auth_refresh_failed admin_id=%s session_id=%s reason=access_token_generation err=%v", user.ID, claims.SessionID, err)
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Session)
	}

	newSession := models.RefreshSession{
		ID:        uuid.New(),
		UserID:    user.ID,
		ExpiresAt: time.Now().Add(token.RefreshTokenDuration),
	}
	refresh, err := token.GenerateRefreshToken(user.ID, user.Role, newSession.ID, p.jwtRefreshSecret)
	if err != nil {
		log.Printf("admin_auth_refresh_failed admin_id=%s session_id=%s reason=refresh_token_generation err=%v", user.ID, claims.SessionID, err)
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Session)
	}
	if err := p.repo.RotateRefreshSession(ctx, claims.SessionID, newSession); err != nil {
		log.Printf("admin_auth_refresh_failed admin_id=%s session_id=%s reason=session_rotation err=%v", user.ID, claims.SessionID, err)
		return pipeError[AdminAuthTokenPair](messages.Invalid_Admin_Session)
	}

	log.Printf("admin_auth_refresh_success admin_id=%s previous_session_id=%s new_session_id=%s", user.ID, claims.SessionID, newSession.ID)
	return pipeSuccess(messages.Admin_Token_Refreshed, &AdminAuthTokenPair{
		AccessToken:  access,
		RefreshToken: refresh,
	})
}

func (p *AdminAuthPipe) Logout(ctx context.Context, dto dtos.RefreshDTO) *shared.PipeRes[any] {
	claims, err := token.ValidateToken(dto.RefreshToken, p.jwtRefreshSecret)
	if err != nil || claims.SessionID == uuid.Nil || claims.Role != models.AdminUserRole {
		log.Printf("admin_auth_logout_failed reason=invalid_admin_session err=%v", err)
		return pipeError[any](messages.Invalid_Admin_Session)
	}

	if err := p.repo.DeleteRefreshSession(ctx, claims.SessionID); err != nil {
		log.Printf("admin_auth_logout_failed admin_id=%s session_id=%s reason=session_delete err=%v", claims.UserID, claims.SessionID, err)
		return pipeError[any](messages.Invalid_Admin_Session)
	}

	log.Printf("admin_auth_logout_success admin_id=%s session_id=%s", claims.UserID, claims.SessionID)
	return pipeSuccess[any](messages.Admin_Logged_Out, nil)
}
