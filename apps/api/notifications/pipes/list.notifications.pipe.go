package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/notifications/dtos"
	"github.com/kinsittr/kinsittr-api/notifications/messages"
	"github.com/kinsittr/kinsittr-api/repositories/notifications"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *NotificationsPipe) List(ctx context.Context, userID uuid.UUID, role models.UserRole, dto dtos.ListNotificationsQueryDTO) *shared.PipeRes[NotificationListData] {
	if userID == uuid.Nil || !validNotificationRole(role) {
		logNotificationEvent("list", userID, role, "forbidden", nil)
		return pipeError[NotificationListData](messages.Forbidden_Notifications_Access)
	}

	page, limit := normalizePageLimit(dto.Page, dto.Limit)
	items, total, err := p.repo.List(ctx, userID, role, notifications.ListNotificationsFilter{
		Page:       page,
		Limit:      limit,
		UnreadOnly: dto.UnreadOnly,
	})
	if err != nil {
		logNotificationEvent("list", userID, role, "failed", err)
		return pipeError[NotificationListData](messages.Invalid_Notification_Request)
	}

	data := NotificationListData{Items: make([]NotificationData, 0, len(items)), Page: page, Limit: limit, Total: total}
	for _, item := range items {
		data.Items = append(data.Items, toNotificationData(item))
	}
	logNotificationEvent("list", userID, role, "success", nil)
	return pipeSuccess(messages.Notifications_Listed, &data)
}
