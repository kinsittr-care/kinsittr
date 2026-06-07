package controllers

import (
	"io"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/models"
	"github.com/kinsittr/kinsittr-api/nanny/messages"
	"github.com/kinsittr/kinsittr-api/nanny/pipes"
)

const maxDocumentUploadBytes = 10 * 1024 * 1024 // 10 MB

func (c *NannyController) ListDocuments(ctx *fiber.Ctx) error {
	userID, ok := authorizedNannyUserID(ctx)
	if !ok {
		return nannyAuthError(ctx)
	}

	res := c.pipe.ListDocuments(ctx.Context(), userID)
	if !res.Success {
		return ctx.Status(nannyDocumentErrorStatus(string(res.Message))).JSON(fiber.Map{
			"success": false,
			"message": string(res.Message),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": string(res.Message),
		"data":    res.Data,
	})
}

func (c *NannyController) UploadDocument(ctx *fiber.Ctx) error {
	userID, ok := authorizedNannyUserID(ctx)
	if !ok {
		return nannyAuthError(ctx)
	}

	file, err := ctx.FormFile("document")
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": messages.Document_Invalid_File,
		})
	}

	f, err := file.Open()
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": messages.Document_Invalid_File,
		})
	}
	defer f.Close()

	data, err := io.ReadAll(io.LimitReader(f, maxDocumentUploadBytes+1))
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": messages.Document_Invalid_File,
		})
	}
	if len(data) > maxDocumentUploadBytes {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": messages.Document_Too_Large,
		})
	}

	res := c.pipe.UploadDocument(ctx.Context(), userID, pipes.UploadDocumentInput{
		FileName: file.Filename,
		Data:     data,
	})
	if !res.Success {
		return ctx.Status(nannyDocumentErrorStatus(string(res.Message))).JSON(fiber.Map{
			"success": false,
			"message": string(res.Message),
		})
	}

	return ctx.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": string(res.Message),
		"data":    res.Data,
	})
}

func (c *NannyController) DeleteDocument(ctx *fiber.Ctx) error {
	userID, ok := authorizedNannyUserID(ctx)
	if !ok {
		return nannyAuthError(ctx)
	}

	documentID, err := uuid.Parse(ctx.Params("id"))
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": messages.Document_Not_Found,
		})
	}

	res := c.pipe.DeleteDocument(ctx.Context(), userID, documentID)
	if !res.Success {
		return ctx.Status(nannyDocumentErrorStatus(string(res.Message))).JSON(fiber.Map{
			"success": false,
			"message": string(res.Message),
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": string(res.Message),
		"data":    res.Data,
	})
}

func authorizedNannyUserID(ctx *fiber.Ctx) (uuid.UUID, bool) {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok || userID == uuid.Nil {
		return uuid.Nil, false
	}

	role, ok := ctx.Locals("auth.role").(models.UserRole)
	if !ok || role != models.NannyUserRole {
		return uuid.Nil, false
	}

	return userID, true
}

func nannyAuthError(ctx *fiber.Ctx) error {
	if role, ok := ctx.Locals("auth.role").(models.UserRole); ok && role != models.NannyUserRole {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": messages.Forbidden_Profile,
		})
	}
	return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
		"success": false,
		"message": "invalid_or_expired_token",
	})
}

func nannyDocumentErrorStatus(message string) int {
	switch message {
	case messages.Cloudinary_Not_Configured:
		return fiber.StatusServiceUnavailable
	case messages.Nanny_Not_Found, messages.Document_Not_Found:
		return fiber.StatusNotFound
	case messages.Document_Upload_Failed, messages.Document_Delete_Failed:
		return fiber.StatusInternalServerError
	default:
		return fiber.StatusBadRequest
	}
}
