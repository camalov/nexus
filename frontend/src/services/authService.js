// frontend/src/services/authService.js
import axios from 'axios';

const API_URL = '/nexus/api/auth';

const register = (username, password) => {
    return axios.post(`${API_URL}/register`, { username, password });
};

const login = (username, password) => {
    return axios.post(`${API_URL}/login`, { username, password });
};

const logout = () => {
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
};

export default authService;
