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

const getAllUsers = () => {
    return apiClient.get('/admin/users');
};

const getUserById = (id) => {
    return apiClient.get(`/admin/users/${id}`);
};

const getMediaMessages = (type) => {
    // If type is null or empty, the backend will return all media types.
    const params = type ? { type } : {};
    return apiClient.get('/admin/media', { params });
};

const hardDeleteMedia = (messageId) => {
    return apiClient.delete(`/admin/media/${messageId}`);
};

const adminService = {
    getAllUsers,
    getUserById,
    getMediaMessages,
    hardDeleteMedia,
};

export default adminService;
