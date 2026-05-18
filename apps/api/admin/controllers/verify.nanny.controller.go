package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
)

func (c *AdminController) VerifyNanny(ctx *fiber.Ctx) error {
	adminUserID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	nannyID, err := parseAdminID(ctx, "id")
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}

	res := c.pipe.VerifyNanny(ctx.Context(), adminUserID, nannyID)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}

	return adminSuccess(ctx, string(res.Message), res.Data)
}

func (c *AdminController) RejectNanny(ctx *fiber.Ctx) error {
	adminUserID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	nannyID, err := parseAdminID(ctx, "id")
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	var dto dtos.AdminNannyActionDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}

	res := c.pipe.RejectNanny(ctx.Context(), adminUserID, nannyID, dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}

	return adminSuccess(ctx, string(res.Message), res.Data)
}
