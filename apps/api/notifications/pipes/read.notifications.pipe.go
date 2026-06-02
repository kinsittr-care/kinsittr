package pipes

import (
	"context"
	"log"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/notifications/messages"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

func (p *NotificationsPipe) CountUnread(ctx context.Context, userID uuid.UUID, role models.UserRole) *shared.PipeRes[UnreadCountData] {
	if userID == uuid.Nil || !validNotificationRole(role) {
		logNotificationEvent("count_unread", userID, role, "forbidden", nil)
		return pipeError[UnreadCountData](messages.Forbidden_Notifications_Access)
	}
	count, err := p.repo.CountUnread(ctx, userID, role)
	if err != nil {
		logNotificationEvent("count_unread", userID, role, "failed", err)
		return pipeError[UnreadCountData](messages.Invalid_Notification_Request)
	}
	data := UnreadCountData{Count: count}
	return pipeSuccess(messages.Unread_Notifications_Count, &data)
}

func (p *NotificationsPipe) MarkRead(ctx context.Context, userID uuid.UUID, role models.UserRole, notificationID uuid.UUID) *shared.PipeRes[NotificationData] {
	if userID == uuid.Nil || !validNotificationRole(role) {
		logNotificationEvent("mark_read", userID, role, "forbidden", nil)
		return pipeError[NotificationData](messages.Forbidden_Notifications_Access)
	}
	notification, err := p.repo.MarkRead(ctx, userID, role, notificationID)
	if err != nil {
		logNotificationEvent("mark_read", userID, role, "failed", err)
		return pipeError[NotificationData](messages.Invalid_Notification_Request)
	}
	if notification.ID == uuid.Nil {
		logNotificationEvent("mark_read", userID, role, "not_found", nil)
		return pipeError[NotificationData](messages.Notification_Not_Found)
	}
	data := toNotificationData(notification)
	logNotificationEvent("mark_read", userID, role, "success", nil)
	return pipeSuccess(messages.Notification_Read, &data)
}

func (p *NotificationsPipe) MarkAllRead(ctx context.Context, userID uuid.UUID, role models.UserRole) *shared.PipeRes[MarkAllReadData] {
	if userID == uuid.Nil || !validNotificationRole(role) {
		logNotificationEvent("mark_all_read", userID, role, "forbidden", nil)
		return pipeError[MarkAllReadData](messages.Forbidden_Notifications_Access)
	}
	updated, err := p.repo.MarkAllRead(ctx, userID, role)
	if err != nil {
		logNotificationEvent("mark_all_read", userID, role, "failed", err)
		return pipeError[MarkAllReadData](messages.Invalid_Notification_Request)
	}
	data := MarkAllReadData{Updated: updated}
	log.Printf("notification_mark_all_read user_id=%s role=%s result=success updated=%d", userID, role, updated)
	return pipeSuccess(messages.Notifications_Read_All, &data)
}
