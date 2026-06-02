package main

import (
	"log"

	"github.com/kinsittr/kinsittr-api/config"
	"github.com/kinsittr/kinsittr-api/server"
	apilogging "github.com/kinsittr/kinsittr-api/shared/logging"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	logCloser, err := apilogging.Configure(apilogging.Config{
		Enabled:     cfg.LogToFile,
		Dir:         cfg.LogDir,
		File:        cfg.LogFile,
		MaxSizeMB:   cfg.LogMaxSizeMB,
		MaxBackups:  cfg.LogMaxBackups,
		AlsoConsole: true,
	})
	if err != nil {
		log.Fatal(err)
	}
	if logCloser != nil {
		defer logCloser.Close()
	}

	app, err := server.New(cfg)
	if err != nil {
		log.Fatal(err)
	}

	if err := app.Listen(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
