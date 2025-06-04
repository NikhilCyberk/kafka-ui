package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nikhilgoenkatech/kafka-ui/internal/kafka"
	"github.com/IBM/sarama"
	"encoding/json"
)

type MessageHandler struct {
	service *kafka.MessageService
}

func NewMessageHandler(service *kafka.MessageService) *MessageHandler {
	return &MessageHandler{service: service}
}

// GetMessages handles GET /api/messages/:topic
func (h *MessageHandler) GetMessages(c *gin.Context) {
	topic := c.Param("topic")
	
	// Parse filter parameters
	filter := &kafka.MessageFilter{}
	
	if key := c.Query("key"); key != "" {
		filter.Key = key
	}
	
	if value := c.Query("value"); value != "" {
		filter.Value = value
	}
	
	if startTime := c.Query("start_time"); startTime != "" {
		t, err := time.Parse(time.RFC3339, startTime)
		if err == nil {
			filter.StartTime = &t
		}
	}
	
	if endTime := c.Query("end_time"); endTime != "" {
		t, err := time.Parse(time.RFC3339, endTime)
		if err == nil {
			filter.EndTime = &t
		}
	}
	
	if format := c.Query("format"); format != "" {
		filter.Format = kafka.MessageFormat(format)
	}

	messages, err := h.service.GetMessages(c.Request.Context(), topic, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"messages": messages})
}

// ReplayMessages handles POST /api/messages/:topic/replay
func (h *MessageHandler) ReplayMessages(c *gin.Context) {
	topic := c.Param("topic")
	
	startOffset, err := strconv.ParseInt(c.Query("start_offset"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start_offset"})
		return
	}
	
	endOffset, err := strconv.ParseInt(c.Query("end_offset"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end_offset"})
		return
	}

	err = h.service.ReplayMessages(c.Request.Context(), topic, startOffset, endOffset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Messages replayed successfully"})
}

// ValidateMessage handles POST /api/messages/validate
func (h *MessageHandler) ValidateMessage(c *gin.Context) {
	var msg kafka.Message
	if err := c.ShouldBindJSON(&msg); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.service.ValidateMessage(&msg)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message is valid"})
}

// ProduceMessage handles POST /api/messages/:topic
func (h *MessageHandler) ProduceMessage(c *gin.Context) {
	topic := c.Param("topic")
	
	var msg struct {
		Key   string      `json:"key" binding:"required"`
		Value interface{} `json:"value" binding:"required"`
		Format kafka.MessageFormat `json:"format"`
	}
	
	if err := c.ShouldBindJSON(&msg); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create a producer
	producer, err := sarama.NewSyncProducer(h.service.GetBrokers(), h.service.GetConfig())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create producer: %v", err)})
		return
	}
	defer producer.Close()

	// Convert value to bytes based on format
	var valueBytes []byte
	switch msg.Format {
	case kafka.FormatJSON:
		valueBytes, err = json.Marshal(msg.Value)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Failed to marshal JSON: %v", err)})
			return
		}
	default:
		// For non-JSON formats, convert to string
		valueBytes = []byte(fmt.Sprintf("%v", msg.Value))
	}

	// Produce the message
	_, _, err = producer.SendMessage(&sarama.ProducerMessage{
		Topic: topic,
		Key:   sarama.StringEncoder(msg.Key),
		Value: sarama.ByteEncoder(valueBytes),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to produce message: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message produced successfully"})
}
