package routers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/contact/controllers"
	"github.com/kinsittr/kinsittr-api/shared/api"
	"github.com/kinsittr/kinsittr-api/typings"
)

func ContactRoutes(controller *controllers.ContactController) []api.RouterSchema {
	return []api.RouterSchema{
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/",
			Middlewares: []typings.FiberMiddleware{},
			Handler:     controller.Send,
		},
	}
}
