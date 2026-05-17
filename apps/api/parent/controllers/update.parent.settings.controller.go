package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/parent/dtos"
)

func (c *ParentController) UpdateOwnSettings(ctx *fiber.Ctx) error {
	userID, ok := parentAuth(ctx)
	if !ok {
		return parentAuthError(ctx)
	}

	var dto dtos.UpdateParentSettingsDTO
	if err := parseAndValidate(ctx, &dto); err != nil {
		return validationError(ctx, err)
	}

	res := c.pipe.UpdateOwnSettings(ctx.Context(), userID, dto)
	if !res.Success {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
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
