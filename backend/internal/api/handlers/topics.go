package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nikhilgoenkatech/kafka-ui/internal/kafka"
)

type TopicHandler struct {
	client *kafka.KafkaClient
}

func NewTopicHandler(client *kafka.KafkaClient) *TopicHandler {
	return &TopicHandler{client: client}
}

func (h *TopicHandler) ListTopics(c *gin.Context) {
	topics, err := h.client.ListTopics()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"topics": topics})
}

func (h *TopicHandler) GetTopicDetails(c *gin.Context) {
	topicName := c.Param("name")
	details, err := h.client.GetTopicDetails(topicName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, details)
}

type CreateTopicRequest struct {
	Name       string `json:"name" binding:"required"`
	Partitions int    `json:"partitions" binding:"required,min=1"`
	Replicas   int    `json:"replicas" binding:"required,min=1"`
}

func (h *TopicHandler) CreateTopic(c *gin.Context) {
	var req CreateTopicRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.client.CreateTopic(req.Name, req.Partitions, req.Replicas)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Topic created successfully"})
}

func (h *TopicHandler) DeleteTopic(c *gin.Context) {
	topicName := c.Param("name")
	err := h.client.DeleteTopic(topicName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Topic deleted successfully"})
}
