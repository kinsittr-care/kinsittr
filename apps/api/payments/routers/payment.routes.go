package routers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/middleware"
	"github.com/kinsittr/kinsittr-api/payments/controllers"
	"github.com/kinsittr/kinsittr-api/shared/api"
	"github.com/kinsittr/kinsittr-api/typings"
)

func NannyPaymentRoutes(controller *controllers.PaymentsController, jwtSecret string) []api.RouterSchema {
	auth := middleware.RequireAuth(jwtSecret)
	return []api.RouterSchema{
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/status",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.GetNannyStripeStatus,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/connect",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.CreateNannyConnectLink,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/balance",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.GetNannyStripeBalance,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/payouts",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.ListNannyStripePayouts,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/payout-settings",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.GetNannyPayoutSettings,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/payout-settings",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.UpdateNannyPayoutSettings,
		},
	}
}

func ParentBillingRoutes(controller *controllers.PaymentsController, jwtSecret string) []api.RouterSchema {
	auth := middleware.RequireAuth(jwtSecret)
	return []api.RouterSchema{
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/setup-intent",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.CreateParentSetupIntent,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/payment-methods",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.ListParentPaymentMethods,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPut),
			Path:        "/payment-methods/:id",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.UpdateParentPaymentMethod,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodDelete),
			Path:        "/payment-methods/:id",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.DeleteParentPaymentMethod,
		},
	}
}

func StripeWebhookRoutes(controller *controllers.PaymentsController) []api.RouterSchema {
	return []api.RouterSchema{
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/stripe",
			Middlewares: nil,
			Handler:     controller.StripeWebhook,
		},
	}
}
