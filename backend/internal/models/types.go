package models

type Cluster struct {
	Name             string `json:"name"`
	BootstrapServers string `json:"bootstrapServers"`
	Zookeeper        string `json:"zookeeper"`
}

type Topic struct {
	Name              string            `json:"name"`
	Partitions        int               `json:"partitions"`
	ReplicationFactor int               `json:"replicationFactor"`
	Configs           map[string]string `json:"configs"`
}

type Broker struct {
	ID   int    `json:"id"`
	Host string `json:"host"`
	Port int    `json:"port"`
	Rack string `json:"rack,omitempty"`
}

type ConsumerGroup struct {
	GroupID string   `json:"groupId"`
	State   string   `json:"state"`
	Members []string `json:"members"`
}
