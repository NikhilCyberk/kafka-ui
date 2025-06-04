package kafka

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/IBM/sarama"
)

type MessageFormat string

const (
	FormatJSON    MessageFormat = "json"
	FormatString  MessageFormat = "string"
	FormatAvro    MessageFormat = "avro"
	FormatProtobuf MessageFormat = "protobuf"
)

type MessageFilter struct {
	Key       string      `json:"key,omitempty"`
	Value     string      `json:"value,omitempty"`
	StartTime *time.Time  `json:"start_time,omitempty"`
	EndTime   *time.Time  `json:"end_time,omitempty"`
	Format    MessageFormat `json:"format,omitempty"`
}

type Message struct {
	Topic     string          `json:"topic"`
	Partition int32          `json:"partition"`
	Offset    int64          `json:"offset"`
	Key       string         `json:"key"`
	Value     interface{}    `json:"value"`
	Timestamp time.Time      `json:"timestamp"`
	Format    MessageFormat  `json:"format"`
}

type MessageService struct {
	client *KafkaClient
	config *sarama.Config
}

// MessageSearch represents search criteria for messages
type MessageSearch struct {
	Query     string    `json:"query"`
	StartTime *time.Time `json:"start_time,omitempty"`
	EndTime   *time.Time `json:"end_time,omitempty"`
	Format    MessageFormat `json:"format,omitempty"`
}

func NewMessageService(client *KafkaClient) *MessageService {
	config := sarama.NewConfig()
	config.Version = sarama.V2_0_0_0
	
	// Configure producer settings
	config.Producer.Return.Successes = true
	config.Producer.Return.Errors = true
	config.Producer.RequiredAcks = sarama.WaitForAll
	
	// Configure consumer settings
	config.Consumer.Return.Errors = true
	
	return &MessageService{
		client: client,
		config: config,
	}
}

// GetBrokers returns the list of Kafka brokers
func (s *MessageService) GetBrokers() []string {
	return s.client.Brokers
}

// GetConfig returns the Sarama configuration
func (s *MessageService) GetConfig() *sarama.Config {
	return s.config
}

// GetMessages retrieves messages from a topic with filtering capabilities
func (s *MessageService) GetMessages(ctx context.Context, topic string, filter *MessageFilter) ([]Message, error) {
	fmt.Printf("Creating consumer for topic: %s\n", topic)
	// Create a consumer
	consumer, err := sarama.NewConsumer(s.client.Brokers, s.config)
	if err != nil {
		fmt.Printf("Failed to create consumer: %v\n", err)
		return nil, fmt.Errorf("failed to create consumer: %v", err)
	}
	defer consumer.Close()

	fmt.Printf("Getting partitions for topic: %s\n", topic)
	// Get topic partitions
	partitions, err := consumer.Partitions(topic)
	if err != nil {
		fmt.Printf("Failed to get partitions: %v\n", err)
		return nil, fmt.Errorf("failed to get partitions: %v", err)
	}
	fmt.Printf("Found %d partitions\n", len(partitions))

	messages := make([]Message, 0)
	maxMessages := 100

	// Create a timeout context
	timeoutCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	// Read from each partition
	for _, partition := range partitions {
		fmt.Printf("Creating partition consumer for partition %d\n", partition)
		// Create partition consumer with OffsetOldest
		pc, err := consumer.ConsumePartition(topic, partition, sarama.OffsetOldest)
		if err != nil {
			fmt.Printf("Failed to create partition consumer: %v\n", err)
			return nil, fmt.Errorf("failed to create partition consumer: %v", err)
		}
		defer pc.Close()

		fmt.Printf("Reading messages from partition %d\n", partition)
		// Read messages
		for i := 0; i < maxMessages; i++ {
			select {
			case <-timeoutCtx.Done():
				fmt.Printf("Timeout reached while reading messages\n")
				return messages, nil
			case msg, ok := <-pc.Messages():
				if !ok {
					fmt.Printf("Partition consumer closed for partition %d\n", partition)
					break
				}

				fmt.Printf("Received message from partition %d, offset %d\n", partition, msg.Offset)

				// Apply filters
				if filter != nil {
					if !s.matchesFilter(msg, filter) {
						fmt.Printf("Message filtered out\n")
						continue
					}
				}

				// Parse message
				message, err := s.parseMessage(msg)
				if err != nil {
					fmt.Printf("Failed to parse message: %v\n", err)
					continue // Skip messages that can't be parsed
				}

				messages = append(messages, message)
				fmt.Printf("Added message to result set, total messages: %d\n", len(messages))

				// Check if we've reached the end time
				if filter != nil && filter.EndTime != nil && msg.Timestamp.After(*filter.EndTime) {
					fmt.Printf("Reached end time filter\n")
					return messages, nil
				}
			}
		}
	}

	fmt.Printf("Finished reading messages, total count: %d\n", len(messages))
	return messages, nil
}

