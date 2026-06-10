package routers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kinsittr/kinsittr-api/middleware"
	"github.com/kinsittr/kinsittr-api/reviews/controllers"
	"github.com/kinsittr/kinsittr-api/shared/api"
	"github.com/kinsittr/kinsittr-api/typings"
)

func BookingReviewRoutes(controller *controllers.ReviewsController, jwtSecret string) []api.RouterSchema {
	auth := middleware.RequireAuth(jwtSecret)
	return []api.RouterSchema{
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/:id/review",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.CreateParentReview,
		},
	}
}

func NannyBookingReviewRoutes(controller *controllers.ReviewsController, jwtSecret string) []api.RouterSchema {
	auth := middleware.RequireAuth(jwtSecret)
	return []api.RouterSchema{
		{
			RouteMethod: api.RouteMethod(fiber.MethodPost),
			Path:        "/:id/review",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.CreateNannyReview,
		},
	}
}

func ParentReviewRoutes(controller *controllers.ReviewsController, jwtSecret string) []api.RouterSchema {
	auth := middleware.RequireAuth(jwtSecret)
	return []api.RouterSchema{
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.ListParentReviews,
		},
	}
}

func NannyReviewRoutes(controller *controllers.ReviewsController, jwtSecret string) []api.RouterSchema {
	auth := middleware.RequireAuth(jwtSecret)
	return []api.RouterSchema{
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/",
			Middlewares: []typings.FiberMiddleware{auth},
			Handler:     controller.ListNannyReviews,
		},
	}
}

func PublicNannyReviewRoutes(controller *controllers.ReviewsController) []api.RouterSchema {
	return []api.RouterSchema{
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/:id/reviews",
			Middlewares: []typings.FiberMiddleware{},
			Handler:     controller.ListPublicNannyReviews,
		},
	}
}

func AdminReviewRoutes(controller *controllers.ReviewsController, jwtSecret string) []api.RouterSchema {
	auth := middleware.RequireAuth(jwtSecret)
	admin := middleware.RequireAdmin()
	adminAuth := []typings.FiberMiddleware{auth, admin}

	return []api.RouterSchema{
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/reviews",
			Middlewares: adminAuth,
			Handler:     controller.ListAdminReviews,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/reviews/:id",
			Middlewares: adminAuth,
			Handler:     controller.GetAdminReview,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodGet),
			Path:        "/reviews/:id/actions",
			Middlewares: adminAuth,
			Handler:     controller.ListReviewActions,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/reviews/:id/flag",
			Middlewares: adminAuth,
			Handler:     controller.FlagReview,
		},
		{
			RouteMethod: api.RouteMethod(fiber.MethodPatch),
			Path:        "/reviews/:id/unflag",
			Middlewares: adminAuth,
			Handler:     controller.UnflagReview,
		},
	}
}
