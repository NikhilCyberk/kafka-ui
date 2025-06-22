// internal/kafka/client.go
package kafka

import (
	"fmt"
	"sync"
	"time"

	"github.com/IBM/sarama"
)

// Service manages multiple Kafka cluster clients.
type Service struct {
	clients map[string]sarama.ClusterAdmin
	brokers map[string][]string
	mu      sync.RWMutex
}

// NewService creates a new Kafka service manager.
func NewService() *Service {
	return &Service{
		clients: make(map[string]sarama.ClusterAdmin),
		brokers: make(map[string][]string),
	}
}

// AddCluster connects to a new Kafka cluster and adds it to the manager.
func (s *Service) AddCluster(name string, brokers []string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.clients[name]; exists {
		return fmt.Errorf("cluster with name '%s' already exists", name)
	}

	config := sarama.NewConfig()
	config.Version = sarama.V2_5_0_0 // A more modern, safe default
	config.ClientID = "kafka-ui-backend"
	// Add a timeout to prevent the request from hanging indefinitely on an invalid address.
	config.Net.DialTimeout = 5 * time.Second

	admin, err := sarama.NewClusterAdmin(brokers, config)
	if err != nil {
		return fmt.Errorf("failed to create cluster admin for %s: %w", name, err)
	}

	// Test the connection by listing topics. This is a lightweight way to verify connectivity.
	_, err = admin.ListTopics()
	if err != nil {
		admin.Close() // Clean up the failed connection
		return fmt.Errorf("failed to connect to cluster %s: %w", name, err)
	}

	s.clients[name] = admin
	s.brokers[name] = brokers
	return nil
}

// RemoveCluster disconnects and removes a Kafka cluster from the manager.
func (s *Service) RemoveCluster(name string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	client, exists := s.clients[name]
	if !exists {
		return fmt.Errorf("cluster '%s' not found", name)
	}

	delete(s.clients, name)
	delete(s.brokers, name)
	return client.Close()
}

// GetClient retrieves a client for a specific cluster.
func (s *Service) GetClient(clusterName string) (sarama.ClusterAdmin, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	client, exists := s.clients[clusterName]
	if !exists {
		return nil, fmt.Errorf("client for cluster '%s' not found", clusterName)
	}
	return client, nil
}

// GetBrokers retrieves the broker list for a specific cluster.
func (s *Service) GetBrokers(clusterName string) ([]string, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	brokers, exists := s.brokers[clusterName]
	if !exists {
		return nil, fmt.Errorf("brokers for cluster '%s' not found", clusterName)
	}
	return brokers, nil
}

// ListClusters returns the names of all managed clusters.
func (s *Service) ListClusters() []string {
	s.mu.RLock()
	defer s.mu.RUnlock()

	names := make([]string, 0, len(s.clients))
	for name := range s.clients {
		names = append(names, name)
	}
	return names
}

// Close gracefully closes all cluster connections.
func (s *Service) Close() {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, client := range s.clients {
		client.Close()
	}
}
