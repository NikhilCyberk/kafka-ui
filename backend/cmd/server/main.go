// main.go
package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/nikhilgoenkatech/kafka-ui/internal/api/handlers"
	"github.com/nikhilgoenkatech/kafka-ui/internal/kafka"
	"github.com/IBM/sarama"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize Kafka client
	client, err := kafka.NewKafkaClient()
	if err != nil {
		log.Fatalf("Failed to create Kafka client: %v", err)
	}
	defer client.Close()

	// Create a Sarama client for metrics
	saramaConfig := sarama.NewConfig()
	saramaConfig.Version = sarama.V2_0_0_0
	saramaClient, err := sarama.NewClient(client.Brokers, saramaConfig)
	if err != nil {
		log.Fatalf("Failed to create Sarama client: %v", err)
	}
	defer saramaClient.Close()

	metricsService, err := kafka.NewMetricsService(saramaClient)
	if err != nil {
		log.Fatalf("Failed to create metrics service: %v", err)
	}
	metricsHandler := handlers.NewMetricsHandler(metricsService)

	// Initialize services
	topicService := kafka.NewTopicService(client)
	messageService := kafka.NewMessageService(client)
	consumerGroupService := kafka.NewConsumerGroupService(client)

	// Initialize handlers
	topicHandler := handlers.NewTopicHandler(topicService)
	messageHandler := handlers.NewMessageHandler(messageService)
	consumerGroupHandler := handlers.NewConsumerGroupHandler(consumerGroupService)

	// Initialize router
	router := gin.Default()

	// Enable CORS
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Register routes
	api := router.Group("/api")
	{
		// Topic routes
		api.GET("/topics", topicHandler.GetTopics)
		api.GET("/topics/:name", topicHandler.GetTopicDetails)
		api.POST("/topics", topicHandler.CreateTopic)
		api.DELETE("/topics/:name", topicHandler.DeleteTopic)

		// Message routes
		api.GET("/messages/:topic", messageHandler.GetMessages)
		api.POST("/messages/:topic", messageHandler.ProduceMessage)
		api.POST("/messages/:topic/replay", messageHandler.ReplayMessages)
		api.POST("/messages/validate", messageHandler.ValidateMessage)

		// Consumer group routes
		api.GET("/consumer-groups", consumerGroupHandler.GetConsumerGroups)
		api.GET("/consumer-groups/:groupId", consumerGroupHandler.GetConsumerGroupDetails)

		// Metrics routes
		api.GET("/metrics/messages-per-second", metricsHandler.GetMessagesPerSecond)
		api.GET("/metrics/lag", metricsHandler.GetLagMetrics)
		api.GET("/metrics/broker-health", metricsHandler.GetBrokerHealth)
		api.GET("/metrics/partition-distribution", metricsHandler.GetPartitionDistribution)
		api.GET("/metrics/topic-metrics", metricsHandler.GetTopicMetrics)
	}

	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
