package controllers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/payments/messages"
)

func (c *PaymentsController) ListPaymentReconciliationIssues(ctx *fiber.Ctx) error {
	page, _ := strconv.Atoi(ctx.Query("page", "1"))
	limit, _ := strconv.Atoi(ctx.Query("limit", "20"))
	res := c.pipe.ListPaymentReconciliationIssues(ctx.Context(), page, limit)
	if !res.Success {
		return paymentError(ctx, paymentErrorStatus(string(res.Message)), string(res.Message))
	}
	return paymentSuccess(ctx, messages.Payment_Reconciliation_Listed, res.Data)
}
