package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/auth/dtos"
	"github.com/kinsittr/kinsittr-api/auth/messages"
	"github.com/kinsittr/kinsittr-api/auth/services"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *AuthPipe) DeactivateAccount(ctx context.Context, userID uuid.UUID, dto dtos.DeactivateAccountDTO) *shared.PipeRes[any] {
	user, err := p.repo.GetUserByID(ctx, userID)
	if err != nil || user.ID == uuid.Nil || !user.IsActive {
		return pipeError[any](messages.Invalid_Account_Request)
	}

	if !services.CheckPassword(user.Password, dto.Password) {
		return pipeError[any](messages.Invalid_Password)
	}

	if err := p.repo.DeactivateUser(ctx, userID); err != nil {
		return pipeError[any](messages.Invalid_Account_Request)
	}

	return pipeSuccess[any](messages.Account_Deactivated, nil)
}
