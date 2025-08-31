// frontend/src/services/authService.js
import axios from 'axios';

const API_URL = '/nexus/api/auth';

const register = (username, password) => {
    return axios.post(`${API_URL}/register`, { username, password });
};

const login = (username, password) => {
    return axios.post(`${API_URL}/login`, { username, password })
        .then(response => {
            if (response.data && response.data.token) {
                // Store the entire user object, including the token and roles
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        });
};

const logout = () => {
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
};

export default authService;
