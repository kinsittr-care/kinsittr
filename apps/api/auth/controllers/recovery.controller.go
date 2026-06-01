package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/auth/dtos"
	"github.com/kinsittr/kinsittr-api/auth/messages"
	"github.com/kinsittr/kinsittr-api/shared/api"
)

func (c *AuthController) RequestRecovery(ctx *fiber.Ctx) error {
	var dto dtos.RecoveryRequestDTO
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

	res := c.pipe.RequestRecovery(ctx.Context(), dto, ctx.IP())
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

func (c *AuthController) VerifyRecovery(ctx *fiber.Ctx) error {
	var dto dtos.RecoveryVerifyDTO
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

	res := c.pipe.VerifyRecovery(ctx.Context(), dto)
	if !res.Success {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
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

func (c *AuthController) ResetRecovery(ctx *fiber.Ctx) error {
	var dto dtos.RecoveryResetDTO
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

	res := c.pipe.ResetRecoveryPassword(ctx.Context(), dto)
	if !res.Success {
		status := fiber.StatusBadRequest
		if string(res.Message) == messages.Invalid_Recovery_Token {
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
