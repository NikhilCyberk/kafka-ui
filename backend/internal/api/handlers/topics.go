package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nikhilgoenkatech/kafka-ui/internal/kafka"
)

type TopicHandler struct {
	service *kafka.TopicService
}

func NewTopicHandler(service *kafka.TopicService) *TopicHandler {
	return &TopicHandler{
		service: service,
	}
}

// GetTopics handles GET requests to /api/topics
func (h *TopicHandler) GetTopics(c *gin.Context) {
	topics, err := h.service.GetTopics(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, topics)
}

// GetTopicDetails handles GET requests to /api/topics/:name
func (h *TopicHandler) GetTopicDetails(c *gin.Context) {
	name := c.Param("name")
	details, err := h.service.GetTopicDetails(c.Request.Context(), name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, details)
}

// CreateTopic handles POST requests to /api/topics
func (h *TopicHandler) CreateTopic(c *gin.Context) {
	var request struct {
		Name       string `json:"name" binding:"required"`
		Partitions int    `json:"partitions" binding:"required"`
		Replicas   int    `json:"replicas" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.service.CreateTopic(c.Request.Context(), request.Name, request.Partitions, request.Replicas)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Topic created successfully"})
}

// DeleteTopic handles DELETE requests to /api/topics/:name
func (h *TopicHandler) DeleteTopic(c *gin.Context) {
	name := c.Param("name")
	err := h.service.DeleteTopic(c.Request.Context(), name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Topic deleted successfully"})
}
