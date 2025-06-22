package kafka

import (
	"bytes"
	"context"
	"encoding/binary"
	"fmt"
)

type GroupMember struct {
	ClientID           string             `json:"client_id"`
	ClientHost         string             `json:"client_host"`
	MemberID           string             `json:"member_id"`
	Topics             []string           `json:"topics"`
	AssignedPartitions map[string][]int32 `json:"assigned_partitions"`
}

type ConsumerGroupService struct {
	kafkaService *Service
}

func NewConsumerGroupService(kafkaService *Service) *ConsumerGroupService {
	return &ConsumerGroupService{
		kafkaService: kafkaService,
	}
}

// ConsumerGroupSummary is returned to the frontend
type ConsumerGroupSummary struct {
	GroupID     string `json:"group_id"`
	State       string `json:"state"`
	NumMembers  int    `json:"num_members"`
	NumTopics   int    `json:"num_topics"`
	ConsumerLag int64  `json:"consumer_lag"`
}

// ConsumerGroupDetails is returned to the frontend
type ConsumerGroupDetails struct {
	GroupID      string        `json:"group_id"`
	State        string        `json:"state"`
	Protocol     string        `json:"protocol"`
	ProtocolType string        `json:"protocol_type"`
	Members      []GroupMember `json:"members"`
}

// parseMemberAssignment parses the member assignment bytes and returns a map of topics to partitions.
func parseMemberAssignment(assignment []byte) (map[string][]int32, error) {
	topics := make(map[string][]int32)
	if len(assignment) == 0 {
		return topics, nil
	}
	buf := bytes.NewBuffer(assignment)
	// Version (int16)
	var version int16
	if err := binary.Read(buf, binary.BigEndian, &version); err != nil {
		return topics, err
	}
	// Topic count (array length)
	var topicCount int32
	if err := binary.Read(buf, binary.BigEndian, &topicCount); err != nil {
		return topics, err
	}
	for i := int32(0); i < topicCount; i++ {
		// Topic name
		var topicLen int16
		if err := binary.Read(buf, binary.BigEndian, &topicLen); err != nil {
			return topics, err
		}
		topicName := make([]byte, topicLen)
		if _, err := buf.Read(topicName); err != nil {
			return topics, err
		}
		// Partition count
		var partitionCount int32
		if err := binary.Read(buf, binary.BigEndian, &partitionCount); err != nil {
			return topics, err
		}
		partitions := make([]int32, partitionCount)
		for j := int32(0); j < partitionCount; j++ {
			if err := binary.Read(buf, binary.BigEndian, &partitions[j]); err != nil {
				return topics, err
			}
		}
		topics[string(topicName)] = partitions
	}
	return topics, nil
}

// GetConsumerGroups returns a list of all consumer groups for a specific cluster.
func (s *ConsumerGroupService) GetConsumerGroups(ctx context.Context, clusterName string) ([]ConsumerGroupSummary, error) {
	admin, err := s.kafkaService.GetClient(clusterName)
	if err != nil {
		return nil, err
	}

	groups, err := admin.ListConsumerGroups()
	if err != nil {
		return nil, fmt.Errorf("failed to list consumer groups for cluster %s: %w", clusterName, err)
	}

	groupIDs := make([]string, 0, len(groups))
	for groupID := range groups {
		groupIDs = append(groupIDs, groupID)
	}

	// Describe all groups to get their state, members
	desc, err := admin.DescribeConsumerGroups(groupIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to describe consumer groups: %w", err)
	}

	// Get lag for all groups
	metricsSvc := NewMetricsService(s.kafkaService)
	lagList, _ := metricsSvc.GetConsumerGroupsLag(ctx, clusterName)
	lagMap := make(map[string]int64)
	for _, lag := range lagList {
		lagMap[lag.GroupID] += lag.TotalLag
	}

	summaries := make([]ConsumerGroupSummary, 0, len(desc))
	for _, d := range desc {
		if d == nil {
			continue
		}
		// Count unique topics
		topicSet := make(map[string]struct{})
		for _, m := range d.Members {
			topics, err := parseMemberAssignment(m.MemberAssignment)
			if err != nil {
				continue
			}
			for t := range topics {
				topicSet[t] = struct{}{}
			}
		}
		summaries = append(summaries, ConsumerGroupSummary{
			GroupID:     d.GroupId,
			State:       d.State,
			NumMembers:  len(d.Members),
			NumTopics:   len(topicSet),
			ConsumerLag: lagMap[d.GroupId],
		})
	}

	return summaries, nil
}

// GetConsumerGroupDetails returns detailed information about a consumer group.
func (s *ConsumerGroupService) GetConsumerGroupDetails(ctx context.Context, clusterName, groupID string) (*ConsumerGroupDetails, error) {
	admin, err := s.kafkaService.GetClient(clusterName)
	if err != nil {
		return nil, err
	}

	desc, err := admin.DescribeConsumerGroups([]string{groupID})
	if err != nil {
		return nil, fmt.Errorf("failed to describe consumer group %s: %w", groupID, err)
	}
	if len(desc) == 0 || desc[0] == nil {
		return nil, fmt.Errorf("consumer group '%s' not found", groupID)
	}
	d := desc[0]

	var memberList []GroupMember
	for _, m := range d.Members {
		assignedTopics, err := parseMemberAssignment(m.MemberAssignment)
		if err != nil {
			// Log or handle error if necessary, but continue processing
			continue
		}

		topics := make([]string, 0, len(assignedTopics))
		for topic := range assignedTopics {
			topics = append(topics, topic)
		}

		member := GroupMember{
			ClientID:   m.ClientId,
			ClientHost: m.ClientHost,
			Topics:     topics,
		}
		memberList = append(memberList, member)
	}

	resp := &ConsumerGroupDetails{
		GroupID:      d.GroupId,
		State:        d.State,
		Protocol:     d.Protocol,
		ProtocolType: d.ProtocolType,
		Members:      memberList,
	}
	return resp, nil
}
