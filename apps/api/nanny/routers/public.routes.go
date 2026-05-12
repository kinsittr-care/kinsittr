package routers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/nanny/controllers"
	"github.com/kinsittr/kinsittr-api/shared/api"
	"github.com/kinsittr/kinsittr-api/typings"
)

func PublicNannyRoutes(controller *controllers.NannyController) []api.RouterSchema {
	return []api.RouterSchema{
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/",
			Middlewares: []typings.FiberMiddleware{},
			Handler:     controller.ListPublic,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/:id",
			Middlewares: []typings.FiberMiddleware{},
			Handler:     controller.GetPublicByID,
		},
	}
}
