package routers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/auth/controllers"
	"github.com/kinsittr/kinsittr-api/middleware"
	"github.com/kinsittr/kinsittr-api/shared/api"
	"github.com/kinsittr/kinsittr-api/typings"
)

func AuthRoutes(controller *controllers.AuthController, jwtSecret string) []api.RouterSchema {
	return []api.RouterSchema{
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/parent/register",
			Middlewares: []typings.FiberMiddleware{},
			Handler:     controller.RegisterParent,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/nanny/register",
			Middlewares: []typings.FiberMiddleware{},
			Handler:     controller.RegisterNanny,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/login",
			Middlewares: []typings.FiberMiddleware{},
			Handler:     controller.Login,
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
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/me",
			Middlewares: []typings.FiberMiddleware{middleware.RequireAuth(jwtSecret)},
			Handler:     controller.Me,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/password",
			Middlewares: []typings.FiberMiddleware{middleware.RequireAuth(jwtSecret)},
			Handler:     controller.ChangePassword,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodDelete),
			Path:        "/account",
			Middlewares: []typings.FiberMiddleware{middleware.RequireAuth(jwtSecret)},
			Handler:     controller.DeactivateAccount,
		},
	}
}
