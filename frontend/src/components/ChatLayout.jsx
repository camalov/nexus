// frontend/src/components/ChatLayout.jsx
import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, TextField, List, ListItem, ListItemButton, ListItemText, CircularProgress, Divider } from '@mui/material';
import userService from '../services/userService';

const ChatLayout = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState(null);

    useEffect(() => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        if (searchQuery.trim()) {
            const timeout = setTimeout(async () => {
                setLoading(true);
                try {
                    const response = await userService.searchUsers(searchQuery);
                    setUsers(response.data);
                } catch (error) {
                    console.error('Failed to search users:', error);
                    setUsers([]);
                }
                setLoading(false);
            }, 500);
            setDebounceTimeout(timeout);
        } else {
            setUsers([]);
        }

        return () => {
            if (debounceTimeout) clearTimeout(debounceTimeout);
        };
    }, [searchQuery]);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
    };

    return (
        <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex' }}>
            <Grid container sx={{ height: '100%' }}>
                {/* User List / Search Area */}
                <Grid item xs={12} sm={4} md={3} sx={{
                    borderRight: { sm: '1px solid #ddd' },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <Paper elevation={0} sx={{ padding: 2 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Search Users"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Paper>
                    <Divider />
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                            {users.map((user) => (
                                <ListItem key={user.id} disablePadding>
                                    <ListItemButton
                                        selected={selectedUser?.id === user.id}
                                        onClick={() => handleUserSelect(user)}
                                    >
                                        <ListItemText primary={user.username} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Grid>

                {/* Chat Window Area */}
                <Grid item xs={12} sm={8} md={9} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Paper elevation={2} sx={{ padding: 2 }}>
                        <Typography variant="h6">
                            {selectedUser ? `Chat with ${selectedUser.username}` : 'Select a user to start chatting'}
                        </Typography>
                    </Paper>
                    <Box sx={{ flexGrow: 1, padding: 2, overflowY: 'auto' }}>
                        {/* Messages will be displayed here */}
                    </Box>
                    <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                        {/* Message input will be here */}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ChatLayout;
