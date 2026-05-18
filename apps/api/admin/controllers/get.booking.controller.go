package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/admin/messages"
)

func (c *AdminController) GetBooking(ctx *fiber.Ctx) error {
	bookingID, err := parseAdminID(ctx, "id")
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}

	res := c.pipe.GetBooking(ctx.Context(), bookingID)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}

	return adminSuccess(ctx, string(res.Message), res.Data)
}
