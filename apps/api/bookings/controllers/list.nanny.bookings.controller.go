package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/bookings/dtos"
	"github.com/kinsittr/kinsittr-api/bookings/messages"
	"github.com/kinsittr/kinsittr-api/models"
)

func (c *BookingsController) ListForNanny(ctx *fiber.Ctx) error {
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
			"message": messages.Forbidden_Booking_Access,
		})
	}

	dto := dtos.ListBookingsQueryDTO{
		Page:  1,
		Limit: 20,
	}
	if err := ctx.QueryParser(&dto); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": messages.Invalid_Booking_Request,
		})
	}

	res := c.pipe.ListForNanny(ctx.Context(), userID, dto)
	if !res.Success {
		status := fiber.StatusBadRequest
		if string(res.Message) == messages.Nanny_Profile_Not_Found {
			status = fiber.StatusNotFound
		}
		return ctx.Status(status).JSON(fiber.Map{
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
