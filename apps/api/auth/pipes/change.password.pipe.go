package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/auth/dtos"
	"github.com/kinsittr/kinsittr-api/auth/messages"
	"github.com/kinsittr/kinsittr-api/auth/services"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *AuthPipe) ChangePassword(ctx context.Context, userID uuid.UUID, dto dtos.ChangePasswordDTO) *shared.PipeRes[any] {
	user, err := p.repo.GetUserByID(ctx, userID)
	if err != nil || user.ID == uuid.Nil || !user.IsActive {
		return pipeError[any](messages.Invalid_Account_Request)
	}

	if !services.CheckPassword(user.Password, dto.CurrentPassword) {
		return pipeError[any](messages.Invalid_Password)
	}

	passwordHash, err := services.HashPassword(dto.NewPassword)
	if err != nil {
		return pipeError[any](messages.Invalid_Account_Request)
	}

	if err := p.repo.UpdateUserPassword(ctx, userID, passwordHash); err != nil {
		return pipeError[any](messages.Invalid_Account_Request)
	}

	return pipeSuccess[any](messages.Password_Changed, nil)
}
