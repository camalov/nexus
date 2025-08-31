import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Avatar, Link } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
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
                backgroundColor: '#181818',
            }}
        >
            <Box
                sx={{
                    maxWidth: 400,
                    width: '100%',
                    padding: { xs: 3, sm: 4 },
                    textAlign: 'center',
                }}
            >
                <Avatar sx={{ width: 56, height: 56, backgroundColor: '#5278a3', margin: '0 auto 16px' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography variant="h5" fontWeight="bold" color="#fff" component="h1">
                    Sign in to Nexus
                </Typography>
                <Typography color="grey.500" sx={{ mb: 4 }}>
                    Please enter your username and password.
                </Typography>

                <Box component="form" onSubmit={handleLogin} noValidate sx={{ width: '100%' }}>
                    <TextField
                        variant="filled"
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
                        InputLabelProps={{
                            style: { color: 'grey.500' },
                        }}
                        sx={{
                            backgroundColor: '#282828',
                            borderRadius: '8px',
                            '& .MuiFilledInput-root': {
                                backgroundColor: '#282828',
                                borderRadius: '8px',
                                '&:before, &:after, &:hover:before, &:hover:after': {
                                    borderBottom: 'none'
                                }
                            },
                            '& .MuiFilledInput-root.Mui-focused': {
                                boxShadow: `0 0 0 2px #8774e1`
                            },
                            '& .MuiInputBase-input': {
                                color: '#fff',
                            }
                        }}
                    />
                    <TextField
                        variant="filled"
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
                        InputLabelProps={{
                            style: { color: 'grey.500' },
                        }}
                        sx={{
                            backgroundColor: '#282828',
                            borderRadius: '8px',
                            '& .MuiFilledInput-root': {
                                backgroundColor: '#282828',
                                borderRadius: '8px',
                                '&:before, &:after, &:hover:before, &:hover:after': {
                                    borderBottom: 'none'
                                }
                            },
                            '& .MuiFilledInput-root.Mui-focused': {
                                boxShadow: `0 0 0 2px #8774e1`
                            },
                            '& .MuiInputBase-input': {
                                color: '#fff',
                            }
                        }}
                    />
                    {error && <Alert severity="error" sx={{ mt: 2, width: '100%', backgroundColor: 'transparent', color: '#f44336', justifyContent: 'center' }}>{error}</Alert>}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            mb: 2,
                            py: 1.5,
                            borderRadius: '8px',
                            backgroundColor: '#8774e1',
                            textTransform: 'none',
                            fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: '#7a68c8',
                            },
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'SIGN IN'}
                    </Button>
                    <Link component={RouterLink} to="/register" sx={{ color: 'grey.500', textDecoration: 'none' }}>
                        {"Don't have an account? Sign Up"}
                    </Link>
                </Box>
            </Box>
        </Box>
    );
};

export default LoginPage;
