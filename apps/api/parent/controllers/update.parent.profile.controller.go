package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/parent/dtos"
)

func (c *ParentController) UpdateOwnProfile(ctx *fiber.Ctx) error {
	userID, ok := parentAuth(ctx)
	if !ok {
		return parentAuthError(ctx)
	}

	var dto dtos.UpdateParentProfileDTO
	if err := parseAndValidate(ctx, &dto); err != nil {
		return validationError(ctx, err)
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
