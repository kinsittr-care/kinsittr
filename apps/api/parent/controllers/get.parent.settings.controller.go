package controllers

import "github.com/gofiber/fiber/v2"

func (c *ParentController) GetOwnSettings(ctx *fiber.Ctx) error {
	userID, ok := parentAuth(ctx)
	if !ok {
		return parentAuthError(ctx)
	}

	res := c.pipe.GetOwnSettings(ctx.Context(), userID)
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
