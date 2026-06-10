package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/admin/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
)

func (c *AdminController) ListConversations(ctx *fiber.Ctx) error {
	dto := dtos.ListAdminConversationsQueryDTO{Page: 1, Limit: 20}
	if err := ctx.QueryParser(&dto); err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}

	res := c.pipe.ListConversations(ctx.Context(), dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}

	return adminSuccess(ctx, string(res.Message), res.Data)
}
