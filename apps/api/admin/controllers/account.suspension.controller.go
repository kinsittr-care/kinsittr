package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
)

func (c *AdminController) SuspendNanny(ctx *fiber.Ctx) error {
	adminUserID, profileID, dto, err := parseAccountAction(ctx)
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	res := c.pipe.SuspendNanny(ctx.Context(), adminUserID, profileID, dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}
	return adminSuccess(ctx, string(res.Message), res.Data)
}

func (c *AdminController) SuspendParent(ctx *fiber.Ctx) error {
	adminUserID, profileID, dto, err := parseAccountAction(ctx)
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	res := c.pipe.SuspendParent(ctx.Context(), adminUserID, profileID, dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}
	return adminSuccess(ctx, string(res.Message), res.Data)
}

func (c *AdminController) ReactivateNanny(ctx *fiber.Ctx) error {
	adminUserID, profileID, dto, err := parseAccountAction(ctx)
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	res := c.pipe.ReactivateNanny(ctx.Context(), adminUserID, profileID, dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}
	return adminSuccess(ctx, string(res.Message), res.Data)
}

func (c *AdminController) ReactivateParent(ctx *fiber.Ctx) error {
	adminUserID, profileID, dto, err := parseAccountAction(ctx)
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	res := c.pipe.ReactivateParent(ctx.Context(), adminUserID, profileID, dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}
	return adminSuccess(ctx, string(res.Message), res.Data)
}

func parseAccountAction(ctx *fiber.Ctx) (uuid.UUID, uuid.UUID, dtos.AdminAccountActionDTO, error) {
	adminUserID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return uuid.Nil, uuid.Nil, dtos.AdminAccountActionDTO{}, fiber.ErrBadRequest
	}
	profileID, err := parseAdminID(ctx, "id")
	if err != nil {
		return uuid.Nil, uuid.Nil, dtos.AdminAccountActionDTO{}, err
	}
	var dto dtos.AdminAccountActionDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return uuid.Nil, uuid.Nil, dtos.AdminAccountActionDTO{}, err
	}
	return adminUserID, profileID, dto, nil
}
