package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
)

func (c *AdminController) LockConversation(ctx *fiber.Ctx) error {
	adminUserID, conversationID, dto, err := parseConversationAction(ctx)
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	res := c.pipe.LockConversation(ctx.Context(), adminUserID, conversationID, dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}
	return adminSuccess(ctx, string(res.Message), res.Data)
}

func (c *AdminController) UnlockConversation(ctx *fiber.Ctx) error {
	adminUserID, conversationID, dto, err := parseConversationAction(ctx)
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	res := c.pipe.UnlockConversation(ctx.Context(), adminUserID, conversationID, dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}
	return adminSuccess(ctx, string(res.Message), res.Data)
}

func (c *AdminController) HideConversationMessage(ctx *fiber.Ctx) error {
	adminUserID, conversationID, dto, err := parseConversationAction(ctx)
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	messageID, err := parseAdminID(ctx, "message_id")
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	res := c.pipe.HideMessage(ctx.Context(), adminUserID, conversationID, messageID, dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}
	return adminSuccess(ctx, string(res.Message), res.Data)
}

func parseConversationAction(ctx *fiber.Ctx) (uuid.UUID, uuid.UUID, dtos.AdminConversationActionDTO, error) {
	adminUserID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return uuid.Nil, uuid.Nil, dtos.AdminConversationActionDTO{}, fiber.ErrBadRequest
	}
	conversationID, err := parseAdminID(ctx, "id")
	if err != nil {
		return uuid.Nil, uuid.Nil, dtos.AdminConversationActionDTO{}, err
	}
	var dto dtos.AdminConversationActionDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return uuid.Nil, uuid.Nil, dtos.AdminConversationActionDTO{}, err
	}
	return adminUserID, conversationID, dto, nil
}
