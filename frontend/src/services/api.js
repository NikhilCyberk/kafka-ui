import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Topic endpoints
export const getTopics = () => api.get('/topics').then(response => response.data);
export const getTopicDetails = (topicName) => api.get(`/topics/${topicName}`).then(response => response.data);
export const createTopic = (topic) => api.post('/topics', topic).then(response => response.data);
export const deleteTopic = (topicName) => api.delete(`/topics/${topicName}`).then(response => response.data);

// Message endpoints
export const getMessages = (topic, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.key) params.append('key', filters.key);
    if (filters.value) params.append('value', filters.value);
    if (filters.startTime) params.append('start_time', filters.startTime.toISOString());
    if (filters.endTime) params.append('end_time', filters.endTime.toISOString());
    if (filters.format) params.append('format', filters.format);
    
    return api.get(`/messages/${topic}?${params.toString()}`).then(response => response.data.messages);
};

export const produceMessage = (topic, message) => {
    return api.post(`/messages/${topic}`, message).then(response => response.data);
};

export const replayMessages = (topic, startOffset, endOffset) => {
    const params = new URLSearchParams({
        start_offset: startOffset,
        end_offset: endOffset
    });
    return api.post(`/messages/${topic}/replay?${params.toString()}`).then(response => response.data);
};

export const validateMessage = (message) => {
    return api.post('/messages/validate', message).then(response => response.data);
};

// Consumer group endpoints
export const getConsumerGroups = () => api.get('/consumer-groups').then(response => response.data.consumer_groups);
export const getConsumerGroupDetails = (groupId) => api.get(`/consumer-groups/${groupId}`).then(response => response.data);

// Metrics endpoints
export const getMessagesPerSecond = () => api.get('/metrics/messages-per-second').then(response => response.data);
export const getLagMetrics = () => api.get('/metrics/lag').then(response => response.data);
export const getBrokerHealth = () => api.get('/metrics/broker-health').then(response => response.data);
export const getPartitionDistribution = () => api.get('/metrics/partition-distribution').then(response => response.data);
export const getTopicMetrics = () => api.get('/metrics/topic-metrics').then(response => response.data);

export default api; 