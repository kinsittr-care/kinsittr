package server

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	auth_controller "github.com/kinsittr/kinsittr-api/auth/controllers"
	auth_pipe "github.com/kinsittr/kinsittr-api/auth/pipes"
	auth_router "github.com/kinsittr/kinsittr-api/auth/routers"
	"github.com/kinsittr/kinsittr-api/config"
	contact_controller "github.com/kinsittr/kinsittr-api/contact/controllers"
	contact_pipe "github.com/kinsittr/kinsittr-api/contact/pipes"
	contact_router "github.com/kinsittr/kinsittr-api/contact/routers"
	contact_services "github.com/kinsittr/kinsittr-api/contact/services"
	"github.com/kinsittr/kinsittr-api/db"
	"github.com/kinsittr/kinsittr-api/repositories"
	"github.com/kinsittr/kinsittr-api/repositories/account"
	"github.com/kinsittr/kinsittr-api/shared/api"
	"github.com/kinsittr/kinsittr-api/shared/mail"
)

func New(cfg *config.Config) (*fiber.App, error) {
	pool, err := db.Connect(context.Background(), cfg.DatabaseURL)
	if err != nil {
		return nil, err
	}

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: cfg.WebOrigin,
		AllowMethods: "GET,POST,PUT,PATCH,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	app.Get("/health", func(ctx *fiber.Ctx) error {
		return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
			"success": true,
			"message": "Server healthy.",
			"data":    fiber.Map{"timestamp": time.Now().UTC()},
		})
	})

	// repositories
	repositories.InitRepositories(pool)

	// auth
	authPipe := auth_pipe.NewAuthPipe(account.AccountRepo, cfg.JWTSecret, cfg.JWTRefreshSecret)
	authController := auth_controller.NewAuthController(authPipe)

	apiGroup := app.Group("/api/v1")

	if cfg.ContactConfigured() {
		resendProvider := mail.NewResendProvider(cfg.ResendAPIKey, cfg.ContactFromEmail)
		emailService := contact_services.NewEmailService(resendProvider)
		contactPipe := contact_pipe.NewContactPipe(emailService, cfg.ContactToEmail)
		contactController := contact_controller.NewContactController(contactPipe)

		contactGroup := apiGroup.Group("/contact")
		api.BaseRouter(contactGroup, contact_router.ContactRoutes(contactController))
	}

	authGroup := apiGroup.Group("/auth")
	api.BaseRouter(authGroup, auth_router.AuthRoutes(authController, cfg.JWTSecret))

	return app, nil
}
