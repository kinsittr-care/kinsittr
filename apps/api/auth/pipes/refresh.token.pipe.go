package pipes

import (
	"context"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/auth/dtos"
	"github.com/kinsittr/kinsittr-api/auth/messages"
	"github.com/kinsittr/kinsittr-api/models"
	shared "github.com/kinsittr/kinsittr-api/shared"
	"github.com/kinsittr/kinsittr-api/shared/token"
)

func (p *AuthPipe) Refresh(ctx context.Context, dto dtos.RefreshDTO) *shared.PipeRes[AuthTokenPair] {
	claims, err := token.ValidateToken(dto.RefreshToken, p.jwtRefreshSecret)
	if err != nil {
		log.Printf("auth_refresh_failed reason=invalid_refresh_token err=%v", err)
		return &shared.PipeRes[AuthTokenPair]{
			Success: false,
			Message: shared.CreatePipeMessage(messages.Invalid_Or_Expired_Token),
		}
	}

	if claims.SessionID == uuid.Nil {
		log.Printf("auth_refresh_failed user_id=%s reason=missing_session_id", claims.UserID)
		return pipeError[AuthTokenPair](messages.Invalid_Or_Expired_Token)
	}

	session, err := p.repo.GetRefreshSessionByID(ctx, claims.SessionID)
	if err != nil || session.ID == uuid.Nil || session.UserID != claims.UserID || session.ExpiresAt.Before(time.Now()) {
		log.Printf("auth_refresh_failed user_id=%s session_id=%s reason=revoked_or_expired_session err=%v", claims.UserID, claims.SessionID, err)
		return pipeError[AuthTokenPair](messages.Invalid_Or_Expired_Token)
	}

	user, err := p.repo.GetUserByID(ctx, claims.UserID)
	if err != nil || user.ID == uuid.Nil || !user.IsActive {
		log.Printf("auth_refresh_failed user_id=%s session_id=%s reason=invalid_or_disabled_user err=%v", claims.UserID, claims.SessionID, err)
		return pipeError[AuthTokenPair](messages.Invalid_Or_Expired_Token)
	}

	access, err := token.GenerateAccessToken(user.ID, user.Role, p.jwtSecret)
	if err != nil {
		log.Printf("auth_refresh_failed user_id=%s session_id=%s reason=access_token_generation err=%v", user.ID, claims.SessionID, err)
		return pipeError[AuthTokenPair](messages.Invalid_Or_Expired_Token)
	}

	newSession := models.RefreshSession{
		ID:        uuid.New(),
		UserID:    user.ID,
		ExpiresAt: time.Now().Add(token.RefreshTokenDuration),
	}
	refresh, err := token.GenerateRefreshToken(user.ID, user.Role, newSession.ID, p.jwtRefreshSecret)
	if err != nil {
		log.Printf("auth_refresh_failed user_id=%s session_id=%s reason=refresh_token_generation err=%v", user.ID, claims.SessionID, err)
		return pipeError[AuthTokenPair](messages.Invalid_Or_Expired_Token)
	}
	if err := p.repo.RotateRefreshSession(ctx, claims.SessionID, newSession); err != nil {
		log.Printf("auth_refresh_failed user_id=%s session_id=%s reason=session_rotation err=%v", user.ID, claims.SessionID, err)
		return pipeError[AuthTokenPair](messages.Invalid_Or_Expired_Token)
	}
	log.Printf("auth_refresh_success user_id=%s previous_session_id=%s new_session_id=%s", user.ID, claims.SessionID, newSession.ID)
	return &shared.PipeRes[AuthTokenPair]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Token_Refreshed_Successfully),
		Data:    &AuthTokenPair{AccessToken: access, RefreshToken: refresh, User: &user},
	}
}
