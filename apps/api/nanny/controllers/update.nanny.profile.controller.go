package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/nanny/dtos"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
	"github.com/kinsittr/kinsittr-api/shared/api"
)

func (c *NannyController) UpdateOwnProfile(ctx *fiber.Ctx) error {
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

	var dto dtos.UpdateNannyProfileDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body.",
		})
	}

	if ok, validationErr := api.ValidateAPIData(dto); !ok {
		return ctx.Status(validationErr.Code).JSON(fiber.Map{
			"success": false,
			"message": validationErr.Message,
		})
	}

	res := c.pipe.UpdateOwnProfile(ctx.Context(), userID, dto)
	if !res.Success {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
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
