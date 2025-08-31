// frontend/src/components/ChatLayout.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Grid, Paper, Typography, TextField, List, ListItem, ListItemButton, ListItemText, CircularProgress, Divider, Badge, styled, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
    },
}));

const ChatLayout = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [contacts, setContacts] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({});

    const currentUser = authService.getCurrentUser();
    const messagesEndRef = useRef(null);
    const selectedUserRef = useRef(null);

    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    useEffect(() => {
        socketService.connect(() => {
            socketService.subscribe(`/user/${currentUser.username}/queue/messages`, (newMessage) => {
                const currentChatUser = selectedUserRef.current;

                if (newMessage.senderUsername === currentUser.username) {
                    // This is the confirmation from the server for a message we sent.
                    // Replace the temporary message with the real one from the server.
                    setMessages(prev => prev.map(msg => msg.id === newMessage.tempId ? newMessage : msg));
                } else if (currentChatUser && newMessage.senderUsername === currentChatUser.username) {
                    setMessages(prev => [...prev, newMessage]);
                    socketService.sendMessage('/app/chat.markAsRead', { messageId: newMessage.id, status: 'READ' });
                } else {
                    setUnreadCounts(prev => ({
                        ...prev,
                        [newMessage.senderUsername]: (prev[newMessage.senderUsername] || 0) + 1
                    }));
                }
            });

            socketService.subscribe(`/user/${currentUser.username}/queue/status`, (statusUpdate) => {
                const currentChatUser = selectedUserRef.current;
                if (statusUpdate.hasOwnProperty('isTyping') && currentChatUser && statusUpdate.fromUsername === currentChatUser.username) {
                    setIsTyping(statusUpdate.isTyping);
                } else if (statusUpdate.hasOwnProperty('messageId')) {
                    setMessages(prev => prev.map(msg => msg.id === statusUpdate.messageId ? { ...msg, status: statusUpdate.status } : msg));
                }
            });

            socketService.subscribe('/topic/presence', (presenceUpdate) => {
                const updateUserStatus = (userList) => userList.map(u => u.username === presenceUpdate.username ? { ...u, isOnline: presenceUpdate.isOnline } : u);
                setContacts(prev => updateUserStatus(prev));
                setSearchResults(prev => updateUserStatus(prev));
            });
        });

        return () => socketService.disconnect();
    }, [currentUser.username]);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await userService.getContactsWithOnlineStatus();
                setContacts(response.data);
            } catch (error) { console.error('Failed to fetch contacts:', error); }
        };
        fetchContacts();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const debouncedSearch = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await userService.searchUsers(searchQuery);
                const onlineContacts = new Map(contacts.map(c => [c.username, c.isOnline]));
                const resultsWithStatus = response.data
                    .filter(user => user.username !== currentUser.username)
                    .map(user => ({ ...user, isOnline: onlineContacts.get(user.username) || false }));
                setSearchResults(resultsWithStatus);
            } catch (error) { console.error('Failed to search users:', error); }
            setLoading(false);
        }, 500);
        return () => clearTimeout(debouncedSearch);
    }, [searchQuery, currentUser.username, contacts]);

    useEffect(() => {
        if (selectedUser) {
            setIsTyping(false);
            const fetchMessages = async () => {
                try {
                    const response = await messageService.getMessageHistory(currentUser.id, selectedUser.id);
                    setMessages(response.data);
                    const unread = response.data.filter(m => m.recipientUsername === currentUser.username && m.status !== 'READ');
                    if (unread.length > 0) {
                        unread.forEach(msg => {
                            socketService.sendMessage('/app/chat.markAsRead', { messageId: msg.id, status: 'READ' });
                        });
                    }
                } catch (error) { console.error('Failed to fetch message history:', error); }
            };
            fetchMessages();
        } else {
            setMessages([]);
        }
    }, [selectedUser, currentUser.id]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleUserSelect = (user) => {
        if (selectedUser?.id === user.id) return;
        setSelectedUser(user);
        setUnreadCounts(prev => ({ ...prev, [user.username]: 0 }));
    };

    const handleSendMessage = (content) => {
        if (!selectedUser) return;
        const tempId = `temp_${Date.now()}`;
        const message = {
            tempId: tempId, // Send temporary ID to the server
            senderUsername: currentUser.username,
            recipientUsername: selectedUser.username,
            content: content,
            type: 'TEXT',
        };
        handleTyping(false);
        socketService.sendMessage('/app/chat.send', message);
        // Optimistic update with a temporary message
        setMessages((prev) => [...prev, { ...message, id: tempId, status: 'SENT' }]);
    };

    const handleTyping = useCallback((typingStatus) => {
        if (!selectedUser) return;
        socketService.sendMessage('/app/chat.typing', {
            fromUsername: currentUser.username, toUsername: selectedUser.username, isTyping: typingStatus,
        });
    }, [currentUser.username, selectedUser]);

    const displayedList = searchQuery.trim() ? searchResults : contacts;

    return (
        <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex' }}>
            <Grid container sx={{ height: '100%' }}>
                <Grid item xs={12} sm={4} md={3} sx={{ borderRight: { sm: '1px solid #ddd' }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Paper elevation={0} sx={{ p: 2 }}>
                        <TextField fullWidth variant="outlined" label="Search Users" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </Paper>
                    <Divider />
                    {loading ? <CircularProgress sx={{ m: 'auto' }} /> : (
                        <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                            {displayedList.map((user) => (
                                <ListItem key={user.id} disablePadding>
                                    <ListItemButton selected={selectedUser?.id === user.id} onClick={() => handleUserSelect(user)}>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <StyledBadge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" isOnline={user.isOnline}>
                                                        <Typography component="span">{user.username}</Typography>
                                                    </StyledBadge>
                                                    {unreadCounts[user.username] > 0 && <Badge badgeContent={unreadCounts[user.username]} color="primary" />}
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
                    {selectedUser ? (
                        <>
                            <Paper elevation={2} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h6">{`Chat with ${selectedUser.username}`}</Typography>
                                    {isTyping && <Typography variant="caption" sx={{ fontStyle: 'italic' }}>typing...</Typography>}
                                </Box>
                                <IconButton onClick={() => setSelectedUser(null)}><CloseIcon /></IconButton>
                            </Paper>
                            <MessageList messages={messages} currentUser={currentUser} />
                            <div ref={messagesEndRef} />
                            <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Typography variant="h6" color="text.secondary">Select a user to start chatting</Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default ChatLayout;