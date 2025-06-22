// Application constants

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
};

// UI Constants
export const UI_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
  
  // Refresh intervals (in milliseconds)
  REFRESH_INTERVALS: {
    FAST: 5000,    // 5 seconds
    NORMAL: 30000, // 30 seconds
    SLOW: 60000,   // 1 minute
  },
  
  // Table settings
  TABLE_SETTINGS: {
    ROWS_PER_PAGE: 10,
    DENSE_PADDING: false,
  },
  
  // Notification settings
  NOTIFICATION: {
    AUTO_HIDE_DURATION: 3000,
    MAX_SNACKS: 3,
    ANCHOR_ORIGIN: {
      vertical: 'bottom',
      horizontal: 'center',
    },
  },
};

// Status constants
export const STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  HEALTHY: 'healthy',
  UNHEALTHY: 'unhealthy',
  STABLE: 'stable',
  UNSTABLE: 'unstable',
};

// Status colors
export const STATUS_COLORS = {
  [STATUS.ONLINE]: '#4caf50',
  [STATUS.OFFLINE]: '#f44336',
  [STATUS.HEALTHY]: '#4caf50',
  [STATUS.UNHEALTHY]: '#f44336',
  [STATUS.STABLE]: '#4caf50',
  [STATUS.UNSTABLE]: '#ff9800',
};

// Kafka constants
export const KAFKA_CONSTANTS = {
  // Default topic configurations
  DEFAULT_TOPIC_CONFIG: {
    numPartitions: 1,
    replicationFactor: 1,
    retentionMs: 604800000, // 7 days
    segmentMs: 86400000,    // 1 day
  },
  
  // Consumer group states
  CONSUMER_GROUP_STATES: {
    STABLE: 'Stable',
    PREPARING_REBALANCE: 'PreparingRebalance',
    COMPLETING_REBALANCE: 'CompletingRebalance',
    DEAD: 'Dead',
    EMPTY: 'Empty',
  },
  
  // Message formats
  MESSAGE_FORMATS: {
    JSON: 'json',
    STRING: 'string',
    AVRO: 'avro',
    PROTOBUF: 'protobuf',
  },
};

// Route paths
export const ROUTES = {
  LANDING: '/',
  DASHBOARD: '/dashboard',
  OVERVIEW: '/dashboard/overview',
  CLUSTERS: '/dashboard/clusters',
  TOPICS: '/dashboard/topics',
  TOPIC_DETAILS: '/dashboard/topics/:topicName',
  BROKERS: '/dashboard/brokers',
  CONSUMER_GROUPS: '/dashboard/consumer-groups',
  CONSUMER_GROUP_DETAILS: '/dashboard/consumer-groups/:groupId',
  METRICS: '/dashboard/metrics',
  MESSAGES: '/dashboard/messages',
};

// Local storage keys
export const STORAGE_KEYS = {
  SELECTED_CLUSTER: 'kafka-ui-selected-cluster',
  THEME_MODE: 'kafka-ui-theme-mode',
  REFRESH_INTERVAL: 'kafka-ui-refresh-interval',
  TABLE_SETTINGS: 'kafka-ui-table-settings',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  API_ERROR: 'API error. Please try again later.',
  CLUSTER_NOT_FOUND: 'Cluster not found.',
  TOPIC_NOT_FOUND: 'Topic not found.',
  CONSUMER_GROUP_NOT_FOUND: 'Consumer group not found.',
  UNAUTHORIZED: 'Unauthorized access.',
  FORBIDDEN: 'Access forbidden.',
  SERVER_ERROR: 'Internal server error.',
  TIMEOUT: 'Request timeout. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  CLUSTER_ADDED: 'Cluster added successfully.',
  CLUSTER_REMOVED: 'Cluster removed successfully.',
  TOPIC_CREATED: 'Topic created successfully.',
  TOPIC_DELETED: 'Topic deleted successfully.',
  MESSAGE_PRODUCED: 'Message produced successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
}; 