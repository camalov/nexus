// frontend/src/components/ChatLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Box, Grid, Paper, Typography, TextField, List, ListItem, ListItemButton, ListItemText, CircularProgress, Divider, Badge, styled } from '@mui/material';
import userService from '../services/userService';
import messageService from '../services/messageService';
import socketService from '../services/socketService';
import authService from '../services/authService';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const StyledBadge = styled(Badge)(({ theme, isOnline }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: isOnline ? '#44b700' : '#d3d3d3',
    color: isOnline ? '#44b700' : '#d3d3d3',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: isOnline ? 'ripple 1.2s infinite ease-in-out' : 'none',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));


const ChatLayout = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [contacts, setContacts] = useState([]); // Use a separate state for contacts
    // users state will now be for search results
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const currentUser = authService.getCurrentUser();
    const messagesEndRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);

    // Connect to WebSocket on component mount
    useEffect(() => {
        socketService.connect(() => {
            // Subscribe to personal message queue after connection
            socketService.subscribe(`/user/${currentUser.username}/queue/messages`, (newMessage) => {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            });

            // Status queue for typing and read receipts
            socketService.subscribe(`/user/${currentUser.username}/queue/status`, (statusUpdate) => {
                if ('isTyping' in statusUpdate) {
                    if (selectedUser && statusUpdate.fromUsername === selectedUser.username) {
                        setIsTyping(statusUpdate.isTyping);
                    }
                } else if ('messageId' in statusUpdate) { // This is a read receipt
                    setMessages(prevMessages =>
                        prevMessages.map(msg =>
                            msg.id === statusUpdate.messageId ? { ...msg, status: statusUpdate.status } : msg
                        )
                    );
                }
            });

            // Public presence topic
            socketService.subscribe('/topic/presence', (presenceUpdate) => {
                setContacts(prevContacts =>
                    prevContacts.map(contact =>
                        contact.username === presenceUpdate.username
                            ? { ...contact, isOnline: presenceUpdate.isOnline }
                            : contact
                    )
                );
            });
        });

        // Disconnect on component unmount
        return () => {
            socketService.disconnect();
        };
    }, [currentUser.username, selectedUser]);

    // New useEffect to fetch contacts on component mount
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await userService.getContacts();
                // Initialize isOnline status to false
                const contactsWithStatus = response.data.map(contact => ({ ...contact, isOnline: false }));
                setContacts(contactsWithStatus);
            } catch (error) {
                console.error('Failed to fetch contacts:', error);
            }
        };
        fetchContacts();
    }, []);

    // Modified user search useEffect
    useEffect(() => {
        if (debounceTimeout) clearTimeout(debounceTimeout);
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
            setUsers([]); // Clear search results when query is empty
        }

        return () => {
            if (debounceTimeout) clearTimeout(debounceTimeout);
        };
    }, [searchQuery, currentUser.username, debounceTimeout]);

    // Fetch message history when a user is selected
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
        }
    }, [selectedUser, currentUser.id]);

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Add this new useEffect to mark messages as read
    useEffect(() => {
        const unreadMessages = messages.filter(
            (msg) => msg.recipientUsername === currentUser.username && msg.status !== 'READ' && msg.id
        );

        if (unreadMessages.length > 0) {
            unreadMessages.forEach((msg) => {
                socketService.sendMessage('/app/chat.markAsRead', {
                    messageId: msg.id,
                    status: 'READ',
                });
            });
        }
    }, [messages, currentUser.username]);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
    };

    const handleSendMessage = (content) => {
        const message = {
            senderUsername: currentUser.username,
            recipientUsername: selectedUser.username,
            content: content,
            type: 'TEXT'
        };
        socketService.sendMessage('/app/chat.send', message);
    };

    const handleTyping = (isTyping) => {
        socketService.sendMessage('/app/chat.typing', {
            fromUsername: currentUser.username,
            toUsername: selectedUser.username,
            isTyping: isTyping,
        });
    };

    return (
        <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex' }}>
            <Grid container sx={{ height: '100%' }}>
                <Grid item xs={12} sm={4} md={3} sx={{ borderRight: { sm: '1px solid #ddd' }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Paper elevation={0} sx={{ padding: 2 }}>
                        <TextField fullWidth variant="outlined" label="Search Users" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </Paper>
                    <Divider />
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>
                    ) : (
                        <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                            {(searchQuery.trim() ? users : contacts).map((user) => (
                                <ListItem key={user.id} disablePadding>
                                    <ListItemButton selected={selectedUser?.id === user.id} onClick={() => handleUserSelect(user)}>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <StyledBadge
                                                        overlap="circular"
                                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                        variant="dot"
                                                        isOnline={user.isOnline}
                                                    >
                                                       <span>{user.username}</span>
                                                    </StyledBadge>
                                                </Box>
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Grid>
                <Grid item xs={12} sm={8} md={9} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Paper elevation={2} sx={{ padding: 2 }}>
                        <Typography variant="h6">
                            {selectedUser ? `Chat with ${selectedUser.username}` : 'Select a user to start chatting'}
                        </Typography>
                        {isTyping && <Typography variant="caption" sx={{ fontStyle: 'italic' }}>typing...</Typography>}
                    </Paper>
                    <MessageList messages={messages} currentUser={currentUser} />
                    <div ref={messagesEndRef} />
                    {selectedUser && <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />}
                </Grid>
            </Grid>
        </Box>
    );
};

export default ChatLayout;
