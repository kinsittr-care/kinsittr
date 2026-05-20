package routers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/admin/auth/controllers"
	"github.com/kinsittr/kinsittr-api/middleware"
	"github.com/kinsittr/kinsittr-api/shared/api"
	"github.com/kinsittr/kinsittr-api/typings"
)

func AdminAuthRoutes(controller *controllers.AdminAuthController, jwtSecret string) []api.RouterSchema {
	return []api.RouterSchema{
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/login",
			Middlewares: []typings.FiberMiddleware{},
			Handler:     controller.Login,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/me",
			Middlewares: []typings.FiberMiddleware{middleware.RequireAuth(jwtSecret), middleware.RequireAdmin()},
			Handler:     controller.Me,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/refresh",
			Middlewares: []typings.FiberMiddleware{},
			Handler:     controller.Refresh,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/logout",
			Middlewares: []typings.FiberMiddleware{},
			Handler:     controller.Logout,
		},
	}
}
