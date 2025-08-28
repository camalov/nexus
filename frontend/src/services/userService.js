import axios from 'axios';

const API_URL = '/nexus/api/users';

const apiClient = axios.create({
    baseURL: API_URL,
});

apiClient.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers['X-Authorization'] = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const searchUsers = (query) => {
    return apiClient.get(`/search?query=${query}`);
};

const userService = {
    searchUsers,
};

export default userService;
