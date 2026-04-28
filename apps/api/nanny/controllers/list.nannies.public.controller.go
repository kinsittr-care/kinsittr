package controllers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func (c *NannyController) ListPublic(ctx *fiber.Ctx) error {
	page, _ := strconv.Atoi(ctx.Query("page", "1"))
	limit, _ := strconv.Atoi(ctx.Query("limit", "12"))

	res := c.pipe.ListPublic(ctx.Context(), page, limit)
	if !res.Success {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
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
