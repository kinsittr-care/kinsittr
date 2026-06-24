package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func (c *NannyController) GetPublicByID(ctx *fiber.Ctx) error {
	nannyParam := ctx.Params("id")
	nannyID, err := uuid.Parse(nannyParam)
	var res any
	var success bool
	var message string
	if err == nil {
		pipeRes := c.pipe.GetPublicByID(ctx.Context(), nannyID)
		success = pipeRes.Success
		message = string(pipeRes.Message)
		res = pipeRes.Data
	} else {
		pipeRes := c.pipe.GetPublicBySlug(ctx.Context(), nannyParam)
		success = pipeRes.Success
		message = string(pipeRes.Message)
		res = pipeRes.Data
	}

	if !success {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": message,
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": message,
		"data":    res,
	})
}
