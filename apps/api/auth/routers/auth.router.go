package routers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/kinsittr/kinsittr-api/auth/controllers"
	"github.com/kinsittr/kinsittr-api/middleware"
	"github.com/kinsittr/kinsittr-api/shared/api"
	"github.com/kinsittr/kinsittr-api/typings"
)

func AuthRoutes(controller *controllers.AuthController, jwtSecret string) []api.RouterSchema {
	recoveryLimit := limiter.New(limiter.Config{
		Max:        5,
		Expiration: 15 * time.Minute,
		KeyGenerator: func(ctx *fiber.Ctx) string {
			return ctx.IP()
		},
	})

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
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/recovery/request",
			Middlewares: []typings.FiberMiddleware{recoveryLimit},
			Handler:     controller.RequestRecovery,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/recovery/verify",
			Middlewares: []typings.FiberMiddleware{},
			Handler:     controller.VerifyRecovery,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/recovery/reset",
			Middlewares: []typings.FiberMiddleware{},
			Handler:     controller.ResetRecovery,
		},
	}
}
