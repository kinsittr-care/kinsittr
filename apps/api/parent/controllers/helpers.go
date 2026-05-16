package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/parent/messages"
	"github.com/kinsittr/kinsittr-api/shared/api"
)

func parentAuth(ctx *fiber.Ctx) (uuid.UUID, bool) {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok || userID == uuid.Nil {
		return uuid.Nil, false
	}

	role, ok := ctx.Locals("auth.role").(models.UserRole)
	if !ok || role != models.ParentUserRole {
		return uuid.Nil, false
	}

	return userID, true
}

func parentAuthError(ctx *fiber.Ctx) error {
	return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
		"success": false,
		"message": messages.Forbidden_Profile,
	})
}

func parseAndValidate(ctx *fiber.Ctx, dto any) error {
	if err := ctx.BodyParser(dto); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid_request_body")
	}
	if ok, validationErr := api.ValidateAPIData(dto); !ok {
		return validationErr
	}
	return nil
}

func validationError(ctx *fiber.Ctx, err error) error {
	if fiberErr, ok := err.(*fiber.Error); ok {
		return ctx.Status(fiberErr.Code).JSON(fiber.Map{
			"success": false,
			"message": fiberErr.Message,
		})
	}

	return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
		"success": false,
		"message": err.Error(),
	})
}
