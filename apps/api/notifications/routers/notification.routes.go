package routers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/middleware"
	"github.com/kinsittr/kinsittr-api/notifications/controllers"
	"github.com/kinsittr/kinsittr-api/shared/api"
	"github.com/kinsittr/kinsittr-api/typings"
)

func NotificationRoutes(controller *controllers.NotificationsController, jwtSecret string) []api.RouterSchema {
	auth := middleware.RequireAuth(jwtSecret)
	return []api.RouterSchema{
		{RouteMethod: api.RouteMethod(fiber.MethodGet), Path: "/", Middlewares: []typings.FiberMiddleware{auth}, Handler: controller.List},
		{RouteMethod: api.RouteMethod(fiber.MethodGet), Path: "/unread-count", Middlewares: []typings.FiberMiddleware{auth}, Handler: controller.CountUnread},
		{RouteMethod: api.RouteMethod(fiber.MethodPatch), Path: "/:id/read", Middlewares: []typings.FiberMiddleware{auth}, Handler: controller.MarkRead},
		{RouteMethod: api.RouteMethod(fiber.MethodPatch), Path: "/read-all", Middlewares: []typings.FiberMiddleware{auth}, Handler: controller.MarkAllRead},
	}
}
