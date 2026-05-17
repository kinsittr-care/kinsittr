package pipes

import (
	"context"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/notifications/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *NotificationsPipe) CountUnread(ctx context.Context, userID uuid.UUID, role models.UserRole) *shared.PipeRes[UnreadCountData] {
	if userID == uuid.Nil || !validNotificationRole(role) {
		return pipeError[UnreadCountData](messages.Forbidden_Notifications_Access)
	}
	count, err := p.repo.CountUnread(ctx, userID, role)
	if err != nil {
		return pipeError[UnreadCountData](messages.Invalid_Notification_Request)
	}
	data := UnreadCountData{Count: count}
	return pipeSuccess(messages.Unread_Notifications_Count, &data)
}

func (p *NotificationsPipe) MarkRead(ctx context.Context, userID uuid.UUID, role models.UserRole, notificationID uuid.UUID) *shared.PipeRes[NotificationData] {
	if userID == uuid.Nil || !validNotificationRole(role) {
		return pipeError[NotificationData](messages.Forbidden_Notifications_Access)
	}
	notification, err := p.repo.MarkRead(ctx, userID, role, notificationID)
	if err != nil {
		return pipeError[NotificationData](messages.Invalid_Notification_Request)
	}
	if notification.ID == uuid.Nil {
		return pipeError[NotificationData](messages.Notification_Not_Found)
	}
	data := toNotificationData(notification)
	return pipeSuccess(messages.Notification_Read, &data)
}

func (p *NotificationsPipe) MarkAllRead(ctx context.Context, userID uuid.UUID, role models.UserRole) *shared.PipeRes[MarkAllReadData] {
	if userID == uuid.Nil || !validNotificationRole(role) {
		return pipeError[MarkAllReadData](messages.Forbidden_Notifications_Access)
	}
	updated, err := p.repo.MarkAllRead(ctx, userID, role)
	if err != nil {
		return pipeError[MarkAllReadData](messages.Invalid_Notification_Request)
	}
	data := MarkAllReadData{Updated: updated}
	return pipeSuccess(messages.Notifications_Read_All, &data)
}
