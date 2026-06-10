package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/notifications/dtos"
)

func (c *NotificationsController) List(ctx *fiber.Ctx) error {
	userID, role, ok := notificationAuth(ctx)
	if !ok {
		return nil
	}

	dto := dtos.ListNotificationsQueryDTO{Page: 1, Limit: 20}
	if err := ctx.QueryParser(&dto); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "invalid_query_parameters"})
	}

	res := c.pipe.List(ctx.Context(), userID, role, dto)
	if !res.Success {
		return notificationPipeError(ctx, string(res.Message))
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"success": true, "message": string(res.Message), "data": res.Data})
}
