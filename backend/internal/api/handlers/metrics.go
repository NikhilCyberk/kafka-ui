package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nikhilgoenkatech/kafka-ui/internal/kafka"
)

type MetricsHandler struct {
	metricsService *kafka.MetricsService
}

func NewMetricsHandler(metricsService *kafka.MetricsService) *MetricsHandler {
	return &MetricsHandler{
		metricsService: metricsService,
	}
}

// GetMessagesPerSecond handles GET /api/metrics/messages-per-second
func (h *MetricsHandler) GetMessagesPerSecond(c *gin.Context) {
	metrics, err := h.metricsService.GetMessagesPerSecond(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, metrics)
}

// GetLagMetrics handles GET /api/metrics/lag
func (h *MetricsHandler) GetLagMetrics(c *gin.Context) {
	metrics, err := h.metricsService.GetLagMetrics(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, metrics)
}

// GetBrokerHealth handles GET /api/metrics/broker-health
func (h *MetricsHandler) GetBrokerHealth(c *gin.Context) {
	health, err := h.metricsService.GetBrokerHealth(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, health)
}

// GetPartitionDistribution handles GET /api/metrics/partition-distribution
func (h *MetricsHandler) GetPartitionDistribution(c *gin.Context) {
	distribution, err := h.metricsService.GetPartitionDistribution(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, distribution)
}

// GetTopicMetrics handles GET /api/metrics/topic-metrics
func (h *MetricsHandler) GetTopicMetrics(c *gin.Context) {
	metrics, err := h.metricsService.GetTopicMetrics(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, metrics)
} 