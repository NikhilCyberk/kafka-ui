// backend/internal/api/handlers/metrics.go
package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/nikhilgoenkatech/kafka-ui/internal/kafka"
	"github.com/nikhilgoenkatech/kafka-ui/pkg/errors"
	"github.com/nikhilgoenkatech/kafka-ui/pkg/utils"
)

// MetricsHandler handles HTTP requests for Kafka metrics.
type MetricsHandler struct {
	service *kafka.MetricsService
}

// NewMetricsHandler creates a new MetricsHandler.
func NewMetricsHandler(service *kafka.MetricsService) *MetricsHandler {
	return &MetricsHandler{service: service}
}

// GetConsumerGroupsLag handles the request to get consumer group lag.
func (h *MetricsHandler) GetConsumerGroupsLag(c *gin.Context) {
	clusterName := c.Param("clusterName")

	lag, err := h.service.GetConsumerGroupsLag(c.Request.Context(), clusterName)
	if err != nil {
		utils.SendError(c, errors.NewInternalError("Failed to get consumer group lag: "+err.Error()))
		return
	}

	utils.SendSuccess(c, lag, "Consumer group lag retrieved successfully")
}

// GetClusterHealth handles the request to get cluster health metrics.
func (h *MetricsHandler) GetClusterHealth(c *gin.Context) {
	clusterName := c.Param("clusterName")

	health, err := h.service.GetClusterHealth(c.Request.Context(), clusterName)
	if err != nil {
		utils.SendError(c, errors.NewInternalError("Failed to get cluster health: "+err.Error()))
		return
	}

	utils.SendSuccess(c, health, "Cluster health retrieved successfully")
}

// GetBrokerMetrics handles the request to get broker metrics.
func (h *MetricsHandler) GetBrokerMetrics(c *gin.Context) {
	clusterName := c.Param("clusterName")

	metrics, err := h.service.GetBrokerMetrics(c.Request.Context(), clusterName)
	if err != nil {
		utils.SendError(c, errors.NewInternalError("Failed to get broker metrics: "+err.Error()))
		return
	}

	utils.SendSuccess(c, metrics, "Broker metrics retrieved successfully")
}

// GetTopicMetrics handles the request to get topic metrics.
func (h *MetricsHandler) GetTopicMetrics(c *gin.Context) {
	clusterName := c.Param("clusterName")

	metrics, err := h.service.GetTopicMetrics(c.Request.Context(), clusterName)
	if err != nil {
		utils.SendError(c, errors.NewInternalError("Failed to get topic metrics: "+err.Error()))
		return
	}

	utils.SendSuccess(c, metrics, "Topic metrics retrieved successfully")
}

// GetConsumerGroupMetrics handles the request to get consumer group metrics.
func (h *MetricsHandler) GetConsumerGroupMetrics(c *gin.Context) {
	clusterName := c.Param("clusterName")

	metrics, err := h.service.GetConsumerGroupMetrics(c.Request.Context(), clusterName)
	if err != nil {
		utils.SendError(c, errors.NewInternalError("Failed to get consumer group metrics: "+err.Error()))
		return
	}

	utils.SendSuccess(c, metrics, "Consumer group metrics retrieved successfully")
}
