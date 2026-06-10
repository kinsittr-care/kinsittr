package routers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/middleware"
	"github.com/kinsittr/kinsittr-api/parent/controllers"
	"github.com/kinsittr/kinsittr-api/shared/api"
	"github.com/kinsittr/kinsittr-api/typings"
)

func ParentRoutes(controller *controllers.ParentController, jwtSecret string) []api.RouterSchema {
	auth := middleware.RequireAuth(jwtSecret)

	return []api.RouterSchema{
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/profile",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.GetOwnProfile,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/profile",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.UpdateOwnProfile,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/settings",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.GetOwnSettings,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/settings",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.UpdateOwnSettings,
		},
	}
}
