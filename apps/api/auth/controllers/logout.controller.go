package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/auth/dtos"
	"github.com/kinsittr/kinsittr-api/shared/api"
)

func (c *AuthController) Logout(ctx *fiber.Ctx) error {
	var dto dtos.RefreshDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false, "message": "invalid_request_body",
		})
	}
	if ok, validErr := api.ValidateAPIData(dto); !ok {
		return ctx.Status(validErr.Code).JSON(fiber.Map{
			"success": false, "message": validErr.Message,
		})
	}
	res := c.pipe.Logout(ctx.Context(), dto)
	if !res.Success {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false, "message": string(res.Message),
		})
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true, "message": string(res.Message), "data": res.Data,
	})
}
