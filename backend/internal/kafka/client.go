// internal/kafka/client.go
package kafka

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/IBM/sarama" // Import the Sarama package for admin functionality
	"github.com/segmentio/kafka-go"
)

// KafkaClient handles interactions with Kafka brokers
type KafkaClient struct {
	Brokers []string
	Conn    *kafka.Conn
}

// NewKafkaClient creates a new Kafka client instance
func NewKafkaClient() (*KafkaClient, error) {
	brokersStr := os.Getenv("KAFKA_BROKERS")
	if brokersStr == "" {
		brokersStr = "localhost:9092" // Default broker
	}
	brokers := strings.Split(brokersStr, ",")

	// Create connection to first broker for admin operations
	conn, err := kafka.Dial("tcp", brokers[0])
	if err != nil {
		return nil, fmt.Errorf("failed to dial: %v", err)
	}

	return &KafkaClient{
		Brokers: brokers,
		Conn:    conn,
	}, nil
}

// Close closes the Kafka connection
func (c *KafkaClient) Close() error {
	if c.Conn != nil {
		return c.Conn.Close()
	}
	return nil
}

// ListTopics returns all topics in the Kafka cluster
func (c *KafkaClient) ListTopics() ([]string, error) {
	conn, err := kafka.Dial("tcp", c.Brokers[0])
	if err != nil {
		return nil, fmt.Errorf("failed to dial: %v", err)
	}
	defer conn.Close()

	partitions, err := conn.ReadPartitions()
	if err != nil {
		return nil, fmt.Errorf("failed to read partitions: %v", err)
	}

	// Use a map to remove duplicates
	topicsMap := make(map[string]bool)
	for _, p := range partitions {
		topicsMap[p.Topic] = true
	}

	// Convert map keys to slice
	topics := make([]string, 0, len(topicsMap))
	for topic := range topicsMap {
		topics = append(topics, topic)
	}

	return topics, nil
}

// GetTopicDetails retrieves details about a specific topic
func (c *KafkaClient) GetTopicDetails(topic string) (*TopicDetails, error) {
	conn, err := kafka.Dial("tcp", c.Brokers[0])
	if err != nil {
		return nil, fmt.Errorf("failed to dial: %v", err)
	}
	defer conn.Close()

	partitions, err := conn.ReadPartitions(topic)
	if err != nil {
		return nil, fmt.Errorf("failed to read partitions: %v", err)
	}

	return &TopicDetails{
		Name:        topic,
		Partitions:  len(partitions),
		Replicas:    len(partitions[0].Replicas),
		LeaderCount: countLeaders(partitions),
	}, nil
}

// CreateTopic creates a new Kafka topic
func (c *KafkaClient) CreateTopic(name string, partitions int, replicationFactor int) error {
	conn, err := kafka.Dial("tcp", c.Brokers[0])
	if err != nil {
		return fmt.Errorf("failed to dial: %v", err)
	}
	defer conn.Close()

	topicConfig := kafka.TopicConfig{
		Topic:             name,
		NumPartitions:     partitions,
		ReplicationFactor: replicationFactor,
	}

	return conn.CreateTopics(topicConfig)
}

// DeleteTopic deletes a Kafka topic
func (c *KafkaClient) DeleteTopic(name string) error {
	conn, err := kafka.Dial("tcp", c.Brokers[0])
	if err != nil {
		return fmt.Errorf("failed to dial: %v", err)
	}
	defer conn.Close()

	return conn.DeleteTopics(name)
}

// ProduceMessage publishes a message to a Kafka topic
func (c *KafkaClient) ProduceMessage(topic, key, value string) error {
	writer := kafka.Writer{
		Addr:         kafka.TCP(c.Brokers...),
		Topic:        topic,
		Balancer:     &kafka.LeastBytes{},
		BatchTimeout: 50 * time.Millisecond,
	}
	defer writer.Close()

	message := kafka.Message{
		Key:   []byte(key),
		Value: []byte(value),
		Time:  time.Now(),
	}

	err := writer.WriteMessages(context.Background(), message)
	if err != nil {
		return fmt.Errorf("failed to write message: %v", err)
	}

	return nil
}

