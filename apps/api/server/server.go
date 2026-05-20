package server

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	admin_auth_controller "github.com/kinsittr/kinsittr-api/admin/auth/controllers"
	admin_auth_pipe "github.com/kinsittr/kinsittr-api/admin/auth/pipes"
	admin_auth_router "github.com/kinsittr/kinsittr-api/admin/auth/routers"
	admin_controller "github.com/kinsittr/kinsittr-api/admin/controllers"
	admin_pipe "github.com/kinsittr/kinsittr-api/admin/pipes"
	admin_router "github.com/kinsittr/kinsittr-api/admin/routers"
	auth_controller "github.com/kinsittr/kinsittr-api/auth/controllers"
	auth_pipe "github.com/kinsittr/kinsittr-api/auth/pipes"
	auth_router "github.com/kinsittr/kinsittr-api/auth/routers"
	bookings_controller "github.com/kinsittr/kinsittr-api/bookings/controllers"
	bookings_pipe "github.com/kinsittr/kinsittr-api/bookings/pipes"
	bookings_router "github.com/kinsittr/kinsittr-api/bookings/routers"
	"github.com/kinsittr/kinsittr-api/config"
	contact_controller "github.com/kinsittr/kinsittr-api/contact/controllers"
	contact_pipe "github.com/kinsittr/kinsittr-api/contact/pipes"
	contact_router "github.com/kinsittr/kinsittr-api/contact/routers"
	contact_services "github.com/kinsittr/kinsittr-api/contact/services"
	conversations_controller "github.com/kinsittr/kinsittr-api/conversations/controllers"
	conversations_pipe "github.com/kinsittr/kinsittr-api/conversations/pipes"
	conversations_router "github.com/kinsittr/kinsittr-api/conversations/routers"
	"github.com/kinsittr/kinsittr-api/db"
	nanny_controller "github.com/kinsittr/kinsittr-api/nanny/controllers"
	nanny_pipe "github.com/kinsittr/kinsittr-api/nanny/pipes"
	nanny_router "github.com/kinsittr/kinsittr-api/nanny/routers"
	notifications_controller "github.com/kinsittr/kinsittr-api/notifications/controllers"
	notifications_pipe "github.com/kinsittr/kinsittr-api/notifications/pipes"
	notifications_router "github.com/kinsittr/kinsittr-api/notifications/routers"
	parent_controller "github.com/kinsittr/kinsittr-api/parent/controllers"
	parent_pipe "github.com/kinsittr/kinsittr-api/parent/pipes"
	parent_router "github.com/kinsittr/kinsittr-api/parent/routers"
	"github.com/kinsittr/kinsittr-api/repositories"
	"github.com/kinsittr/kinsittr-api/repositories/account"
	admin_repo "github.com/kinsittr/kinsittr-api/repositories/admin"
	bookings_repo "github.com/kinsittr/kinsittr-api/repositories/bookings"
	messages_repo "github.com/kinsittr/kinsittr-api/repositories/messages"
	nanny_repo "github.com/kinsittr/kinsittr-api/repositories/nanny"
	notifications_repo "github.com/kinsittr/kinsittr-api/repositories/notifications"
	profile_repo "github.com/kinsittr/kinsittr-api/repositories/profile"
	reviews_repo "github.com/kinsittr/kinsittr-api/repositories/reviews"
	reviews_controller "github.com/kinsittr/kinsittr-api/reviews/controllers"
	reviews_pipe "github.com/kinsittr/kinsittr-api/reviews/pipes"
	reviews_router "github.com/kinsittr/kinsittr-api/reviews/routers"
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
		AllowMethods: "GET,POST,PUT,PATCH,OPTIONS,DELETE",
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

	// parent
	parentPipe := parent_pipe.NewParentPipe(profile_repo.ProfileRepo)
	parentController := parent_controller.NewParentController(parentPipe)

	// bookings
	bookingsPipe := bookings_pipe.NewBookingsPipe(bookings_repo.BookingsRepo, profile_repo.ProfileRepo, nanny_repo.NannyRepo, notifications_repo.NotificationsRepo)
	bookingsController := bookings_controller.NewBookingsController(bookingsPipe)

	// conversations
	conversationsPipe := conversations_pipe.NewConversationsPipe(messages_repo.MessagesRepo, profile_repo.ProfileRepo, notifications_repo.NotificationsRepo)
	conversationsController := conversations_controller.NewConversationsController(conversationsPipe)

	// notifications
	notificationsPipe := notifications_pipe.NewNotificationsPipe(notifications_repo.NotificationsRepo)
	notificationsController := notifications_controller.NewNotificationsController(notificationsPipe)

	// reviews
	reviewsPipe := reviews_pipe.NewReviewsPipe(reviews_repo.ReviewsRepo, bookings_repo.BookingsRepo, profile_repo.ProfileRepo)
	reviewsController := reviews_controller.NewReviewsController(reviewsPipe)

	// admin
	adminAuthPipe := admin_auth_pipe.NewAdminAuthPipe(account.AccountRepo, cfg.JWTSecret, cfg.JWTRefreshSecret)
	adminAuthController := admin_auth_controller.NewAdminAuthController(adminAuthPipe)
	adminPipe := admin_pipe.NewAdminPipe(admin_repo.AdminRepo, cfg.PlatformFeeRate, notifications_repo.NotificationsRepo)
	adminController := admin_controller.NewAdminController(adminPipe)

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
	api.BaseRouter(publicNannyGroup, reviews_router.PublicNannyReviewRoutes(reviewsController))
	api.BaseRouter(publicNannyGroup, nanny_router.PublicNannyRoutes(nannyController))

	nannyGroup := apiGroup.Group("/nanny")
	nannyBookingsGroup := nannyGroup.Group("/bookings")
	api.BaseRouter(nannyBookingsGroup, bookings_router.NannyBookingRoutes(bookingsController, cfg.JWTSecret))
	api.BaseRouter(nannyBookingsGroup, reviews_router.NannyBookingReviewRoutes(reviewsController, cfg.JWTSecret))
	nannyReviewsGroup := nannyGroup.Group("/reviews")
	api.BaseRouter(nannyReviewsGroup, reviews_router.NannyReviewRoutes(reviewsController, cfg.JWTSecret))
	api.BaseRouter(nannyGroup, nanny_router.NannyRoutes(nannyController, cfg.JWTSecret))

	parentGroup := apiGroup.Group("/parent")
	api.BaseRouter(parentGroup, parent_router.ParentRoutes(parentController, cfg.JWTSecret))

	bookingsGroup := apiGroup.Group("/bookings")
	api.BaseRouter(bookingsGroup, bookings_router.BookingRoutes(bookingsController, cfg.JWTSecret))
	api.BaseRouter(bookingsGroup, reviews_router.BookingReviewRoutes(reviewsController, cfg.JWTSecret))

	reviewsGroup := apiGroup.Group("/reviews")
	api.BaseRouter(reviewsGroup, reviews_router.ParentReviewRoutes(reviewsController, cfg.JWTSecret))

	conversationsGroup := apiGroup.Group("/conversations")
	api.BaseRouter(conversationsGroup, conversations_router.ConversationRoutes(conversationsController, cfg.JWTSecret))

	notificationsGroup := apiGroup.Group("/notifications")
	api.BaseRouter(notificationsGroup, notifications_router.NotificationRoutes(notificationsController, cfg.JWTSecret))

	adminGroup := apiGroup.Group("/admin")
	adminAuthGroup := adminGroup.Group("/auth")
	api.BaseRouter(adminAuthGroup, admin_auth_router.AdminAuthRoutes(adminAuthController, cfg.JWTSecret))
	api.BaseRouter(adminGroup, admin_router.AdminRoutes(adminController, cfg.JWTSecret))
	api.BaseRouter(adminGroup, reviews_router.AdminReviewRoutes(reviewsController, cfg.JWTSecret))

	return app, nil
}
