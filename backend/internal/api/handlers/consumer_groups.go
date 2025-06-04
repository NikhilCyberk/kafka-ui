package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nikhilgoenkatech/kafka-ui/internal/kafka"
)

type ConsumerGroupHandler struct {
	service *kafka.ConsumerGroupService
}

func NewConsumerGroupHandler(service *kafka.ConsumerGroupService) *ConsumerGroupHandler {
	return &ConsumerGroupHandler{service: service}
}

// GetConsumerGroups handles GET /api/consumer-groups
func (h *ConsumerGroupHandler) GetConsumerGroups(c *gin.Context) {
	groups, err := h.service.GetConsumerGroups(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"consumer_groups": groups})
}

// GetConsumerGroupDetails handles GET /api/consumer-groups/:groupId
func (h *ConsumerGroupHandler) GetConsumerGroupDetails(c *gin.Context) {
	groupId := c.Param("groupId")
	details, err := h.service.GetConsumerGroupDetails(c.Request.Context(), groupId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, details)
}
