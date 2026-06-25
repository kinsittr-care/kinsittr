package controllers

import (
	"context"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/notifications/pipes"
	"github.com/kinsittr/kinsittr-api/repositories/notifications"
)

type mockNotificationsRepo struct {
	notification models.Notification
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
func (m *mockNotificationsRepo) List(_ context.Context, userID uuid.UUID, role models.UserRole, _ notifications.ListNotificationsFilter) ([]models.Notification, int, error) {
	item := models.Notification{ID: uuid.New(), UserID: userID, Role: role, Type: models.MessageReceivedNotificationType, Title: "Title", Body: "Body", CreatedAt: time.Now()}
	return []models.Notification{item}, 1, nil
}
func (m *mockNotificationsRepo) CountUnread(context.Context, uuid.UUID, models.UserRole) (int, error) {
	return 2, nil
}
func (m *mockNotificationsRepo) MarkRead(context.Context, uuid.UUID, models.UserRole, uuid.UUID) (models.Notification, error) {
	return m.notification, nil
}
func (m *mockNotificationsRepo) MarkAllRead(context.Context, uuid.UUID, models.UserRole) (int, error) {
	return 2, nil
}
func (m *mockNotificationsRepo) CreateBookingReminder24h(context.Context, time.Time, time.Time) (int64, error) {
	return 0, nil
}

func notificationsTestApp(role models.UserRole, notification models.Notification) *fiber.App {
	app := fiber.New()
	controller := NewNotificationsController(pipes.NewNotificationsPipe(&mockNotificationsRepo{notification: notification}))
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("auth.user_id", uuid.New())
		c.Locals("auth.role", role)
		return c.Next()
	})
	app.Get("/notifications", controller.List)
	app.Get("/notifications/unread-count", controller.CountUnread)
	app.Patch("/notifications/:id/read", controller.MarkRead)
	app.Patch("/notifications/read-all", controller.MarkAllRead)
	return app
}

func TestNotificationsControllerListAndCount(t *testing.T) {
	app := notificationsTestApp(models.ParentUserRole, models.Notification{})
	for _, path := range []string{"/notifications", "/notifications/unread-count"} {
		resp, err := app.Test(httptest.NewRequest(fiber.MethodGet, path, nil))
		if err != nil {
			t.Fatal(err)
		}
		if resp.StatusCode != fiber.StatusOK {
			t.Fatalf("%s expected 200, got %d", path, resp.StatusCode)
		}
	}
}

func TestNotificationsControllerMarkRead(t *testing.T) {
	notificationID := uuid.New()
	app := notificationsTestApp(models.NannyUserRole, models.Notification{
		ID: notificationID, UserID: uuid.New(), Role: models.NannyUserRole,
		Type: models.BookingRequestedNotificationType, Title: "Title", Body: "Body",
	})
	resp, err := app.Test(httptest.NewRequest(fiber.MethodPatch, "/notifications/"+notificationID.String()+"/read", nil))
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != fiber.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
}
