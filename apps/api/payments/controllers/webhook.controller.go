package controllers

import "github.com/gofiber/fiber/v2"

func (c *PaymentsController) StripeWebhook(ctx *fiber.Ctx) error {
	res := c.pipe.HandleStripeWebhook(ctx.Context(), ctx.Body(), ctx.Get("Stripe-Signature"))
	if !res.Success {
		return paymentError(ctx, paymentErrorStatus(string(res.Message)), string(res.Message))
	}
	return paymentSuccess(ctx, string(res.Message), res.Data)
}
