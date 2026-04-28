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
	nanny_controller "github.com/kinsittr/kinsittr-api/nanny/controllers"
	nanny_pipe "github.com/kinsittr/kinsittr-api/nanny/pipes"
	nanny_router "github.com/kinsittr/kinsittr-api/nanny/routers"
	"github.com/kinsittr/kinsittr-api/repositories"
	"github.com/kinsittr/kinsittr-api/repositories/account"
	nanny_repo "github.com/kinsittr/kinsittr-api/repositories/nanny"
	profile_repo "github.com/kinsittr/kinsittr-api/repositories/profile"
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
	authPipe := auth_pipe.NewAuthPipe(account.AccountRepo, profile_repo.ProfileRepo, cfg.JWTSecret, cfg.JWTRefreshSecret)
	authController := auth_controller.NewAuthController(authPipe)

	// nanny public
	nannyPipe := nanny_pipe.NewNannyPipe(nanny_repo.NannyRepo, profile_repo.ProfileRepo)
	nannyController := nanny_controller.NewNannyController(nannyPipe)

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

	publicNannyGroup := apiGroup.Group("/nannies")
	api.BaseRouter(publicNannyGroup, nanny_router.PublicNannyRoutes(nannyController))

	nannyGroup := apiGroup.Group("/nanny")
	api.BaseRouter(nannyGroup, nanny_router.NannyRoutes(nannyController, cfg.JWTSecret))

	return app, nil
}
