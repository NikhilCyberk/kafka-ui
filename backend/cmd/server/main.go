// main.go
package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/nikhilgoenkatech/kafka-ui/internal/api/handlers"
	"github.com/nikhilgoenkatech/kafka-ui/internal/kafka"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Create Kafka client
	client, err := kafka.NewKafkaClient()
	if err != nil {
		log.Fatalf("Failed to create Kafka client: %v", err)
	}
	defer client.Close()

	// Create handlers
	topicHandler := handlers.NewTopicHandler(client)
	messageHandler := handlers.NewMessageHandler(client)
	consumerGroupHandler := handlers.NewConsumerGroupHandler(client)

	// Set up gin router
	router := gin.Default()

	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// API routes
	api := router.Group("/api")
	{
		// Health check endpoint
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})

		// Topics endpoints
		topics := api.Group("/topics")
		{
			topics.GET("", topicHandler.ListTopics)
			topics.GET("/:name", topicHandler.GetTopicDetails)
			topics.POST("", topicHandler.CreateTopic)
			topics.DELETE("/:name", topicHandler.DeleteTopic)
		}

		// Messages endpoints
		messages := api.Group("/messages")
		{
			messages.GET("/:topic", messageHandler.GetMessages)
			messages.POST("/:topic", messageHandler.ProduceMessage)
		}

		// Consumer groups endpoints
		consumerGroups := api.Group("/consumer-groups")
		{
			consumerGroups.GET("", consumerGroupHandler.ListConsumerGroups)
			consumerGroups.GET("/:groupId", consumerGroupHandler.GetConsumerGroupDetails)
		}
	}

	// Get port from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	log.Printf("Server starting on port %s\n", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
