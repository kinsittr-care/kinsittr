package db

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func Connect(ctx context.Context, dsn string) (*pgxpool.Pool, error) {
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		log.Printf("db_pool_create_failed err=%v", err)
		return nil, err
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		log.Printf("db_ping_failed err=%v", err)
		return nil, err
	}
	log.Print("db_connected")
	return pool, nil
}
