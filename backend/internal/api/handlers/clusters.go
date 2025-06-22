package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/nikhilgoenkatech/kafka-ui/internal/kafka"
	"github.com/nikhilgoenkatech/kafka-ui/pkg/errors"
	"github.com/nikhilgoenkatech/kafka-ui/pkg/utils"
)

type ClusterHandler struct {
	kafkaSvc *kafka.Service
}

func NewClusterHandler(kafkaSvc *kafka.Service) *ClusterHandler {
	return &ClusterHandler{kafkaSvc: kafkaSvc}
}

func (h *ClusterHandler) ListClusters(c *gin.Context) {
	clusters := h.kafkaSvc.ListClusters()
	utils.SendSuccess(c, clusters, "Clusters retrieved successfully")
}

func (h *ClusterHandler) AddCluster(c *gin.Context) {
	var req struct {
		Name    string   `json:"name" binding:"required"`
		Brokers []string `json:"brokers" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, errors.NewValidationError("Invalid request: "+err.Error()))
		return
	}

	if err := h.kafkaSvc.AddCluster(req.Name, req.Brokers); err != nil {
		utils.SendError(c, errors.NewInternalError("Failed to add cluster: "+err.Error()))
		return
	}

	utils.SendSuccess(c, gin.H{"name": req.Name}, "Cluster added successfully")
}

func (h *ClusterHandler) RemoveCluster(c *gin.Context) {
	clusterName := c.Param("clusterName")
	if err := h.kafkaSvc.RemoveCluster(clusterName); err != nil {
		utils.SendError(c, errors.NewInternalError("Failed to remove cluster: "+err.Error()))
		return
	}

	utils.SendSuccess(c, gin.H{"name": clusterName}, "Cluster removed successfully")
}
