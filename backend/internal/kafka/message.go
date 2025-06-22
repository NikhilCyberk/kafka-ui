package kafka

import (
	"context"
	"fmt"
	"sort"
	"sync"
	"time"

	"github.com/IBM/sarama"
	"github.com/segmentio/kafka-go"
)

// APIMessage defines the structure of a message for the API response.
type APIMessage struct {
	Partition int       `json:"partition"`
	Offset    int64     `json:"offset"`
	Key       string    `json:"key"`
	Value     string    `json:"value"`
	Size      int       `json:"size"`
	Time      time.Time `json:"time"`
}

type MessageService struct {
	kafkaService *Service
}

func NewMessageService(kafkaService *Service) *MessageService {
	return &MessageService{
		kafkaService: kafkaService,
	}
}

// GetMessages - Optimized version that doesn't wait unnecessarily
func (s *MessageService) GetMessages(ctx context.Context, clusterName, topic string, limit int) ([]APIMessage, error) {
	brokers, err := s.kafkaService.GetBrokers(clusterName)
	if err != nil {
		return nil, fmt.Errorf("could not get brokers for cluster %s: %w", clusterName, err)
	}

	client, err := sarama.NewClient(brokers, nil)
	if err != nil {
		return nil, fmt.Errorf("could not create client for cluster %s: %w", clusterName, err)
	}
	defer client.Close()

	partitions, err := client.Partitions(topic)
	if err != nil {
		return nil, fmt.Errorf("failed to get partitions for topic %s: %w", topic, err)
	}

	// Check total messages available
	partitionInfo := make(map[int32]struct{ oldest, newest int64 })
	totalMessages := int64(0)

	for _, partition := range partitions {
		oldest, err := client.GetOffset(topic, partition, sarama.OffsetOldest)
		if err != nil {
			continue
		}
		newest, err := client.GetOffset(topic, partition, sarama.OffsetNewest)
		if err != nil {
			continue
		}

		partitionInfo[partition] = struct{ oldest, newest int64 }{oldest, newest}
		totalMessages += (newest - oldest)
	}

	if totalMessages == 0 {
		return []APIMessage{}, nil
	}

	// Much shorter timeout since we know exactly how many messages to read
	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	var allMessages []APIMessage
	var mu sync.Mutex
	var wg sync.WaitGroup

	for _, partition := range partitions {
		wg.Add(1)
		go func(partitionID int32) {
			defer wg.Done()

			info, exists := partitionInfo[partitionID]
			if !exists || info.newest <= info.oldest {
				return
			}

			// Read all messages from this partition efficiently
			messages := s.readPartitionMessages(ctx, brokers, topic, partitionID, info.oldest, info.newest)

			mu.Lock()
			allMessages = append(allMessages, messages...)
			mu.Unlock()
		}(partition)
	}

	wg.Wait()

	// Sort by time descending (newest first)
	sort.Slice(allMessages, func(i, j int) bool {
		return allMessages[i].Time.After(allMessages[j].Time)
	})

	// Apply limit
	if len(allMessages) > limit {
		allMessages = allMessages[:limit]
	}

	return allMessages, nil
}

// readPartitionMessages reads all messages from a partition efficiently
func (s *MessageService) readPartitionMessages(ctx context.Context, brokers []string, topic string, partitionID int32, oldest, newest int64) []APIMessage {
	var messages []APIMessage

	if newest <= oldest {
		return messages
	}

	// Create reader with correct configuration
	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers:   brokers,
		Topic:     topic,
		Partition: int(partitionID),
		MaxBytes:  1e6, // 1MB max
		MinBytes:  1,   // Don't wait for batches
	})
	defer r.Close()

	// Set starting offset
	if err := r.SetOffset(oldest); err != nil {
		return messages
	}

	expectedMessages := int(newest - oldest)
	messages = make([]APIMessage, 0, expectedMessages) // Pre-allocate slice

	// Read exactly the number of messages we expect
	for len(messages) < expectedMessages {
		select {
		case <-ctx.Done():
			return messages
		default:
		}

		// Set a very short timeout for each read operation
		readCtx, cancel := context.WithTimeout(ctx, 200*time.Millisecond)
		m, err := r.ReadMessage(readCtx)
		cancel()

		if err != nil {
			// If we can't read more messages, break (probably reached end)
			break
		}

		messages = append(messages, APIMessage{
			Partition: m.Partition,
			Offset:    m.Offset,
			Key:       string(m.Key),
			Value:     string(m.Value),
			Size:      len(m.Value),
			Time:      m.Time,
		})

		// Safety check - if we've read past what we expected, break
		if m.Offset >= newest-1 {
			break
		}
	}

	return messages
}

