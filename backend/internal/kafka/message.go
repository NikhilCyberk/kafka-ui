package kafka

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/IBM/sarama"
	"github.com/segmentio/kafka-go"
)

type MessageFormat string

const (
	FormatJSON    MessageFormat = "json"
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

func NewMessageService(client *KafkaClient) *MessageService {
	config := sarama.NewConfig()
	config.Version = sarama.V2_0_0_0
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
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:   s.client.Brokers,
		Topic:     topic,
		MinBytes:  10e3,
		MaxBytes:  10e6,
		MaxWait:   time.Second,
	})

	defer reader.Close()

	// Set initial offset based on filter
	if filter != nil && filter.StartTime != nil {
		// Start from the beginning and filter by time
		if err := reader.SetOffset(kafka.FirstOffset); err != nil {
			return nil, fmt.Errorf("failed to set initial offset: %v", err)
		}
	} else {
		if err := reader.SetOffset(kafka.FirstOffset); err != nil {
			return nil, fmt.Errorf("failed to set initial offset: %v", err)
		}
	}

	messages := make([]Message, 0)
	for {
		select {
		case <-ctx.Done():
			return messages, nil
		default:
			m, err := reader.ReadMessage(ctx)
			if err != nil {
				if err == context.DeadlineExceeded {
					return messages, nil
				}
				return nil, fmt.Errorf("failed to read message: %v", err)
			}

			// Apply filters
			if filter != nil {
				if !s.matchesFilter(m, filter) {
					continue
				}
			}

			// Parse message value based on format
			value, format, err := s.parseMessageValue(m.Value)
			if err != nil {
				continue // Skip messages that can't be parsed
			}

			msg := Message{
				Topic:     m.Topic,
				Partition: int32(m.Partition),
				Offset:    m.Offset,
				Key:       string(m.Key),
				Value:     value,
				Timestamp: m.Time,
				Format:    format,
			}

			messages = append(messages, msg)

			// Check if we've reached the end time
			if filter != nil && filter.EndTime != nil && m.Time.After(*filter.EndTime) {
				return messages, nil
			}
		}
	}
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

// Helper functions

func (s *MessageService) matchesFilter(m kafka.Message, filter *MessageFilter) bool {
	if filter.Key != "" && string(m.Key) != filter.Key {
		return false
	}

	if filter.Value != "" {
		valueStr := string(m.Value)
		if valueStr != filter.Value {
			return false
		}
	}

	if filter.StartTime != nil && m.Time.Before(*filter.StartTime) {
		return false
	}

	if filter.EndTime != nil && m.Time.After(*filter.EndTime) {
		return false
	}

	return true
}

func (s *MessageService) parseMessageValue(value []byte) (interface{}, MessageFormat, error) {
	// Try parsing as JSON first
	var jsonValue interface{}
	if err := json.Unmarshal(value, &jsonValue); err == nil {
		return jsonValue, FormatJSON, nil
	}

	// TODO: Add Avro and Protobuf parsing
	// For now, return raw bytes for non-JSON messages
	return string(value), FormatJSON, nil
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