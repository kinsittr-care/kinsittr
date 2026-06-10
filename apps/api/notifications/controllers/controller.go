package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/notifications/messages"
	"github.com/kinsittr/kinsittr-api/notifications/pipes"
)

type NotificationsController struct {
	pipe *pipes.NotificationsPipe
}

func NewNotificationsController(pipe *pipes.NotificationsPipe) *NotificationsController {
	return &NotificationsController{pipe: pipe}
}

func notificationAuth(ctx *fiber.Ctx) (uuid.UUID, models.UserRole, bool) {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok || userID == uuid.Nil {
		_ = ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "invalid_or_expired_token"})
		return uuid.Nil, "", false
	}
	role, ok := ctx.Locals("auth.role").(models.UserRole)
	if !ok || (role != models.ParentUserRole && role != models.NannyUserRole) {
		_ = ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{"success": false, "message": messages.Forbidden_Notifications_Access})
		return uuid.Nil, "", false
	}
	return userID, role, true
}

func notificationPipeError(ctx *fiber.Ctx, message string) error {
	status := fiber.StatusBadRequest
	switch message {
	case messages.Forbidden_Notifications_Access:
		status = fiber.StatusForbidden
	case messages.Notification_Not_Found:
		status = fiber.StatusNotFound
	}
	return ctx.Status(status).JSON(fiber.Map{"success": false, "message": message})
}
