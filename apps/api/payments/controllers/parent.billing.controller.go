package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/payments/dtos"
	"github.com/kinsittr/kinsittr-api/payments/messages"
)

func (c *PaymentsController) CreateParentSetupIntent(ctx *fiber.Ctx) error {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return paymentError(ctx, fiber.StatusBadRequest, messages.Invalid_Payment_Request)
	}
	res := c.pipe.CreateParentSetupIntent(ctx.Context(), userID)
	if !res.Success {
		return paymentError(ctx, paymentErrorStatus(string(res.Message)), string(res.Message))
	}
	return paymentSuccess(ctx, string(res.Message), res.Data)
}

func (c *PaymentsController) ListParentPaymentMethods(ctx *fiber.Ctx) error {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return paymentError(ctx, fiber.StatusBadRequest, messages.Invalid_Payment_Request)
	}
	res := c.pipe.ListParentPaymentMethods(ctx.Context(), userID)
	if !res.Success {
		return paymentError(ctx, paymentErrorStatus(string(res.Message)), string(res.Message))
	}
	return paymentSuccess(ctx, string(res.Message), res.Data)
}

func (c *PaymentsController) UpdateParentPaymentMethod(ctx *fiber.Ctx) error {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return paymentError(ctx, fiber.StatusBadRequest, messages.Invalid_Payment_Request)
	}
	var dto dtos.UpdatePaymentMethodDTO
	if err := ctx.BodyParser(&dto); err != nil {
		return paymentError(ctx, fiber.StatusBadRequest, messages.Invalid_Payment_Request)
	}
	res := c.pipe.UpdateParentPaymentMethod(ctx.Context(), userID, ctx.Params("id"), dto)
	if !res.Success {
		return paymentError(ctx, paymentErrorStatus(string(res.Message)), string(res.Message))
	}
	return paymentSuccess(ctx, string(res.Message), res.Data)
}

func (c *PaymentsController) DeleteParentPaymentMethod(ctx *fiber.Ctx) error {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return paymentError(ctx, fiber.StatusBadRequest, messages.Invalid_Payment_Request)
	}
	res := c.pipe.DeleteParentPaymentMethod(ctx.Context(), userID, ctx.Params("id"))
	if !res.Success {
		return paymentError(ctx, paymentErrorStatus(string(res.Message)), string(res.Message))
	}
	return paymentSuccess(ctx, string(res.Message), res.Data)
}
