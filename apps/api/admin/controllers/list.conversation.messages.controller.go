package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/admin/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
)

func (c *AdminController) ListConversationMessages(ctx *fiber.Ctx) error {
	conversationID, err := parseAdminID(ctx, "id")
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}

	dto := dtos.ListAdminMessagesQueryDTO{Page: 1, Limit: 50}
	if err := ctx.QueryParser(&dto); err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}

	res := c.pipe.ListConversationMessages(ctx.Context(), conversationID, dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}

	return adminSuccess(ctx, string(res.Message), res.Data)
}
