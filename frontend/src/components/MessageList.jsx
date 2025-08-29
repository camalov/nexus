// frontend/src/components/MessageList.jsx
import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const MessageList = ({ messages, currentUser }) => {
    return (
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
            {messages.map((msg, index) => {
                // Həm dərhal göstərilən, həm də serverdən gələn mesaj formatlarını nəzərə alırıq
                const senderUsername = msg.sender ? msg.sender.username : msg.senderUsername;
                const isSender = senderUsername === currentUser.username;

                return (
                    <Box
                        key={index}
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
                                maxWidth: '60%',
                            }}
                        >
                            <Typography variant="body1">{msg.content}</Typography>
                        </Paper>
                    </Box>
                );
            })}
        </Box>
    );
};

export default MessageList;