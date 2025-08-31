import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Grid, Paper, Typography, TextField, List, ListItem, ListItemButton, ListItemText, CircularProgress, Divider, Badge, styled, IconButton, useMediaQuery, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import userService from '../services/userService';
import messageService from '../services/messageService';
import socketService from '../services/socketService';
import authService from '../services/authService';
import fileService from '../services/fileService';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const telegramPattern = `url('data:image/svg+xml;utf8,<svg width="100" height="100" transform="scale(3)" opacity="0.05" xmlns="http://www.w3.org/2000/svg"><g fill-rule="evenodd"><g fill="%23000"><path d="M24.78 5.945c.39 0 .706.317.706.708v2.83c0 .39-.316.707-.706.707h-2.83a.707.707 0 0 1-.707-.707v-2.83c0-.39.316-.708.707-.708h2.83zm14.15 0c.39 0 .707.317.707.708v2.83c0 .39-.317.707-.707.707h-2.83a.707.707 0 0 1-.707-.707v-2.83c0-.39.317-.708.707-.708h2.83zm14.152 0c.39 0 .707.317.707.708v2.83c0 .39-.317.707-.707.707h-2.83a.707.707 0 0 1-.707-.707v-2.83c0-.39.317-.708.707-.708h2.83zM77.914 5.945c.39 0 .707.317.707.l_path_d_goes_here...zM92.064 5.945c.39 0 .707.317.707.708v2.83c0 .39-.317.707-.707.707h-2.83a.707.707 0 0 1-.707-.707v-2.83c0-.39.317-.708.707-.708h2.83z"/></g></g></svg>')`;

const StyledBadge = styled(Badge)(({ theme, isOnline }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: isOnline ? '#44b700' : '#808080',
        color: isOnline ? '#44b700' : '#808080',
        boxShadow: `0 0 0 2px #1e2732`,
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

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        <Box sx={{ height: '100vh', width: '100vw', display: 'flex' }}>
            <Grid container sx={{ height: '100%' }}>
                {/* Left Panel: Contacts List */}
                <Grid item xs={12} sm={4} md={3} sx={{ 
                    height: '100%', 
                    display: isMobile && selectedUser ? 'none' : 'flex', 
                    flexDirection: 'column', 
                    backgroundColor: '#1e2732' 
                }}>
                    <Paper elevation={0} sx={{ p: 2, backgroundColor: '#2a3b4d' }}>
                        <TextField 
                            fullWidth 
                            variant="outlined" 
                            placeholder="Search..." 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ 
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '20px',
                                    backgroundColor: '#1e2732',
                                    color: '#fff',
                                    '& fieldset': { borderColor: 'transparent' },
                                    '&:hover fieldset': { borderColor: '#5278a3' },
                                    '&.Mui-focused fieldset': { borderColor: '#5278a3' },
                                },
                                '& .MuiOutlinedInput-input::placeholder': { color: '#a0a0a0' },
                            }}
                        />
                    </Paper>
                    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                        {loading ? <CircularProgress sx={{ m: 'auto', display: 'block', color: '#fff' }} /> : (
                            <List sx={{ p: 0 }}>
                                {displayedList.map((user) => (
                                    <ListItem key={user.id} disablePadding>
                                        <ListItemButton 
                                            selected={selectedUser?.id === user.id} 
                                            onClick={() => handleUserSelect(user)}
                                            sx={{
                                                '&.Mui-selected': { backgroundColor: '#5278a3' },
                                                '&:hover': { backgroundColor: '#2a3b4d' },
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
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
                    </Box>
                </Grid>

                {/* Right Panel: Chat Area */}
                <Grid item xs={12} sm={8} md={9} sx={{ 
                    height: '100%', 
                    display: isMobile && !selectedUser ? 'none' : 'flex', 
                    flexDirection: 'column', 
                    backgroundColor: '#0e1621', 
                    backgroundImage: telegramPattern 
                }}>
                    {selectedUser ? (
                        <>
                            <Paper elevation={2} sx={{ p: 2, flexShrink: 0, backgroundColor: '#1e2732', color: '#fff' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {isMobile && (
                                            <IconButton onClick={() => setSelectedUser(null)} sx={{ color: '#fff', mr: 1 }}>
                                                <ArrowBackIcon />
                                            </IconButton>
                                        )}
                                        <Box>
                                            <Typography variant="h6">{selectedUser.username}</Typography>
                                            {isTyping && <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#a0a0a0' }}>yazır...</Typography>}
                                        </Box>
                                    </Box>
                                    {!isMobile && (
                                        <IconButton onClick={() => setSelectedUser(null)} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
                                    )}
                                </Box>
                            </Paper>
                            <Box
                                ref={messageContainerRef}
                                onScroll={handleScroll}
                                sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}
                            >
                                {loadingMessages ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                        <CircularProgress sx={{ color: '#fff' }}/>
                                    </Box>
                                ) : (
                                    <MessageList
                                        messages={messages}
                                        currentUser={currentUser}
                                        messagesEndRef={messagesEndRef}
                                        onDeleteMessage={handleDeleteMessage}
                                    />
                                )}
                            </Box>
                            <Box sx={{ flexShrink: 0, p: 1, backgroundColor: '#1e2732' }}>
                                <MessageInput
                                    onSendMessage={handleSendMessage}
                                    onTyping={handleTyping}
                                    onFileSelect={handleFileSelect}
                                />
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Typography variant="h6" sx={{ color: '#a0a0a0' }}>Select a chat to start messaging</Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default ChatLayout;
