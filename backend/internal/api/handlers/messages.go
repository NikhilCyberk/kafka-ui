package handlers

import (
	"fmt"
	"net/http"
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

// GetMessages handles GET requests to /api/messages/:topic
func (h *MessageHandler) GetMessages(c *gin.Context) {
	topic := c.Param("topic")
	fmt.Printf("Received request for messages from topic: %s\n", topic)
	
	if topic == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "topic is required"})
		return
	}

	// Parse filter parameters
	filter := &kafka.MessageFilter{}
	fmt.Printf("Query parameters: %v\n", c.Request.URL.Query())

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

	fmt.Printf("Fetching messages with filter: %+v\n", filter)
	messages, err := h.service.GetMessages(c.Request.Context(), topic, filter)
	if err != nil {
		fmt.Printf("Error fetching messages: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Ensure we always return an array, even if empty
	if messages == nil {
		messages = make([]kafka.Message, 0)
	}

	fmt.Printf("Returning %d messages\n", len(messages))
	c.JSON(http.StatusOK, messages)
}

// ReplayMessages handles POST requests to /api/messages/:topic/replay
func (h *MessageHandler) ReplayMessages(c *gin.Context) {
	topic := c.Param("topic")
	if topic == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "topic is required"})
		return
	}

	var request struct {
		StartOffset int64 `json:"start_offset" binding:"required"`
		EndOffset   int64 `json:"end_offset" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.service.ReplayMessages(c.Request.Context(), topic, request.StartOffset, request.EndOffset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Messages replayed successfully"})
}

// ValidateMessage handles POST requests to /api/messages/validate
func (h *MessageHandler) ValidateMessage(c *gin.Context) {
	var message kafka.Message
	if err := c.ShouldBindJSON(&message); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.ValidateMessage(&message); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message is valid"})
}

// ProduceMessage handles POST requests to /api/messages/:topic
func (h *MessageHandler) ProduceMessage(c *gin.Context) {
	topic := c.Param("topic")
	if topic == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "topic is required"})
		return
	}

	var message kafka.Message
	if err := c.ShouldBindJSON(&message); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate message
	if err := h.service.ValidateMessage(&message); err != nil {
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
	switch message.Format {
	case kafka.FormatJSON:
		valueBytes, err = json.Marshal(message.Value)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Failed to marshal JSON: %v", err)})
			return
		}
	default:
		// For non-JSON formats, convert to string
		valueBytes = []byte(fmt.Sprintf("%v", message.Value))
	}

	// Produce the message
	_, _, err = producer.SendMessage(&sarama.ProducerMessage{
		Topic: topic,
		Key:   sarama.StringEncoder(message.Key),
		Value: sarama.ByteEncoder(valueBytes),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to produce message: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message produced successfully"})
}

// SearchMessages handles POST requests to /api/messages/:topic/search
func (h *MessageHandler) SearchMessages(c *gin.Context) {
	topic := c.Param("topic")
	if topic == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "topic is required"})
		return
	}

	var search kafka.MessageSearch
	if err := c.ShouldBindJSON(&search); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	messages, err := h.service.SearchMessages(c.Request.Context(), topic, &search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, messages)
}
