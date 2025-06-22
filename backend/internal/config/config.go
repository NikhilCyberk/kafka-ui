package config

import (
	"os"

	"gopkg.in/yaml.v2"
)

type ClusterConfig struct {
	Name    string   `yaml:"name"`
	Brokers []string `yaml:"brokers"`
}

type Config struct {
	Clusters []ClusterConfig `yaml:"clusters"`
}

func LoadConfig(path string) (*Config, error) {
	config := &Config{}

	file, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	err = yaml.Unmarshal(file, config)
	if err != nil {
		return nil, err
	}

	return config, nil
}
