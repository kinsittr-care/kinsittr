package routers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/admin/controllers"
	"github.com/kinsittr/kinsittr-api/middleware"
	"github.com/kinsittr/kinsittr-api/shared/api"
	"github.com/kinsittr/kinsittr-api/typings"
)

func AdminRoutes(controller *controllers.AdminController, jwtSecret string) []api.RouterSchema {
	auth := middleware.RequireAuth(jwtSecret)
	admin := middleware.RequireAdmin()
	adminAuth := []typings.FiberMiddleware{auth, admin}

	return []api.RouterSchema{
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/screening/nannies",
			Middlewares: adminAuth,
			Handler:     controller.ListScreeningNannies,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/screening/nannies/:id/steps",
			Middlewares: adminAuth,
			Handler:     controller.UpdateScreeningSteps,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/screening/nannies/:id/under-review",
			Middlewares: adminAuth,
			Handler:     controller.StartScreening,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/screening/nannies/:id/reset",
			Middlewares: adminAuth,
			Handler:     controller.ResetScreening,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/nannies",
			Middlewares: adminAuth,
			Handler:     controller.ListNannies,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/nannies/:id",
			Middlewares: adminAuth,
			Handler:     controller.GetNanny,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/parents",
			Middlewares: adminAuth,
			Handler:     controller.ListParents,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/parents/:id",
			Middlewares: adminAuth,
			Handler:     controller.GetParent,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/admins",
			Middlewares: adminAuth,
			Handler:     controller.ListAdmins,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/admins/invite",
			Middlewares: adminAuth,
			Handler:     controller.InviteAdmin,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/admins/:id/disable",
			Middlewares: adminAuth,
			Handler:     controller.DisableAdmin,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/nannies/:id/verify",
			Middlewares: adminAuth,
			Handler:     controller.VerifyNanny,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/nannies/:id/suspend",
			Middlewares: adminAuth,
			Handler:     controller.SuspendNanny,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/nannies/:id/reject",
			Middlewares: adminAuth,
			Handler:     controller.RejectNanny,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/parents/:id/suspend",
			Middlewares: adminAuth,
			Handler:     controller.SuspendParent,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/bookings",
			Middlewares: adminAuth,
			Handler:     controller.ListBookings,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/bookings/:id",
			Middlewares: adminAuth,
			Handler:     controller.GetBooking,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/bookings/:id/actions",
			Middlewares: adminAuth,
			Handler:     controller.ListBookingActions,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/bookings/:id/cancel",
			Middlewares: adminAuth,
			Handler:     controller.CancelBooking,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/bookings/:id/complete",
			Middlewares: adminAuth,
			Handler:     controller.CompleteBooking,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/conversations",
			Middlewares: adminAuth,
			Handler:     controller.ListConversations,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/conversations/:id/messages",
			Middlewares: adminAuth,
			Handler:     controller.ListConversationMessages,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/conversations/:id/lock",
			Middlewares: adminAuth,
			Handler:     controller.LockConversation,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/conversations/:id/unlock",
			Middlewares: adminAuth,
			Handler:     controller.UnlockConversation,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/conversations/:id/messages/:message_id/hide",
			Middlewares: adminAuth,
			Handler:     controller.HideConversationMessage,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/analytics",
			Middlewares: adminAuth,
			Handler:     controller.Analytics,
		},
	}
}
