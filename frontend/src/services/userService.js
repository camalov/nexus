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

export const getContacts = () => {
    return apiClient.get('/users/contacts');
};

// FIX: Changed '?query=' to '?username=' to match the backend controller
export const searchUsers = (query) => {
    return apiClient.get(`/users/search?username=${query}`);
};

const userService = {
    searchUsers,
    getContacts,
};

export default userService;
