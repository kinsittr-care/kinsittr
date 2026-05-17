package controllers

import "github.com/gofiber/fiber/v2"

func (c *ParentController) GetOwnProfile(ctx *fiber.Ctx) error {
	userID, ok := parentAuth(ctx)
	if !ok {
		return parentAuthError(ctx)
	}

	res := c.pipe.GetOwnProfile(ctx.Context(), userID)
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
