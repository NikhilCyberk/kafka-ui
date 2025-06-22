package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/nikhilgoenkatech/kafka-ui/internal/kafka"
	"github.com/nikhilgoenkatech/kafka-ui/pkg/errors"
	"github.com/nikhilgoenkatech/kafka-ui/pkg/utils"
)

type ConsumerGroupHandler struct {
	service *kafka.ConsumerGroupService
}

func NewConsumerGroupHandler(service *kafka.ConsumerGroupService) *ConsumerGroupHandler {
	return &ConsumerGroupHandler{service: service}
}

// GetConsumerGroups handles GET /api/consumer-groups
func (h *ConsumerGroupHandler) GetConsumerGroups(c *gin.Context) {
	clusterName := c.Param("clusterName")
	groups, err := h.service.GetConsumerGroups(c.Request.Context(), clusterName)
	if err != nil {
		utils.SendError(c, errors.NewInternalError("Failed to get consumer groups: "+err.Error()))
		return
	}

	utils.SendSuccess(c, groups, "Consumer groups retrieved successfully")
}

// GetConsumerGroupDetails handles GET /api/consumer-groups/:groupId
func (h *ConsumerGroupHandler) GetConsumerGroupDetails(c *gin.Context) {
	clusterName := c.Param("clusterName")
	groupID := c.Param("groupId")
	details, err := h.service.GetConsumerGroupDetails(c.Request.Context(), clusterName, groupID)
	if err != nil {
		utils.SendError(c, errors.NewInternalError("Failed to get consumer group details: "+err.Error()))
		return
	}

	utils.SendSuccess(c, details, "Consumer group details retrieved successfully")
}
