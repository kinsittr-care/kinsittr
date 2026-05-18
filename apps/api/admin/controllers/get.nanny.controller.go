package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/admin/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
)

func (c *AdminController) GetNanny(ctx *fiber.Ctx) error {
	nannyID, err := parseAdminID(ctx, "id")
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}

	dto := dtos.ListAdminBookingsQueryDTO{Page: 1, Limit: 10}
	if err := ctx.QueryParser(&dto); err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}

	res := c.pipe.GetNanny(ctx.Context(), nannyID, dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}

	return adminSuccess(ctx, string(res.Message), res.Data)
}
