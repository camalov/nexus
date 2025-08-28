import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatLayout from './components/ChatLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<ChatLayout />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
