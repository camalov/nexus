// frontend/src/services/userService.js
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

const getContactsWithOnlineStatus = () => {
    return apiClient.get('/users/contacts');
};

const searchUsers = (query) => {
    return apiClient.get(`/users/search?username=${query}`);
};

const userService = {
    searchUsers,
    getContactsWithOnlineStatus,
};

export default userService;