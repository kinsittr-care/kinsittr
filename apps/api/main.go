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
		log.Printf("api_config_load_failed err=%v", err)
		log.Fatal(err)
	}
	log.Printf("api_config_loaded port=%s auto_migrate=%t log_to_file=%t", cfg.Port, cfg.AutoMigrate, cfg.LogToFile)

	logCloser, err := apilogging.Configure(apilogging.Config{
		Enabled:     cfg.LogToFile,
		Dir:         cfg.LogDir,
		File:        cfg.LogFile,
		MaxSizeMB:   cfg.LogMaxSizeMB,
		MaxBackups:  cfg.LogMaxBackups,
		AlsoConsole: true,
	})
	if err != nil {
		log.Printf("api_logger_configure_failed err=%v", err)
		log.Fatal(err)
	}
	log.Printf("api_logger_configured file_enabled=%t dir=%s file=%s max_size_mb=%d max_backups=%d", cfg.LogToFile, cfg.LogDir, cfg.LogFile, cfg.LogMaxSizeMB, cfg.LogMaxBackups)
	if logCloser != nil {
		defer func() {
			if err := logCloser.Close(); err != nil {
				log.Printf("api_logger_close_failed err=%v", err)
			}
		}()
	}

	app, err := server.New(cfg)
	if err != nil {
		log.Printf("api_server_create_failed err=%v", err)
		log.Fatal(err)
	}

	log.Printf("api_server_starting port=%s", cfg.Port)
	if err := app.Listen(":" + cfg.Port); err != nil {
		log.Printf("api_server_start_failed port=%s err=%v", cfg.Port, err)
		log.Fatal(err)
	}
	log.Printf("api_server_stopped port=%s", cfg.Port)
}
