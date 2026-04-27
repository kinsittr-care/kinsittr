package repositories

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinsittr/kinsittr-api/repositories/account"
)

func InitRepositories(db *pgxpool.Pool) {
	account.InitAccountRepo(db)
}
