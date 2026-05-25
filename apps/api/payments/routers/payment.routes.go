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
