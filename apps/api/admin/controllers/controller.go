package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/messages"
	"github.com/kinsittr/kinsittr-api/admin/pipes"
)

type AdminController struct {
	pipe *pipes.AdminPipe
}

func NewAdminController(pipe *pipes.AdminPipe) *AdminController {
	return &AdminController{pipe: pipe}
}

func adminPipeError(ctx *fiber.Ctx, message string) error {
	status := fiber.StatusBadRequest
	switch message {
	case messages.Admin_Nanny_Not_Found, messages.Admin_Parent_Not_Found, messages.Admin_Booking_Not_Found, messages.Admin_Conversation_Not_Found, messages.Admin_Message_Not_Found, messages.Admin_User_Not_Found:
		status = fiber.StatusNotFound
	case messages.Admin_Screening_Closed, messages.Admin_Booking_Action_Blocked, messages.Admin_Nanny_Action_Blocked, messages.Admin_Account_Action_Blocked:
		status = fiber.StatusConflict
	}
	return ctx.Status(status).JSON(fiber.Map{
		"success": false,
		"message": message,
	})
}

func parseAdminID(ctx *fiber.Ctx, param string) (uuid.UUID, error) {
	return uuid.Parse(ctx.Params(param))
}

func adminSuccess(ctx *fiber.Ctx, message string, data any) error {
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": message,
		"data":    data,
	})
}
