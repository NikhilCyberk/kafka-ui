package kafka

import (
	"context"
	"fmt"

	"github.com/nikhilgoenkatech/kafka-ui/internal/constants"
)

// BrokerService handles broker-related operations.
type BrokerService struct {
	kafkaService *Service
}

// NewBrokerService creates a new BrokerService.
func NewBrokerService(kafkaService *Service) *BrokerService {
	return &BrokerService{
		kafkaService: kafkaService,
	}
}

// GetBrokers returns a list of all brokers for a specific cluster.
func (s *BrokerService) GetBrokers(ctx context.Context, clusterName string) (interface{}, error) {
	client, err := s.kafkaService.GetClient(clusterName)
	if err != nil {
		return nil, err
	}

	brokers, _, err := client.DescribeCluster()
	if err != nil {
		return nil, fmt.Errorf(constants.ErrDescribeCluster, clusterName, err)
	}

	if len(brokers) == 0 {
		return nil, fmt.Errorf(constants.ErrNoBrokersFound, clusterName)
	}

	// You can enhance this to return more detailed information if needed.
	var brokerInfo []map[string]interface{}
	for _, b := range brokers {
		info := make(map[string]interface{})
		info[constants.BrokerIDKey] = b.ID()
		info[constants.BrokerAddrKey] = b.Addr()
		brokerInfo = append(brokerInfo, info)
	}

	return brokerInfo, nil
}
