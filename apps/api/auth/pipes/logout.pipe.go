package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/auth/dtos"
	"github.com/kinsittr/kinsittr-api/auth/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
	"github.com/kinsittr/kinsittr-api/shared/token"
)

func (p *AuthPipe) Logout(ctx context.Context, dto dtos.RefreshDTO) *shared.PipeRes[any] {
	claims, err := token.ValidateToken(dto.RefreshToken, p.jwtRefreshSecret)
	if err != nil || claims.SessionID == uuid.Nil {
		return pipeError[any](messages.Invalid_Or_Expired_Token)
	}

	if err := p.repo.DeleteRefreshSession(ctx, claims.SessionID); err != nil {
		return pipeError[any](messages.Invalid_Or_Expired_Token)
	}

	return &shared.PipeRes[any]{
		Success: true,
		Message: shared.CreatePipeMessage(messages.Logged_Out_Successfully),
	}
}
