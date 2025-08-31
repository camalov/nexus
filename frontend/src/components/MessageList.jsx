import React from 'react';
import { Box, Typography, Link, IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';

const MessageList = ({ messages, currentUser, onDeleteMessage, messagesEndRef }) => {

    const getStatusIcon = (msg) => {
        if (msg.senderUsername !== currentUser.username || msg.deleted) {
            return null;
        }
        const iconProps = { fontSize: 'small', sx: { ml: 0.5 } };
        switch (msg.status) {
            case 'READ':
                return <DoneAllIcon {...iconProps} sx={{ ...iconProps.sx, color: '#4FC3F7' }} />;
            case 'DELIVERED':
                return <DoneAllIcon {...iconProps} sx={{ ...iconProps.sx, color: '#a0a0a0' }} />;
            case 'SENT':
                return <CheckIcon {...iconProps} sx={{ ...iconProps.sx, color: '#a0a0a0' }} />;
            default:
                // For temp messages that haven't been confirmed by the server yet
                return <CheckIcon {...iconProps} sx={{ ...iconProps.sx, color: '#a0a0a0' }} />;
        }
    };

    const renderMessageContent = (msg) => {
        if (msg.deleted) {
            return <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#a0a0a0' }}>Message deleted</Typography>;
        }

        const baseUrl = window.location.origin.replace(':3000', ':8080') + '/nexus/api';
        const fullPath = msg.content.startsWith('/') ? `${baseUrl}${msg.content}` : msg.content;

        switch (msg.type) {
            case 'IMAGE':
                return (
                    <Box sx={{ p: 0.5, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                         <img src={fullPath} alt="Image content" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '6px', display: 'block' }} />
                    </Box>
                );
            case 'FILE':
                const fileName = msg.content.split('/').pop();
                return (
                    <Link href={fullPath} download target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#fff' }}>
                        <InsertDriveFileIcon sx={{ mr: 1, color: '#a0a0a0' }} />
                        <Typography variant="body1">{fileName}</Typography>
                    </Link>
                );
            case 'TEXT':
            default:
                return <Typography variant="body1" sx={{ color: '#fff' }}>{msg.content}</Typography>;
        }
    };

    return (
        <Box sx={{ px: 2, py: 1 }}>
            {messages.map((msg) => {
                const senderUsername = msg.sender ? msg.sender.username : msg.senderUsername;
                const isSender = senderUsername === currentUser.username;

                return (
                    <Box
                        key={msg.id || msg.tempId}
                        sx={{
                            display: 'flex',
                            justifyContent: isSender ? 'flex-end' : 'flex-start',
                            mb: 1.5,
                        }}
                    >
                        <Box
                            sx={{
                                bgcolor: isSender ? '#2b5278' : '#262d31',
                                color: '#fff',
                                p: 1.5,
                                borderRadius: '20px',
                                maxWidth: { xs: '80%', sm: '70%', md: '60%' },
                                wordWrap: 'break-word',
                                position: 'relative',
                            }}
                        >
                            {renderMessageContent(msg)}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 0.5 }}>
                                <Typography variant="caption" sx={{ color: '#a0a0a0', mr: 0.5 }}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                                {isSender && getStatusIcon(msg)}
                            </Box>
                             {isSender && !msg.deleted && (
                                <IconButton size="small" onClick={() => onDeleteMessage(msg.id)} sx={{ position: 'absolute', top: -5, right: -5, color: '#a0a0a0', backgroundColor: '#17212b', '&:hover': { backgroundColor: '#2a3b4d'} }}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Box>
                    </Box>
                );
            })}
            <div ref={messagesEndRef} />
        </Box>
    );
};

export default MessageList;
