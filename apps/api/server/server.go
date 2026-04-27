package server

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/kinsittr/kinsittr-api/config"
	"github.com/kinsittr/kinsittr-api/contact/controllers"
	"github.com/kinsittr/kinsittr-api/contact/pipes"
	"github.com/kinsittr/kinsittr-api/contact/routers"
	"github.com/kinsittr/kinsittr-api/contact/services"
	"github.com/kinsittr/kinsittr-api/shared/api"
	"github.com/kinsittr/kinsittr-api/shared/mail"
)

func New(cfg *config.Config) *fiber.App {
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: cfg.WebOrigin,
		AllowMethods: "GET,POST,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	app.Get("/health", func(ctx *fiber.Ctx) error {
		return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
			"success": true,
			"message": "Server healthy.",
			"data": fiber.Map{
				"timestamp": time.Now().UTC(),
			},
		})
	})

	resendProvider := mail.NewResendProvider(cfg.ResendAPIKey, cfg.ContactFromEmail)
	emailService := services.NewEmailService(resendProvider)
	contactPipe := pipes.NewContactPipe(emailService, cfg.ContactToEmail)
	contactController := controllers.NewContactController(contactPipe)

	apiGroup := app.Group("/api/v1")
	api.BaseRouter(apiGroup, routers.ContactRoutes(contactController))

	return app
}
