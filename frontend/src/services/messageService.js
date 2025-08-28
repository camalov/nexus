import axios from 'axios';
import authService from './authService';

const apiClient = axios.create({
    baseURL: '/nexus/api',
});

apiClient.interceptors.request.use(
    (config) => {
        const user = authService.getCurrentUser();
        if (user && user.token) {
            config.headers['X-Authorization'] = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getMessageHistory = (userId1, userId2) => {
    return apiClient.get(`/messages/${userId1}/${userId2}`);
};

const messageService = {
    getMessageHistory,
};

export default messageService;
