package notifications

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinsittr/kinsittr-api/models"
)

type ListNotificationsFilter struct {
	Page       int
	Limit      int
	UnreadOnly bool
}

type NotificationsRepository interface {
	Create(ctx context.Context, notification models.Notification) (models.Notification, error)
	CreateForParentProfileID(ctx context.Context, parentProfileID uuid.UUID, notification models.Notification) (models.Notification, error)
	CreateForNannyProfileID(ctx context.Context, nannyProfileID uuid.UUID, notification models.Notification) (models.Notification, error)
	List(ctx context.Context, userID uuid.UUID, role models.UserRole, filter ListNotificationsFilter) ([]models.Notification, int, error)
	CountUnread(ctx context.Context, userID uuid.UUID, role models.UserRole) (int, error)
	MarkRead(ctx context.Context, userID uuid.UUID, role models.UserRole, notificationID uuid.UUID) (models.Notification, error)
	MarkAllRead(ctx context.Context, userID uuid.UUID, role models.UserRole) (int, error)
}

var NotificationsRepo NotificationsRepository

func InitNotificationsRepo(db *pgxpool.Pool) {
	NotificationsRepo = newPgRepository(db)
}
