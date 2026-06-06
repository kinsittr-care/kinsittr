package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/messages"
	"github.com/kinsittr/kinsittr-api/models"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *AdminAuthPipe) Me(ctx context.Context, userID uuid.UUID) *shared.PipeRes[AdminSessionData] {
	user, err := p.repo.GetUserByID(ctx, userID)
	if err != nil || user.ID == uuid.Nil || user.Role != models.AdminUserRole || !user.IsActive {
		return pipeError[AdminSessionData](messages.Invalid_Admin_Session)
	}

	return pipeSuccess(messages.Admin_Current_User_Fetched, &AdminSessionData{User: adminAuthUserData(user)})
}