// ConsumeMessages retrieves messages from a Kafka topic
func (c *KafkaClient) ConsumeMessages(topic string, maxMessages int) ([]KafkaMessage, error) {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:   c.Brokers,
		Topic:     topic,
		Partition: 0,
		MinBytes:  10e3, // 10KB
		MaxBytes:  10e6, // 10MB
	})
	defer reader.Close()

	// Set initial offset to oldest messages
	err := reader.SetOffset(kafka.FirstOffset)
	if err != nil {
		return nil, fmt.Errorf("failed to set offset: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	messages := make([]KafkaMessage, 0, maxMessages)
	for i := 0; i < maxMessages; i++ {
		m, err := reader.ReadMessage(ctx)
		if err != nil {
			// If we timed out and have some messages, return them
			if len(messages) > 0 {
				break
			}
			return nil, fmt.Errorf("failed to read message: %v", err)
		}

		messages = append(messages, KafkaMessage{
			Topic:     m.Topic,
			Partition: m.Partition,
			Offset:    m.Offset,
			Key:       string(m.Key),
			Value:     string(m.Value),
			Timestamp: m.Time,
		})
	}

	return messages, nil
}

// ListConsumerGroups returns all consumer groups in the Kafka cluster
func (c *KafkaClient) ListConsumerGroups() ([]string, error) {
	// Using Sarama admin client
	config := sarama.NewConfig()
	// Set appropriate version
	config.Version = sarama.V2_0_0_0

	admin, err := sarama.NewClusterAdmin(c.Brokers, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create admin client: %v", err)
	}
	defer admin.Close()

	groups, err := admin.ListConsumerGroups()
	if err != nil {
		return nil, fmt.Errorf("failed to list consumer groups: %v", err)
	}

	groupIDs := make([]string, 0, len(groups))
	for groupID := range groups {
		groupIDs = append(groupIDs, groupID)
	}

	return groupIDs, nil
}

// GetConsumerGroupDetails retrieves details about a specific consumer group
func (c *KafkaClient) GetConsumerGroupDetails(groupID string) (*ConsumerGroupDetails, error) {
	// Implementation using Sarama admin client
	config := sarama.NewConfig()
	config.Version = sarama.V2_0_0_0

	admin, err := sarama.NewClusterAdmin(c.Brokers, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create admin client: %v", err)
	}
	defer admin.Close()

	// Get consumer group description
	description, err := admin.DescribeConsumerGroups([]string{groupID})
	if err != nil {
		return nil, fmt.Errorf("failed to describe consumer group: %v", err)
	}

	if len(description) == 0 {
		return nil, fmt.Errorf("no description found for group: %s", groupID)
	}

	// Get list of topics from members' assignments
	topicsMap := make(map[string]struct{})
	members := len(description[0].Members)

	for _, member := range description[0].Members {
		assignment, err := member.GetMemberAssignment()
		if err != nil {
			continue // Skip this member if we can't get assignment
		}

		for topic := range assignment.Topics {
			topicsMap[topic] = struct{}{}
		}
	}

	// Convert map to slice
	topics := make([]string, 0, len(topicsMap))
	for topic := range topicsMap {
		topics = append(topics, topic)
	}

	// Create a client to get topic offsets
	client, err := sarama.NewClient(c.Brokers, config)
	if err != nil {
		// If we can't create client for lag calculation, return what we have
		return &ConsumerGroupDetails{
			GroupID: groupID,
			Topics:  topics,
			Members: members,
			Lag:     0,
		}, nil
	}
	defer client.Close()

	// Calculate approximate lag (difference between latest offset and committed offset)
	// This is a simplified implementation
	var totalLag int64 = 0

	// Get the consumer group coordinator
	offsetManager, err := sarama.NewOffsetManagerFromClient(groupID, client)
	if err == nil {
		defer offsetManager.Close()

		// Try to calculate lag for each topic
		for _, topic := range topics {
			partitions, err := client.Partitions(topic)
			if err != nil {
				continue
			}

			for _, partition := range partitions {
				// Get latest offset
				latestOffset, err := client.GetOffset(topic, partition, sarama.OffsetNewest)
				if err != nil {
					continue
				}

				// Get committed offset
				partitionOffsetManager, err := offsetManager.ManagePartition(topic, partition)
				if err != nil {
					continue
				}

				committedOffset, _ := partitionOffsetManager.NextOffset()
				partitionOffsetManager.Close()

				if committedOffset > 0 { // Skip if no committed offset
					lag := latestOffset - committedOffset
					if lag > 0 {
						totalLag += lag
					}
				}
			}
		}
	}

	return &ConsumerGroupDetails{
		GroupID: groupID,
		Topics:  topics,
		Members: members,
		Lag:     totalLag,
	}, nil
}

// Helper functions
func countLeaders(partitions []kafka.Partition) int {
	leaderMap := make(map[int]bool)
	for _, p := range partitions {
		leaderMap[p.Leader.ID] = true
	}
	return len(leaderMap)
}

// Type definitions

// TopicDetails contains information about a Kafka topic
type TopicDetails struct {
	Name        string `json:"name"`
	Partitions  int    `json:"partitions"`
	Replicas    int    `json:"replicas"`
	LeaderCount int    `json:"leader_count"`
}

// KafkaMessage represents a message from a Kafka topic
type KafkaMessage struct {
	Topic     string    `json:"topic"`
	Partition int       `json:"partition"`
	Offset    int64     `json:"offset"`
	Key       string    `json:"key"`
	Value     string    `json:"value"`
	Timestamp time.Time `json:"timestamp"`
}

// ConsumerGroupDetails contains information about a Kafka consumer group
type ConsumerGroupDetails struct {
	GroupID string   `json:"group_id"`
	Topics  []string `json:"topics"`
	Members int      `json:"members"`
	Lag     int64    `json:"lag"`
}
