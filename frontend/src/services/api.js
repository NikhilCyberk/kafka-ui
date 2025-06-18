import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Topic endpoints
export const getTopics = () => {
    console.log('API: Fetching topics...');
    return api.get('/topics')
        .then(response => {
            console.log('API: Topics response:', response.data);
            return response.data;
        })
        .catch(error => {
            console.error('API: Error fetching topics:', error);
            throw error;
        });
};

export const getTopicDetails = (topicName) => {
    console.log('API: Fetching topic details for:', topicName);
    return api.get(`/topics/${topicName}`)
        .then(response => {
            console.log('API: Topic details response:', response.data);
    return response.data;
        })
        .catch(error => {
            console.error('API: Error fetching topic details:', error);
            throw error;
        });
};

export const createTopic = (topic) => {
    console.log('Creating topic:', topic);
    return api.post('/topics', topic)
        .then(response => {
            console.log('Topic created successfully:', response.data);
    return response.data;
        })
        .catch(error => {
            console.error('Error creating topic:', error.response?.data || error.message);
            throw error;
        });
};

export const deleteTopic = (topicName) => {
    console.log('Deleting topic:', topicName);
    return api.delete(`/topics/${topicName}`)
        .then(response => {
            console.log('Topic deleted successfully:', response.data);
    return response.data;
        })
        .catch(error => {
            console.error('Error deleting topic:', error.response?.data || error.message);
            throw error;
        });
};

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
    console.log('Producing message:', { topic, message });
    // Ensure message has required fields
    const messageToSend = {
        ...message,
        format: message.format || 'json'
    };
    return api.post(`/messages/${topic}`, messageToSend)
        .then(response => {
            console.log('Message produced successfully:', response.data);
    return response.data;
        })
        .catch(error => {
            console.error('Error producing message:', error.response?.data || error.message);
            throw error;
        });
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
export const getConsumerGroups = () => {
    console.log('API: Fetching consumer groups...');
    return api.get('/consumer-groups')
        .then(response => {
            console.log('API: Consumer groups response:', response.data);
            return response.data.consumer_groups || [];
        })
        .catch(error => {
            console.error('API: Error fetching consumer groups:', error);
            throw error;
        });
};

export const getConsumerGroupDetails = (groupId) => api.get(`/consumer-groups/${groupId}`).then(response => response.data);

// Metrics endpoints
export const getMessagesPerSecond = () => api.get('/metrics/messages-per-second').then(response => response.data);
export const getLagMetrics = () => api.get('/metrics/lag').then(response => response.data);
export const getBrokerHealth = () => api.get('/metrics/broker-health').then(response => response.data);
export const getPartitionDistribution = () => api.get('/metrics/partition-distribution').then(response => response.data);
export const getTopicMetrics = () => api.get('/metrics/topic-metrics').then(response => response.data);

export default api; 