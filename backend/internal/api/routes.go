package api

import (
	"github.com/gin-gonic/gin"
	"github.com/nikhilgoenkatech/kafka-ui/internal/api/handlers"
	"github.com/nikhilgoenkatech/kafka-ui/internal/api/middleware"
	"github.com/nikhilgoenkatech/kafka-ui/internal/kafka"
)

func RegisterRoutes(router *gin.Engine) {
	// Initialize Kafka service and handlers
	kafkaSvc := kafka.NewService()

	// Initialize services
	topicSvc := kafka.NewTopicService(kafkaSvc)
	brokerSvc := kafka.NewBrokerService(kafkaSvc)
	cgSvc := kafka.NewConsumerGroupService(kafkaSvc)
	msgSvc := kafka.NewMessageService(kafkaSvc)
	metricsSvc := kafka.NewMetricsService(kafkaSvc)

	// Initialize handlers
	clusterHandler := handlers.NewClusterHandler(kafkaSvc)
	topicHandler := handlers.NewTopicHandler(topicSvc)
	brokerHandler := handlers.NewBrokerHandler(brokerSvc)
	cgHandler := handlers.NewConsumerGroupHandler(cgSvc)
	msgHandler := handlers.NewMessageHandler(msgSvc)
	metricsHandler := handlers.NewMetricsHandler(metricsSvc)

	// Public routes (no authentication required)
	api := router.Group("/api")
	{
		// Authentication routes
		api.POST("/auth/register", handlers.Register)
		api.POST("/auth/login", handlers.Login)
	}

	// Protected routes (authentication required)
	protected := router.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		// User management
		protected.GET("/auth/profile", handlers.GetProfile)
		protected.PUT("/auth/change-password", handlers.ChangePassword)


		
		// Kafka management routes
		protected.GET("/clusters", clusterHandler.ListClusters)
		protected.POST("/clusters", clusterHandler.AddCluster)
		protected.DELETE("/clusters/:clusterName", clusterHandler.RemoveCluster)

		protected.GET("/clusters/:clusterName/topics", topicHandler.GetTopics)
		protected.POST("/clusters/:clusterName/topics", topicHandler.CreateTopic)
		protected.GET("/clusters/:clusterName/topics/:topicName", topicHandler.GetTopicDetails)
		protected.DELETE("/clusters/:clusterName/topics/:topicName", topicHandler.DeleteTopic)

		protected.GET("/clusters/:clusterName/brokers", brokerHandler.GetBrokers)

		protected.GET("/clusters/:clusterName/consumer-groups", cgHandler.GetConsumerGroups)
		protected.GET("/clusters/:clusterName/consumer-groups/:groupId", cgHandler.GetConsumerGroupDetails)

		protected.GET("/clusters/:clusterName/topics/:topicName/messages", msgHandler.GetMessages)
		protected.POST("/clusters/:clusterName/topics/:topicName/messages", msgHandler.ProduceMessage)

		// Metrics routes
		protected.GET("/clusters/:clusterName/metrics/consumer-lag", metricsHandler.GetConsumerGroupsLag)
		protected.GET("/clusters/:clusterName/metrics/cluster-health", metricsHandler.GetClusterHealth)
		protected.GET("/clusters/:clusterName/metrics/brokers", metricsHandler.GetBrokerMetrics)
		protected.GET("/clusters/:clusterName/metrics/topics", metricsHandler.GetTopicMetrics)
		protected.GET("/clusters/:clusterName/metrics/consumer-groups", metricsHandler.GetConsumerGroupMetrics)
	}
}
