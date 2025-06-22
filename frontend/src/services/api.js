// API service functions for communicating with the backend

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api', // Use relative path for proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple redirects
let isRedirecting = false;

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and extract data
api.interceptors.response.use(
  (response) => {
    // Extract data from the response format
    if (response.data && response.data.success !== undefined) {
      // New format: { success: true, data: {...}, message: "..." }
      if (response.data.success) {
        return { ...response, data: response.data.data };
      } else {
        // Handle error response
        const error = new Error(response.data.error?.message || response.data.message || 'Request failed');
        error.response = response;
        throw error;
      }
    }
    // Old format: direct data
    return response;
  },
  (error) => {
    // We remove the interceptor that was causing a hard redirect
    // The individual calls should handle errors now
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Register user
  register: (userData) => api.post('/auth/register', userData),
  
  // Get user profile
  getProfile: () => api.get('/auth/profile'),
  
  // Change password
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// Cluster API
export const clusterAPI = {
  // Get all clusters
  getClusters: () => api.get('/clusters'),
  
  // Add a new cluster
  addCluster: (clusterData) => api.post('/clusters', clusterData),
  
  // Remove a cluster
  removeCluster: (clusterName) => api.delete(`/clusters/${clusterName}`),
};

// Topic API
export const topicAPI = {
  // Get topics for a cluster
  getTopics: (clusterName) => api.get(`/clusters/${clusterName}/topics`),
  
  // Create a new topic
  createTopic: (clusterName, topicData) => api.post(`/clusters/${clusterName}/topics`, topicData),
  
  // Get topic details
  getTopicDetails: (clusterName, topicName) => api.get(`/clusters/${clusterName}/topics/${topicName}`),
  
  // Delete a topic
  deleteTopic: (clusterName, topicName) => api.delete(`/clusters/${clusterName}/topics/${topicName}`),
};

// Broker API
export const brokerAPI = {
  // Get brokers for a cluster
  getBrokers: (clusterName) => api.get(`/clusters/${clusterName}/brokers`),
};

// Consumer Group API
export const consumerGroupAPI = {
  // Get consumer groups for a cluster
  getConsumerGroups: (clusterName) => api.get(`/clusters/${clusterName}/consumer-groups`),
  
  // Get consumer group details
  getConsumerGroupDetails: (clusterName, groupId) => api.get(`/clusters/${clusterName}/consumer-groups/${groupId}`),
};

// Message API
export const messageAPI = {
  // Get messages from a topic
  getMessages: (clusterName, topicName, params = {}) => {
    return api.get(`/clusters/${clusterName}/topics/${topicName}/messages`, { params });
  },
  
  // Produce a message to a topic
  produceMessage: (clusterName, topicName, messageData) => api.post(`/clusters/${clusterName}/topics/${topicName}/messages`, messageData),
};

// Metrics API
export const metricsAPI = {
  // Get consumer lag metrics
  getConsumerLag: (clusterName) => api.get(`/clusters/${clusterName}/metrics/consumer-lag`),
  
  // Get cluster health metrics
  getClusterHealth: (clusterName) => api.get(`/clusters/${clusterName}/metrics/cluster-health`),
  
  // Get broker metrics
  getBrokerMetrics: (clusterName) => api.get(`/clusters/${clusterName}/metrics/brokers`),
  
  // Get topic metrics
  getTopicMetrics: (clusterName) => api.get(`/clusters/${clusterName}/metrics/topics`),
  
  // Get consumer group metrics
  getConsumerGroupMetrics: (clusterName) => api.get(`/clusters/${clusterName}/metrics/consumer-groups`),
};

// Export both the axios instance and the old API structure for backward compatibility
export default {
  ...api,
  auth: authAPI,
  cluster: clusterAPI,
  topic: topicAPI,
  broker: brokerAPI,
  consumerGroup: consumerGroupAPI,
  message: messageAPI,
  metrics: metricsAPI,
}; 