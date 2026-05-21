package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
)

func (c *AdminController) ListNannyActions(ctx *fiber.Ctx) error {
	id, dto, err := parseAuditActionQuery(ctx)
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	res := c.pipe.ListNannyActions(ctx.Context(), id, dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}
	return adminSuccess(ctx, string(res.Message), res.Data)
}

func (c *AdminController) ListParentActions(ctx *fiber.Ctx) error {
	id, dto, err := parseAuditActionQuery(ctx)
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	res := c.pipe.ListParentActions(ctx.Context(), id, dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}
	return adminSuccess(ctx, string(res.Message), res.Data)
}

func (c *AdminController) ListConversationActions(ctx *fiber.Ctx) error {
	id, dto, err := parseAuditActionQuery(ctx)
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	res := c.pipe.ListConversationActions(ctx.Context(), id, dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}
	return adminSuccess(ctx, string(res.Message), res.Data)
}

func parseAuditActionQuery(ctx *fiber.Ctx) (id uuid.UUID, dto dtos.ListAdminMessagesQueryDTO, err error) {
	id, err = parseAdminID(ctx, "id")
	if err != nil {
		return uuid.Nil, dto, err
	}
	dto = dtos.ListAdminMessagesQueryDTO{Page: 1, Limit: 20}
	if err = ctx.QueryParser(&dto); err != nil {
		return uuid.Nil, dto, err
	}
	return id, dto, nil
}
