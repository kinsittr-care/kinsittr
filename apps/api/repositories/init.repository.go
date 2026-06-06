package repositories

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinsittr/kinsittr-api/repositories/account"
	"github.com/kinsittr/kinsittr-api/repositories/admin"
	"github.com/kinsittr/kinsittr-api/repositories/bookings"
	"github.com/kinsittr/kinsittr-api/repositories/documents"
	"github.com/kinsittr/kinsittr-api/repositories/messages"
	"github.com/kinsittr/kinsittr-api/repositories/nanny"
	"github.com/kinsittr/kinsittr-api/repositories/notifications"
	"github.com/kinsittr/kinsittr-api/repositories/payments"
	"github.com/kinsittr/kinsittr-api/repositories/profile"
	"github.com/kinsittr/kinsittr-api/repositories/reviews"
)

func InitRepositories(db *pgxpool.Pool) {
	account.InitAccountRepo(db)
	admin.InitAdminRepo(db)
	bookings.InitBookingsRepo(db)
	documents.InitDocumentsRepo(db)
	messages.InitMessagesRepo(db)
	nanny.InitNannyRepo(db)
	notifications.InitNotificationsRepo(db)
	payments.InitPaymentsRepo(db)
	profile.InitProfileRepo(db)
	reviews.InitReviewsRepo(db)
}
