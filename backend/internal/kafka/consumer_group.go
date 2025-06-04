package kafka

import (
	"context"
	"fmt"

	"github.com/IBM/sarama"
)

type GroupMember struct {
	ClientID      string   `json:"client_id"`
	ClientHost    string   `json:"client_host"`
	MemberID      string   `json:"member_id"`
	Topics        []string `json:"topics"`
	AssignedPartitions map[string][]int32 `json:"assigned_partitions"`
}

type ConsumerGroupService struct {
	client *KafkaClient
	config *sarama.Config
}

func NewConsumerGroupService(client *KafkaClient) *ConsumerGroupService {
	config := sarama.NewConfig()
	config.Version = sarama.V2_0_0_0
	return &ConsumerGroupService{
		client: client,
		config: config,
	}
}

// GetConsumerGroups returns a list of all consumer groups
func (s *ConsumerGroupService) GetConsumerGroups(ctx context.Context) ([]string, error) {
	admin, err := sarama.NewClusterAdmin(s.client.Brokers, s.config)
	if err != nil {
		return nil, fmt.Errorf("failed to create cluster admin: %v", err)
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

// GetConsumerGroupDetails returns detailed information about a consumer group
func (s *ConsumerGroupService) GetConsumerGroupDetails(ctx context.Context, groupID string) (map[string]interface{}, error) {
	admin, err := sarama.NewClusterAdmin(s.client.Brokers, s.config)
	if err != nil {
		return nil, fmt.Errorf("failed to create cluster admin: %v", err)
	}
	defer admin.Close()

	// Get group description
	desc, err := admin.DescribeConsumerGroups([]string{groupID})
	if err != nil {
		return nil, fmt.Errorf("failed to describe consumer group: %v", err)
	}

	if len(desc) == 0 {
		return nil, fmt.Errorf("consumer group not found")
	}

	group := desc[0]
	members := make([]GroupMember, 0, len(group.Members))
	
	// Collect unique topics from all members
	uniqueTopics := make(map[string]struct{})
	
	for _, member := range group.Members {
		topics := make([]string, 0)
		assignedPartitions := make(map[string][]int32)

		// Extract topics and partitions from member assignments
		if len(member.MemberAssignment) > 0 {
			// Create a new consumer group to decode the assignment
			consumer, err := sarama.NewConsumerGroup(s.client.Brokers, groupID, s.config)
			if err == nil {
				defer consumer.Close()
				
				// Get the member's topics and partitions
				for _, topic := range member.MemberMetadata {
					topics = append(topics, string(topic))
					uniqueTopics[string(topic)] = struct{}{}
				}
			}
		}

		members = append(members, GroupMember{
			ClientID:      member.ClientId,
			ClientHost:    member.ClientHost,
			MemberID:      member.MemberId,
			Topics:        topics,
			AssignedPartitions: assignedPartitions,
		})
	}

	// Convert unique topics map to slice
	topics := make([]string, 0, len(uniqueTopics))
	for topic := range uniqueTopics {
		topics = append(topics, topic)
	}

	// Get offsets for each topic-partition
	offsets := make(map[string]int64)
	for topic := range uniqueTopics {
		offset, err := admin.ListConsumerGroupOffsets(groupID, map[string][]int32{
			topic: nil, // Get all partitions
		})
		if err != nil {
			continue
		}
		if block, ok := offset.Blocks[topic]; ok {
			for partition, partitionOffset := range block {
				offsets[fmt.Sprintf("%s-%d", topic, partition)] = partitionOffset.Offset
			}
		}
	}

	return map[string]interface{}{
		"group_id":       group.GroupId,
		"members":        members,
		"state":          group.State,
		"protocol":       group.Protocol,
		"protocol_type":  group.ProtocolType,
		"topics":         topics,
		"offsets":        offsets,
	}, nil
} 