// ReplayMessages replays messages from a specific offset
func (s *MessageService) ReplayMessages(ctx context.Context, topic string, startOffset int64, endOffset int64) error {
	// Create a producer
	producer, err := sarama.NewSyncProducer(s.client.Brokers, s.config)
	if err != nil {
		return fmt.Errorf("failed to create producer: %v", err)
	}
	defer producer.Close()

	// Create a consumer
	consumer, err := sarama.NewConsumer(s.client.Brokers, s.config)
	if err != nil {
		return fmt.Errorf("failed to create consumer: %v", err)
	}
	defer consumer.Close()

	// Get partition
	partition, err := consumer.ConsumePartition(topic, 0, startOffset)
	if err != nil {
		return fmt.Errorf("failed to consume partition: %v", err)
	}
	defer partition.Close()

	// Read and replay messages
	for {
		select {
		case <-ctx.Done():
			return nil
		default:
			msg, ok := <-partition.Messages()
			if !ok {
				return fmt.Errorf("partition consumer closed")
			}

			// Check if we've reached the end offset
			if msg.Offset >= endOffset {
				return nil
			}

			// Produce the message
			_, _, err = producer.SendMessage(&sarama.ProducerMessage{
				Topic: topic,
				Key:   sarama.StringEncoder(msg.Key),
				Value: sarama.ByteEncoder(msg.Value),
			})
			if err != nil {
				return fmt.Errorf("failed to replay message: %v", err)
			}
		}
	}
}

// ValidateMessage validates a message against a schema
func (s *MessageService) ValidateMessage(msg *Message) error {
	switch msg.Format {
	case FormatJSON:
		return s.validateJSON(msg.Value)
	case FormatAvro:
		return s.validateAvro(msg.Value)
	case FormatProtobuf:
		return s.validateProtobuf(msg.Value)
	default:
		return fmt.Errorf("unsupported message format: %s", msg.Format)
	}
}

// SearchMessages searches for messages in a topic based on the search criteria
func (s *MessageService) SearchMessages(ctx context.Context, topic string, search *MessageSearch) ([]Message, error) {
	// Create a consumer
	consumer, err := sarama.NewConsumer(s.client.Brokers, s.config)
	if err != nil {
		return nil, fmt.Errorf("failed to create consumer: %v", err)
	}
	defer consumer.Close()

	// Get topic partitions
	partitions, err := consumer.Partitions(topic)
	if err != nil {
		return nil, fmt.Errorf("failed to get partitions: %v", err)
	}

	var messages []Message
	for _, partition := range partitions {
		// Create partition consumer
		pc, err := consumer.ConsumePartition(topic, partition, sarama.OffsetOldest)
		if err != nil {
			return nil, fmt.Errorf("failed to create partition consumer: %v", err)
		}
		defer pc.Close()

		// Read messages
		for msg := range pc.Messages() {
			// Check if message matches search criteria
			if s.matchesSearch(msg, search) {
				message, err := s.parseMessage(msg)
				if err != nil {
					continue
				}
				messages = append(messages, message)
			}
		}
	}

	return messages, nil
}

// matchesSearch checks if a message matches the search criteria
func (s *MessageService) matchesSearch(msg *sarama.ConsumerMessage, search *MessageSearch) bool {
	// Check time range if specified
	if search.StartTime != nil && msg.Timestamp.Before(*search.StartTime) {
		return false
	}
	if search.EndTime != nil && msg.Timestamp.After(*search.EndTime) {
		return false
	}

	// Check if message content matches search query
	if search.Query != "" {
		// Search in key
		if strings.Contains(string(msg.Key), search.Query) {
			return true
		}

		// Search in value
		if strings.Contains(string(msg.Value), search.Query) {
			return true
		}

		// If no match found, return false
		return false
	}

	return true
}

// Helper functions

func (s *MessageService) matchesFilter(msg *sarama.ConsumerMessage, filter *MessageFilter) bool {
	if filter.Key != "" && string(msg.Key) != filter.Key {
		return false
	}

	if filter.Value != "" {
		valueStr := string(msg.Value)
		if valueStr != filter.Value {
			return false
		}
	}

	if filter.StartTime != nil && msg.Timestamp.Before(*filter.StartTime) {
		return false
	}

	if filter.EndTime != nil && msg.Timestamp.After(*filter.EndTime) {
		return false
	}

	return true
}

// parseMessage parses a Kafka message into our Message type
func (s *MessageService) parseMessage(msg *sarama.ConsumerMessage) (Message, error) {
	// Parse message value based on format
	value, format, err := s.parseMessageValue(msg.Value)
	if err != nil {
		return Message{}, fmt.Errorf("failed to parse message value: %v", err)
	}

	return Message{
		Topic:     msg.Topic,
		Partition: msg.Partition,
		Offset:    msg.Offset,
		Key:       string(msg.Key),
		Value:     value,
		Timestamp: msg.Timestamp,
		Format:    format,
	}, nil
}

// parseMessageValue parses the message value based on its format
func (s *MessageService) parseMessageValue(value []byte) (interface{}, MessageFormat, error) {
	// Try to parse as JSON first
	var jsonValue interface{}
	if err := json.Unmarshal(value, &jsonValue); err == nil {
		return jsonValue, FormatJSON, nil
	}

	// If not JSON, return as string
	return string(value), FormatString, nil
}

func (s *MessageService) validateJSON(value interface{}) error {
	// Basic JSON validation
	_, err := json.Marshal(value)
	return err
}

func (s *MessageService) validateAvro(value interface{}) error {
	// TODO: Implement Avro validation
	return nil
}

func (s *MessageService) validateProtobuf(value interface{}) error {
	// TODO: Implement Protobuf validation
	return nil
} 