import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatLayout from './components/ChatLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPanel from './components/AdminPanel'; // Import AdminPanel

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Routes for all authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<ChatLayout />} />
        </Route>

        {/* Routes exclusively for ADMIN users */}
        <Route element={<ProtectedRoute role="ROLE_ADMIN" />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

      </Routes>
    </>
  );
}

export default App;
