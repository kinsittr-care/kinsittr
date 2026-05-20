package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
)

func (c *AdminController) ListAdmins(ctx *fiber.Ctx) error {
	dto := dtos.ListAdminMessagesQueryDTO{Page: 1, Limit: 20}
	if err := ctx.QueryParser(&dto); err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	res := c.pipe.ListAdmins(ctx.Context(), dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}
	return adminSuccess(ctx, string(res.Message), res.Data)
}

func (c *AdminController) InviteAdmin(ctx *fiber.Ctx) error {
	invitedBy, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	var dto dtos.InviteAdminDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	res := c.pipe.InviteAdmin(ctx.Context(), invitedBy, dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}
	return adminSuccess(ctx, string(res.Message), res.Data)
}

func (c *AdminController) AcceptAdminInvite(ctx *fiber.Ctx) error {
	var dto dtos.AcceptAdminInviteDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	res := c.pipe.AcceptAdminInvite(ctx.Context(), dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}
	return adminSuccess(ctx, string(res.Message), res.Data)
}

func (c *AdminController) DisableAdmin(ctx *fiber.Ctx) error {
	currentAdminID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	targetAdminID, err := parseAdminID(ctx, "id")
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	res := c.pipe.DisableAdmin(ctx.Context(), currentAdminID, targetAdminID)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}
	return adminSuccess(ctx, string(res.Message), res.Data)
}
