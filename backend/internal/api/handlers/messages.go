package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/nikhilgoenkatech/kafka-ui/internal/kafka"
)

type MessageHandler struct {
	client *kafka.KafkaClient
}

func NewMessageHandler(client *kafka.KafkaClient) *MessageHandler {
	return &MessageHandler{client: client}
}

func (h *MessageHandler) GetMessages(c *gin.Context) {
	topic := c.Param("topic")
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10
	}

	messages, err := h.client.ConsumeMessages(topic, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"messages": messages})
}

type ProduceMessageRequest struct {
	Key   string `json:"key"`
	Value string `json:"value" binding:"required"`
}

func (h *MessageHandler) ProduceMessage(c *gin.Context) {
	topicName := c.Param("topic")
	var req ProduceMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.client.ProduceMessage(topicName, req.Key, req.Value)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Message produced successfully"})
}
