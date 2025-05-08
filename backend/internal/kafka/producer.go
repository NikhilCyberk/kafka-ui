package kafka

import (
	"context"
	"fmt"
	"time"

	"github.com/segmentio/kafka-go"
)

// Producer represents a Kafka message producer
type Producer struct {
	writer *kafka.Writer
}

// NewProducer creates a new Kafka producer
func NewProducer(brokers []string) *Producer {
	writer := &kafka.Writer{
		Addr:         kafka.TCP(brokers...),
		Balancer:     &kafka.LeastBytes{},
		BatchTimeout: 50 * time.Millisecond,
	}

	return &Producer{
		writer: writer,
	}
}

// ProduceMessage sends a message to a Kafka topic
func (p *Producer) ProduceMessage(topic, key, value string) error {
	message := kafka.Message{
		Topic: topic,
		Key:   []byte(key),
		Value: []byte(value),
		Time:  time.Now(),
	}

	err := p.writer.WriteMessages(context.Background(), message)
	if err != nil {
		return fmt.Errorf("failed to write message: %v", err)
	}

	return nil
}

// Close closes the producer
func (p *Producer) Close() error {
	return p.writer.Close()
}
