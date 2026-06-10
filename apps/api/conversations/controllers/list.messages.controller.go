package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/conversations/dtos"
	conversation_messages "github.com/kinsittr/kinsittr-api/conversations/messages"
	"github.com/kinsittr/kinsittr-api/models"
)

func (c *ConversationsController) ListMessages(ctx *fiber.Ctx) error {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok || userID == uuid.Nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "invalid_or_expired_token"})
	}
	role, ok := ctx.Locals("auth.role").(models.UserRole)
	if !ok {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{"success": false, "message": conversation_messages.Forbidden_Conversation_Access})
	}
	conversationID, err := uuid.Parse(ctx.Params("id"))
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": conversation_messages.Invalid_Message_Request})
	}

	dto := dtos.ListMessagesQueryDTO{Page: 1, Limit: 50}
	if err := ctx.QueryParser(&dto); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": conversation_messages.Invalid_Message_Request})
	}

	res := c.pipe.ListMessages(ctx.Context(), userID, role, conversationID, dto)
	if !res.Success {
		status := fiber.StatusBadRequest
		switch string(res.Message) {
		case conversation_messages.Conversation_Not_Found:
			status = fiber.StatusNotFound
		case conversation_messages.Forbidden_Conversation_Access:
			status = fiber.StatusForbidden
		}
		return ctx.Status(status).JSON(fiber.Map{"success": false, "message": string(res.Message)})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"success": true, "message": string(res.Message), "data": res.Data})
}
