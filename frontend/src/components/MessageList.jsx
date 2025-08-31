import React from 'react';
import { Box, Paper, Typography, CircularProgress, Link, IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';

const MessageList = ({ messages, currentUser, onScroll, messageContainerRef, loadingMore, messagesEndRef, onDeleteMessage }) => {
    const getStatusIcon = (msg) => {
        if (msg.senderUsername !== currentUser.username || msg.deleted) {
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

    const renderMessageContent = (msg) => {
        if (!msg || !msg.content) {
            return null; // Safeguard for empty content
        }

        // If message is soft-deleted, show the appropriate text.
        if (msg.deleted) {
            return <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>[media deleted]</Typography>;
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
                    <Link href={fullPath} download target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
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
        <Box ref={messageContainerRef} onScroll={onScroll} sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
            {loadingMore && <CircularProgress sx={{ display: 'block', margin: '10px auto' }} />}
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
                            mb: 2,
                        }}
                    >
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 1.5,
                                backgroundColor: isSender ? 'primary.main' : 'grey.300',
                                color: isSender ? 'primary.contrastText' : 'text.primary',
                                borderRadius: isSender ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                                maxWidth: '70%',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                                {renderMessageContent(msg)}
                                {isSender && getStatusIcon(msg)}
                            </Box>
                            {isSender && isMedia && !msg.deleted && (
                                <IconButton size="small" onClick={() => onDeleteMessage(msg.id)} sx={{ ml: 1, color: 'inherit', opacity: 0.7 }}>
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
