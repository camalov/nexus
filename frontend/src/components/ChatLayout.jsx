// frontend/src/components/ChatLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Box, Grid, Paper, Typography, TextField, List, ListItem, ListItemButton, ListItemText, CircularProgress, Divider } from '@mui/material';
import userService from '../services/userService';
import messageService from '../services/messageService';
import socketService from '../services/socketService';
import authService from '../services/authService';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatLayout = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const currentUser = authService.getCurrentUser();
    const messagesEndRef = useRef(null);

    // Debounced user search
    useEffect(() => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        if (searchQuery.trim()) {
            const timeout = setTimeout(async () => {
                setLoading(true);
                try {
                    const response = await userService.searchUsers(searchQuery);
                    setUsers(response.data.filter(user => user.username !== currentUser.username));
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
    }, [searchQuery, currentUser.username]);

    // Fetch messages and connect to WebSocket when a user is selected
    useEffect(() => {
        if (selectedUser) {
            const fetchMessages = async () => {
                try {
                    const response = await messageService.getMessageHistory(currentUser.id, selectedUser.id);
                    setMessages(response.data);
                } catch (error) {
                    console.error('Failed to fetch message history:', error);
                    setMessages([]);
                }
            };
            fetchMessages();

            socketService.connect(currentUser.username, (message) => {
                // Only add the message if it's part of the current conversation
                if (message.senderUsername === selectedUser.username || message.senderUsername === currentUser.username) {
                   setMessages((prevMessages) => [...prevMessages, message]);
                }
            });

            return () => {
                socketService.disconnect();
            };
        }
    }, [selectedUser, currentUser.id, currentUser.username]);

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
    };

    const handleSendMessage = (content) => {
        const message = {
            senderUsername: currentUser.username,
            recipientUsername: selectedUser.username,
            content: content,
            type: 'TEXT',
        };
        socketService.sendMessage('/app/chat.send', message);
        // Optimistically add the sent message to the UI
        setMessages((prevMessages) => [...prevMessages, message]);
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
                    <MessageList messages={messages} currentUser={currentUser} />
                    <div ref={messagesEndRef} />
                    {selectedUser && <MessageInput onSendMessage={handleSendMessage} />}
                </Grid>
            </Grid>
        </Box>
    );
};

export default ChatLayout;