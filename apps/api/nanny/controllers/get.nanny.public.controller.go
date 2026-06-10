package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
)

func (c *NannyController) GetPublicByID(ctx *fiber.Ctx) error {
	nannyID, err := uuid.Parse(ctx.Params("id"))
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": messages.Invalid_Nanny_ID,
		})
	}

	res := c.pipe.GetPublicByID(ctx.Context(), nannyID)
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
