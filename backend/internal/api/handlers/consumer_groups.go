package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nikhilgoenkatech/kafka-ui/internal/kafka"
)

type ConsumerGroupHandler struct {
	client *kafka.KafkaClient
}

func NewConsumerGroupHandler(client *kafka.KafkaClient) *ConsumerGroupHandler {
	return &ConsumerGroupHandler{client: client}
}

func (h *ConsumerGroupHandler) ListConsumerGroups(c *gin.Context) {
	groups, err := h.client.ListConsumerGroups()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"consumer_groups": groups})
}

func (h *ConsumerGroupHandler) GetConsumerGroupDetails(c *gin.Context) {
	groupId := c.Param("groupId")
	details, err := h.client.GetConsumerGroupDetails(groupId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, details)
}
