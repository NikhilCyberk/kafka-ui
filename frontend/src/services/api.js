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
export const getTopicDetails = (topicName) => 
    api.get(`/topics/${topicName}`)
        .then(response => {
            console.log('Topic details response:', response.data); // Debug log
            return response.data;
        })
        .catch(error => {
            console.error('Error in getTopicDetails:', error); // Debug log
            throw error;
        });
export const createTopic = (topic) => api.post('/topics', topic).then(response => response.data);
export const deleteTopic = (topicName) => api.delete(`/topics/${topicName}`).then(response => response.data);

// Message endpoints
export const getMessages = (topic, filters = {}) => {
    console.log('Fetching messages for topic:', topic, 'with filters:', filters);
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
    });
    const url = `/messages/${topic}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('Messages API URL:', url);
    return api.get(url)
        .then(response => {
            console.log('Messages response:', response.data);
            return Array.isArray(response.data) ? response.data : [];
        })
        .catch(error => {
            console.error('Error fetching messages:', error);
            return [];
        });
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

export const searchMessages = (topic, searchParams) => 
    api.post(`/messages/${topic}/search`, searchParams).then(response => response.data);

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