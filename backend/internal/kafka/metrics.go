package kafka

import (
	"context"
	"fmt"
	"time"

	"github.com/IBM/sarama"
)

type MetricsService struct {
	client sarama.Client
	admin  sarama.ClusterAdmin
}

type MessageMetrics struct {
	Time     string `json:"time"`
	Messages int64  `json:"messages"`
}

type LagMetrics struct {
	Time string `json:"time"`
	Lag  int64  `json:"lag"`
}

type BrokerHealth struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
}

type PartitionDistribution struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
}

type TopicMetrics struct {
	Name   string  `json:"name"`
	Size   int64   `json:"size"`
	Growth float64 `json:"growth"`
}

func NewMetricsService(client sarama.Client) (*MetricsService, error) {
	admin, err := sarama.NewClusterAdminFromClient(client)
	if err != nil {
		return nil, fmt.Errorf("failed to create cluster admin: %v", err)
	}

	return &MetricsService{
		client: client,
		admin:  admin,
	}, nil
}

// GetMessagesPerSecond returns the message throughput metrics for the last 24 hours
func (s *MetricsService) GetMessagesPerSecond(ctx context.Context) ([]MessageMetrics, error) {
	topics, err := s.client.Topics()
	if err != nil {
		return nil, fmt.Errorf("failed to get topics: %v", err)
	}

	metrics := make([]MessageMetrics, 24)
	now := time.Now()

	for i := 0; i < 24; i++ {
		t := now.Add(time.Duration(i-23) * time.Hour)
		var totalMessages int64

		for _, topic := range topics {
			partitions, err := s.client.Partitions(topic)
			if err != nil {
				continue
			}

			for _, partition := range partitions {
				offset, err := s.client.GetOffset(topic, partition, t.UnixNano()/int64(time.Millisecond))
				if err != nil {
					continue
				}
				totalMessages += offset
			}
		}

		metrics[i] = MessageMetrics{
			Time:     t.Format("15:04"),
			Messages: totalMessages,
		}
	}

	return metrics, nil
}

// GetLagMetrics returns the consumer lag metrics for the last 24 hours
func (s *MetricsService) GetLagMetrics(ctx context.Context) ([]LagMetrics, error) {
	groups, err := s.admin.ListConsumerGroups()
	if err != nil {
		return nil, fmt.Errorf("failed to list consumer groups: %v", err)
	}

	metrics := make([]LagMetrics, 24)
	now := time.Now()

	for i := 0; i < 24; i++ {
		t := now.Add(time.Duration(i-23) * time.Hour)
		var totalLag int64

		for group := range groups {
			offsets, err := s.admin.ListConsumerGroupOffsets(group, nil)
			if err != nil {
				continue
			}

			for topic, partitions := range offsets.Blocks {
				for partition, block := range partitions {
					if block.Offset == -1 {
						continue
					}

					// Get the latest offset for this partition
					latestOffset, err := s.client.GetOffset(topic, partition, sarama.OffsetNewest)
					if err != nil {
						continue
					}

					lag := latestOffset - block.Offset
					if lag > 0 {
						totalLag += lag
					}
				}
			}
		}

		metrics[i] = LagMetrics{
			Time: t.Format("15:04"),
			Lag:  totalLag,
		}
	}

	return metrics, nil
}

// GetBrokerHealth returns the health status of all brokers
func (s *MetricsService) GetBrokerHealth(ctx context.Context) ([]BrokerHealth, error) {
	brokers := s.client.Brokers()
	healthy := 0
	warning := 0
	critical := 0

	controller, err := s.client.Controller()
	var controllerID int32 = -1
	if err == nil && controller != nil {
		controllerID = controller.ID()
	}

	for _, broker := range brokers {
		connected, err := broker.Connected()
		if err != nil {
			critical++
			continue
		}

		if !connected {
			critical++
			continue
		}

		if broker.ID() == controllerID {
			healthy++
		} else {
			// Check for under-replicated partitions
			topics, err := s.client.Topics()
			if err != nil {
				warning++
				continue
			}

			hasUnderReplicated := false
			for _, topic := range topics {
				partitions, err := s.client.Partitions(topic)
				if err != nil {
					continue
				}

				for _, partition := range partitions {
					replicas, err := s.client.Replicas(topic, partition)
					if err != nil {
						continue
					}

					if len(replicas) < 2 {
						hasUnderReplicated = true
						break
					}
				}

				if hasUnderReplicated {
					break
				}
			}

			if hasUnderReplicated {
				warning++
			} else {
				healthy++
			}
		}
	}

	return []BrokerHealth{
		{Name: "Healthy", Value: healthy},
		{Name: "Warning", Value: warning},
		{Name: "Critical", Value: critical},
	}, nil
}

// GetPartitionDistribution returns the distribution of partition roles
func (s *MetricsService) GetPartitionDistribution(ctx context.Context) ([]PartitionDistribution, error) {
	topics, err := s.client.Topics()
	if err != nil {
		return nil, fmt.Errorf("failed to get topics: %v", err)
	}

	leaders := 0
	followers := 0
	offline := 0

	for _, topic := range topics {
		partitions, err := s.client.Partitions(topic)
		if err != nil {
			continue
		}

		for _, partition := range partitions {
			leader, err := s.client.Leader(topic, partition)
			if err != nil {
				offline++
				continue
			}

			if leader != nil {
				leaders++
			}

			replicas, err := s.client.Replicas(topic, partition)
			if err != nil {
				continue
			}

			followers += len(replicas) - 1 // Subtract 1 for the leader
		}
	}

	return []PartitionDistribution{
		{Name: "Leader", Value: leaders},
		{Name: "Follower", Value: followers},
		{Name: "Offline", Value: offline},
	}, nil
}

// GetTopicMetrics returns size and growth metrics for all topics
func (s *MetricsService) GetTopicMetrics(ctx context.Context) ([]TopicMetrics, error) {
	topics, err := s.client.Topics()
	if err != nil {
		return nil, fmt.Errorf("failed to get topics: %v", err)
	}

	metrics := make([]TopicMetrics, 0, len(topics))
	now := time.Now()
	oneHourAgo := now.Add(-1 * time.Hour)

	for _, topic := range topics {
		partitions, err := s.client.Partitions(topic)
		if err != nil {
			continue
		}

		var currentSize int64
		var previousSize int64

		for _, partition := range partitions {
			// Get current size
			currentOffset, err := s.client.GetOffset(topic, partition, sarama.OffsetNewest)
			if err != nil {
				continue
			}
			currentSize += currentOffset

			// Get size from one hour ago
			previousOffset, err := s.client.GetOffset(topic, partition, oneHourAgo.UnixNano()/int64(time.Millisecond))
			if err != nil {
				continue
			}
			previousSize += previousOffset
		}

		// Calculate growth rate
		var growth float64
		if previousSize > 0 {
			growth = float64(currentSize-previousSize) / float64(previousSize) * 100
		}

		metrics = append(metrics, TopicMetrics{
			Name:   topic,
			Size:   currentSize,
			Growth: growth,
		})
	}

	return metrics, nil
} 