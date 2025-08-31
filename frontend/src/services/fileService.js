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

const uploadFile = (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post('/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

const fileService = {
    uploadFile,
};

export default fileService;
