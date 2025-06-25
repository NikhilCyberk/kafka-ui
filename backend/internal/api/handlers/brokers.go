package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/nikhilgoenkatech/kafka-ui/internal/constants"
	"github.com/nikhilgoenkatech/kafka-ui/internal/kafka"
	"github.com/nikhilgoenkatech/kafka-ui/pkg/errors"
	"github.com/nikhilgoenkatech/kafka-ui/pkg/utils"
)

type BrokerHandler struct {
	service *kafka.BrokerService
}

func NewBrokerHandler(service *kafka.BrokerService) *BrokerHandler {
	return &BrokerHandler{service: service}
}

// GetBrokers handles GET requests to /api/clusters/:clusterName/brokers
func (h *BrokerHandler) GetBrokers(c *gin.Context) {
	clusterName := c.Param("clusterName")
	brokers, err := h.service.GetBrokers(c.Request.Context(), clusterName)
	if err != nil {
		utils.SendError(c, errors.NewInternalError(constants.MsgFailedToGetBrokers+err.Error()))
		return
	}
	utils.SendSuccess(c, brokers, constants.MsgBrokersRetrievedSuccessfully)
}
