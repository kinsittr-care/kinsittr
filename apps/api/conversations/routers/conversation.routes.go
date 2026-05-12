package routers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/conversations/controllers"
	"github.com/kinsittr/kinsittr-api/middleware"
	"github.com/kinsittr/kinsittr-api/shared/api"
	"github.com/kinsittr/kinsittr-api/typings"
)

func ConversationRoutes(controller *controllers.ConversationsController, jwtSecret string) []api.RouterSchema {
	auth := middleware.RequireAuth(jwtSecret)

	return []api.RouterSchema{
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
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/:id/messages",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.ListMessages,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/:id/messages",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.SendMessage,
		},
	}
}
