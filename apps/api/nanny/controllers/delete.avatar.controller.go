package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
)

func (c *NannyController) DeleteAvatar(ctx *fiber.Ctx) error {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok || userID == uuid.Nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "invalid_or_expired_token",
		})
	}

	role, ok := ctx.Locals("auth.role").(models.UserRole)
	if !ok || role != models.NannyUserRole {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": messages.Forbidden_Profile,
		})
	}

	res := c.pipe.DeleteAvatar(ctx.Context(), userID)
	if !res.Success {
		status := fiber.StatusBadRequest
		msg := string(res.Message)
		if msg == messages.Cloudinary_Not_Configured {
			status = fiber.StatusServiceUnavailable
		}
		return ctx.Status(status).JSON(fiber.Map{
			"success": false,
			"message": msg,
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": string(res.Message),
		"data":    res.Data,
	})
}
