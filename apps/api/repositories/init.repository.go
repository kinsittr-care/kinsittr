package repositories

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinsittr/kinsittr-api/repositories/account"
	"github.com/kinsittr/kinsittr-api/repositories/admin"
	"github.com/kinsittr/kinsittr-api/repositories/bookings"
	"github.com/kinsittr/kinsittr-api/repositories/messages"
	"github.com/kinsittr/kinsittr-api/repositories/nanny"
	"github.com/kinsittr/kinsittr-api/repositories/notifications"
	"github.com/kinsittr/kinsittr-api/repositories/profile"
)

func InitRepositories(db *pgxpool.Pool) {
	account.InitAccountRepo(db)
	admin.InitAdminRepo(db)
	bookings.InitBookingsRepo(db)
	messages.InitMessagesRepo(db)
	nanny.InitNannyRepo(db)
	notifications.InitNotificationsRepo(db)
	profile.InitProfileRepo(db)
}
