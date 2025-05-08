import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getTopics = async () => {
    const response = await api.get('/topics');
    return response.data.topics;
};

export const getTopicDetails = async (topicName) => {
    const response = await api.get(`/topics/${topicName}`);
    return response.data;
};

export const createTopic = async (topicData) => {
    const response = await api.post('/topics', topicData);
    return response.data;
};

export const deleteTopic = async (topicName) => {
    const response = await api.delete(`/topics/${topicName}`);
    return response.data;
};

export const getMessages = async (topicName) => {
    const response = await api.get(`/messages/${topicName}`);
    return response.data.messages;
};

export const produceMessage = async (topicName, message) => {
    const response = await api.post(`/messages/${topicName}`, message);
    return response.data;
};

export const getConsumerGroups = async () => {
    const response = await api.get('/consumer-groups');
    return response.data.consumer_groups;
};

export const getConsumerGroupDetails = async (groupId) => {
    const response = await api.get(`/consumer-groups/${groupId}`);
    return response.data;
};

export default api; 