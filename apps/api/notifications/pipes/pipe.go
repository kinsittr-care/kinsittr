package pipes

import (
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/repositories/notifications"
	shared "github.com/kinsittr/kinsittr-api/shared"
)

type NotificationData struct {
	ID        string                  `json:"id"`
	UserID    string                  `json:"user_id"`
	Role      models.UserRole         `json:"role"`
	Type      models.NotificationType `json:"type"`
	Title     string                  `json:"title"`
	Body      string                  `json:"body"`
	Data      any                     `json:"data,omitempty"`
	ReadAt    *time.Time              `json:"read_at,omitempty"`
	CreatedAt time.Time               `json:"created_at"`
}

type NotificationListData struct {
	Items []NotificationData `json:"items"`
	Page  int                `json:"page"`
	Limit int                `json:"limit"`
	Total int                `json:"total"`
}

type UnreadCountData struct {
	Count int `json:"count"`
}

type MarkAllReadData struct {
	Updated int `json:"updated"`
}

type NotificationsPipe struct {
	repo notifications.NotificationsRepository
}

func NewNotificationsPipe(repo notifications.NotificationsRepository) *NotificationsPipe {
	return &NotificationsPipe{repo: repo}
}

func toNotificationData(notification models.Notification) NotificationData {
	return NotificationData{
		ID:        notification.ID.String(),
		UserID:    notification.UserID.String(),
		Role:      notification.Role,
		Type:      notification.Type,
		Title:     notification.Title,
		Body:      notification.Body,
		Data:      notification.Data,
		ReadAt:    notification.ReadAt,
		CreatedAt: notification.CreatedAt,
	}
}

func normalizePageLimit(page, limit int) (int, int) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	return page, limit
}

func pipeError[T any](message string) *shared.PipeRes[T] {
	return &shared.PipeRes[T]{Success: false, Message: shared.CreatePipeMessage(message)}
}

func pipeSuccess[T any](message string, data *T) *shared.PipeRes[T] {
	return &shared.PipeRes[T]{Success: true, Message: shared.CreatePipeMessage(message), Data: data}
}

func validNotificationRole(role models.UserRole) bool {
	return role == models.ParentUserRole || role == models.NannyUserRole
}

func parseUUID(value string) (uuid.UUID, error) {
	return uuid.Parse(value)
}
