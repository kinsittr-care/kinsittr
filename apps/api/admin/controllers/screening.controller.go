package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
)

func (c *AdminController) ListScreeningNannies(ctx *fiber.Ctx) error {
	dto := dtos.ListAdminNanniesQueryDTO{Page: 1, Limit: 20}
	if err := ctx.QueryParser(&dto); err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}

	res := c.pipe.ListScreeningNannies(ctx.Context(), dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}

	return adminSuccess(ctx, string(res.Message), res.Data)
}

func (c *AdminController) UpdateScreeningSteps(ctx *fiber.Ctx) error {
	nannyID, err := parseAdminID(ctx, "id")
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}

	var dto dtos.UpdateScreeningStepsDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}

	res := c.pipe.UpdateScreeningSteps(ctx.Context(), nannyID, dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}

	return adminSuccess(ctx, string(res.Message), res.Data)
}

func (c *AdminController) StartScreening(ctx *fiber.Ctx) error {
	adminUserID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	nannyID, err := parseAdminID(ctx, "id")
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}

	res := c.pipe.StartScreening(ctx.Context(), adminUserID, nannyID)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}

	return adminSuccess(ctx, string(res.Message), res.Data)
}

func (c *AdminController) ResetScreening(ctx *fiber.Ctx) error {
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

	res := c.pipe.ResetScreening(ctx.Context(), adminUserID, nannyID, dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}

	return adminSuccess(ctx, string(res.Message), res.Data)
}
