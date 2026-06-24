package pipes

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/notifications/dtos"
	"github.com/kinsittr/kinsittr-api/notifications/messages"
	"github.com/kinsittr/kinsittr-api/repositories/notifications"
)

type mockNotificationsRepo struct {
	items        []models.Notification
	total        int
	unread       int
	notification models.Notification
	updated      int
}

func (m *mockNotificationsRepo) Create(_ context.Context, n models.Notification) (models.Notification, error) {
	return n, nil
}
func (m *mockNotificationsRepo) CreateForParentProfileID(_ context.Context, _ uuid.UUID, n models.Notification) (models.Notification, error) {
	return n, nil
}
func (m *mockNotificationsRepo) CreateForNannyProfileID(_ context.Context, _ uuid.UUID, n models.Notification) (models.Notification, error) {
	return n, nil
}
func (m *mockNotificationsRepo) List(_ context.Context, _ uuid.UUID, _ models.UserRole, _ notifications.ListNotificationsFilter) ([]models.Notification, int, error) {
	return m.items, m.total, nil
}
func (m *mockNotificationsRepo) CountUnread(_ context.Context, _ uuid.UUID, _ models.UserRole) (int, error) {
	return m.unread, nil
}
func (m *mockNotificationsRepo) MarkRead(_ context.Context, _ uuid.UUID, _ models.UserRole, _ uuid.UUID) (models.Notification, error) {
	return m.notification, nil
}
func (m *mockNotificationsRepo) MarkAllRead(_ context.Context, _ uuid.UUID, _ models.UserRole) (int, error) {
	return m.updated, nil
}
func (m *mockNotificationsRepo) CreateBookingReminder24h(_ context.Context, _, _ time.Time) (int64, error) {
	return 0, nil
}

func TestListNotifications(t *testing.T) {
	userID := uuid.New()
	item := models.Notification{
		ID: uuid.New(), UserID: userID, Role: models.ParentUserRole,
		Type: models.MessageReceivedNotificationType, Title: "New message", Body: "Body", CreatedAt: time.Now(),
	}
	pipe := NewNotificationsPipe(&mockNotificationsRepo{items: []models.Notification{item}, total: 1})

	res := pipe.List(context.Background(), userID, models.ParentUserRole, dtos.ListNotificationsQueryDTO{Page: 0, Limit: 999})
	if !res.Success || string(res.Message) != messages.Notifications_Listed {
		t.Fatalf("expected list success, got success=%v msg=%s", res.Success, res.Message)
	}
	if res.Data.Page != 1 || res.Data.Limit != 100 || res.Data.Total != 1 || len(res.Data.Items) != 1 {
		t.Fatalf("unexpected data: %+v", res.Data)
	}
}

func TestNotificationReadActions(t *testing.T) {
	userID := uuid.New()
	notificationID := uuid.New()
	readAt := time.Now()
	item := models.Notification{
		ID: notificationID, UserID: userID, Role: models.NannyUserRole,
		Type: models.BookingApprovedNotificationType, Title: "Title", Body: "Body", ReadAt: &readAt,
	}
	pipe := NewNotificationsPipe(&mockNotificationsRepo{notification: item, unread: 3, updated: 2})

	count := pipe.CountUnread(context.Background(), userID, models.NannyUserRole)
	if !count.Success || count.Data.Count != 3 {
		t.Fatalf("expected unread count 3, got %+v", count.Data)
	}

	read := pipe.MarkRead(context.Background(), userID, models.NannyUserRole, notificationID)
	if !read.Success || string(read.Message) != messages.Notification_Read || read.Data.ID != notificationID.String() {
		t.Fatalf("unexpected mark read response: success=%v msg=%s data=%+v", read.Success, read.Message, read.Data)
	}

	all := pipe.MarkAllRead(context.Background(), userID, models.NannyUserRole)
	if !all.Success || all.Data.Updated != 2 {
		t.Fatalf("expected updated=2, got %+v", all.Data)
	}
}
