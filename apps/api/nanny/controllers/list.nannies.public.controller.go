package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/nanny/dtos"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
)

func (c *NannyController) ListPublic(ctx *fiber.Ctx) error {
	dto := dtos.ListPublicNanniesQuery{
		Page:  1,
		Limit: 12,
	}
	if err := ctx.QueryParser(&dto); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid query parameters.",
		})
	}

	res := c.pipe.ListPublic(ctx.Context(), dto)
	if !res.Success {
		status := fiber.StatusInternalServerError
		if string(res.Message) == messages.Invalid_Public_Query {
			status = fiber.StatusBadRequest
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
