package routers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/bookings/controllers"
	"github.com/kinsittr/kinsittr-api/middleware"
	"github.com/kinsittr/kinsittr-api/shared/api"
	"github.com/kinsittr/kinsittr-api/typings"
)

func BookingRoutes(controller *controllers.BookingsController, jwtSecret string) []api.RouterSchema {
	auth := middleware.RequireAuth(jwtSecret)

	return []api.RouterSchema{
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.Create,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.List,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/:id",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.GetByID,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/:id/cancel",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.Cancel,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/:id/change-requests",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.CreateParentChangeRequest,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/:id/change-requests",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.ListParentChangeRequests,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/:id/change-requests/:requestId/accept",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.AcceptParentChangeRequest,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/:id/change-requests/:requestId/decline",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.DeclineParentChangeRequest,
		},
	}
}

func NannyBookingRoutes(controller *controllers.BookingsController, jwtSecret string) []api.RouterSchema {
	auth := middleware.RequireAuth(jwtSecret)

	return []api.RouterSchema{
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.ListForNanny,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/:id",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.GetForNannyByID,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/:id/approve",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.Approve,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/:id/decline",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.Decline,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/:id/complete",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.Complete,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/:id/change-requests",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.CreateNannyChangeRequest,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/:id/change-requests",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.ListNannyChangeRequests,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/:id/change-requests/:requestId/accept",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.AcceptNannyChangeRequest,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/:id/change-requests/:requestId/decline",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.DeclineNannyChangeRequest,
		},
	}
}
