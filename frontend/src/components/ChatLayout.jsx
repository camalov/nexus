import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Grid, Paper, Typography, TextField, List, ListItem, ListItemButton, ListItemText, CircularProgress, Badge, Avatar, IconButton, useMediaQuery, useTheme, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CallIcon from '@mui/icons-material/Call';

import userService from '../services/userService';
import messageService from '../services/messageService';
import socketService from '../services/socketService';
import authService from '../services/authService';
import fileService from '../services/fileService';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const telegramPattern = `url('data:image/svg+xml;utf8,<svg width="100" height="100" transform="scale(2.5)" opacity="0.06" xmlns="http://www.w3.org/2000/svg"><g fill="%232a3b4d" fill-rule="evenodd"><circle cx="5" cy="5" r="5"/><circle cx="25" cy="25" r="5"/><circle cx="45" cy="45" r="5"/><circle cx="65" cy="65" r="5"/><circle cx="85" cy="85" r="5"/></g></svg>')`;

const getInitials = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
};

const ChatLayout = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [contacts, setContacts] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(true);
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
                    setUnreadCounts(prev => ({ ...prev, [newMessage.senderUsername]: (prev[newMessage.senderUsername] || 0) + 1 }));
                }
            });
            socketService.subscribe(`/user/${currentUser.username}/queue/status`, (statusUpdate) => {
                const currentChatUser = selectedUserRef.current;
                if (statusUpdate.hasOwnProperty('messageId')) {
                    setMessages(prev => prev.map(msg => msg.id === statusUpdate.messageId ? { ...msg, status: statusUpdate.status } : msg));
                } else if (currentChatUser && (statusUpdate.fromUsername || statusUpdate.senderUsername) === currentChatUser.username) {
                    setIsTyping(statusUpdate.typing || statusUpdate.isTyping);
                }
            });
            socketService.subscribe('/topic/presence', (presenceUpdate) => {
                const updateUserStatus = (userList) => userList.map(u => u.username === presenceUpdate.username ? { ...u, isOnline: presenceUpdate.isOnline } : u);
                setContacts(prev => updateUserStatus(prev));
                setSearchResults(prev => updateUserStatus(prev));

                // If the presence update is for the currently selected user, update their state too
                if (selectedUserRef.current && selectedUserRef.current.username === presenceUpdate.username) {
                    setSelectedUser(prev => ({ ...prev, isOnline: presenceUpdate.isOnline }));
                }
            });
        });
        return () => socketService.disconnect();
    }, [currentUser.username]);

    useEffect(() => {
        const fetchContacts = async () => {
            setLoadingContacts(true);
            try {
                const response = await userService.getContactsWithOnlineStatus();
                setContacts(response.data);
            } catch (error) { console.error('Failed to fetch contacts:', error); }
            setLoadingContacts(false);
        };
        fetchContacts();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const debouncedSearch = setTimeout(async () => {
            try {
                const response = await userService.searchUsers(searchQuery);
                const onlineStatusMap = new Map(contacts.map(c => [c.username, c.isOnline]));
                const resultsWithStatus = response.data
                    .filter(user => user.username !== currentUser.username)
                    .map(user => ({ ...user, isOnline: onlineStatusMap.get(user.username) || false }));
                setSearchResults(resultsWithStatus);
            } catch (error) {
                console.error('Failed to search users:', error);
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(debouncedSearch);
    }, [searchQuery, currentUser.username, contacts]);

    const fetchMessages = useCallback(async (isInitialLoad = true) => {
        if (!selectedUser || (!hasMoreMessages && !isInitialLoad)) return;
        const loadStateSetter = isInitialLoad ? setLoadingMessages : setLoadingMore;
        if (!isInitialLoad && loadingMore) return;
        loadStateSetter(true);
        try {
            const currentPage = isInitialLoad ? 0 : page + 1;
            const response = await messageService.getMessageHistory(currentUser.id, selectedUser.id, currentPage);
            const newMessages = response.data.content.reverse();
            setMessages(prev => isInitialLoad ? newMessages : [...newMessages, ...prev]);
            if (isInitialLoad) {
                const unread = newMessages.filter(m => m.recipientUsername === currentUser.username && m.status !== 'READ');
                unread.forEach(msg => socketService.sendMessage('/app/chat.markAsRead', { messageId: msg.id, status: 'READ' }));
            }
            setPage(currentPage);
            setHasMoreMessages(!response.data.last);
        } catch (error) { console.error('Failed to fetch message history:', error); }
        loadStateSetter(false);
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
    }, [selectedUser, fetchMessages]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleUserSelect = (user) => {
        if (selectedUser?.id === user.id) return;
        setSelectedUser(user);
        setUnreadCounts(prev => ({ ...prev, [user.username]: 0 }));
    };

    const handleSendMessage = (content) => {
        if (!selectedUser) return;
        const tempId = `temp_${Date.now()}`;
        const message = { tempId, senderUsername: currentUser.username, recipientUsername: selectedUser.username, content, type: 'TEXT' };
        handleTyping(false);
        socketService.sendMessage('/app/chat.send', message);
        setMessages((prev) => [...prev, { ...message, id: tempId, status: 'SENT', timestamp: new Date().toISOString() }]);
    };

    const handleFileSelect = async (file) => {
        if (!selectedUser) return;
        try {
            const response = await fileService.uploadFile(file);
            const filePath = response.data.fileUrl;
            if (!filePath) { console.error("File URL not found"); return; }
            const messageType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type) ? 'IMAGE' : 'FILE';
            const tempId = `temp_${Date.now()}`;
            const message = { tempId, senderUsername: currentUser.username, recipientUsername: selectedUser.username, content: filePath, type: messageType };
            socketService.sendMessage('/app/chat.send', message);
            setMessages((prev) => [...prev, { ...message, id: tempId, status: 'SENT', timestamp: new Date().toISOString() }]);
        } catch (error) { console.error("Failed to upload file:", error); }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await messageService.softDeleteMessage(messageId);
            setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, deleted: true } : msg));
        } catch (error) { console.error('Failed to delete message:', error); }
    };

    const handleTyping = (typingStatus) => {
        if (!selectedUser) return;
        socketService.sendMessage('/app/chat.typing', { fromUsername: currentUser.username, toUsername: selectedUser.username, isTyping: typingStatus });
    };

    const handleScroll = () => {
        if (messageContainerRef.current?.scrollTop === 0 && hasMoreMessages && !loadingMore) {
            fetchMessages(false);
        }
    };

    const displayedList = searchQuery.trim() ? searchResults : contacts;

    const LeftPanel = (
        <Grid item xs={12} sm={4} md={3.5}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                bgcolor: '#17212b',
                borderRight: '1px solid #000'
            }}
        >
            <Box sx={{ p: 2, borderBottom: '1px solid #000' }}>
                <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#6b7b8c' }} /></InputAdornment>,
                        disableUnderline: true,
                        sx: { bgcolor: '#242f3d', borderRadius: '20px', p: '6px 12px', color: '#fff' }
                    }}
                />
            </Box>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {loadingContacts ? <CircularProgress sx={{ m: 'auto', display: 'block' }} /> : (
                    <List sx={{ p: 0 }}>
                        {displayedList.map((user) => (
                            <ListItem key={user.id} disablePadding>
                                <ListItemButton
                                    selected={selectedUser?.id === user.id}
                                    onClick={() => handleUserSelect(user)}
                                    sx={{
                                        p: 1.5,
                                        '&.Mui-selected': { bgcolor: '#2b5278' },
                                        '&:hover': { bgcolor: '#2a3b4d' },
                                    }}
                                >
                                    <Avatar sx={{ bgcolor: '#607d8b', mr: 2 }}>{getInitials(user.username)}</Avatar>
                                    <ListItemText
                                        primary={<Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: '600' }}>{user.username}</Typography>}
                                        secondary={<Typography variant="body2" sx={{ color: '#a0a0a0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>Last message placeholder...</Typography>}
                                    />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml: 1, alignSelf: 'flex-start' }}>
                                        <Typography variant="caption" sx={{ color: '#a0a0a0' }}>10:30 PM</Typography>
                                        {unreadCounts[user.username] > 0 &&
                                            <Badge badgeContent={unreadCounts[user.username]} color="primary" sx={{ mt: 0.5 }} />
                                        }
                                    </Box>
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </Grid>
    );

    const RightPanel = (
        <Grid item xs={12} sm={8} md={8.5}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}
        >
            {selectedUser ? (
                <>
                    <Paper elevation={0} sx={{ p: 1.5, flexShrink: 0, bgcolor: '#17212b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #000' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {isMobile && (
                                <IconButton onClick={() => setSelectedUser(null)} sx={{ color: '#fff', mr: 1 }}><ArrowBackIcon /></IconButton>
                            )}
                            <Avatar sx={{ bgcolor: '#607d8b', mr: 2 }}>{getInitials(selectedUser.username)}</Avatar>
                            <Box>
                                <Typography variant="h6">{selectedUser.username}</Typography>
                                <Typography variant="caption" sx={{ color: '#a0a0a0' }}>{isTyping ? 'typing...' : (selectedUser.isOnline ? 'online' : 'offline')}</Typography>
                            </Box>
                        </Box>
                        <Box>
                            <IconButton sx={{ color: '#a0a0a0' }}><SearchIcon /></IconButton>
                            <IconButton sx={{ color: '#a0a0a0' }}><CallIcon /></IconButton>
                            <IconButton sx={{ color: '#a0a0a0' }}><MoreVertIcon /></IconButton>
                        </Box>
                    </Paper>

                    <Box ref={messageContainerRef} onScroll={handleScroll} sx={{ flexGrow: 1, overflowY: 'auto', p: 3, backgroundColor: '#0e1621', backgroundImage: telegramPattern }}>
                        <MessageList messages={messages} currentUser={currentUser} onDeleteMessage={handleDeleteMessage} />
                        <div ref={messagesEndRef} />
                    </Box>

                    <Box sx={{ flexShrink: 0, bgcolor: '#17212b', borderTop: '1px solid #000' }}>
                        <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} onFileSelect={handleFileSelect} />
                    </Box>
                </>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                    <Typography variant="h5" sx={{color: '#a0a0a0'}}>Nexus Web</Typography>
                    <Typography sx={{ mt: 1, color: '#6b7b8c' }}>Select a chat to start messaging</Typography>
                </Box>
            )}
        </Grid>
    );

    return (
        <Box sx={{ height: '100vh', width: '100vw', display: 'flex', bgcolor: '#0e1621' }}>
            <Grid container sx={{ height: '100%', width: '100%' }}>
                {isMobile ? (
                    selectedUser ? RightPanel : LeftPanel
                ) : (
                    <>
                        {LeftPanel}
                        {RightPanel}
                    </>
                )}
            </Grid>
        </Box>
    );
};

export default ChatLayout;
