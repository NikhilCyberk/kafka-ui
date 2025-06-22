package kafka

import (
	"context"
	"fmt"

	"github.com/IBM/sarama"
)

// APIPartitionMetadata defines the structure for partition details in the API response.
type APIPartitionMetadata struct {
	ID              int32   `json:"id"`
	Leader          int32   `json:"leader"`
	Replicas        []int32 `json:"replicas"`
	Isr             []int32 `json:"isr"`
	OfflineReplicas []int32 `json:"offlineReplicas"`
}

// APITopicDetails defines the structure for the detailed topic view in the API response.
type APITopicDetails struct {
	Name              string                 `json:"name"`
	Partitions        []APIPartitionMetadata `json:"partitions"`
	Configs           map[string]string      `json:"configs"`
	ReplicationFactor int                    `json:"replicationFactor"`
}

// APITopicSummary defines the structure for topic list items.
type APITopicSummary struct {
	Name              string `json:"name"`
	PartitionCount    int    `json:"partitionCount"`
	ReplicationFactor int    `json:"replicationFactor"`
}

// TopicService handles topic-related operations.
type TopicService struct {
	kafkaService *Service
}

// NewTopicService creates a new TopicService.
func NewTopicService(kafkaService *Service) *TopicService {
	return &TopicService{
		kafkaService: kafkaService,
	}
}

// GetTopics returns a list of all topics for a specific cluster with summary details.
func (s *TopicService) GetTopics(ctx context.Context, clusterName string) ([]APITopicSummary, error) {
	admin, err := s.kafkaService.GetClient(clusterName)
	if err != nil {
		return nil, err
	}

	topics, err := admin.ListTopics()
	if err != nil {
		return nil, fmt.Errorf("failed to list topics for cluster %s: %w", clusterName, err)
	}

	topicNames := make([]string, 0, len(topics))
	for name := range topics {
		topicNames = append(topicNames, name)
	}

	if len(topicNames) == 0 {
		return []APITopicSummary{}, nil
	}

	metadata, err := admin.DescribeTopics(topicNames)
	if err != nil {
		return nil, fmt.Errorf("failed to describe topics: %w", err)
	}

	summaries := make([]APITopicSummary, len(metadata))
	for i, topic := range metadata {
		summaries[i] = APITopicSummary{
			Name:              topic.Name,
			PartitionCount:    len(topic.Partitions),
			ReplicationFactor: len(topic.Partitions[0].Replicas), // Assuming RF is consistent
		}
	}

	return summaries, nil
}

// GetTopicDetails retrieves detailed information about a specific topic.
func (s *TopicService) GetTopicDetails(ctx context.Context, clusterName string, topicName string) (*APITopicDetails, error) {
	admin, err := s.kafkaService.GetClient(clusterName)
	if err != nil {
		return nil, err
	}

	metadata, err := admin.DescribeTopics([]string{topicName})
	if err != nil {
		return nil, fmt.Errorf("failed to describe topic %s: %w", topicName, err)
	}

	if len(metadata) == 0 || metadata[0] == nil {
		return nil, fmt.Errorf("topic not found: %s", topicName)
	}

	topic := metadata[0]
	if topic.Err != sarama.ErrNoError {
		return nil, fmt.Errorf("error describing topic %s: %w", topicName, topic.Err)
	}

	// Manually construct the response with the correct field names
	partitions := make([]APIPartitionMetadata, len(topic.Partitions))
	for i, p := range topic.Partitions {
		partitions[i] = APIPartitionMetadata{
			ID:              p.ID,
			Leader:          p.Leader,
			Replicas:        p.Replicas,
			Isr:             p.Isr,
			OfflineReplicas: p.OfflineReplicas,
		}
	}

	// Fetch topic configs
	configs := make(map[string]string)
	resource := sarama.ConfigResource{
		Type: sarama.TopicResource,
		Name: topicName,
	}
	configEntries, err := admin.DescribeConfig(resource)
	if err == nil {
		for _, entry := range configEntries {
			configs[entry.Name] = entry.Value
		}
	}

	return &APITopicDetails{
		Name:              topicName,
		Partitions:        partitions,
		Configs:           configs,
		ReplicationFactor: len(topic.Partitions[0].Replicas),
	}, nil
}

// CreateTopic creates a new topic in a specific cluster.
func (s *TopicService) CreateTopic(ctx context.Context, clusterName string, topicName string, numPartitions int32, replicationFactor int16) error {
	admin, err := s.kafkaService.GetClient(clusterName)
	if err != nil {
		return err
	}

	topicDetail := &sarama.TopicDetail{
		NumPartitions:     numPartitions,
		ReplicationFactor: replicationFactor,
	}

	return admin.CreateTopic(topicName, topicDetail, false)
}

// DeleteTopic deletes a topic from a specific cluster.
func (s *TopicService) DeleteTopic(ctx context.Context, clusterName, topicName string) error {
	admin, err := s.kafkaService.GetClient(clusterName)
	if err != nil {
		return err
	}

	return admin.DeleteTopic(topicName)
}
