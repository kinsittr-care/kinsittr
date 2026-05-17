package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/auth/dtos"
	"github.com/kinsittr/kinsittr-api/auth/messages"
	"github.com/kinsittr/kinsittr-api/shared/api"
)

func (c *AuthController) ChangePassword(ctx *fiber.Ctx) error {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok || userID == uuid.Nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": messages.Invalid_Or_Expired_Token,
		})
	}

	var dto dtos.ChangePasswordDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "invalid_request_body",
		})
	}
	if ok, validErr := api.ValidateAPIData(dto); !ok {
		return ctx.Status(validErr.Code).JSON(fiber.Map{
			"success": false,
			"message": validErr.Message,
		})
	}

	res := c.pipe.ChangePassword(ctx.Context(), userID, dto)
	if !res.Success {
		status := fiber.StatusBadRequest
		if string(res.Message) == messages.Invalid_Password {
			status = fiber.StatusUnauthorized
		}
		return ctx.Status(status).JSON(fiber.Map{
			"success": false,
			"message": string(res.Message),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": string(res.Message),
		"data":    res.Data,
	})
}
