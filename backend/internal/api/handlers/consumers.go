package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nikhilgoenkatech/kafka-ui/internal/kafka"
)

type ConsumerHandler struct {
	client *kafka.KafkaClient
}

func NewConsumerHandler(client *kafka.KafkaClient) *ConsumerHandler {
	return &ConsumerHandler{client: client}
}

func (h *ConsumerHandler) ListConsumers(c *gin.Context) {
	consumers, err := h.client.ListConsumerGroups()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"consumers": consumers})
}

func (h *ConsumerHandler) GetConsumerDetails(c *gin.Context) {
	consumerID := c.Param("id")
	details, err := h.client.GetConsumerGroupDetails(consumerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, details)
}
