import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Avatar, Link } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import authService from '../services/authService';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authService.register(username, password);
            navigate('/login');
        } catch (err) {
            setError('Registration failed. That username might already be taken.');
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
                    Create your account
                </Typography>
                <Typography color="grey.500" sx={{ mb: 4 }}>
                    Please enter your username and password.
                </Typography>

                <Box component="form" onSubmit={handleRegister} noValidate sx={{ width: '100%' }}>
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
                        autoComplete="new-password"
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
                        {loading ? 'Creating Account...' : 'SIGN UP'}
                    </Button>
                    <Link component={RouterLink} to="/login" sx={{ color: 'grey.500', textDecoration: 'none' }}>
                        {"Already have an account? Sign In"}
                    </Link>
                </Box>
            </Box>
        </Box>
    );
};

export default RegisterPage;
