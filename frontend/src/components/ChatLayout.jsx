// frontend/src/components/ChatLayout.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Grid, Paper, Typography, TextField, List, ListItem, ListItemButton, ListItemText, CircularProgress, Divider, Badge, styled, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import userService from '../services/userService';
import messageService from '../services/messageService';
import socketService from '../services/socketService';
import authService from '../services/authService';
import fileService from '../services/fileService';
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
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [page, setPage] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);

    const currentUser = authService.getCurrentUser();
    const messagesEndRef = useRef(null);
    const messageContainerRef = useRef(null);
    const selectedUserRef = useRef(null);

    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    useEffect(() => {
        socketService.connect(() => {
            socketService.subscribe(`/user/${currentUser.username}/queue/messages`, (newMessage) => {
                const currentChatUser = selectedUserRef.current;

                if (newMessage.senderUsername === currentUser.username) {
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
                const typingUsername = statusUpdate.fromUsername || statusUpdate.senderUsername;

                if (statusUpdate.hasOwnProperty('typing') || statusUpdate.hasOwnProperty('isTyping')) {
                    const typingStatus = statusUpdate.hasOwnProperty('typing') ? statusUpdate.typing : statusUpdate.isTyping;
                    if (currentChatUser && typingUsername === currentChatUser.username) {
                        setIsTyping(typingStatus);
                    }
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

    const fetchMessages = useCallback(async (isInitialLoad = true) => {
        if (!selectedUser || (!hasMoreMessages && !isInitialLoad)) return;

        if (isInitialLoad) {
            setLoadingMessages(true);
        } else {
            if (loadingMore) return;
            setLoadingMore(true);
        }
        try {
            const currentPage = isInitialLoad ? 0 : page + 1;
            const response = await messageService.getMessageHistory(currentUser.id, selectedUser.id, currentPage);
            const newMessages = response.data.content.reverse();

            if (isInitialLoad) {
                setMessages(newMessages);
                const unread = newMessages.filter(m => m.recipientUsername === currentUser.username && m.status !== 'READ');
                if (unread.length > 0) {
                    unread.forEach(msg => {
                        socketService.sendMessage('/app/chat.markAsRead', { messageId: msg.id, status: 'READ' });
                    });
                }
            } else {
                setMessages(prev => [...newMessages, ...prev]);
            }

            setPage(currentPage);
            setHasMoreMessages(!response.data.last);
        } catch (error) { console.error('Failed to fetch message history:', error); }
        if (isInitialLoad) {
            setLoadingMessages(false);
        } else {
            setLoadingMore(false);
        }
    }, [selectedUser, currentUser.id, hasMoreMessages, page, loadingMore]);

    useEffect(() => {
        if (selectedUser) {
            setIsTyping(false);
            setMessages([]);
            setPage(0);
            setHasMoreMessages(true);
            fetchMessages(true);
        } else {
            setMessages([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedUser]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' }); }, [messages]);

    const handleUserSelect = (user) => {
        if (selectedUser?.id === user.id) return;
        setSelectedUser(user);
        setUnreadCounts(prev => ({ ...prev, [user.username]: 0 }));
    };

    const handleSendMessage = (content) => {
        if (!selectedUser) return;
        const tempId = `temp_${Date.now()}`;
        const message = {
            tempId: tempId,
            senderUsername: currentUser.username,
            recipientUsername: selectedUser.username,
            content: content,
            type: 'TEXT',
        };
        handleTyping(false);
        socketService.sendMessage('/app/chat.send', message);
        setMessages((prev) => [...prev, { ...message, id: tempId, status: 'SENT' }]);
    };

    const handleFileSelect = async (file) => {
        if (!selectedUser) return;

        try {
            const response = await fileService.uploadFile(file);
            const filePath = response.data.fileUrl;

            if (!filePath) {
                console.error("File URL not found in server response");
                return;
            }

            const imageTypes = ['image/jpeg', 'image/png', 'image/gif'];
            const messageType = imageTypes.includes(file.type) ? 'IMAGE' : 'FILE';

            const tempId = `temp_${Date.now()}`;
            const message = {
                tempId: tempId,
                senderUsername: currentUser.username,
                recipientUsername: selectedUser.username,
                content: filePath,
                type: messageType,
            };

            socketService.sendMessage('/app/chat.send', message);
            setMessages((prev) => [...prev, { ...message, id: tempId, status: 'SENT' }]);
        } catch (error) {
            console.error("Failed to upload file or send message:", error);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await messageService.softDeleteMessage(messageId);
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.id === messageId
                        ? { ...msg, deleted: true }
                        : msg
                )
            );
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    };

    const handleTyping = (typingStatus) => {
        if (!selectedUser) return;
        socketService.sendMessage('/app/chat.typing', {
            fromUsername: currentUser.username,
            toUsername: selectedUser.username,
            isTyping: typingStatus,
        });
    };

    const handleScroll = () => {
        if (messageContainerRef.current && messageContainerRef.current.scrollTop === 0 && hasMoreMessages && !loadingMore) {
            fetchMessages(false);
        }
    };

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
                                    {isTyping && <Typography variant="caption" sx={{ fontStyle: 'italic' }}>yazır...</Typography>}
                                </Box>
                                <IconButton onClick={() => setSelectedUser(null)}><CloseIcon /></IconButton>
                            </Paper>
                            {loadingMessages ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <MessageList
                                    messages={messages}
                                    currentUser={currentUser}
                                    onScroll={handleScroll}
                                    messageContainerRef={messageContainerRef}
                                    loadingMore={loadingMore}
                                    messagesEndRef={messagesEndRef}
                                    onDeleteMessage={handleDeleteMessage}
                                />
                            )}
                            <MessageInput
                                onSendMessage={handleSendMessage}
                                onTyping={handleTyping}
                                onFileSelect={handleFileSelect}
                            />
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
