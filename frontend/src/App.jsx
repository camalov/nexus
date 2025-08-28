// frontend/src/App.jsx
import React from 'react';
import { CssBaseline } from '@mui/material';
import LoginPage from './pages/LoginPage';
// import ChatLayout from './components/ChatLayout'; // This will be used later

function App() {
  // We will add logic here later to check if the user is authenticated
  const user = localStorage.getItem('user');

  return (
    <>
      <CssBaseline />
      {/* For now, we will always show the LoginPage. */}
      {/* In the future, this will be: {user ? <ChatLayout /> : <LoginPage />} */}
      <LoginPage />
    </>
  );
}

export default App;
