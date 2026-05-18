package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/admin/dtos"
	"github.com/kinsittr/kinsittr-api/admin/messages"
)

func (c *AdminController) CancelBooking(ctx *fiber.Ctx) error {
	adminUserID, bookingID, dto, err := parseBookingAction(ctx)
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}

	res := c.pipe.CancelBooking(ctx.Context(), adminUserID, bookingID, dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}

	return adminSuccess(ctx, string(res.Message), res.Data)
}

func (c *AdminController) CompleteBooking(ctx *fiber.Ctx) error {
	adminUserID, bookingID, dto, err := parseBookingAction(ctx)
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}

	res := c.pipe.CompleteBooking(ctx.Context(), adminUserID, bookingID, dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}

	return adminSuccess(ctx, string(res.Message), res.Data)
}

func (c *AdminController) ListBookingActions(ctx *fiber.Ctx) error {
	bookingID, err := parseAdminID(ctx, "id")
	if err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}
	dto := dtos.ListAdminMessagesQueryDTO{Page: 1, Limit: 20}
	if err := ctx.QueryParser(&dto); err != nil {
		return adminPipeError(ctx, messages.Invalid_Admin_Request)
	}

	res := c.pipe.ListBookingActions(ctx.Context(), bookingID, dto)
	if !res.Success {
		return adminPipeError(ctx, string(res.Message))
	}

	return adminSuccess(ctx, string(res.Message), res.Data)
}

func parseBookingAction(ctx *fiber.Ctx) (uuid.UUID, uuid.UUID, dtos.AdminBookingActionDTO, error) {
	adminUserID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return uuid.Nil, uuid.Nil, dtos.AdminBookingActionDTO{}, fiber.ErrBadRequest
	}
	bookingID, err := parseAdminID(ctx, "id")
	if err != nil {
		return uuid.Nil, uuid.Nil, dtos.AdminBookingActionDTO{}, err
	}
	var dto dtos.AdminBookingActionDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return uuid.Nil, uuid.Nil, dtos.AdminBookingActionDTO{}, err
	}
	return adminUserID, bookingID, dto, nil
}
