package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/payments/messages"
	"github.com/kinsittr/kinsittr-api/payments/pipes"
)

type PaymentsController struct {
	pipe *pipes.PaymentsPipe
}

func NewPaymentsController(pipe *pipes.PaymentsPipe) *PaymentsController {
	return &PaymentsController{pipe: pipe}
}

func paymentSuccess(ctx *fiber.Ctx, message string, data any) error {
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"success": true, "message": message, "data": data})
}

func paymentError(ctx *fiber.Ctx, status int, message string) error {
	return ctx.Status(status).JSON(fiber.Map{"success": false, "message": message})
}

func paymentErrorStatus(message string) int {
	switch message {
	case messages.Stripe_Not_Configured:
		return fiber.StatusServiceUnavailable
	case messages.Payment_Profile_Not_Found:
		return fiber.StatusNotFound
	default:
		return fiber.StatusBadRequest
	}
}
