package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/contact/dtos"
	"github.com/kinsittr/kinsittr-api/contact/pipes"
	"github.com/kinsittr/kinsittr-api/shared/api"
)

type ContactController struct {
	pipe *pipes.ContactPipe
}

func NewContactController(pipe *pipes.ContactPipe) *ContactController {
	return &ContactController{pipe: pipe}
}

func (c *ContactController) Send(ctx *fiber.Ctx) error {
	var dto dtos.ContactDTO
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

	res := c.pipe.SendContactMessage(ctx.Context(), dto)
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
