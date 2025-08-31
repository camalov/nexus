import React from 'react';
import { Box, Paper, Typography, CircularProgress, Link, IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';

const MessageList = ({ messages, currentUser, onDeleteMessage, messagesEndRef }) => {
    const getStatusIcon = (msg) => {
        if (msg.senderUsername !== currentUser.username || msg.deleted) {
            return null;
        }
        switch (msg.status) {
            case 'READ':
                // Blue double check for READ
                return <DoneAllIcon fontSize="small" sx={{ color: '#4FC3F7', ml: 0.5 }} />;
            case 'DELIVERED':
                // Grey double check for DELIVERED
                return <DoneAllIcon fontSize="small" sx={{ color: 'grey.700', ml: 0.5, opacity: 0.8 }} />;
            case 'SENT':
                // Grey single check for SENT
                return <CheckIcon fontSize="small" sx={{ color: 'grey.700', ml: 0.5, opacity: 0.8 }} />;
            default:
                return null;
        }
    };

    const renderMessageContent = (msg, isSender) => {
        if (!msg || !msg.content) {
            return null;
        }

        if (msg.deleted) {
            return <Typography variant="body2" sx={{ fontStyle: 'italic', color: isSender ? '#708b81' : '#a0a0a0' }}>[media deleted]</Typography>;
        }

        const baseUrl = window.location.origin.replace(':3000', ':8080') + '/nexus/api';
        const fullPath = msg.content.startsWith('/') ? `${baseUrl}${msg.content}` : msg.content;

        switch (msg.type) {
            case 'IMAGE':
                return (
                    <img
                        src={fullPath}
                        alt="Image content"
                        style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                    />
                );
            case 'FILE':
                const fileName = msg.content.split('/').pop();
                return (
                    <Link href={fullPath} download target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: isSender ? '#000' : 'inherit' }}>
                        <InsertDriveFileIcon sx={{ mr: 1 }} />
                        <Typography variant="body1">{fileName}</Typography>
                    </Link>
                );
            case 'TEXT':
            default:
                return <Typography variant="body1">{msg.content}</Typography>;
        }
    };

    return (
        <Box sx={{ px: 1, py: 2 }}>
            {messages.map((msg) => {
                const senderUsername = msg.sender ? msg.sender.username : msg.senderUsername;
                const isSender = senderUsername === currentUser.username;
                const isMedia = msg.type === 'IMAGE' || msg.type === 'FILE';

                return (
                    <Box
                        key={msg.id}
                        sx={{
                            display: 'flex',
                            justifyContent: isSender ? 'flex-end' : 'flex-start',
                            mb: 1,
                        }}
                    >
                        <Paper
                            variant="elevation"
                            elevation={1}
                            sx={{
                                p: 1.5,
                                backgroundColor: isSender ? '#e1ffc7' : '#fff',
                                color: '#000',
                                borderRadius: isSender ? '15px 15px 3px 15px' : '15px 15px 15px 3px',
                                maxWidth: '70%',
                                wordWrap: 'break-word',
                                position: 'relative', // Needed for absolute positioning of delete icon
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                                <Box>
                                    {renderMessageContent(msg, isSender)}
                                    <Typography variant="caption" sx={{ color: isSender ? '#708b81' : '#a0a0a0', display: 'block', textAlign: 'right', mt: 0.5 }}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Box>
                                {isSender && getStatusIcon(msg)}
                            </Box>
                            {isSender && isMedia && !msg.deleted && (
                                <IconButton size="small" onClick={() => onDeleteMessage(msg.id)} sx={{ position: 'absolute', top: 0, right: 0, color: '#000', opacity: 0.4 }}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Paper>
                    </Box>
                );
            })}
            <div ref={messagesEndRef} />
        </Box>
    );
};

export default MessageList;
