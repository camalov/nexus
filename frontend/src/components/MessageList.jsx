import React from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const MessageList = ({ messages, currentUser, onScroll, messageContainerRef, loadingMore }) => {
    const getStatusIcon = (msg) => {
        if (msg.senderUsername !== currentUser.username) {
            return null;
        }
        if (msg.status === 'READ') {
            return <DoneAllIcon fontSize="small" sx={{ color: 'blue', ml: 0.5 }} />;
        }
        if (msg.status === 'SENT' || msg.status === 'DELIVERED') {
            return <CheckIcon fontSize="small" sx={{ ml: 0.5 }} />;
        }
        return null;
    };

    return (
        <Box ref={messageContainerRef} onScroll={onScroll} sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
            {loadingMore && <CircularProgress sx={{ display: 'block', margin: '10px auto' }} />}
            {messages.map((msg, index) => {
                // FIX: Handle both optimistic and server messages
                const senderUsername = msg.sender ? msg.sender.username : msg.senderUsername;
                const isSender = senderUsername === currentUser.username;

                return (
                    <Box
                        key={msg.id || index}
                        sx={{
                            display: 'flex',
                            justifyContent: isSender ? 'flex-end' : 'flex-start',
                            mb: 2,
                        }}
                    >
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                backgroundColor: isSender ? 'primary.main' : 'grey.300',
                                color: isSender ? 'primary.contrastText' : 'text.primary',
                                borderRadius: isSender ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body1">{msg.content}</Typography>
                                {getStatusIcon(msg)}
                            </Box>
                        </Paper>
                    </Box>
                );
            })}
        </Box>
    );
};

export default MessageList;