// GetLatestMessages - Alternative method for even faster latest message retrieval
func (s *MessageService) GetLatestMessages(ctx context.Context, clusterName, topic string, limit int) ([]APIMessage, error) {
	brokers, err := s.kafkaService.GetBrokers(clusterName)
	if err != nil {
		return nil, fmt.Errorf("could not get brokers for cluster %s: %w", clusterName, err)
	}

	client, err := sarama.NewClient(brokers, nil)
	if err != nil {
		return nil, fmt.Errorf("could not create client for cluster %s: %w", clusterName, err)
	}
	defer client.Close()

	partitions, err := client.Partitions(topic)
	if err != nil {
		return nil, fmt.Errorf("failed to get partitions for topic %s: %w", topic, err)
	}

	// Very short timeout for latest messages
	ctx, cancel := context.WithTimeout(ctx, 1*time.Second)
	defer cancel()

	var allMessages []APIMessage
	var mu sync.Mutex
	var wg sync.WaitGroup

	messagesPerPartition := limit/len(partitions) + 1

	for _, partition := range partitions {
		wg.Add(1)
		go func(partitionID int32) {
			defer wg.Done()

			oldest, err := client.GetOffset(topic, partitionID, sarama.OffsetOldest)
			if err != nil {
				return
			}
			newest, err := client.GetOffset(topic, partitionID, sarama.OffsetNewest)
			if err != nil {
				return
			}

			if newest <= oldest {
				return
			}

			// Calculate start offset for latest N messages
			startOffset := newest - int64(messagesPerPartition)
			if startOffset < oldest {
				startOffset = oldest
			}

			messages := s.readPartitionMessages(ctx, brokers, topic, partitionID, startOffset, newest)

			mu.Lock()
			allMessages = append(allMessages, messages...)
			mu.Unlock()
		}(partition)
	}

	wg.Wait()

	// Sort by time descending
	sort.Slice(allMessages, func(i, j int) bool {
		return allMessages[i].Time.After(allMessages[j].Time)
	})

	if len(allMessages) > limit {
		allMessages = allMessages[:limit]
	}

	return allMessages, nil
}

// ProduceMessage sends a message to a topic in a specific cluster, optionally to a specific partition.
// If partition is -1, one will be chosen automatically.
func (s *MessageService) ProduceMessage(ctx context.Context, clusterName, topic string, key, value []byte, partition int32) error {
	brokers, err := s.kafkaService.GetBrokers(clusterName)
	if err != nil {
		return fmt.Errorf("could not get brokers for cluster %s: %w", clusterName, err)
	}

	config := sarama.NewConfig()
	config.Producer.Return.Successes = true
	// When a specific partition is set on the message, the producer will use it.
	// When Partition is set to -1, it will use the default partitioner (e.g., round-robin).
	// We do not need to set a manual partitioner.

	producer, err := sarama.NewSyncProducer(brokers, config)
	if err != nil {
		return fmt.Errorf("could not create sync producer: %w", err)
	}
	defer producer.Close()

	msg := &sarama.ProducerMessage{
		Topic:     topic,
		Partition: partition,
		Key:       sarama.ByteEncoder(key),
		Value:     sarama.ByteEncoder(value),
	}

	fmt.Printf("Service: Producing to partition: %d\n", partition)

	_, _, err = producer.SendMessage(msg)
	return err
}
