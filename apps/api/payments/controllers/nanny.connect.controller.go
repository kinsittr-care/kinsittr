package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/payments/dtos"
	"github.com/kinsittr/kinsittr-api/payments/messages"
	"github.com/kinsittr/kinsittr-api/shared/api"
)

func (c *PaymentsController) CreateNannyConnectLink(ctx *fiber.Ctx) error {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return paymentError(ctx, fiber.StatusBadRequest, messages.Invalid_Payment_Request)
	}
	res := c.pipe.CreateNannyConnectLink(ctx.Context(), userID)
	if !res.Success {
		return paymentError(ctx, paymentErrorStatus(string(res.Message)), string(res.Message))
	}
	return paymentSuccess(ctx, string(res.Message), res.Data)
}

func (c *PaymentsController) GetNannyStripeStatus(ctx *fiber.Ctx) error {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return paymentError(ctx, fiber.StatusBadRequest, messages.Invalid_Payment_Request)
	}
	res := c.pipe.GetNannyStripeStatus(ctx.Context(), userID)
	if !res.Success {
		return paymentError(ctx, paymentErrorStatus(string(res.Message)), string(res.Message))
	}
	return paymentSuccess(ctx, string(res.Message), res.Data)
}

func (c *PaymentsController) GetNannyStripeBalance(ctx *fiber.Ctx) error {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return paymentError(ctx, fiber.StatusBadRequest, messages.Invalid_Payment_Request)
	}
	res := c.pipe.GetNannyStripeBalance(ctx.Context(), userID)
	if !res.Success {
		return paymentError(ctx, paymentErrorStatus(string(res.Message)), string(res.Message))
	}
	return paymentSuccess(ctx, string(res.Message), res.Data)
}

func (c *PaymentsController) ListNannyStripePayouts(ctx *fiber.Ctx) error {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return paymentError(ctx, fiber.StatusBadRequest, messages.Invalid_Payment_Request)
	}
	limit := ctx.QueryInt("limit", 10)
	res := c.pipe.ListNannyStripePayouts(ctx.Context(), userID, limit, ctx.Query("starting_after"))
	if !res.Success {
		return paymentError(ctx, paymentErrorStatus(string(res.Message)), string(res.Message))
	}
	return paymentSuccess(ctx, string(res.Message), res.Data)
}

func (c *PaymentsController) GetNannyPayoutSettings(ctx *fiber.Ctx) error {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return paymentError(ctx, fiber.StatusBadRequest, messages.Invalid_Payment_Request)
	}
	res := c.pipe.GetNannyPayoutSettings(ctx.Context(), userID)
	if !res.Success {
		return paymentError(ctx, paymentErrorStatus(string(res.Message)), string(res.Message))
	}
	return paymentSuccess(ctx, string(res.Message), res.Data)
}

func (c *PaymentsController) UpdateNannyPayoutSettings(ctx *fiber.Ctx) error {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return paymentError(ctx, fiber.StatusBadRequest, messages.Invalid_Payment_Request)
	}
	var dto dtos.UpdateNannyPayoutSettingsDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return paymentError(ctx, fiber.StatusBadRequest, messages.Invalid_Payment_Request)
	}
	if ok, validationErr := api.ValidateAPIData(dto); !ok {
		return paymentError(ctx, validationErr.Code, validationErr.Message)
	}
	res := c.pipe.UpdateNannyPayoutSettings(ctx.Context(), userID, dto)
	if !res.Success {
		return paymentError(ctx, paymentErrorStatus(string(res.Message)), string(res.Message))
	}
	return paymentSuccess(ctx, string(res.Message), res.Data)
}
