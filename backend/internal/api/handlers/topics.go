package handlers

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/nikhilgoenkatech/kafka-ui/internal/kafka"
	"github.com/nikhilgoenkatech/kafka-ui/pkg/errors"
	"github.com/nikhilgoenkatech/kafka-ui/pkg/utils"
)

type TopicHandler struct {
	service *kafka.TopicService
}

func NewTopicHandler(service *kafka.TopicService) *TopicHandler {
	return &TopicHandler{
		service: service,
	}
}

// GetTopics handles GET requests to /api/clusters/:clusterName/topics
func (h *TopicHandler) GetTopics(c *gin.Context) {
	clusterName := c.Param("clusterName")
	topics, err := h.service.GetTopics(c.Request.Context(), clusterName)
	if err != nil {
		utils.SendError(c, errors.NewInternalError("Failed to get topics: "+err.Error()))
		return
	}

	utils.SendSuccess(c, topics, "Topics retrieved successfully")
}

// GetTopicDetails handles GET requests to /api/clusters/:clusterName/topics/:topicName
func (h *TopicHandler) GetTopicDetails(c *gin.Context) {
	clusterName := c.Param("clusterName")
	topicName := c.Param("topicName")

	details, err := h.service.GetTopicDetails(c.Request.Context(), clusterName, topicName)
	if err != nil {
		utils.SendError(c, errors.NewInternalError("Failed to get topic details: "+err.Error()))
		return
	}

	utils.SendSuccess(c, details, "Topic details retrieved successfully")
}

// CreateTopic handles POST requests to /api/clusters/:clusterName/topics
func (h *TopicHandler) CreateTopic(c *gin.Context) {
	clusterName := c.Param("clusterName")

	var request struct {
		Name       string `json:"name" binding:"required"`
		Partitions int    `json:"partitions" binding:"required"`
		Replicas   int    `json:"replicas" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		utils.SendError(c, errors.NewValidationError("Invalid request: "+err.Error()))
		return
	}

	// Validate topic name
	if request.Name == "" {
		utils.SendError(c, errors.NewValidationError("Topic name is required"))
		return
	}

	// Validate partitions and replicas
	if request.Partitions <= 0 {
		utils.SendError(c, errors.NewValidationError("Partitions must be greater than 0"))
		return
	}
	if request.Replicas <= 0 {
		utils.SendError(c, errors.NewValidationError("Replicas must be greater than 0"))
		return
	}

	err := h.service.CreateTopic(c.Request.Context(), clusterName, request.Name, int32(request.Partitions), int16(request.Replicas))
	if err != nil {
		utils.SendError(c, errors.NewInternalError("Failed to create topic: "+err.Error()))
		return
	}

	utils.SendSuccess(c, gin.H{"name": request.Name}, fmt.Sprintf("Topic %s created successfully", request.Name))
}

// DeleteTopic handles DELETE requests to /api/clusters/:clusterName/topics/:topicName
func (h *TopicHandler) DeleteTopic(c *gin.Context) {
	clusterName := c.Param("clusterName")
	topicName := c.Param("topicName")

	// Prevent deletion of system topics
	if topicName == "__consumer_offsets" {
		utils.SendError(c, errors.NewValidationError("Cannot delete system topic"))
		return
	}

	err := h.service.DeleteTopic(c.Request.Context(), clusterName, topicName)
	if err != nil {
		utils.SendError(c, errors.NewInternalError("Failed to delete topic: "+err.Error()))
		return
	}

	utils.SendSuccess(c, gin.H{"name": topicName}, fmt.Sprintf("Topic %s deleted successfully", topicName))
}
