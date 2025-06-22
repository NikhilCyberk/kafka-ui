package handlers

import (
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/nikhilgoenkatech/kafka-ui/internal/kafka"
	"github.com/nikhilgoenkatech/kafka-ui/pkg/errors"
	"github.com/nikhilgoenkatech/kafka-ui/pkg/utils"
)

type MessageHandler struct {
	service *kafka.MessageService
}

func NewMessageHandler(service *kafka.MessageService) *MessageHandler {
	return &MessageHandler{service: service}
}

func (h *MessageHandler) GetMessages(c *gin.Context) {
	clusterName := c.Param("clusterName")
	topicName := c.Param("topicName")
	limitStr := c.DefaultQuery("limit", "100")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		utils.SendError(c, errors.NewValidationError("Invalid limit parameter"))
		return
	}

	messages, err := h.service.GetLatestMessages(c.Request.Context(), clusterName, topicName, limit)
	if err != nil {
		utils.SendError(c, errors.NewInternalError("Failed to get messages: "+err.Error()))
		return
	}
	utils.SendSuccess(c, messages, "Messages retrieved successfully")
}

type ProduceMessageRequest struct {
	Key       string `json:"key"`
	Value     string `json:"value"`
	Partition *int32 `json:"partition"`
}

func (h *MessageHandler) ProduceMessage(c *gin.Context) {
	clusterName := c.Param("clusterName")
	topicName := c.Param("topicName")

	var req ProduceMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, errors.NewValidationError("Invalid request body: "+err.Error()))
		return
	}

	partition := int32(-1)
	if req.Partition != nil {
		partition = *req.Partition
	}

	fmt.Printf("API: Producing to partition: %v (raw: %v)\n", partition, req.Partition)

	err := h.service.ProduceMessage(c.Request.Context(), clusterName, topicName, []byte(req.Key), []byte(req.Value), partition)
	if err != nil {
		utils.SendError(c, errors.NewInternalError("Failed to produce message: "+err.Error()))
		return
	}

	utils.SendSuccess(c, gin.H{"status": "success"}, "Message produced successfully")
}
