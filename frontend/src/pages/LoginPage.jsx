import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Login failed. Please check your username and password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #71b7e6, #9b59b6)', // Telegram-like gradient
                p: 2, // Add some padding for smaller screens
            }}
        >
            <Container component="main" maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center' }}>
                <Paper
                    elevation={6}
                    sx={{
                        padding: { xs: 2, sm: 4 }, // Responsive padding
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: '15px', // Rounded corners
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slight transparency
                        backdropFilter: 'blur(10px)', // Frosted glass effect
                        width: '100%',
                        maxWidth: '450px', // Set a max-width for the form itself
                    }}
                >
                    <Typography component="h1" variant="h5" sx={{ color: '#333' }}>
                        Sign in to Nexus
                    </Typography>
                    <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5, // Taller button
                                borderRadius: '8px',
                                backgroundColor: '#5278a3', // Telegram blue
                                '&:hover': {
                                    backgroundColor: '#416082',
                                },
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            <Link to="/register" variant="body2" sx={{ color: '#5278a3' }}>
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default LoginPage;
