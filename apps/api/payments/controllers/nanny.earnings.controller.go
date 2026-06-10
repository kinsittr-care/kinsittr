package controllers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/kinsittr/kinsittr-api/payments/messages"
)

func (c *PaymentsController) GetNannyEarningsSummary(ctx *fiber.Ctx) error {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return paymentError(ctx, fiber.StatusBadRequest, messages.Invalid_Payment_Request)
	}
	res := c.pipe.GetNannyEarningsSummary(ctx.Context(), userID)
	if !res.Success {
		return paymentError(ctx, paymentErrorStatus(string(res.Message)), string(res.Message))
	}
	return paymentSuccess(ctx, string(res.Message), res.Data)
}

func (c *PaymentsController) ListNannyEarnings(ctx *fiber.Ctx) error {
	userID, ok := ctx.Locals("auth.user_id").(uuid.UUID)
	if !ok {
		return paymentError(ctx, fiber.StatusBadRequest, messages.Invalid_Payment_Request)
	}
	page, _ := strconv.Atoi(ctx.Query("page", "1"))
	limit, _ := strconv.Atoi(ctx.Query("limit", "20"))
	res := c.pipe.ListNannyEarnings(ctx.Context(), userID, page, limit)
	if !res.Success {
		return paymentError(ctx, paymentErrorStatus(string(res.Message)), string(res.Message))
	}
	return paymentSuccess(ctx, string(res.Message), res.Data)
}
