package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/conversations/dtos"
	convmessages "github.com/kinsittr/kinsittr-api/conversations/messages"
	"github.com/kinsittr/kinsittr-api/models"
)

func (c *ConversationsController) List(ctx *fiber.Ctx) error {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok || userID == uuid.Nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "invalid_or_expired_token"})
	}
	role, ok := ctx.Locals("auth.role").(models.UserRole)
	if !ok {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{"success": false, "message": convmessages.Forbidden_Conversation_Access})
	}

	dto := dtos.ListConversationsQueryDTO{Page: 1, Limit: 20}
	if err := ctx.QueryParser(&dto); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": convmessages.Invalid_Message_Request})
	}

	res := c.pipe.List(ctx.Context(), userID, role, dto)
	if !res.Success {
		status := fiber.StatusBadRequest
		switch string(res.Message) {
		case convmessages.Conversation_Not_Found:
			status = fiber.StatusNotFound
		case convmessages.Forbidden_Conversation_Access:
			status = fiber.StatusForbidden
		}
		return ctx.Status(status).JSON(fiber.Map{"success": false, "message": string(res.Message)})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"success": true, "message": string(res.Message), "data": res.Data})
}
