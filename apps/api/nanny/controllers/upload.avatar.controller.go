package controllers

import (
	"io"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
)

func (c *NannyController) UploadAvatar(ctx *fiber.Ctx) error {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok || userID == uuid.Nil {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "invalid_or_expired_token",
		})
	}

	role, ok := ctx.Locals("auth.role").(models.UserRole)
	if !ok || role != models.NannyUserRole {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": messages.Forbidden_Profile,
		})
	}

	file, err := ctx.FormFile("avatar")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": messages.Avatar_Invalid_File,
		})
	}

	f, err := file.Open()
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": messages.Avatar_Invalid_File,
		})
	}
	defer f.Close()

	data, err := io.ReadAll(f)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": messages.Avatar_Invalid_File,
		})
	}

	res := c.pipe.UploadAvatar(ctx.Context(), userID, data)
	if !res.Success {
		status := fiber.StatusBadRequest
		msg := string(res.Message)
		if msg == messages.Cloudinary_Not_Configured {
			status = fiber.StatusServiceUnavailable
		}
		return ctx.Status(status).JSON(fiber.Map{
			"success": false,
			"message": msg,
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": string(res.Message),
		"data":    res.Data,
	})
}
