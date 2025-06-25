package handlers

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/nikhilgoenkatech/kafka-ui/internal/constants"
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
		utils.SendError(c, errors.NewInternalError(constants.MsgFailedToGetTopics+err.Error()))
		return
	}

	utils.SendSuccess(c, topics, constants.MsgTopicsRetrievedSuccessfully)
}

// GetTopicDetails handles GET requests to /api/clusters/:clusterName/topics/:topicName
func (h *TopicHandler) GetTopicDetails(c *gin.Context) {
	clusterName := c.Param("clusterName")
	topicName := c.Param("topicName")

	details, err := h.service.GetTopicDetails(c.Request.Context(), clusterName, topicName)
	if err != nil {
		utils.SendError(c, errors.NewInternalError(constants.MsgFailedToGetTopicDetails+err.Error()))
		return
	}

	utils.SendSuccess(c, details, constants.MsgTopicDetailsRetrievedSuccessfully)
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
		utils.SendError(c, errors.NewValidationError(constants.MsgInvalidRequest+err.Error()))
		return
	}

	// Validate topic name
	if request.Name == "" {
		utils.SendError(c, errors.NewValidationError(constants.MsgTopicNameRequired))
		return
	}

	// Validate partitions and replicas
	if request.Partitions <= 0 {
		utils.SendError(c, errors.NewValidationError(constants.MsgPartitionsGreaterThanZero))
		return
	}
	if request.Replicas <= 0 {
		utils.SendError(c, errors.NewValidationError(constants.MsgReplicasGreaterThanZero))
		return
	}

	err := h.service.CreateTopic(c.Request.Context(), clusterName, request.Name, int32(request.Partitions), int16(request.Replicas))
	if err != nil {
		utils.SendError(c, errors.NewInternalError(constants.MsgFailedToCreateTopic+err.Error()))
		return
	}

	utils.SendSuccess(c, gin.H{"name": request.Name}, fmt.Sprintf(constants.MsgTopicCreatedSuccessfullyFmt, request.Name))
}

// DeleteTopic handles DELETE requests to /api/clusters/:clusterName/topics/:topicName
func (h *TopicHandler) DeleteTopic(c *gin.Context) {
	clusterName := c.Param("clusterName")
	topicName := c.Param("topicName")

	// Prevent deletion of system topics
	if topicName == "__consumer_offsets" {
		utils.SendError(c, errors.NewValidationError(constants.MsgCannotDeleteSystemTopic))
		return
	}

	err := h.service.DeleteTopic(c.Request.Context(), clusterName, topicName)
	if err != nil {
		utils.SendError(c, errors.NewInternalError(constants.MsgFailedToDeleteTopic+err.Error()))
		return
	}

	utils.SendSuccess(c, gin.H{"name": topicName}, fmt.Sprintf(constants.MsgTopicDeletedSuccessfullyFmt, topicName))
}
