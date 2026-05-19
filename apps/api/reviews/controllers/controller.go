package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/reviews/messages"
	"github.com/kinsittr/kinsittr-api/reviews/pipes"
)

type ReviewsController struct {
	pipe *pipes.ReviewsPipe
}

func NewReviewsController(pipe *pipes.ReviewsPipe) *ReviewsController {
	return &ReviewsController{pipe: pipe}
}

func reviewAuth(ctx *fiber.Ctx, expectedRole models.UserRole) (uuid.UUID, bool) {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok || userID == uuid.Nil {
		_ = ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "invalid_or_expired_token"})
		return uuid.Nil, false
	}
	role, ok := ctx.Locals("auth.role").(models.UserRole)
	if !ok || role != expectedRole {
		_ = ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{"success": false, "message": messages.Forbidden_Review_Access})
		return uuid.Nil, false
	}
	return userID, true
}

func reviewIDParam(ctx *fiber.Ctx, name string) (uuid.UUID, bool) {
	id, err := uuid.Parse(ctx.Params(name))
	if err != nil {
		_ = ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": messages.Invalid_Review_Request})
		return uuid.Nil, false
	}
	return id, true
}

func reviewPipeError(ctx *fiber.Ctx, message string) error {
	status := fiber.StatusBadRequest
	switch message {
	case messages.Review_Not_Found, messages.Booking_Not_Found, messages.Parent_Profile_Not_Found, messages.Nanny_Profile_Not_Found:
		status = fiber.StatusNotFound
	case messages.Review_Already_Exists, messages.Cannot_Review_Booking:
		status = fiber.StatusConflict
	case messages.Forbidden_Review_Access:
		status = fiber.StatusForbidden
	}
	return ctx.Status(status).JSON(fiber.Map{"success": false, "message": message})
}

func reviewSuccess(ctx *fiber.Ctx, status int, message string, data any) error {
	return ctx.Status(status).JSON(fiber.Map{"success": true, "message": message, "data": data})
}
