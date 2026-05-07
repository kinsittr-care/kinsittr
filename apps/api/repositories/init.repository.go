package repositories

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinsittr/kinsittr-api/repositories/account"
	"github.com/kinsittr/kinsittr-api/repositories/bookings"
	"github.com/kinsittr/kinsittr-api/repositories/nanny"
	"github.com/kinsittr/kinsittr-api/repositories/profile"
)

func InitRepositories(db *pgxpool.Pool) {
	account.InitAccountRepo(db)
	bookings.InitBookingsRepo(db)
	nanny.InitNannyRepo(db)
	profile.InitProfileRepo(db)
}
