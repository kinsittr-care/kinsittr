package main

import (
	"log"

	"github.com/kinsittr/kinsittr-api/config"
	"github.com/kinsittr/kinsittr-api/server"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	app, err := server.New(cfg)
	if err != nil {
		log.Fatal(err)
	}

	if err := app.Listen(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
