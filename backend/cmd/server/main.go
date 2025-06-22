// main.go
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nikhilgoenkatech/kafka-ui/internal/api"
	"github.com/nikhilgoenkatech/kafka-ui/pkg/utils"
)

func main() {
	// Setup Gin router with custom logging
	router := gin.New()
	router.Use(utils.LoggingMiddleware())
	router.Use(utils.CORSMiddleware())
	router.Use(utils.RateLimitMiddleware(100)) // 100 requests per minute per IP

	// Register all routes (including authentication)
	api.RegisterRoutes(router)

	// Server setup
	srv := &http.Server{
		Addr:    ":8080",
		Handler: router,
	}

	// Graceful shutdown
	go func() {
		log.Printf("Server starting on port 8080...")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")
}
