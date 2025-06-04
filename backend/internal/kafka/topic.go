package kafka

import (
	"context"
	"fmt"

	"github.com/IBM/sarama"
)

type TopicService struct {
	client *KafkaClient
	config *sarama.Config
}

func NewTopicService(client *KafkaClient) *TopicService {
	config := sarama.NewConfig()
	config.Version = sarama.V2_0_0_0
	return &TopicService{
		client: client,
		config: config,
	}
}

// GetTopics returns a list of all topics
func (s *TopicService) GetTopics(ctx context.Context) ([]string, error) {
	admin, err := sarama.NewClusterAdmin(s.client.Brokers, s.config)
	if err != nil {
		return nil, fmt.Errorf("failed to create cluster admin: %v", err)
	}
	defer admin.Close()

	topics, err := admin.ListTopics()
	if err != nil {
		return nil, fmt.Errorf("failed to list topics: %v", err)
	}

	topicNames := make([]string, 0, len(topics))
	for name := range topics {
		topicNames = append(topicNames, name)
	}

	return topicNames, nil
}

// GetTopicDetails returns detailed information about a topic
func (s *TopicService) GetTopicDetails(ctx context.Context, name string) (map[string]interface{}, error) {
	admin, err := sarama.NewClusterAdmin(s.client.Brokers, s.config)
	if err != nil {
		return nil, fmt.Errorf("failed to create cluster admin: %v", err)
	}
	defer admin.Close()

	// Get topic metadata
	metadata, err := admin.DescribeTopics([]string{name})
	if err != nil {
		return nil, fmt.Errorf("failed to describe topic: %v", err)
	}

	if len(metadata) == 0 {
		return nil, fmt.Errorf("topic not found: %s", name)
	}

	topic := metadata[0]

	// Get leader count
	leaderCount := 0
	for _, partition := range topic.Partitions {
		if partition.Leader != -1 {
			leaderCount++
		}
	}

	// Get replica count from the first partition if available
	replicaCount := 0
	if len(topic.Partitions) > 0 {
		replicaCount = len(topic.Partitions[0].Replicas)
	}

	return map[string]interface{}{
		"name":         name,
		"partitions":   len(topic.Partitions),
		"replicas":     replicaCount,
		"leader_count": leaderCount,
		"configs":      make(map[string]string), // TODO: Implement config retrieval
	}, nil
}

// CreateTopic creates a new topic
func (s *TopicService) CreateTopic(ctx context.Context, name string, partitions int, replicas int) error {
	admin, err := sarama.NewClusterAdmin(s.client.Brokers, s.config)
	if err != nil {
		return fmt.Errorf("failed to create cluster admin: %v", err)
	}
	defer admin.Close()

	topicDetail := &sarama.TopicDetail{
		NumPartitions:     int32(partitions),
		ReplicationFactor: int16(replicas),
	}

	return admin.CreateTopic(name, topicDetail, false)
}

// DeleteTopic deletes a topic
func (s *TopicService) DeleteTopic(ctx context.Context, name string) error {
	admin, err := sarama.NewClusterAdmin(s.client.Brokers, s.config)
	if err != nil {
		return fmt.Errorf("failed to create cluster admin: %v", err)
	}
	defer admin.Close()

	return admin.DeleteTopic(name)
} 