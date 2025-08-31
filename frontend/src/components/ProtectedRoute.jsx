import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ role }) => {
    const currentUser = authService.getCurrentUser();

    // 1. Check if user is logged in at all. If not, redirect to login.
    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    // 2. If a specific role is required, check for it.
    if (role) {
        const hasRole = currentUser.roles && currentUser.roles.includes(role);
        // If user doesn't have the required role, redirect to the home page.
        return hasRole ? <Outlet /> : <Navigate to="/" />;
    }

    // 3. If no specific role is required, just being logged in is enough.
    return <Outlet />;
};

export default ProtectedRoute;
