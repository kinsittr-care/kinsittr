package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/notifications/messages"
)

func (c *NotificationsController) CountUnread(ctx *fiber.Ctx) error {
	userID, role, ok := notificationAuth(ctx)
	if !ok {
		return nil
	}
	res := c.pipe.CountUnread(ctx.Context(), userID, role)
	if !res.Success {
		return notificationPipeError(ctx, string(res.Message))
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"success": true, "message": string(res.Message), "data": res.Data})
}

func (c *NotificationsController) MarkRead(ctx *fiber.Ctx) error {
	userID, role, ok := notificationAuth(ctx)
	if !ok {
		return nil
	}
	notificationID, err := uuid.Parse(ctx.Params("id"))
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": messages.Invalid_Notification_Request})
	}
	res := c.pipe.MarkRead(ctx.Context(), userID, role, notificationID)
	if !res.Success {
		return notificationPipeError(ctx, string(res.Message))
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"success": true, "message": string(res.Message), "data": res.Data})
}

func (c *NotificationsController) MarkAllRead(ctx *fiber.Ctx) error {
	userID, role, ok := notificationAuth(ctx)
	if !ok {
		return nil
	}
	res := c.pipe.MarkAllRead(ctx.Context(), userID, role)
	if !res.Success {
		return notificationPipeError(ctx, string(res.Message))
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"success": true, "message": string(res.Message), "data": res.Data})
}
