package pipes

import (
	"context"
	"log"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/auth/dtos"
	"github.com/kinsittr/kinsittr-api/auth/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
	"github.com/kinsittr/kinsittr-api/shared/token"
)

func (p *AuthPipe) Logout(ctx context.Context, dto dtos.RefreshDTO) *shared.PipeRes[any] {
	claims, err := token.ValidateToken(dto.RefreshToken, p.jwtRefreshSecret)
	if err != nil || claims.SessionID == uuid.Nil {
		log.Printf("auth_logout_failed reason=invalid_refresh_token err=%v", err)
		return pipeError[any](messages.Invalid_Or_Expired_Token)
	}

	if err := p.repo.DeleteRefreshSession(ctx, claims.SessionID); err != nil {
		log.Printf("auth_logout_failed user_id=%s session_id=%s reason=session_delete err=%v", claims.UserID, claims.SessionID, err)
		return pipeError[any](messages.Invalid_Or_Expired_Token)
	}

	log.Printf("auth_logout_success user_id=%s session_id=%s", claims.UserID, claims.SessionID)
	return &shared.PipeRes[any]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Logged_Out_Successfully),
	}
}
